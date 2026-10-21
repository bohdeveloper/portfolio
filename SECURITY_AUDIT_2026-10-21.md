# Auditoría de seguridad — bohdeveloper.com — 21 de octubre de 2026

Alcance: sitio público (Next.js 15 en export estático), API en Cloudflare Pages
Functions (45 endpoints), base D1 `bohdeveloper-admin`, panel `/admin` con
cuatro apps multiusuario (Moneta, Tracker, Bioptima, TintAI), dependencias npm
e historial de git. Comprobación estática del código y peticiones reales contra
producción.

## Resumen ejecutivo

**0 críticos · 0 altos · 5 medios · 10 bajos.** La base es sólida:
- La autenticación está centralizada y bien hecha: bcrypt, JWT HS256 de 4 h y
  cookie `HttpOnly; Secure; SameSite=Strict`.
- Todas las consultas a D1 están parametrizadas.
- Las cuatro apps privadas filtran siempre por el usuario de la sesión: no hay
  IDOR explotable entre usuarios.
- Ningún secreto está en el repositorio ni en su historial.

El riesgo real estaba en el abuso de recursos: endpoints públicos de escritura
sin uso y generación de pago sin cuota. Le seguían la cadena de suministro
(scripts de CDN sin SRI y dependencias con CVE) y la falta de CSP. Quedan
corregidos 4 medios y 7 bajos. Lo pendiente necesita una decisión o una acción
manual tuya.

## Hallazgos

### 🔴 Crítico

Ninguno.

### 🟠 Alto

Ninguno.

### 🟡 Medio

- **Endpoints públicos de escritura anónima sin uso** — `functions/api/games/{score,visitor,vote,react}.ts`
  - Riesgo: cualquiera podía crear visitantes, puntuaciones, votos y reacciones
    sin autenticación ni rate limit. Un script en bucle agotaría la cuota
    diaria de escrituras de D1. Esa base es la misma del panel y de los
    comentarios, así que caería todo. Además los juegos ya no están en la web
    desde hoy.
  - Fix: eliminados `visitor.ts`, `vote.ts` y `react.ts`, y el `POST` de
    `score.ts`. Se conservan la lectura y el `DELETE` de administración.
  - Estado: **Corregido**

- **Generación de pago sin cuota en TintAI** — `functions/api/tintai/generate.ts`
  - Riesgo: cualquier cuenta del panel (también rol `user`) podía crear libros
    sin límite. Además, el `chapter_index` era libre: un mismo libro admitía
    capítulos infinitos, y cada uno es una llamada de pago a la API de
    Anthropic. Una cuenta comprometida vaciaría el saldo.
  - Fix: cuota de 5 libros por usuario cada 24 h (respuesta 429) y
    `chapter_index` acotado al índice del libro.
  - Estado: **Corregido**

- **Sin Content-Security-Policy** — `functions/_middleware.ts`
  - Riesgo: sin CSP, cualquier XSS que apareciera podría cargar scripts de
    cualquier dominio, inyectar `<base>` o embeber objetos.
  - Fix: CSP global. `default-src 'self'`; scripts solo propios y de
    cdnjs/jsdelivr; `object-src 'none'`; `base-uri`, `form-action` y
    `frame-ancestors` en `'self'`.
  - Limitación: `'unsafe-inline'` en scripts es inevitable con el export
    estático de Next (hidratación y JSON-LD inline, sin servidor que genere
    nonces).
  - Estado: **Corregido (parcial por diseño)**

- **Scripts de CDN sin Subresource Integrity** — `src/app/blog/page.tsx`, `src/app/admin/dashboard/tintai/page.tsx`, `src/app/admin/dashboard/tracker/page.tsx`
  - Riesgo: `marked` y `Chart.js` se cargaban de CDN sin comprobación. En el
    caso de TintAI la versión además era flotante (`marked@12`). Si el CDN o
    el paquete se comprometían, ese código corría en la sesión del admin y
    podía llamar a la API como tú.
  - Fix: versión exacta (`marked@12.0.2`), `integrity` sha384 y
    `crossOrigin="anonymous"` en los tres.
  - Estado: **Corregido**

