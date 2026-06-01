import { verifyAuth } from '../_auth-util';

interface Env {
  DB: D1Database;
  JWT_SECRET: string;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const headers = { 'Content-Type': 'application/json' };

  const auth = await verifyAuth(request, env.JWT_SECRET);
  if (!auth) return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401, headers });

  const url = new URL(request.url);
  const start = url.searchParams.get('start');
  if (!start || !/^\d{4}-\d{2}-\d{2}$/.test(start)) {
    return new Response(JSON.stringify({ ok: false, error: 'Missing or invalid start date' }), { status: 400, headers });
  }

  const startDate = new Date(start);
  const endDate   = new Date(startDate);
  // Se calcula el fin de semana sumando 6 días al inicio para cubrir exactamente 7 días (lun-dom).
  endDate.setDate(startDate.getDate() + 6);
  const end = endDate.toISOString().slice(0, 10);

  // La query devuelve todos los registros de la semana sin agrupar: el cliente es responsable
  // de organizar los datos por día (date) y por actividad (activity_id).
  // day_index permite ordenar actividades que se repiten múltiples veces en el mismo día.
  const { results } = await env.DB.prepare(
    'SELECT date, activity_id, day_index, done, reason, updated_at FROM tracker_records WHERE user_id = ? AND date >= ? AND date <= ? ORDER BY date, activity_id'
  ).bind(auth.user_id, start, end).all();

  return new Response(JSON.stringify({ ok: true, data: results }), { status: 200, headers });
};
