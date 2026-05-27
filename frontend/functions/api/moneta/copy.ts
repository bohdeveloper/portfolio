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

/* ── POST /api/moneta/copy
   Copia los ítems del mes de origen al mes de destino (solo amount, sin real_amount).
   Si el mes de destino ya tiene ítems, no hace nada (idempotente). */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!await auth(request, env))
    return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401, headers: H });

  const body = await request.json() as {
    from_year: number; from_month: number;
    to_year: number;   to_month: number;
  };
  const { from_year, from_month, to_year, to_month } = body;

  if (!from_year || !from_month || !to_year || !to_month)
    return new Response(JSON.stringify({ ok: false, error: 'Faltan parámetros' }), { status: 400, headers: H });

  try {
    /* Inserta todos los ítems del mes origen (sin real_amount) */
    await env.DB.prepare(`
      INSERT INTO moneta_items (profile_id, year, month, name, amount, type, sort_order)
      SELECT profile_id, ?, ?, name, amount, type, sort_order
      FROM moneta_items
      WHERE year = ? AND month = ?
    `).bind(to_year, to_month, from_year, from_month).run();

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: H });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Database error';
    return new Response(JSON.stringify({ ok: false, error: msg }), { status: 500, headers: H });
  }
};
