import { verifyAuth, checkRole } from '../_auth-util';
import bcrypt from 'bcryptjs';

interface Env { DB: D1Database; JWT_SECRET: string }

const H = { 'Content-Type': 'application/json' };
const bad = (msg: string) => new Response(JSON.stringify({ ok: false, error: msg }), { status: 400, headers: H });
const unauthorized = () => new Response(JSON.stringify({ ok: false, error: 'Forbidden' }), { status: 403, headers: H });

/* ── GET /api/admin/users — lista todos los usuarios ── */
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const auth = await verifyAuth(request, env.JWT_SECRET);
  if (!auth || !checkRole(['super_admin'], auth.role)) return unauthorized();

  try {
    const { results } = await env.DB.prepare('SELECT id, username, role, active FROM admin_users ORDER BY username')
      .all<{ id: number; username: string; role: string; active: number }>();
    return new Response(JSON.stringify({ ok: true, data: results }), { status: 200, headers: H });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Database error' }), { status: 500, headers: H });
  }
};

/* ── POST /api/admin/users — crear nuevo usuario ── */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const auth = await verifyAuth(request, env.JWT_SECRET);
  if (!auth || !checkRole(['super_admin'], auth.role)) return unauthorized();

  const body = await request.json() as {
    username?: string; password?: string; role?: string;
  };
  const { username, password, role = 'user' } = body;
  if (!username || !password) return bad('Missing username or password');
  if (!['super_admin', 'user'].includes(role)) return bad('Invalid role');

  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await env.DB.prepare(
      'INSERT INTO admin_users (username, password_hash, role, active) VALUES (?, ?, ?, 1)'
    ).bind(username, hash, role).run();

    const newUserId = Number(result.meta.last_row_id);
    await env.DB.batch([
      env.DB.prepare('INSERT INTO moneta_profiles (user_id, name, sort_order) VALUES (?, ?, ?)').bind(newUserId, 'Pareja', 1),
      env.DB.prepare('INSERT INTO moneta_profiles (user_id, name, sort_order) VALUES (?, ?, ?)').bind(newUserId, 'Personal', 2),
    ]);

    return new Response(JSON.stringify({ ok: true, id: newUserId }), { status: 200, headers: H });
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('UNIQUE')) {
      return new Response(JSON.stringify({ ok: false, error: 'Username already exists' }), { status: 409, headers: H });
    }
    return new Response(JSON.stringify({ ok: false, error: 'Database error' }), { status: 500, headers: H });
  }
};

/* ── PATCH /api/admin/users?id=N — actualizar usuario ── */
export const onRequestPatch: PagesFunction<Env> = async ({ request, env }) => {
  const auth = await verifyAuth(request, env.JWT_SECRET);
  if (!auth || !checkRole(['super_admin'], auth.role)) return unauthorized();

  const id = new URL(request.url).searchParams.get('id');
  if (!id) return bad('Missing user ID');

  const body = await request.json() as {
    username?: string; password?: string; role?: string; active?: boolean;
  };

  try {
    const parts: string[] = [];
    const vals: unknown[] = [];
    if (body.username !== undefined) { parts.push('username=?'); vals.push(body.username); }
    if (body.password !== undefined) { parts.push('password_hash=?'); vals.push(await bcrypt.hash(body.password, 10)); }
    if (body.role !== undefined) {
      if (!['super_admin', 'user'].includes(body.role)) return bad('Invalid role');
      parts.push('role=?'); vals.push(body.role);
    }
    if (body.active !== undefined) {
      if (id === String(auth.user_id)) return bad('No puedes desactivar tu propia cuenta');
      parts.push('active=?'); vals.push(body.active ? 1 : 0);
    }
    if (parts.length === 0) return bad('Nothing to update');

    await env.DB.prepare(`UPDATE admin_users SET ${parts.join(', ')} WHERE id=?`)
      .bind(...vals, id).run();
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: H });
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('UNIQUE')) {
      return new Response(JSON.stringify({ ok: false, error: 'Username already exists' }), { status: 409, headers: H });
    }
    return new Response(JSON.stringify({ ok: false, error: 'Database error' }), { status: 500, headers: H });
  }
};

/* ── DELETE /api/admin/users?id=N — eliminar usuario ── */
export const onRequestDelete: PagesFunction<Env> = async ({ request, env }) => {
  const auth = await verifyAuth(request, env.JWT_SECRET);
  if (!auth || !checkRole(['super_admin'], auth.role)) return unauthorized();

  const id = new URL(request.url).searchParams.get('id');
  if (!id) return bad('Missing user ID');

  try {
    if (id === String(auth.user_id)) return bad('Cannot delete your own account');
    await env.DB.prepare('DELETE FROM admin_users WHERE id=?').bind(id).run();
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: H });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Database error' }), { status: 500, headers: H });
  }
};
