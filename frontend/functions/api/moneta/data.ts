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

interface ItemRow {
  id: number; profile_id: number; year: number; month: number;
  name: string; amount: number; real_amount: number | null; type: string; sort_order: number;
}

/* ── GET /api/moneta/data?year=YYYY&month=M
   Devuelve los perfiles con la lista de ítems del mes. */
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (!await auth(request, env))
    return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401, headers: H });

  const url   = new URL(request.url);
  const year  = parseInt(url.searchParams.get('year')  ?? String(new Date().getFullYear()));
  const month = parseInt(url.searchParams.get('month') ?? String(new Date().getMonth() + 1));

  try {
    const { results: profiles } = await env.DB.prepare(
      'SELECT * FROM moneta_profiles ORDER BY sort_order'
    ).all<{ id: number; name: string; sort_order: number }>();

    const { results: items } = await env.DB.prepare(`
      SELECT id, profile_id, name, amount, real_amount, type, sort_order
      FROM moneta_items
      WHERE year = ? AND month = ?
      ORDER BY profile_id, sort_order, id
    `).bind(year, month).all<ItemRow>();

    const data = profiles.map(p => ({
      ...p,
      items: items.filter(i => i.profile_id === p.id),
    }));

    return new Response(JSON.stringify({ ok: true, data }), { status: 200, headers: H });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Database error';
    return new Response(JSON.stringify({ ok: false, error: msg }), { status: 500, headers: H });
  }
};
