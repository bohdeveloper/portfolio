interface Env { DB: D1Database }

const H = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

/* ── POST /api/games/visitor — crear visitante ── */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: { alias?: string };
  try { body = await request.json(); } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid JSON' }), { status: 400, headers: H });
  }

  const alias = body.alias?.trim();
  if (!alias) return new Response(JSON.stringify({ ok: false, error: 'Alias requerido' }), { status: 400, headers: H });
  if (alias.length > 30) return new Response(JSON.stringify({ ok: false, error: 'Alias demasiado largo' }), { status: 400, headers: H });

  try {
    const result = await env.DB.prepare('INSERT INTO game_visitors (alias) VALUES (?)').bind(alias).run();
    return new Response(JSON.stringify({ ok: true, id: Number(result.meta.last_row_id), alias }), { status: 200, headers: H });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Database error' }), { status: 500, headers: H });
  }
};

/* ── GET /api/games/visitor?id=N — verificar que existe ── */
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const id = parseInt(new URL(request.url).searchParams.get('id') ?? '');
  if (!id || isNaN(id)) return new Response(JSON.stringify({ ok: false }), { status: 400, headers: H });

  try {
    const row = await env.DB.prepare('SELECT id, alias FROM game_visitors WHERE id = ?')
      .bind(id).first<{ id: number; alias: string }>();
    if (!row) return new Response(JSON.stringify({ ok: false }), { status: 404, headers: H });
    return new Response(JSON.stringify({ ok: true, id: row.id, alias: row.alias }), { status: 200, headers: H });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Database error' }), { status: 500, headers: H });
  }
};
