import { verifyAuth } from '../_auth-util';
import { validateStr, validateInt } from '../_security';

interface Env {
  DB: D1Database;
  JWT_SECRET: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const headers = { 'Content-Type': 'application/json' };

  const auth = await verifyAuth(request, env.JWT_SECRET);
  if (!auth) return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401, headers });

  let body: { day_index?: number; name?: string; cat_key?: string; start_min?: number; end_min?: number; description?: string; track?: number };
  try { body = await request.json(); } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid JSON' }), { status: 400, headers });
  }

  const { day_index, name, cat_key, start_min, end_min, description = '', track = 1 } = body;
  if (day_index === undefined || !name || !cat_key || start_min === undefined || end_min === undefined) {
    return new Response(JSON.stringify({ ok: false, error: 'Missing fields' }), { status: 400, headers });
  }
  if (validateInt(day_index, 0, 6) === null)
    return new Response(JSON.stringify({ ok: false, error: 'day_index must be 0-6' }), { status: 400, headers });
  if (!validateStr(name, 1, 120))
    return new Response(JSON.stringify({ ok: false, error: 'name: 1-120 caracteres' }), { status: 400, headers });
  if (!validateStr(cat_key, 1, 40))
    return new Response(JSON.stringify({ ok: false, error: 'cat_key inválido' }), { status: 400, headers });
  if (validateInt(start_min, 0, 1439) === null || validateInt(end_min, 1, 1440) === null)
    return new Response(JSON.stringify({ ok: false, error: 'Horario inválido' }), { status: 400, headers });
  if (typeof description === 'string' && description.length > 500)
    return new Response(JSON.stringify({ ok: false, error: 'description: máximo 500 caracteres' }), { status: 400, headers });

  const activity_id = 't_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);

  const result = await env.DB.prepare(
    `INSERT INTO tracker_tasks (user_id, day_index, activity_id, name, cat_key, start_min, end_min, description, track)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(auth.user_id, day_index, activity_id, name, cat_key, start_min, end_min, description, track).run();

  return new Response(JSON.stringify({ ok: true, id: result.meta.last_row_id, activity_id }), { status: 200, headers });
};

export const onRequestPatch: PagesFunction<Env> = async ({ request, env }) => {
  const headers = { 'Content-Type': 'application/json' };

  const auth = await verifyAuth(request, env.JWT_SECRET);
  if (!auth) return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401, headers });

  let body: { id?: number; name?: string; cat_key?: string; start_min?: number; end_min?: number; description?: string; track?: number };
  try { body = await request.json(); } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid JSON' }), { status: 400, headers });
  }

  const { id, name, cat_key, start_min, end_min, description, track } = body;
  if (!id) return new Response(JSON.stringify({ ok: false, error: 'Missing id' }), { status: 400, headers });

  // Validar campos opcionales si se envían
  if (name !== undefined && !validateStr(name, 1, 120))
    return new Response(JSON.stringify({ ok: false, error: 'name: 1-120 caracteres' }), { status: 400, headers });
  if (cat_key !== undefined && !validateStr(cat_key, 1, 40))
    return new Response(JSON.stringify({ ok: false, error: 'cat_key inválido' }), { status: 400, headers });
  if (start_min !== undefined && validateInt(start_min, 0, 1439) === null)
    return new Response(JSON.stringify({ ok: false, error: 'Horario inválido' }), { status: 400, headers });
  if (end_min !== undefined && validateInt(end_min, 1, 1440) === null)
    return new Response(JSON.stringify({ ok: false, error: 'Horario inválido' }), { status: 400, headers });
  if (description !== undefined && description.length > 500)
    return new Response(JSON.stringify({ ok: false, error: 'description: máximo 500 caracteres' }), { status: 400, headers });

  const sets: string[] = [];
  const vals: unknown[] = [];
  if (name !== undefined)        { sets.push('name = ?');        vals.push(name); }
  if (cat_key !== undefined)     { sets.push('cat_key = ?');     vals.push(cat_key); }
  if (start_min !== undefined)   { sets.push('start_min = ?');   vals.push(start_min); }
  if (end_min !== undefined)     { sets.push('end_min = ?');     vals.push(end_min); }
  if (description !== undefined) { sets.push('description = ?'); vals.push(description); }
  if (track !== undefined)       { sets.push('track = ?');       vals.push(track); }
  if (sets.length === 0) return new Response(JSON.stringify({ ok: true }), { status: 200, headers });

  vals.push(id, auth.user_id);
  await env.DB.prepare(
    `UPDATE tracker_tasks SET ${sets.join(', ')} WHERE id = ? AND user_id = ?`
  ).bind(...vals).run();

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
};

export const onRequestDelete: PagesFunction<Env> = async ({ request, env }) => {
  const headers = { 'Content-Type': 'application/json' };

  const auth = await verifyAuth(request, env.JWT_SECRET);
  if (!auth) return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401, headers });

  const id = parseInt(new URL(request.url).searchParams.get('id') ?? '');
  if (!id) return new Response(JSON.stringify({ ok: false, error: 'Missing id' }), { status: 400, headers });

  await env.DB.prepare('DELETE FROM tracker_tasks WHERE id = ? AND user_id = ?').bind(id, auth.user_id).run();

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
};
