import { verifyAuth } from '../_auth-util';

interface Env { DB: D1Database; JWT_SECRET: string }

const H = { 'Content-Type': 'application/json' };

/* ── POST /api/moneta/actual — guarda o actualiza el importe real de una categoría en un mes.
   Usa UPSERT para simplificar: si ya existe la fila para ese (category_id, year, month), la actualiza. */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const auth = await verifyAuth(request, env.JWT_SECRET);
  if (!auth)
    return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401, headers: H });

  const body = await request.json() as {
    category_id: number; year: number; month: number; amount: number;
  };
  const { category_id, year, month, amount } = body;
  if (!category_id || year == null || month == null || amount == null)
    return new Response(JSON.stringify({ ok: false, error: 'Faltan parámetros' }), { status: 400, headers: H });

  try {
    const { results } = await env.DB.prepare(`
      SELECT c.id FROM moneta_categories c
      JOIN moneta_profiles p ON p.id = c.profile_id
      WHERE c.id = ? AND p.user_id = ?
    `).bind(category_id, auth.user_id).all<{ id: number }>();
    if (!results.length) return new Response(JSON.stringify({ ok: false, error: 'Category not found' }), { status: 403, headers: H });

    await env.DB.prepare(`
      INSERT INTO moneta_actuals (category_id, year, month, amount)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(category_id, year, month) DO UPDATE SET amount = excluded.amount
    `).bind(category_id, year, month, amount).run();
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: H });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Database error';
    return new Response(JSON.stringify({ ok: false, error: msg }), { status: 500, headers: H });
  }
};
