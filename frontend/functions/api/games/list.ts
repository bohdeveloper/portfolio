interface Env { DB: D1Database }

const H = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  try {
    const { results: games } = await env.DB.prepare(
      'SELECT id, name, slug, description, url, screenshot, is_top, vote_count, created_at FROM games ORDER BY is_top DESC, created_at DESC'
    ).all<{ id: number; name: string; slug: string; description: string; url: string; screenshot: string; is_top: number; vote_count: number; created_at: string }>();

    const { results: reactions } = await env.DB.prepare(
      'SELECT game_id, emoji, count FROM game_reactions'
    ).all<{ game_id: number; emoji: string; count: number }>();

    const reactionMap: Record<number, Record<string, number>> = {};
    for (const r of reactions) {
      if (!reactionMap[r.game_id]) reactionMap[r.game_id] = {};
      reactionMap[r.game_id][r.emoji] = r.count;
    }

    // TOP comunidad = juego con más reacciones totales (suma de todos los emojis)
    const totalReactions = (id: number) =>
      Object.values(reactionMap[id] ?? {}).reduce((s, n) => s + n, 0);

    const maxReactions = Math.max(0, ...games.map(g => totalReactions(g.id)));
    const communityTopId = maxReactions > 0
      ? games.find(g => totalReactions(g.id) === maxReactions)?.id ?? null
      : games.find(g => g.is_top)?.id ?? null;

    const data = games.map(g => ({
      ...g,
      reactions:         reactionMap[g.id] ?? {},
      total_reactions:   totalReactions(g.id),
      is_community_top:  g.id === communityTopId ? 1 : 0,
    }));

    const top = data.find(g => g.is_community_top) ?? data.find(g => g.is_top) ?? null;

    return new Response(JSON.stringify({ ok: true, games: data, top }), { status: 200, headers: H });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Database error' }), { status: 500, headers: H });
  }
};
