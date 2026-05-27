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

/* ── POST /api/moneta/item — crear ítem ── */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!await auth(request, env))
    return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401, headers: H });

  const body = await request.json() as {
    profile_id: number; year: number; month: number;
    name: string; amount: number; type: string; sort_order?: number;
  };
  const { profile_id, year, month, name, amount, type, sort_order = 99 } = body;
  if (!profile_id || !name || year == null || month == null) return bad('Faltan parámetros');

  try {
    const result = await env.DB.prepare(`
      INSERT INTO moneta_items (profile_id, year, month, name, amount, type, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(profile_id, year, month, name, amount ?? 0, type, sort_order).run();

    return new Response(JSON.stringify({ ok: true, id: result.meta.last_row_id }), { status: 200, headers: H });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Database error';
    return new Response(JSON.stringify({ ok: false, error: msg }), { status: 500, headers: H });
  }
};

/* ── PATCH /api/moneta/item?id=N — actualizar nombre, importe y/o importe real ── */
export const onRequestPatch: PagesFunction<Env> = async ({ request, env }) => {
  if (!await auth(request, env))
    return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401, headers: H });

  const id = new URL(request.url).searchParams.get('id');
  if (!id) return bad('Falta id');

  const body = await request.json() as { name?: string; amount?: number; real_amount?: number | null };

  const parts: string[] = [];
  const vals: unknown[] = [];
  if (body.name        !== undefined) { parts.push('name=?');        vals.push(body.name); }
  if (body.amount      !== undefined) { parts.push('amount=?');      vals.push(body.amount); }
  if ('real_amount' in body)          { parts.push('real_amount=?'); vals.push(body.real_amount ?? null); }
  if (parts.length === 0) return bad('Nada que actualizar');

  try {
    await env.DB.prepare(`UPDATE moneta_items SET ${parts.join(', ')} WHERE id=?`)
      .bind(...vals, id).run();
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: H });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Database error';
    return new Response(JSON.stringify({ ok: false, error: msg }), { status: 500, headers: H });
  }
};

/* ── DELETE /api/moneta/item?id=N — borrar ítem ── */
export const onRequestDelete: PagesFunction<Env> = async ({ request, env }) => {
  if (!await auth(request, env))
    return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401, headers: H });

  const id = new URL(request.url).searchParams.get('id');
  if (!id) return bad('Falta id');

  try {
    await env.DB.prepare('DELETE FROM moneta_items WHERE id=?').bind(id).run();
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: H });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Database error';
    return new Response(JSON.stringify({ ok: false, error: msg }), { status: 500, headers: H });
  }
};
