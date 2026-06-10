import { verifyAuth } from '../_auth-util';
import { validateFloat } from '../_security';

interface Env { DB: D1Database; JWT_SECRET: string }

const H = { 'Content-Type': 'application/json' };

interface DailyRow {
  id: number; date: string; kcal_exercise: number | null; kcal_intake: number | null;
  updated_at: string;
}

interface BiometricLatest {
  tdee: number | null;
}

/* ── GET /api/bioptima/daily?days=N — últimos N días (defecto 30) ── */
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const auth = await verifyAuth(request, env.JWT_SECRET);
  if (!auth)
    return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401, headers: H });

  const days = parseInt(new URL(request.url).searchParams.get('days') ?? '30');

  const { results } = await env.DB.prepare(`
    SELECT id, date, kcal_exercise, kcal_intake, updated_at
    FROM bioptima_daily
    WHERE user_id = ?
    ORDER BY date DESC
    LIMIT ?
  `).bind(auth.user_id, days).all<DailyRow>();

  // TDEE del último registro biométrico — necesario para calcular balance en el cliente
  const { results: bioRows } = await env.DB.prepare(`
    SELECT tdee FROM bioptima_biometrics
    WHERE user_id = ? AND tdee IS NOT NULL
    ORDER BY date DESC LIMIT 1
  `).bind(auth.user_id).all<BiometricLatest>();

  const tdee = bioRows[0]?.tdee ?? null;

  return new Response(JSON.stringify({ ok: true, records: results, tdee }), { status: 200, headers: H });
};

/* ── POST /api/bioptima/daily — UPSERT calorías del día ──────────────────────
   Acepta { date, field: 'exercise'|'intake', value: number }.
   Cada botón de la UI envía solo su campo para no sobreescribir el otro.
   También añade una nota al Tracker cuando ambos campos están presentes. */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const auth = await verifyAuth(request, env.JWT_SECRET);
  if (!auth)
    return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401, headers: H });

  let body: { date?: string; field?: 'exercise' | 'intake'; value?: number };
  try { body = await request.json(); } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid JSON' }), { status: 400, headers: H });
  }

  const { date, field, value } = body;
  if (!date || !field || value === undefined)
    return new Response(JSON.stringify({ ok: false, error: 'Faltan campos: date, field, value' }), { status: 400, headers: H });

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
    return new Response(JSON.stringify({ ok: false, error: 'Formato de fecha inválido (YYYY-MM-DD)' }), { status: 400, headers: H });

  if (!['exercise', 'intake'].includes(field))
    return new Response(JSON.stringify({ ok: false, error: 'field debe ser exercise o intake' }), { status: 400, headers: H });

  // Rango de kcal realista: 0 a 30000 kcal
  if (validateFloat(value, 0, 30000) === null)
    return new Response(JSON.stringify({ ok: false, error: 'value: entre 0 y 30000 kcal' }), { status: 400, headers: H });

  const col = field === 'exercise' ? 'kcal_exercise' : 'kcal_intake';

  // UPSERT del campo específico — el otro campo no se toca gracias a excluded.
  await env.DB.prepare(`
    INSERT INTO bioptima_daily (user_id, date, ${col}, updated_at)
    VALUES (?, ?, ?, datetime('now'))
    ON CONFLICT(user_id, date) DO UPDATE SET
      ${col}     = excluded.${col},
      updated_at = excluded.updated_at
  `).bind(auth.user_id, date, value).run();

  // Tras guardar, recuperamos el registro completo para saber si podemos añadir nota al Tracker
  const { results } = await env.DB.prepare(
    'SELECT kcal_exercise, kcal_intake FROM bioptima_daily WHERE user_id = ? AND date = ?'
  ).bind(auth.user_id, date).all<{ kcal_exercise: number | null; kcal_intake: number | null }>();

  const rec = results[0];
  if (rec?.kcal_exercise !== null && rec?.kcal_intake !== null) {
    // Obtenemos el TDEE del último biométrico para calcular el balance
    const { results: bioRows } = await env.DB.prepare(`
      SELECT tdee FROM bioptima_biometrics
      WHERE user_id = ? AND tdee IS NOT NULL
      ORDER BY date DESC LIMIT 1
    `).bind(auth.user_id).all<{ tdee: number }>();

    if (bioRows[0]?.tdee) {
      const tdee    = bioRows[0].tdee;
      const balance = Math.round(rec.kcal_intake! - (tdee + rec.kcal_exercise!));
      const sign    = balance > 0 ? '+' : '';
      const note    = `Bioptima — Balance: ${sign}${balance} kcal (ingesta ${rec.kcal_intake} / ejercicio ${rec.kcal_exercise})`;

      // Insertar o actualizar nota del Tracker para esa fecha
      // Usa la columna reason del registro más reciente del día en tracker_records,
      // o inserta en tracker_notes si la tabla existe; aquí usamos tracker_notes directamente.
      await env.DB.prepare(`
        INSERT INTO tracker_notes (user_id, date, note, updated_at)
        VALUES (?, ?, ?, datetime('now'))
        ON CONFLICT(user_id, date) DO UPDATE SET note = excluded.note, updated_at = excluded.updated_at
      `).bind(auth.user_id, date, note).run().catch(() => {
        // tracker_notes puede no tener UNIQUE(user_id, date) — ignorar silenciosamente
      });
    }
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: H });
};