- **Dependencias con vulnerabilidades conocidas** — `frontend/package.json`
  - Riesgo: `npm audit` daba 33 vulnerabilidades (1 crítica, 6 altas). La
    crítica es de `next` 15.1.6, cuyas CVE son casi todas de servidor y no
    aplican a un export estático. TipTap/ProseMirror tenían XSS al pegar
    contenido en el editor del admin.
  - Fix: `next` 15.5.28 (parche dentro de la versión 15), TipTap 3.32 y
    `npm audit fix`. Quedan 2.
  - Estado: **Corregido**. Queda `postcss` interno de Next: ver 🟢.

- **Las sesiones no se revocan al desactivar un usuario o cambiarle el rol** — `functions/api/_auth-util.ts`
  - Riesgo: `verifyAuth` solo valida firma y caducidad del JWT. Un usuario
    desactivado o degradado conserva su acceso y su rol hasta 4 h.
  - Fix propuesto: comprobar `active` y `role` en `admin_users` dentro de
    `verifyAuth`, o añadir un `token_version` a la tabla e incluirlo en el JWT.
  - Por qué no lo he aplicado: cambia la firma de una función con 54 llamadas
    (CLAUDE.md exige `detect_changes`) y añade una lectura de D1 por petición.
    Con pocos usuarios de confianza, es una decisión tuya.
  - Estado: **Pendiente — decisión del usuario**

### 🟢 Bajo

- **Borradores visibles para cualquier cuenta del panel** — `functions/api/blog/list.ts`, `functions/api/projects/list.ts`
  - Riesgo: el modo `?admin=true` validaba el JWT pero no el rol. Una cuenta
    `user` (Moneta, Tracker…) podía leer posts y proyectos sin publicar,
    contenido completo incluido.
  - Fix: el modo admin exige `role === 'super_admin'`.
  - Estado: **Corregido**

- **Errores internos de D1 devueltos al cliente** — `functions/api/moneta/*.ts`, `functions/api/bioptima/stats.ts`
  - Riesgo: `err.message` llegaba a la respuesta y filtraba nombres de tabla y
    restricciones. Rompía el patrón `dbError` de spec.md.
  - Fix: mensaje genérico `Database error`.
  - Estado: **Corregido**

- **Moneta: `last_modified` de un ítem ajeno** — `functions/api/moneta/item.ts` (PATCH)
  - Riesgo: el `UPDATE` sí filtraba por usuario, pero la lectura posterior no.
    Bastaba un id ajeno para tocar la fecha de modificación del resumen de
    otro usuario. Solo afectaba a la integridad, no a la confidencialidad.
  - Fix: la lectura filtra por los perfiles del usuario.
  - Estado: **Corregido**

- **TintAI: `finalize` y el registro de errores sin ownership** — `functions/api/tintai/generate.ts`
  - Riesgo: `finalize` devolvía el recuento de palabras de un libro ajeno, y el
    `UPDATE` de error se escribía sin filtrar por usuario.
  - Fix: ambas consultas filtran por `user_id`.
  - Estado: **Corregido**

- **Rate limit del login solo por IP** — `functions/api/auth/login.ts`
  - Riesgo: un ataque distribuido desde muchas IP no se frena. Lo mitigan
    bcrypt (coste 10) y el bloqueo de 5 intentos cada 15 min por IP.
  - Fix propuesto: contador también por `username`, y regla de rate limiting
    o Turnstile de Cloudflare sobre `/api/auth/login`.
  - Estado: **Pendiente**

- **Sin política de contraseñas al crear usuarios** — `functions/api/admin/users.ts`
  - Riesgo: el super_admin puede crear cuentas con contraseñas triviales, y
    sin límite de longitud (bcrypt trunca a 72 bytes).
  - Fix propuesto: `validateStr(password, 12, 72)`.
  - Estado: **Pendiente**

