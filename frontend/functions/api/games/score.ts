interface Env { DB: D1Database }

const H = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

/* ── GET /api/games/score?game_id=N&limit=3 — leaderboard top N ── */
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url     = new URL(request.url);
  const game_id = parseInt(url.searchParams.get('game_id') ?? '');
  const limit   = Math.min(10, parseInt(url.searchParams.get('limit') ?? '3'));

  if (!game_id || isNaN(game_id)) {
    return new Response(JSON.stringify({ ok: false, error: 'Missing game_id' }), { status: 400, headers: H });
  }

  try {
    const { results } = await env.DB.prepare(`
      SELECT v.alias, MAX(s.score) AS best_score, v.id AS visitor_id
      FROM game_scores s
      JOIN game_visitors v ON v.id = s.visitor_id
      WHERE s.game_id = ?
      GROUP BY s.visitor_id
      ORDER BY best_score DESC
      LIMIT ?
    `).bind(game_id, limit).all<{ alias: string; best_score: number; visitor_id: number }>();

    const data = results.map((r, i) => ({ rank: i + 1, alias: r.alias, score: r.best_score, visitor_id: r.visitor_id }));
    return new Response(JSON.stringify({ ok: true, data }), { status: 200, headers: H });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Database error' }), { status: 500, headers: H });
  }
};

/* ── POST /api/games/score — enviar puntuación ── */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: { game_id?: number; visitor_id?: number; score?: number };
  try { body = await request.json(); } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid JSON' }), { status: 400, headers: H });
  }

  const { game_id, visitor_id, score } = body;
  if (!game_id || !visitor_id || score === undefined) {
    return new Response(JSON.stringify({ ok: false, error: 'Missing fields' }), { status: 400, headers: H });
  }
  if (score < 0 || score > 999999) {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid score' }), { status: 400, headers: H });
  }

  try {
    // Verificar que el juego y el visitante existen
    const [game, visitor] = await Promise.all([
      env.DB.prepare('SELECT id FROM games WHERE id = ?').bind(game_id).first(),
      env.DB.prepare('SELECT id FROM game_visitors WHERE id = ?').bind(visitor_id).first(),
    ]);
    if (!game)    return new Response(JSON.stringify({ ok: false, error: 'Game not found' }), { status: 404, headers: H });
    if (!visitor) return new Response(JSON.stringify({ ok: false, error: 'Visitor not found' }), { status: 404, headers: H });

    // Insertar puntuación
    await env.DB.prepare('INSERT INTO game_scores (game_id, visitor_id, score) VALUES (?, ?, ?)')
      .bind(game_id, visitor_id, score).run();

    // Calcular rango del jugador (posición basada en su mejor puntuación)
    const rankRow = await env.DB.prepare(`
      SELECT COUNT(*) + 1 AS rank
      FROM (
        SELECT MAX(score) AS best
        FROM game_scores
        WHERE game_id = ?
        GROUP BY visitor_id
        HAVING MAX(score) > (
          SELECT MAX(score) FROM game_scores WHERE game_id = ? AND visitor_id = ?
        )
      )
    `).bind(game_id, game_id, visitor_id).first<{ rank: number }>();

    const rank = rankRow?.rank ?? 1;
    const isRecord = rank === 1;

    return new Response(JSON.stringify({ ok: true, rank, isRecord }), { status: 200, headers: H });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Database error' }), { status: 500, headers: H });
  }
};
