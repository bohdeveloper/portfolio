import { verifyAuth } from '../_auth-util';

interface Env { DB: D1Database; JWT_SECRET: string }

const H = { 'Content-Type': 'application/json' };

/* ── POST /api/moneta/summary
   Guarda el saldo inicial o cierra/reabre el mes según `action`. */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const auth = await verifyAuth(request, env.JWT_SECRET);
  if (!auth)
    return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401, headers: H });

  const body = await request.json() as {
    profile_id: number; year: number; month: number;
    saldo_inicial?: number | null;
    action?: 'close' | 'reopen';
  };
  const { profile_id, year, month } = body;

  try {
    const { results } = await env.DB.prepare('SELECT id FROM moneta_profiles WHERE id = ? AND user_id = ?')
      .bind(profile_id, auth.user_id).all<{ id: number }>();
    if (!results.length) return new Response(JSON.stringify({ ok: false, error: 'Profile not found' }), { status: 403, headers: H });

    /* Guarda saldo inicial */
    if ('saldo_inicial' in body) {
      // UPSERT: si ya existe un resumen para (profile_id, year, month) actualiza solo saldo_inicial;
      // si no existe lo crea. Se usa 'in body' (no !=null) para permitir guardar null explícitamente
      // (el usuario borra el saldo inicial del mes).
      await env.DB.prepare(`
        INSERT INTO moneta_monthly_summary (profile_id, year, month, saldo_inicial)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(profile_id, year, month) DO UPDATE SET saldo_inicial = excluded.saldo_inicial
      `).bind(profile_id, year, month, body.saldo_inicial ?? null).run();
    }

    /* Cierra el mes */
    if (body.action === 'close') {
      // UPSERT que activa el cierre: crea la fila si aún no existe ningún resumen para el mes
      // (puede ocurrir si el usuario nunca guardó saldo inicial) y registra el timestamp de cierre.
      await env.DB.prepare(`
        INSERT INTO moneta_monthly_summary (profile_id, year, month, closed, closed_at)
        VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP)
        ON CONFLICT(profile_id, year, month) DO UPDATE SET closed = 1, closed_at = CURRENT_TIMESTAMP
      `).bind(profile_id, year, month).run();
    }

    /* Reabre el mes */
    if (body.action === 'reopen') {
      // Al reabrir se pone closed=0 y se borra closed_at para indicar que no hay fecha de cierre válida.
      await env.DB.prepare(`
        INSERT INTO moneta_monthly_summary (profile_id, year, month, closed)
        VALUES (?, ?, ?, 0)
        ON CONFLICT(profile_id, year, month) DO UPDATE SET closed = 0, closed_at = NULL
      `).bind(profile_id, year, month).run();
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: H });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Database error';
    return new Response(JSON.stringify({ ok: false, error: msg }), { status: 500, headers: H });
  }
};