- **Hash de IP de comentarios con sal fija y pública** — `functions/api/blog/comments.ts`
  - Riesgo: la sal `boh_comments_` está en el repositorio público. Con ella,
    el espacio IPv4 se recorre en minutos y el `ip_hash` se puede revertir a
    la IP, que es un dato personal según el RGPD.
  - Fix propuesto: sal secreta en una variable de entorno
    (`COMMENTS_IP_SALT`). Implica que los bans actuales dejan de coincidir.
  - Estado: **Pendiente — requiere crear el secreto en Cloudflare**

- **`innerHTML` con datos propios en el panel** — `tracker/page.tsx`, `tintai/page.tsx`
  - Riesgo: XSS contra uno mismo. Los nombres de actividad y el Markdown
    generado se pintan sin escapar, pero cada usuario solo ve sus datos.
    `marked` no sanea el HTML.
  - Fix propuesto: escapar en el tracker y pasar la salida de `marked` por
    DOMPurify.
  - Estado: **Pendiente (aceptable)**

- **`postcss` vulnerable dentro de Next** — `node_modules/next/node_modules/postcss`
  - Riesgo: solo actúa al compilar, sobre el CSS propio. No llega a
    producción.
  - Fix: requiere Next 16, que es un cambio de versión mayor.
  - Estado: **Aceptado**

- **`jwtVerify` sin fijar algoritmos** — `_auth-util.ts`, `admin/_middleware.ts`, `auth/me.ts`
  - Riesgo: prácticamente nulo. `jose` con clave simétrica solo acepta HS* y
    rechaza `alg: none` (comprobado contra producción).
  - Fix propuesto: `jwtVerify(token, secret, { algorithms: ['HS256'] })` como
    defensa en profundidad.
  - Estado: **Pendiente**

## Lo que está bien (comprobado)

- Ningún secreto versionado: `git ls-files` y el historial sin `.env` ni
  `.dev.vars`, y grep de claves (`sk-ant-`, `AKIA`, JWT) sin resultados.
  `ANTHROPIC_API_KEY` solo se usa en servidor.
- Las 45 funciones usan `prepare().bind()`. La única interpolación de SQL son
  nombres de columna de listas blancas o constantes.
- IDOR: Moneta comprueba el perfil del usuario; Tracker, Bioptima y TintAI
  filtran por `auth.user_id` en cada lectura y escritura.
- Escritura de contenido público (blog, proyectos, juegos) solo para
  `super_admin`, por lo que el `innerHTML` del blog no es explotable por
  terceros.
- Comentarios moderados, con rate limit (3 cada 10 min por IP) y baneo.
- Login con hash ficticio contra la enumeración de usuarios por tiempo.
- CSRF cubierto por `SameSite=Strict`. CORS `*` solo en lecturas públicas sin
  credenciales.
- Cabeceras: HSTS, nosniff, X-Frame-Options, Referrer-Policy y
  Permissions-Policy (ahora también CSP).

## Verificación

| Comprobación | Resultado |
|---|---|
| `GET /api/moneta/data`, `/api/tracker/schedule`, `/api/projects/list?admin=true` sin cookie | 401 |
| `GET /api/admin/users`, `/api/blog/comments?admin=1` sin cookie | 403 |
| `GET /api/admin/users` con JWT `alg: none` y rol `super_admin` | 403 |
| `GET /.dev.vars`, `/.git/config`, `/wrangler.toml`, `/schema.sql` | 404 |
| `GET /admin/dashboard` sin sesión | 302 → login |
| Grep de `err.message` en respuestas de moneta/bioptima tras el fix | 0 apariciones |
| Hash SRI: descarga de cada script y `openssl dgst -sha384` | Coincide con el `integrity` |
| `npm audit --omit=dev` | 33 → 2 vulnerabilidades (0 críticas) |
| `npm run build` con Next 15.5.28 | 17/17 páginas exportadas |

**Pendiente de verificar tras el despliegue:**
- Cabecera `Content-Security-Policy` en producción, sin errores de CSP en
  consola, en la home, `/blog`, `/admin/dashboard/tracker` y `tintai`.
- `POST /api/games/visitor` devuelve 404/405.
