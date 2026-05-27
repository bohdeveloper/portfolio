interface Env { DB: D1Database; JWT_SECRET: string }

async function auth(request: Request, env: Env): Promise<boolean> {
  const cookie = request.headers.get('Cookie') ?? '';
  const token = cookie.split(';')
    .find(c => c.trim().startsWith('admin_token='))
    ?.split('=').slice(1).join('=').trim();
  if (!token) return false;
  try {
    const { jwtVerify } = await import('jose');
    await jwtVerify(token, new TextEncoder().encode(env.JWT_SECRET));
    return true;
  } catch { return false; }
}

const H = { 'Content-Type': 'application/json' };

/* ── POST /api/moneta/actual — guarda o actualiza el importe real de una categoría en un mes.
   Usa UPSERT para simplificar: si ya existe la fila para ese (category_id, year, month), la actualiza. */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!await auth(request, env))
    return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401, headers: H });

  const body = await request.json() as {
    category_id: number; year: number; month: number; amount: number;
  };
  const { category_id, year, month, amount } = body;
  if (!category_id || year == null || month == null || amount == null)
    return new Response(JSON.stringify({ ok: false, error: 'Faltan parámetros' }), { status: 400, headers: H });

  try {
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
