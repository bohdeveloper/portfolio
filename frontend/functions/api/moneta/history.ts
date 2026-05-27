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

interface HistoryRow {
  profile_id: number; profile_name: string;
  year: number; month: number;
  ingresos_prev: number; gastos_prev: number; gastos_real: number; n_real: number;
}

/* ── GET /api/moneta/history
   Devuelve el ahorro mensual por perfil (todos los meses con datos). */
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (!await auth(request, env))
    return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401, headers: H });

  try {
    const { results } = await env.DB.prepare(`
      SELECT
        i.profile_id,
        p.name  AS profile_name,
        i.year,
        i.month,
        CAST(SUM(CASE WHEN i.type='ingreso' THEN i.amount ELSE 0 END) AS REAL) AS ingresos_prev,
        CAST(SUM(CASE WHEN i.type='gasto'   THEN i.amount ELSE 0 END) AS REAL) AS gastos_prev,
        CAST(SUM(CASE WHEN i.type='gasto' AND i.real_amount IS NOT NULL
                      THEN i.real_amount ELSE 0 END) AS REAL) AS gastos_real,
        SUM(CASE WHEN i.type='gasto' AND i.real_amount IS NOT NULL THEN 1 ELSE 0 END) AS n_real
      FROM moneta_items i
      JOIN moneta_profiles p ON p.id = i.profile_id
      GROUP BY i.profile_id, i.year, i.month
      ORDER BY i.year ASC, i.month ASC
    `).all<HistoryRow>();

    return new Response(JSON.stringify({ ok: true, data: results }), { status: 200, headers: H });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Database error';
    return new Response(JSON.stringify({ ok: false, error: msg }), { status: 500, headers: H });
  }
};
