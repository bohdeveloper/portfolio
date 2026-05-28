interface Env { DB: D1Database }

const H = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

/* ── POST /api/games/vote — emitir o retirar voto ── */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: { game_id?: number; fingerprint?: string };
  try { body = await request.json(); } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid JSON' }), { status: 400, headers: H });
  }

  const { game_id, fingerprint } = body;
  if (!game_id || !fingerprint?.trim()) {
    return new Response(JSON.stringify({ ok: false, error: 'Missing fields' }), { status: 400, headers: H });
  }
  if (fingerprint.length > 64) {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid fingerprint' }), { status: 400, headers: H });
  }

  try {
    // Verificar que el juego existe
    const game = await env.DB.prepare('SELECT id FROM games WHERE id = ?').bind(game_id).first();
    if (!game) return new Response(JSON.stringify({ ok: false, error: 'Game not found' }), { status: 404, headers: H });

    // Comprobar si ya votó
    const existing = await env.DB.prepare(
      'SELECT id FROM game_votes WHERE game_id = ? AND fingerprint = ?'
    ).bind(game_id, fingerprint).first();

    let voted: boolean;
    if (existing) {
      // Retirar voto
      await env.DB.batch([
        env.DB.prepare('DELETE FROM game_votes WHERE game_id = ? AND fingerprint = ?').bind(game_id, fingerprint),
        env.DB.prepare('UPDATE games SET vote_count = MAX(0, vote_count - 1) WHERE id = ?').bind(game_id),
      ]);
      voted = false;
    } else {
      // Emitir voto
      await env.DB.batch([
        env.DB.prepare('INSERT INTO game_votes (game_id, fingerprint) VALUES (?, ?)').bind(game_id, fingerprint),
        env.DB.prepare('UPDATE games SET vote_count = vote_count + 1 WHERE id = ?').bind(game_id),
      ]);
      voted = true;
    }

    const updated = await env.DB.prepare('SELECT vote_count FROM games WHERE id = ?')
      .bind(game_id).first<{ vote_count: number }>();

    return new Response(JSON.stringify({ ok: true, voted, vote_count: updated?.vote_count ?? 0 }), { status: 200, headers: H });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Database error' }), { status: 500, headers: H });
  }
};

/* ── GET /api/games/vote?game_id=N&fingerprint=X — comprobar si ya votó ── */
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const game_id   = parseInt(url.searchParams.get('game_id') ?? '');
  const fingerprint = url.searchParams.get('fingerprint') ?? '';

  if (!game_id || !fingerprint) {
    return new Response(JSON.stringify({ ok: false, error: 'Missing params' }), { status: 400, headers: H });
  }

  try {
    const existing = await env.DB.prepare(
      'SELECT id FROM game_votes WHERE game_id = ? AND fingerprint = ?'
    ).bind(game_id, fingerprint).first();

    return new Response(JSON.stringify({ ok: true, voted: !!existing }), { status: 200, headers: H });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Database error' }), { status: 500, headers: H });
  }
};
