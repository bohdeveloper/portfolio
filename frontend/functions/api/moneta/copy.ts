import { verifyAuth } from '../_auth-util';

interface Env { DB: D1Database; JWT_SECRET: string }

const H = { 'Content-Type': 'application/json' };

/* ── POST /api/moneta/copy
   Copia los ítems del mes de origen al mes de destino (solo amount, sin real_amount).
   Si el mes de destino ya tiene ítems, no hace nada (idempotente). */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const auth = await verifyAuth(request, env.JWT_SECRET);
  if (!auth)
    return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401, headers: H });

  const body = await request.json() as {
    from_year: number; from_month: number;
    to_year: number;   to_month: number;
  };
  const { from_year, from_month, to_year, to_month } = body;

  if (!from_year || !from_month || !to_year || !to_month)
    return new Response(JSON.stringify({ ok: false, error: 'Faltan parámetros' }), { status: 400, headers: H });

  const validMonths = [1,2,3,4,5,6,7,8,9,10,11,12];
  if (!validMonths.includes(from_month) || !validMonths.includes(to_month))
    return new Response(JSON.stringify({ ok: false, error: 'Mes inválido' }), { status: 400, headers: H });
  if (from_year < 2000 || from_year > 2100 || to_year < 2000 || to_year > 2100)
    return new Response(JSON.stringify({ ok: false, error: 'Año inválido' }), { status: 400, headers: H });

  try {
    // Copia name, amount, type y sort_order del mes origen al mes destino.
    // real_amount se omite intencionadamente: representa el gasto real ejecutado
    // y no debe trasladarse a un mes nuevo donde aún no se ha gastado nada.
    // El JOIN con moneta_profiles garantiza que solo se copian ítems del usuario
    // autenticado, aunque moneta_items no tenga columna user_id directa.
    /* Inserta todos los ítems del mes origen (sin real_amount) */
    await env.DB.prepare(`
      INSERT INTO moneta_items (profile_id, year, month, name, amount, type, sort_order, user_id)
      SELECT i.profile_id, ?, ?, i.name, i.amount, i.type, i.sort_order, i.user_id
      FROM moneta_items i
      JOIN moneta_profiles p ON p.id = i.profile_id
      WHERE i.year = ? AND i.month = ? AND p.user_id = ?
    `).bind(to_year, to_month, from_year, from_month, auth.user_id).run();

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: H });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Database error';
    return new Response(JSON.stringify({ ok: false, error: msg }), { status: 500, headers: H });
  }
};
