import { verifyAuth } from '../_auth-util';

interface Env { DB: D1Database; JWT_SECRET: string }

const H = { 'Content-Type': 'application/json' };

/* ── GET /api/bioptima/stats — resumen diario, semanal y mensual ──────────
   Devuelve:
   · today:   registro diario de hoy con balance calculado
   · week:    suma y media de los últimos 7 días
   · month:   suma y media de los últimos 30 días
   · latest:  último registro biométrico (peso, %MG, TMB, TDEE)
   · history: últimos 90 días de diario para las gráficas SVG            */
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const auth = await verifyAuth(request, env.JWT_SECRET);
  if (!auth)
    return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401, headers: H });

  const today = new Date().toISOString().slice(0, 10);
  const d7    = new Date(Date.now() - 6  * 86400000).toISOString().slice(0, 10);
  const d30   = new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10);
  const d90   = new Date(Date.now() - 89 * 86400000).toISOString().slice(0, 10);

  try {
    // Registro de hoy
    const { results: todayRows } = await env.DB.prepare(`
      SELECT kcal_exercise, kcal_intake FROM bioptima_daily
      WHERE user_id = ? AND date = ?
    `).bind(auth.user_id, today).all<{ kcal_exercise: number | null; kcal_intake: number | null }>();

    // Último biométrico para TDEE y métricas
    const { results: latestBio } = await env.DB.prepare(`
      SELECT date, weight_kg, body_fat_pct, lean_mass_kg, bmr, tdee, bmi
      FROM bioptima_biometrics
      WHERE user_id = ? AND tdee IS NOT NULL
      ORDER BY date DESC LIMIT 1
    `).bind(auth.user_id).all<{
      date: string; weight_kg: number; body_fat_pct: number | null;
      lean_mass_kg: number | null; bmr: number | null; tdee: number | null; bmi: number | null;
    }>();

    const tdee = latestBio[0]?.tdee ?? 0;

    // Resumen de los últimos 7 días
    const { results: weekRows } = await env.DB.prepare(`
      SELECT
        COUNT(*)                        AS days,
        SUM(kcal_intake)                AS total_intake,
        SUM(kcal_exercise)              AS total_exercise,
        ROUND(AVG(kcal_intake), 0)      AS avg_intake,
        ROUND(AVG(kcal_exercise), 0)    AS avg_exercise
      FROM bioptima_daily
      WHERE user_id = ? AND date >= ? AND date <= ?
        AND kcal_intake IS NOT NULL
    `).bind(auth.user_id, d7, today).all<{
      days: number; total_intake: number | null; total_exercise: number | null;
      avg_intake: number | null; avg_exercise: number | null;
    }>();

    // Resumen de los últimos 30 días
    const { results: monthRows } = await env.DB.prepare(`
      SELECT
        COUNT(*)                        AS days,
        SUM(kcal_intake)                AS total_intake,
        SUM(kcal_exercise)              AS total_exercise,
        ROUND(AVG(kcal_intake), 0)      AS avg_intake,
        ROUND(AVG(kcal_exercise), 0)    AS avg_exercise
      FROM bioptima_daily
      WHERE user_id = ? AND date >= ? AND date <= ?
        AND kcal_intake IS NOT NULL
    `).bind(auth.user_id, d30, today).all<{
      days: number; total_intake: number | null; total_exercise: number | null;
      avg_intake: number | null; avg_exercise: number | null;
    }>();

    // Historial de 90 días para gráficas (fecha + calorías)
    const { results: history } = await env.DB.prepare(`
      SELECT date, kcal_exercise, kcal_intake
      FROM bioptima_daily
      WHERE user_id = ? AND date >= ?
      ORDER BY date ASC
    `).bind(auth.user_id, d90).all<{
      date: string; kcal_exercise: number | null; kcal_intake: number | null;
    }>();

    // Historial biométrico de 90 días para gráfica de evolución
    const { results: bioHistory } = await env.DB.prepare(`
      SELECT date, weight_kg, body_fat_pct, bmi
      FROM bioptima_biometrics
      WHERE user_id = ? AND date >= ?
      ORDER BY date ASC
    `).bind(auth.user_id, d90).all<{
      date: string; weight_kg: number; body_fat_pct: number | null; bmi: number | null;
    }>();

    // Calcular balance con TDEE para cada día del historial
    const historyWithBalance = history.map(r => ({
      ...r,
      balance: (r.kcal_intake !== null && tdee > 0)
        ? Math.round(r.kcal_intake - (tdee + (r.kcal_exercise ?? 0)))
        : null,
    }));

    // Balance acumulado semanal y mensual
    const calcBalance = (rows: typeof weekRows) => {
      const r = rows[0];
      if (!r || !r.total_intake || !tdee) return null;
      return Math.round(r.total_intake - (tdee * r.days + (r.total_exercise ?? 0)));
    };

    return new Response(JSON.stringify({
      ok: true,
      today:      todayRows[0] ?? { kcal_exercise: null, kcal_intake: null },
      latest:     latestBio[0] ?? null,
      tdee,
      week: {
        ...(weekRows[0] ?? {}),
        balance: calcBalance(weekRows),
      },
      month: {
        ...(monthRows[0] ?? {}),
        balance: calcBalance(monthRows),
      },
      history:    historyWithBalance,
      bioHistory,
    }), { status: 200, headers: H });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Database error';
    return new Response(JSON.stringify({ ok: false, error: msg }), { status: 500, headers: H });
  }
};
