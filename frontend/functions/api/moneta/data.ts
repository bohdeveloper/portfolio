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

    // Los ítems NO filtran por user_id directamente porque moneta_items no tiene esa columna.
    // El acceso se restringe de forma indirecta: solo se devuelven los perfiles del usuario
    // (query anterior), y luego en JS se filtran los ítems por profile_id de esos perfiles.
    // Esto significa que un ítem de otro usuario con el mismo year/month nunca llegaría
    // al cliente, ya que su profile_id no aparecería en el array de perfiles del usuario.
    const { results: items } = await env.DB.prepare(`
      SELECT id, profile_id, name, amount, real_amount, type, sort_order
      FROM moneta_items
      WHERE year = ? AND month = ?
      ORDER BY profile_id, sort_order, id
    `).bind(year, month).all<ItemRow>();

    const { results: summaries } = await env.DB.prepare(`
      SELECT profile_id, saldo_inicial, closed, closed_at, last_modified
      FROM moneta_monthly_summary
      WHERE year = ? AND month = ?
    `).bind(year, month).all<SummaryRow>();

    const data = profiles.map(p => ({
      ...p,
      items:   items.filter(i => i.profile_id === p.id),
      summary: summaries.find(s => s.profile_id === p.id) ?? null,
    }));

    return new Response(JSON.stringify({ ok: true, data }), { status: 200, headers: H });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Database error';
    return new Response(JSON.stringify({ ok: false, error: msg }), { status: 500, headers: H });
  }
};
