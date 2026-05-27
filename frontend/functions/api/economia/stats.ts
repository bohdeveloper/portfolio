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

/* ── GET /api/economia/stats?year=YYYY&month=M ──
   Devuelve: totales del mes, desglose por categoría y tendencia 6 meses */
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (!await auth(request, env)) {
    return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401, headers: H });
  }

  const url   = new URL(request.url);
  const year  = parseInt(url.searchParams.get('year')  ?? String(new Date().getFullYear()));
  const month = parseInt(url.searchParams.get('month') ?? String(new Date().getMonth() + 1));
  const monthStr = `${year}-${String(month).padStart(2, '0')}`;

  try {
    // Totales del mes (ingresos y gastos)
    const totals = await env.DB.prepare(`
      SELECT
        SUM(CASE WHEN type='income'  THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) as expenses
      FROM eco_transactions
      WHERE strftime('%Y-%m', date) = ?
    `).bind(monthStr).first<{ income: number; expenses: number }>();

    // Desglose de gastos por categoría (para gráfica donut)
    const { results: byCategory } = await env.DB.prepare(`
      SELECT c.id, c.name, c.color, c.icon,
             SUM(t.amount) as total
      FROM eco_transactions t
      JOIN eco_categories c ON t.category_id = c.id
      WHERE strftime('%Y-%m', t.date) = ? AND t.type = 'expense'
      GROUP BY c.id
      ORDER BY total DESC
    `).bind(monthStr).all();

    // Meta de ahorro del mes actual
    const goalRow = await env.DB.prepare(
      'SELECT savings_goal FROM eco_goals WHERE year=? AND month=?'
    ).bind(year, month).first<{ savings_goal: number }>();

    // Tendencia de los últimos 6 meses (para gráfica de barras)
    const { results: trend } = await env.DB.prepare(`
      SELECT
        strftime('%Y-%m', date) as month,
        SUM(CASE WHEN type='income'  THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) as expenses
      FROM eco_transactions
      WHERE date >= date(?, '-5 months', 'start of month')
      GROUP BY strftime('%Y-%m', date)
      ORDER BY month ASC
    `).bind(`${monthStr}-01`).all();

    return new Response(JSON.stringify({
      ok: true,
      data: {
        income:       totals?.income   ?? 0,
        expenses:     totals?.expenses ?? 0,
        balance:      (totals?.income ?? 0) - (totals?.expenses ?? 0),
        savings_goal: goalRow?.savings_goal ?? 0,
        by_category:  byCategory,
        trend,
      }
    }), { status: 200, headers: H });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Database error';
    return new Response(JSON.stringify({ ok: false, error: msg }), { status: 500, headers: H });
  }
};

/* ── POST /api/economia/stats — guarda o actualiza la meta de ahorro mensual ── */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!await auth(request, env)) {
    return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401, headers: H });
  }

  const { year, month, savings_goal } = await request.json() as {
    year: number; month: number; savings_goal: number;
  };

  try {
    // UPSERT: inserta o actualiza la meta si ya existe para ese año/mes
    await env.DB.prepare(`
      INSERT INTO eco_goals (year, month, savings_goal, updated_at)
      VALUES (?, ?, ?, datetime('now'))
      ON CONFLICT(year, month) DO UPDATE SET savings_goal=excluded.savings_goal, updated_at=excluded.updated_at
    `).bind(year, month, savings_goal).run();
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: H });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Database error';
    return new Response(JSON.stringify({ ok: false, error: msg }), { status: 500, headers: H });
  }
};
