interface Env { DB: D1Database }

const VALID_EMOJIS = ['👍', '❤️', '🔥', '💡'];
const MAX_COUNT = 9999;
const H = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: { game_id?: number; emoji?: string; delta?: number };
  try { body = await request.json(); } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid JSON' }), { status: 400, headers: H });
  }

  const { game_id, emoji, delta = 1 } = body;
  if (!game_id || !emoji) return new Response(JSON.stringify({ ok: false, error: 'Missing fields' }), { status: 400, headers: H });
  if (!VALID_EMOJIS.includes(emoji)) return new Response(JSON.stringify({ ok: false, error: 'Invalid emoji' }), { status: 400, headers: H });
  if (delta !== 1 && delta !== -1) return new Response(JSON.stringify({ ok: false, error: 'Invalid delta' }), { status: 400, headers: H });

  try {
    const game = await env.DB.prepare('SELECT id FROM games WHERE id = ?').bind(game_id).first<{ id: number }>();
    if (!game) return new Response(JSON.stringify({ ok: false, error: 'Game not found' }), { status: 404, headers: H });

    if (delta === 1) {
      await env.DB.prepare(
        `INSERT INTO game_reactions (game_id, emoji, count) VALUES (?, ?, 1)
         ON CONFLICT(game_id, emoji) DO UPDATE SET count = MIN(${MAX_COUNT}, count + 1)`
      ).bind(game_id, emoji).run();
    } else {
      await env.DB.prepare(
        'UPDATE game_reactions SET count = MAX(0, count - 1) WHERE game_id = ? AND emoji = ?'
      ).bind(game_id, emoji).run();
    }

    const row = await env.DB.prepare('SELECT count FROM game_reactions WHERE game_id = ? AND emoji = ?')
      .bind(game_id, emoji).first<{ count: number }>();

    return new Response(JSON.stringify({ ok: true, count: row?.count ?? 0 }), { status: 200, headers: H });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Database error' }), { status: 500, headers: H });
  }
};
