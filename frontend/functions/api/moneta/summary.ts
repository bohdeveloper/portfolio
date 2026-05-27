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

/* ── POST /api/moneta/summary
   Guarda el saldo inicial o cierra/reabre el mes según `action`. */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!await auth(request, env))
    return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401, headers: H });

  const body = await request.json() as {
    profile_id: number; year: number; month: number;
    saldo_inicial?: number | null;
    action?: 'close' | 'reopen';
  };
  const { profile_id, year, month } = body;

  try {
    /* Guarda saldo inicial */
    if ('saldo_inicial' in body) {
      await env.DB.prepare(`
        INSERT INTO moneta_monthly_summary (profile_id, year, month, saldo_inicial)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(profile_id, year, month) DO UPDATE SET saldo_inicial = excluded.saldo_inicial
      `).bind(profile_id, year, month, body.saldo_inicial ?? null).run();
    }

    /* Cierra el mes */
    if (body.action === 'close') {
      await env.DB.prepare(`
        INSERT INTO moneta_monthly_summary (profile_id, year, month, closed, closed_at)
        VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP)
        ON CONFLICT(profile_id, year, month) DO UPDATE SET closed = 1, closed_at = CURRENT_TIMESTAMP
      `).bind(profile_id, year, month).run();
    }

    /* Reabre el mes */
    if (body.action === 'reopen') {
      await env.DB.prepare(`
        INSERT INTO moneta_monthly_summary (profile_id, year, month, closed)
        VALUES (?, ?, ?, 0)
        ON CONFLICT(profile_id, year, month) DO UPDATE SET closed = 0, closed_at = NULL
      `).bind(profile_id, year, month).run();
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: H });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Database error';
    return new Response(JSON.stringify({ ok: false, error: msg }), { status: 500, headers: H });
  }
};
