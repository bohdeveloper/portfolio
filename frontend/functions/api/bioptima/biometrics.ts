import { verifyAuth } from '../_auth-util';

interface Env { DB: D1Database; JWT_SECRET: string }

const H = { 'Content-Type': 'application/json' };

interface ProfileRow {
  sex: string; age: number; height_cm: number; activity_factor: number;
}

interface BiometricRow {
  id: number; date: string; weight_kg: number;
  waist_cm: number | null; hip_cm: number | null; neck_cm: number | null;
  chest_cm: number | null; bicep_cm: number | null; thigh_cm: number | null;
  bmi: number | null; body_fat_pct: number | null; lean_mass_kg: number | null;
  bmr: number | null; tdee: number | null; created_at: string;
}

/* ── Cálculos biométricos ─────────────────────────────────────────────────
   Todos los valores se redondean a 2 decimales y se almacenan en la fila
   para evitar recalcular en cada consulta. Si faltan medidas para la fórmula
   US Navy, body_fat_pct se guarda como null. */

function calcBMI(weight_kg: number, height_cm: number): number {
  const h = height_cm / 100;
  return Math.round((weight_kg / (h * h)) * 100) / 100;
}

function calcBodyFat(
  sex: string, waist_cm: number | null, hip_cm: number | null,
  neck_cm: number | null, height_cm: number
): number | null {
  if (!waist_cm || !neck_cm) return null;
  if (sex === 'female' && !hip_cm) return null;

  const h = height_cm;
  let pct: number;
  if (sex === 'male') {
    // US Navy hombre: 86.01·log10(cintura-cuello) − 70.04·log10(talla) + 36.76
    pct = 86.01 * Math.log10(waist_cm - neck_cm) - 70.04 * Math.log10(h) + 36.76;
  } else {
    // US Navy mujer: 163.2·log10(cintura+cadera-cuello) − 97.72·log10(talla) − 78.39
    pct = 163.2 * Math.log10(waist_cm + hip_cm! - neck_cm) - 97.72 * Math.log10(h) - 78.39;
  }
  return Math.max(0, Math.round(pct * 100) / 100);
}

function calcBMR(sex: string, weight_kg: number, height_cm: number, age: number): number {
  // Mifflin-St Jeor
  const base = 10 * weight_kg + 6.25 * height_cm - 5 * age;
  return Math.round((sex === 'male' ? base + 5 : base - 161) * 100) / 100;
}

/* ── GET /api/bioptima/biometrics — historial de registros (máx 90) ── */
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const auth = await verifyAuth(request, env.JWT_SECRET);
  if (!auth)
    return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401, headers: H });

  const limit = parseInt(new URL(request.url).searchParams.get('limit') ?? '90');

  const { results } = await env.DB.prepare(`
    SELECT id, date, weight_kg, waist_cm, hip_cm, neck_cm, chest_cm, bicep_cm, thigh_cm,
           bmi, body_fat_pct, lean_mass_kg, bmr, tdee, created_at
    FROM bioptima_biometrics
    WHERE user_id = ?
    ORDER BY date DESC
    LIMIT ?
  `).bind(auth.user_id, limit).all<BiometricRow>();

  return new Response(JSON.stringify({ ok: true, records: results }), { status: 200, headers: H });
};

/* ── POST /api/bioptima/biometrics — nuevo registro con cálculos ── */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const auth = await verifyAuth(request, env.JWT_SECRET);
  if (!auth)
    return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401, headers: H });

  let body: {
    date?: string; weight_kg?: number;
    waist_cm?: number; hip_cm?: number; neck_cm?: number;
    chest_cm?: number; bicep_cm?: number; thigh_cm?: number;
  };
  try { body = await request.json(); } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid JSON' }), { status: 400, headers: H });
  }

  const { date, weight_kg } = body;
  if (!date || !weight_kg)
    return new Response(JSON.stringify({ ok: false, error: 'date y weight_kg son obligatorios' }), { status: 400, headers: H });

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
    return new Response(JSON.stringify({ ok: false, error: 'Formato de fecha inválido (YYYY-MM-DD)' }), { status: 400, headers: H });

  // Necesitamos el perfil del usuario para los cálculos
  const { results: profileRows } = await env.DB.prepare(
    'SELECT sex, age, height_cm, activity_factor FROM bioptima_profile WHERE user_id = ?'
  ).bind(auth.user_id).all<ProfileRow>();

  const profile = profileRows[0];
  if (!profile)
    return new Response(JSON.stringify({ ok: false, error: 'Perfil no encontrado — guarda primero los datos de perfil' }), { status: 400, headers: H });

  const { sex, age, height_cm, activity_factor } = profile;
  const { waist_cm = null, hip_cm = null, neck_cm = null, chest_cm = null, bicep_cm = null, thigh_cm = null } = body;

  const bmi          = calcBMI(weight_kg, height_cm);
  const body_fat_pct = calcBodyFat(sex, waist_cm, hip_cm, neck_cm, height_cm);
  const lean_mass_kg = body_fat_pct !== null
    ? Math.round(weight_kg * (1 - body_fat_pct / 100) * 100) / 100
    : null;
  const bmr  = calcBMR(sex, weight_kg, height_cm, age);
  const tdee = Math.round(bmr * activity_factor * 100) / 100;

  try {
    const { meta } = await env.DB.prepare(`
      INSERT INTO bioptima_biometrics
        (user_id, date, weight_kg, waist_cm, hip_cm, neck_cm, chest_cm, bicep_cm, thigh_cm,
         bmi, body_fat_pct, lean_mass_kg, bmr, tdee)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, date) DO UPDATE SET
        weight_kg    = excluded.weight_kg,
        waist_cm     = excluded.waist_cm,
        hip_cm       = excluded.hip_cm,
        neck_cm      = excluded.neck_cm,
        chest_cm     = excluded.chest_cm,
        bicep_cm     = excluded.bicep_cm,
        thigh_cm     = excluded.thigh_cm,
        bmi          = excluded.bmi,
        body_fat_pct = excluded.body_fat_pct,
        lean_mass_kg = excluded.lean_mass_kg,
        bmr          = excluded.bmr,
        tdee         = excluded.tdee
    `).bind(
      auth.user_id, date, weight_kg,
      waist_cm, hip_cm, neck_cm, chest_cm, bicep_cm, thigh_cm,
      bmi, body_fat_pct, lean_mass_kg, bmr, tdee
    ).run();

    return new Response(JSON.stringify({
      ok: true, id: meta.last_row_id,
      calc: { bmi, body_fat_pct, lean_mass_kg, bmr, tdee }
    }), { status: 200, headers: H });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Database error';
    return new Response(JSON.stringify({ ok: false, error: msg }), { status: 500, headers: H });
  }
};

/* ── DELETE /api/bioptima/biometrics?id=N — eliminar un registro ── */
export const onRequestDelete: PagesFunction<Env> = async ({ request, env }) => {
  const auth = await verifyAuth(request, env.JWT_SECRET);
  if (!auth)
    return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401, headers: H });

  const id = parseInt(new URL(request.url).searchParams.get('id') ?? '');
  if (!id)
    return new Response(JSON.stringify({ ok: false, error: 'id requerido' }), { status: 400, headers: H });

  await env.DB.prepare(
    'DELETE FROM bioptima_biometrics WHERE id = ? AND user_id = ?'
  ).bind(id, auth.user_id).run();

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: H });
};
