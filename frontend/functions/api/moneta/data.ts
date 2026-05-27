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

interface CatRow {
  id: number; profile_id: number; name: string; planned_amount: number;
  type: string; parent_id: number | null; sort_order: number;
  actual: number; has_actual: number;
}

/* ── GET /api/moneta/data?year=YYYY&month=M
   Devuelve todos los perfiles con sus categorías (árbol) e importes reales del mes. */
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

    /* Carga todas las categorías con su importe real del mes (LEFT JOIN) */
    const { results: cats } = await env.DB.prepare(`
      SELECT c.*,
             COALESCE(a.amount, 0)  as actual,
             (a.id IS NOT NULL)     as has_actual
      FROM moneta_categories c
      LEFT JOIN moneta_actuals a
        ON a.category_id = c.id AND a.year = ? AND a.month = ?
      ORDER BY c.profile_id, c.sort_order, c.id
    `).bind(year, month).all<CatRow>();

    /* Construye el árbol: raíces con sus hijos para cada perfil */
    const data = profiles.map(p => {
      const all    = cats.filter(c => c.profile_id === p.id);
      const roots  = all.filter(c => !c.parent_id).map(c => ({
        ...c,
        has_actual: Boolean(c.has_actual),
        children: all.filter(ch => ch.parent_id === c.id)
                     .map(ch => ({ ...ch, has_actual: Boolean(ch.has_actual), children: [] })),
      }));
      return { ...p, categories: roots };
    });

    return new Response(JSON.stringify({ ok: true, data }), { status: 200, headers: H });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Database error';
    return new Response(JSON.stringify({ ok: false, error: msg }), { status: 500, headers: H });
  }
};
