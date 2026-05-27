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
const bad = (msg: string) => new Response(JSON.stringify({ ok: false, error: msg }), { status: 400, headers: H });

/* ── POST /api/moneta/category — crear o actualizar una categoría ── */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!await auth(request, env))
    return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401, headers: H });

  const body = await request.json() as {
    id?: number; profile_id: number; name: string; planned_amount?: number;
    type?: string; parent_id?: number | null; sort_order?: number;
  };
  const { id, profile_id, name, planned_amount = 0, type = 'expense', parent_id, sort_order = 99 } = body;
  if (!profile_id || !name) return bad('Faltan profile_id o name');

  try {
    if (id) {
      await env.DB.prepare(`
        UPDATE moneta_categories
        SET name=?, planned_amount=?, type=?, parent_id=?, sort_order=?
        WHERE id=?
      `).bind(name, planned_amount, type, parent_id ?? null, sort_order, id).run();
    } else {
      await env.DB.prepare(`
        INSERT INTO moneta_categories (profile_id, name, planned_amount, type, parent_id, sort_order)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(profile_id, name, planned_amount, type, parent_id ?? null, sort_order).run();
    }
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: H });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Database error';
    return new Response(JSON.stringify({ ok: false, error: msg }), { status: 500, headers: H });
  }
};

/* ── DELETE /api/moneta/category?id=N — borra categoría y sus hijos (ON DELETE CASCADE) ── */
export const onRequestDelete: PagesFunction<Env> = async ({ request, env }) => {
  if (!await auth(request, env))
    return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401, headers: H });

  const id = new URL(request.url).searchParams.get('id');
  if (!id) return bad('Falta id');

  try {
    await env.DB.prepare('DELETE FROM moneta_categories WHERE id=?').bind(id).run();
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: H });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Database error';
    return new Response(JSON.stringify({ ok: false, error: msg }), { status: 500, headers: H });
  }
};
