interface Env { DB: D1Database; JWT_SECRET: string }

/* Verifica el JWT de la cookie admin_token */
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

/* ── GET /api/economia/transactions?year=YYYY&month=M ── */
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (!await auth(request, env)) return unauth();
  const url = new URL(request.url);
  const year  = url.searchParams.get('year');
  const month = url.searchParams.get('month');

  // Construye el filtro de mes si se pasa año y mes
  const where = (year && month)
    ? `WHERE strftime('%Y-%m', t.date) = '${year}-${String(month).padStart(2, '0')}'`
    : '';

  try {
    const { results } = await env.DB.prepare(`
      SELECT t.id, t.date, t.amount, t.type, t.category_id,
             t.description, t.owner, t.created_at,
             c.name as category_name, c.color as category_color, c.icon as category_icon
      FROM eco_transactions t
      LEFT JOIN eco_categories c ON t.category_id = c.id
      ${where}
      ORDER BY t.date DESC, t.created_at DESC
    `).all();
    return new Response(JSON.stringify({ ok: true, data: results }), { status: 200, headers: H });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Database error';
    return new Response(JSON.stringify({ ok: false, error: msg }), { status: 500, headers: H });
  }
};

/* ── POST /api/economia/transactions — crear o actualizar ── */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!await auth(request, env)) return unauth();
  const body = await request.json() as {
    id?: number; date: string; amount: number; type: string;
    category_id?: number | null; description?: string; owner?: string;
  };

  const { id, date, amount, type, category_id, description = '', owner = 'me' } = body;
  if (!date || amount == null || !type) return bad('Faltan campos obligatorios: date, amount, type');

  try {
    if (id) {
      // Actualización de transacción existente
      await env.DB.prepare(`
        UPDATE eco_transactions
        SET date=?, amount=?, type=?, category_id=?, description=?, owner=?
        WHERE id=?
      `).bind(date, amount, type, category_id ?? null, description, owner, id).run();
    } else {
      // Nueva transacción
      await env.DB.prepare(`
        INSERT INTO eco_transactions (date, amount, type, category_id, description, owner)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(date, amount, type, category_id ?? null, description, owner).run();
    }
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: H });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Database error';
    return new Response(JSON.stringify({ ok: false, error: msg }), { status: 500, headers: H });
  }
};

/* ── DELETE /api/economia/transactions?id=N ── */
export const onRequestDelete: PagesFunction<Env> = async ({ request, env }) => {
  if (!await auth(request, env)) return unauth();
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return bad('Falta el parámetro id');

  try {
    await env.DB.prepare('DELETE FROM eco_transactions WHERE id=?').bind(id).run();
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: H });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Database error';
    return new Response(JSON.stringify({ ok: false, error: msg }), { status: 500, headers: H });
  }
};
