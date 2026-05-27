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
const unauth = () => new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401, headers: H });
const bad    = (msg: string) => new Response(JSON.stringify({ ok: false, error: msg }), { status: 400, headers: H });

/* ── GET /api/economia/categories — lista todas las categorías ── */
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (!await auth(request, env)) return unauth();
  try {
    const { results } = await env.DB.prepare(
      'SELECT * FROM eco_categories ORDER BY sort_order ASC, name ASC'
    ).all();
    return new Response(JSON.stringify({ ok: true, data: results }), { status: 200, headers: H });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Database error';
    return new Response(JSON.stringify({ ok: false, error: msg }), { status: 500, headers: H });
  }
};

/* ── POST /api/economia/categories — crear o actualizar ── */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!await auth(request, env)) return unauth();
  const body = await request.json() as {
    id?: number; name: string; color?: string; icon?: string;
    budget_limit?: number | null; type?: string; sort_order?: number;
  };

  const { id, name, color = '#6366f1', icon = '💰', budget_limit, type = 'expense', sort_order = 0 } = body;
  if (!name) return bad('El nombre de la categoría es obligatorio');

  try {
    if (id) {
      await env.DB.prepare(`
        UPDATE eco_categories
        SET name=?, color=?, icon=?, budget_limit=?, type=?, sort_order=?
        WHERE id=?
      `).bind(name, color, icon, budget_limit ?? null, type, sort_order, id).run();
    } else {
      await env.DB.prepare(`
        INSERT INTO eco_categories (name, color, icon, budget_limit, type, sort_order)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(name, color, icon, budget_limit ?? null, type, sort_order).run();
    }
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: H });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Database error';
    return new Response(JSON.stringify({ ok: false, error: msg }), { status: 500, headers: H });
  }
};

/* ── DELETE /api/economia/categories?id=N ── */
export const onRequestDelete: PagesFunction<Env> = async ({ request, env }) => {
  if (!await auth(request, env)) return unauth();
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return bad('Falta el parámetro id');

  try {
    // Antes de borrar, desvincula las transacciones que usen esta categoría
    await env.DB.prepare('UPDATE eco_transactions SET category_id=NULL WHERE category_id=?').bind(id).run();
    await env.DB.prepare('DELETE FROM eco_categories WHERE id=?').bind(id).run();
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: H });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Database error';
    return new Response(JSON.stringify({ ok: false, error: msg }), { status: 500, headers: H });
  }
};
