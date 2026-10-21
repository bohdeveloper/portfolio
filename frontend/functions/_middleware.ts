export const onRequest: PagesFunction = async ({ next }) => {
  const response = await next();

  const headers = new Headers(response.headers);
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'SAMEORIGIN');
  headers.set('X-XSS-Protection', '1; mode=block');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  // CSP: solo scripts propios y de los dos CDN usados (con SRI). 'unsafe-inline'
  // es obligatorio: el export estático de Next inyecta scripts inline (hidratación,
  // JSON-LD, tema) y no hay servidor que genere nonces. Aun así bloquea scripts de
  // dominios ajenos, objetos embebidos, <base> inyectado y el enmarcado externo.
  headers.set('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-src 'self'",
    "frame-ancestors 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '));

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};
