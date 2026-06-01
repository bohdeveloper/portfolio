import { verifyAuth } from '../_auth-util';

interface Env { DB: D1Database; JWT_SECRET: string }

const H = { 'Content-Type': 'application/json' };

interface HistoryRow {
  profile_id: number; profile_name: string;
  year: number; month: number;
  ingresos_prev: number; gastos_prev: number; gastos_real: number; n_real: number;
}

/* ── GET /api/moneta/history
   Devuelve el ahorro mensual por perfil (todos los meses con datos). */
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const auth = await verifyAuth(request, env.JWT_SECRET);
  if (!auth)
    return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401, headers: H });

  try {
    // La query agrega todos los ítems por perfil y mes para calcular el ahorro histórico.
    // Se calculan tres métricas clave:
    //   · gastos_prev  = suma de amount de gastos (presupuesto previsto)
    //   · gastos_real  = suma de real_amount de gastos que tienen importe real registrado
    //   · n_real       = número de gastos con importe real registrado
    //
    // En el cliente, el ahorro se calcula así:
    //   si n_real > 0  →  ingresos_prev - gastos_real   (mes parcial o cerrado con datos reales)
    //   si n_real == 0 →  ingresos_prev - gastos_prev   (mes sin importe real: se usa el presupuesto)
    // Esto permite mostrar el ahorro real cuando existe y el estimado cuando no.
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
      WHERE p.user_id = ?
      GROUP BY i.profile_id, i.year, i.month
      ORDER BY i.year ASC, i.month ASC
    `).bind(auth.user_id).all<HistoryRow>();

    return new Response(JSON.stringify({ ok: true, data: results }), { status: 200, headers: H });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Database error';
    return new Response(JSON.stringify({ ok: false, error: msg }), { status: 500, headers: H });
  }
};
