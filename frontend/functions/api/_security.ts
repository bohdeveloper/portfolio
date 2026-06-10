// Helpers de seguridad compartidos para los Cloudflare Pages Functions.
// Centraliza validaciones para garantizar consistencia en todos los endpoints.

/** Valida y recorta un string. Devuelve el string o null si no cumple los límites. */
export function validateStr(
  val: unknown,
  min: number,
  max: number,
): string | null {
  if (typeof val !== 'string') return null;
  const t = val.trim();
  if (t.length < min || t.length > max) return null;
  return t;
}

/** Valida que un número entero esté dentro de [min, max]. */
export function validateInt(
  val: unknown,
  min: number,
  max: number,
): number | null {
  const n = typeof val === 'number' ? val : parseInt(String(val), 10);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < min || n > max) return null;
  return n;
}

/** Valida que un número decimal esté dentro de [min, max]. */
export function validateFloat(
  val: unknown,
  min: number,
  max: number,
): number | null {
  const n = typeof val === 'number' ? val : parseFloat(String(val));
  if (!Number.isFinite(n) || n < min || n > max) return null;
  return n;
}

/** Valida una URL https. Devuelve '' si el campo está vacío, null si es inválida. */
export function validateHttpsUrl(val: unknown): string | null {
  if (typeof val !== 'string') return null;
  const t = val.trim();
  if (t === '') return '';
  try {
    const u = new URL(t);
    if (u.protocol !== 'https:') return null;
    return t;
  } catch {
    return null;
  }
}

/** Valida un color hex #rrggbb. */
export function validateHexColor(val: unknown): string | null {
  if (typeof val !== 'string') return null;
  const t = val.trim();
  return /^#[0-9a-fA-F]{6}$/.test(t) ? t : null;
}

/** Respuesta 500 genérica que nunca expone mensajes internos de BD. */
export function dbError(
  headers: Record<string, string>,
): Response {
  return new Response(
    JSON.stringify({ ok: false, error: 'Database error' }),
    { status: 500, headers },
  );
}
