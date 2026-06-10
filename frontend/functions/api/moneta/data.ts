import { verifyAuth } from '../_auth-util';

interface Env { DB: D1Database; JWT_SECRET: string }

const H = { 'Content-Type': 'application/json' };

interface ItemRow {
  id: number; profile_id: number; name: string;
  amount: number; real_amount: number | null; type: string; sort_order: number;
}

interface SummaryRow {
  profile_id: number; saldo_inicial: number | null; closed: number; closed_at: string | null; last_modified: string | null;
}

/* ── GET /api/moneta/data?year=YYYY&month=M
   Devuelve los perfiles con ítems del mes y resumen mensual (saldo, estado). */
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const auth = await verifyAuth(request, env.JWT_SECRET);
  if (!auth)
    return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401, headers: H });

  const url   = new URL(request.url);
  const year  = parseInt(url.searchParams.get('year')  ?? String(new Date().getFullYear()));
  const month = parseInt(url.searchParams.get('month') ?? String(new Date().getMonth() + 1));

  try {
    const { results: profiles } = await env.DB.prepare(
      'SELECT * FROM moneta_profiles WHERE user_id = ? ORDER BY sort_order'
    ).bind(auth.user_id).all<{ id: number; name: string; sort_order: number }>();

    if (profiles.length === 0) {
      return new Response(JSON.stringify({ ok: true, data: [] }), { status: 200, headers: H });
    }

    // Filtrar items y summaries SOLO por los profile_ids que pertenecen al usuario.
    // Defensa en profundidad: la query SQL restringe por ownership, no solo JS del cliente.
    const profileIds = profiles.map(p => p.id);
    const ph = profileIds.map(() => '?').join(',');

    const { results: items } = await env.DB.prepare(`
      SELECT id, profile_id, name, amount, real_amount, type, sort_order
      FROM moneta_items
      WHERE year = ? AND month = ? AND profile_id IN (${ph})
      ORDER BY profile_id, sort_order, id
    `).bind(year, month, ...profileIds).all<ItemRow>();

    const { results: summaries } = await env.DB.prepare(`
      SELECT profile_id, saldo_inicial, closed, closed_at, last_modified
      FROM moneta_monthly_summary
      WHERE year = ? AND month = ? AND profile_id IN (${ph})
    `).bind(year, month, ...profileIds).all<SummaryRow>();

    const data = profiles.map(p => ({
      ...p,
      items:   items.filter(i => i.profile_id === p.id),
      summary: summaries.find(s => s.profile_id === p.id) ?? null,
    }));

    return new Response(JSON.stringify({ ok: true, data }), { status: 200, headers: H });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Database error' }), { status: 500, headers: H });
  }
};
