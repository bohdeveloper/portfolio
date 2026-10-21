# spec.md — bohdeveloper.com

> Documento vivo de especificación (Spec-Driven Development).
> Memoria del proyecto: qué es, cómo está construido, decisiones y metodología.
> El trabajo pendiente vive en [plan.md](plan.md), que incluye el histórico resumido de lo completado.
> **Regla: toda decisión nueva de producto o arquitectura se registra aquí en la misma sesión.**

---

## 1. Qué es bohdeveloper.com

Portfolio personal de **Borja Olazabal** en producción, que cumple dos funciones
distintas bajo el mismo despliegue:

**Escaparate profesional (público).** Es la herramienta principal de búsqueda de
empleo. Todo su contenido está escrito para un público concreto y por orden de
prioridad:

1. Consultoras del sector público gallego — Coremain, Altia, Balidea, Plexus, Bahía Software
2. Producto y tecnológicas gallegas — Denodo, Imatia, Gradiant, Ozona
3. Posiciones remotas a nivel nacional

**Ubicación de destino aún abierta.** El traslado es al norte de España, sin
ciudad decidida entre Galicia, Asturias o Cantabria. La web y los dos CV usan
siempre «norte de España» en vez de una ciudad concreta; no fijar una localidad
hasta que el destino esté decidido de verdad (actualizado 16 sep 2026, antes
decía Vigo).

**Sin panel de administración desde el 21 oct 2026.** Hasta esa fecha, tras
`/admin` vivía una suite de apps personales (tracker, Moneta, Bioptima, TintAI) y
la gestión de contenidos. Se retiró porque no se usaba: el tracker no tenía
registros desde junio y TintAI y Bioptima estaban vacíos. El código sigue en el
historial de git. Los datos personales de esas apps se borraron de D1 ese mismo
día (`migrations/borrado-datos-personales-oct-2026.sql`). El sitio es ahora
solo público y de solo lectura: el contenido se edita con migraciones.

| | |
|---|---|
| Producción | https://bohdeveloper.com |
| Repositorio | https://github.com/bohdeveloper/portfolio |
| Fase | Mantenimiento — desarrollo de fases cerrado el 2 de junio de 2026 |
| Contacto público | ohb.seven@gmail.com · 672 987 992 |

---

## 2. Stack y arquitectura

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 15.5.28 (`output: "export"`) · React 18 · TypeScript · Tailwind CSS 3 |
| API | Cloudflare Pages Functions — solo lecturas públicas (blog, proyectos) y reacciones del blog |
| Base de datos | Cloudflare D1 — SQLite distribuido, base única `bohdeveloper-admin` |
| Auth | Ninguna: no hay zona privada desde el 21 oct 2026 |
| Deploy | Cloudflare Pages · `git push origin main` → despliegue automático |

### Arquitectura

```
Cloudflare Pages (CDN global, ~300 PoPs)
├── Next.js estático (output: "export")   → HTML/JS servido desde el edge
└── Pages Functions (frontend/functions/) → API serverless
    └── D1 (bohdeveloper-admin)           → datos junto al código
```

Sin servidor central. `frontend/functions/_middleware.ts` aplica las cabeceras de
seguridad globales, CSP incluida.

### Estructura del repositorio

```
portfolio/
├── frontend/
│   ├── src/app/                 Páginas (App Router, exportadas a estático)
│   ├── src/components/          layout/ · sections/ · ui/
│   ├── src/hooks/               useCardHolo · useFadeInOnScroll
│   ├── functions/api/           blog (list, post, comments, reactions) · projects (list, post)
│   ├── public/cv/               Los dos PDF de currículum (programador y técnico)
│   └── schema.sql               Tablas base
├── migrations/                  Cambios de datos versionados, un fichero por cambio
├── schema-*.sql                 Esquemas de las apps retiradas (moneta, bioptima, tintai)
├── .claude/agents/              Agentes del proyecto (§6)
└── .mcp.json                    Grafo de código (codebase-memory-mcp)
```

### Patrones establecidos

- **API mínima y de solo lectura.** Los únicos endpoints son lecturas
  públicas y las reacciones anónimas del blog. Si alguna vez vuelve a haber
  zona privada, el código de auth (`_auth-util.ts`, `verifyAuth`) y de
  validación (`_security.ts`) está en el historial de git, antes del 21 oct 2026.
  Nunca se devuelve el error de D1 en crudo.
- **Caché de edge en lecturas públicas.** Los endpoints públicos usan
  `caches.default` con TTL (p. ej. 300 s en `/api/projects/list`) para que los
  bots no agoten la cuota de D1. Consecuencia práctica: tras escribir en D1, los
  cambios tardan hasta el TTL en verse; para verificar al instante, añadir una
  query string distinta.
- **Contenido en D1, no en el código.** Proyectos y posts viven en base de datos
  y se editan con migraciones en `migrations/` (ya no hay panel). Los arrays
  `FALLBACK` del código solo se usan si la API falla, y hay que mantenerlos
  sincronizados.
- **Query params en vez de rutas dinámicas.** `output: "export"` no genera rutas
  dinámicas, así que el detalle se sirve como `/blog?slug=xxx` y
  `/projects?slug=xxx`.
- **CSS variables.** `--primary` / `--bg` / `--text`.

### Modelo de dominio

Una sola base D1. El sitio solo lee `projects` y `blog_posts`, con sus tablas
satélite `blog_reactions` (escritura anónima acotada) y `blog_comments` (solo
lectura de los aprobados; comentarios cerrados). Las tablas de las apps
retiradas se eliminaron el 21 oct 2026 por RGPD; solo quedan `projects`,
`blog_posts`, `blog_reactions`, `blog_comments` (sin hash de IP), `games` y
`game_reactions`. Recuperar una app exige recrear su esquema con `schema-*.sql`.

---

## 3. Decisiones de producto e invariantes

Decisiones ya tomadas. No se reabren sin decisión explícita del usuario.

1. **El portfolio se posiciona como Java senior / sector público, con dirección
   hacia la IA aplicada.** El argumento central son los cinco años continuados
   para EJIE (Gobierno Vasco), y el `<h1>` sigue siendo «programador web». Desde
   el 21 oct 2026 el hero declara una dirección: la trayectoria Industria →
   Desarrollo Java → Ingeniería de IA aplicada. La IA es el siguiente paso, no
   experiencia acreditada. Ante cualquier duda de contenido, gana lo que
   demuestre stack de administración pública.
2. **La separación entre stack profesional y stack de proyectos propios es
   explícita y visible.** En «Acerca de mí» son grupos separados con su propio
   título (desde el 21 oct 2026, todos en cian a petición de Borja; la
   separación la marcan los títulos, no el color). El motivo es evitar que en una entrevista se dé por supuesto que
   React o Docker se han usado profesionalmente.
3. **La IA es dirección y prueba, no el titular.** En el hero aparece solo como
   tercer tramo de la trayectoria («Siguiente paso»), nunca en el `<h1>` ni por
   delante del stack. El distintivo «Potenciado por Claude» se retiró del hero
   el 21 oct 2026 (el CV de programador aún lo lleva). La sección «IA en la
   práctica» va por debajo de proyectos y formación y solo recoge uso real.
4. **Nunca se publica un enlace roto.** Un proyecto sin repositorio muestra
   «Repositorio próximamente» en lugar de un botón que lleve a un 404.
5. **La web no afirma más de lo que afirma el CV.** Si el CV dice que un producto
   está en validación, la web no lo describe como operativo.
6. **Proyectos: estado real y agrupación editorial.** Dos secciones,
   «Terminados» y «En desarrollo», según `ESTADO` en `Proyectos.tsx` (no se
   deduce de la landing). Dentro, grupos por stack fijados en `GRUPOS`, cada
   uno enlazado a sus bloques de la hoja de ruta (`#ruta-N`). Actual: Java y
   Spring (REXIA, ayudas_gv) · IA (BAKO) · JavaScript full stack (Unyona app,
   Unyona landing). Diamadmin despublicado y Nitflex/DevHelper aparcados
   (21 oct 2026).
7. **Dos CV: `programador` y `tecnico`, con nombres de fichero estables.**
   `borja-olazabal-programador.pdf` y `borja-olazabal-tecnico.pdf` en `/cv/`.
   Al actualizarlos se sustituye el contenido pero nunca el nombre. Los nombres
   anteriores (`backend-sector-publico`, `fullstack-producto` y la ruta raíz
   `borja-olazabal-programador-web-cv.pdf`) redirigen con 301 al de programador
   en `_redirects` y no deben retirarse: pueden estar enlazados desde fuera.
   Cambio del 14 oct 2026: los dos CV de programación se fundieron en uno y se
   añadió el técnico.
   Se generan con `cv-src/generar_cv.py` (ReportLab). El CV de programador
   sigue al portfolio; el técnico (`generar_tecnico`) no se modifica.
8. **Un solo `<h1>` por página**, el del hero. Las secciones son `<h2>`.
   Orden de la home y del menú: Hero · Acerca de mí · Formación · Experiencia ·
   Proyectos · IA · Contacto (21 oct 2026).
9. **Cumplimiento del EU AI Act.** Todo contenido generado con IA lleva aviso
   visible, como los artículos del blog.
10. **Sin SSR.** Se evaluó y se descartó por riesgo de romper el despliegue en
    Cloudflare para el beneficio real que aportaba.
11. **Sin librerías de gráficas.** Cualquier visualización se hace en SVG
    escrito a mano (las de Moneta y Bioptima lo eran).
12. **Sin panel, sin juegos; blog archivado y comentarios cerrados.** Desde el
    21 oct 2026 no existe `/admin` ni login, y los juegos se retiraron del todo
    (también `public/games/`). El blog queda enlazado solo desde el pie: sus
    URLs siguen vivas porque los artículos están indexados. Muestra los
    comentarios aprobados, pero no acepta nuevos, porque nadie puede moderarlos.
13. **Java, Spring y Spring Boot son los tres profesionales.** Los CV de sep 2026
    solo mencionan «Spring» en la experiencia profesional, pero Borja confirmó
    (16 sep 2026) que también ha usado Spring Boot en el puesto, junto con
    WebLogic como servidor de despliegue. La web menciona los tres siempre
    juntos: hero, «Acerca de mí», stack de Inetum, marco EJIE y JSON-LD. Ya no
    hay distinción entre prosa visible y metadato indexable — el desajuste con
    el CV queda documentado aquí porque el CV es más corto por espacio, no
    porque Spring Boot no se haya usado; si se actualizan los CV en el futuro,
    conviene añadir Spring Boot ahí también. Hecho en el CV de programador el 21 oct 2026.

14. **El oficio es el origen, no un segundo perfil.** Desde el 21 oct 2026 el
    hero no habla de «doble perfil»: la industria (mecanizado, electricidad,
    carpintería) es el primer tramo de la trayectoria. En «Acerca de mí» el
    grupo «Perfil técnico · oficio» va el último. El CV técnico sigue
    existiendo para puestos de oficio.

15. **Formación como recorrido y hoja de ruta.** Orden: formación técnica →
    cambio de sector → formación en desarrollo realizada (IFCD0112 destacada),
    ambas filas cronológicas con flecha → hoja de ruta «Del backend senior a
    la IA aplicada» (`HojaDeRuta.tsx`). La hoja de ruta tiene 10 bloques
    ordenados por peso en ofertas reales, solo con recursos gratuitos, en una
    línea con ficha emergente por bloque.
    Un bloque solo cambia de `pendiente` a `en-curso` o `completado` (verde,
    con check y fecha) cuando lo está de verdad. Los bloques se practican en
    proyectos propios; ayudas_gv es el laboratorio principal.

---

## 4. Sistema de diseño y convenciones UI

### Paleta

| Token | Claro | Oscuro |
|---|---|---|
| `--primary` | `#00a8bf` | `#00e7eb` |
| `--bg` | `#fdfefe` | `#0d0d0d` |
| `--text` | `#1a1a1a` | `#f5f5f5` |


### Componentes y patrones

- **Cabecera de sección:** `<h2>` con el glifo `⌁` en `text-primary text-4xl`.
- **`card-holo`:** tarjetas con inclinación 3D según el puntero, brillo iridiscente
  y ruido SVG. Se aplica con el hook `useCardHolo` más los spans
  `card-holo-shine` y `card-holo-noise`.
- **Estados de proyecto:** verde esmeralda con punto para lo desplegado
  (`Online`, `En producción`), cian para `En desarrollo`.
- **Botones:** borde `cyan-400`, `hover:bg-cyan-400 hover:text-black`.
- **Entrada en scroll:** `useFadeInOnScroll` + clase `fade-in-up`.
- **Modales en móvil:** a pantalla completa y centrados verticalmente, nunca
  anclados a un borde.

### Prohibiciones

- ❌ Librerías de gráficas (Chart.js, Recharts…) — SVG a mano
- ❌ Dependencias por CDN externo salvo `marked.js` en el blog (con SRI)
- ❌ Rutas dinámicas de Next — incompatibles con `output: "export"`
- ❌ Más de un `<h1>` por página
- ❌ Enlaces a repositorios o recursos que no existen todavía

---

## 5. Entorno de desarrollo y producción

### Local

```bash
cd frontend
npm install
npm run dev          # Next.js en desarrollo
npm run build        # build estático → frontend/out/
```

Sin variables de entorno: desde la retirada del panel no hay secretos.

### Base de datos

Los esquemas iniciales están en `frontend/schema.sql` y `schema-*.sql`. **Todo
cambio posterior de datos o de esquema va en un fichero nuevo en `migrations/`**,
con cabecera que explique el porqué y el comando de ejecución. Nunca se modifica
D1 con un comando suelto sin dejar rastro en el repo.

```bash
wrangler d1 execute bohdeveloper-admin --remote --file=./migrations/<fichero>.sql
```

`wrangler` usa OAuth y el token caduca; si falla con «non-interactive
environment», hay que reautenticar con `wrangler login`.

### Producción

- Despliegue: `git push origin main`. Cloudflare Pages construye y publica.
- Verificación: tras el push, el despliegue tarda unos minutos; conviene
  comprobar contra la URL real antes de dar algo por hecho.
- Variables: ninguna. `JWT_SECRET` y `ANTHROPIC_API_KEY` se pueden borrar del panel de Cloudflare.
- Redirecciones y cabeceras: `frontend/public/_redirects`.

### Deuda aceptada deliberadamente

- `NEXT_DISABLE_TYPECHECK=1` en el build y `ignoreBuildErrors` en `next.config.js`.
  El typecheck no bloquea el despliegue; hay que ejecutarlo aparte si se quiere.
  Desde la retirada del panel (21 oct 2026), `src/` no tiene errores de tipos,
  así que se podría volver a activar.
- `backend/` solo contiene `node_modules` — carpeta muerta de una etapa anterior.
- La página del blog concentra vista pública, comentarios y panel lateral, lo que
  se refleja en la cohesión más baja del grafo (0,692).

---

## 6. Metodología de desarrollo (Spec-Driven Development)

### Antes de desarrollar

1. Leer **§3 invariantes** y esta sección. Confirmar que la tarea está en
   [plan.md](plan.md); si no está, añadirla antes de empezar.
2. Contrastar con los invariantes. Si la tarea choca con alguno, **avisar al
   usuario antes de implementar**, no después.
3. Explorar el código con **codebase-memory-mcp**, no releyendo archivos:
   `get_graph_schema` una vez por sesión, luego `search_graph`, `trace_path` y
   `get_code_snippet`. Ver [GRAPH_REPORT.md](GRAPH_REPORT.md).
4. Buscar el helper que ya cubra el concepto antes de crear uno nuevo —
   especialmente en auth y validación, que están centralizadas.
5. Para UI nueva, usar el agente `ux-ui-designer` y respetar §4.
6. Desglosar las tareas grandes en fases dentro de plan.md.

### Durante el desarrollo

- Comentarios técnicos **en español** en las partes complejas, no en lo obvio.
- Endpoint nuevo: solo lectura pública por defecto. Uno que escriba o que
  necesite auth reabre la decisión del invariante 12 y exige `/security-review`.
- Contenido nuevo del sitio → D1 mediante `migrations/`, y sincronizar el
  `FALLBACK` correspondiente del componente.

### Después de desarrollar

1. `npm run build` de lo tocado.
2. **`/code-review` sobre el diff — obligatorio antes de cerrar una feature.**
3. `/security-review` si se toca auth, privacidad, moderación o se añaden endpoints.
4. Verificar en la aplicación real, y contra producción si ya está desplegado.
5. Registrar: marcar en plan.md con fecha · decisiones nuevas → spec.md §3 ·
   cambios de alcance o stack → README.md.
6. **Commit solo cuando el usuario lo pida**, en el estilo del `git log`
   (español, imperativo, cuerpo explicando el porqué).
7. `/simplify` opcional al cerrar una fase.

### Agentes del proyecto

Instalados en `.claude/agents/` y versionados con el repositorio.

| Agente | Cuándo usarlo |
|---|---|
| **`seo-master`** | Metadatos, datos estructurados, indexación, sitemap, canonicals, Core Web Vitals, arquitectura de contenidos. Todo lo que afecte a que el portfolio se encuentre. |
| **`git-master`** | Operaciones no triviales: conflictos de merge o rebase, estrategia de ramas, recuperar trabajo del reflog, limpiar historia. **No** para un `status` o un commit rutinario. |
| **`ux-ui-designer`** | Diseño o rediseño de páginas y componentes, evolución del sistema de diseño, responsive, animaciones y accesibilidad. Cualquier tarea cuyo resultado principal sea visual. |

### Skills

| Skill | Cuándo |
|---|---|
| `/code-review` | Sobre el diff, antes de cerrar cualquier feature. Obligatoria. |
| `/security-review` | Cambios en auth, endpoints nuevos, moderación, datos personales. |
| `/security-master` | Auditoría completa periódica: secretos, rate limiting, IDOR, headers, CORS. |
| `/simplify` | Al cerrar una fase, para limpiar duplicación y complejidad. |
| `/grafo-designer` | Reindexar el grafo tras cambios estructurales grandes. |
| `/spec-driven` | Mantener sincronizados spec.md y plan.md. |
| `/run` | Levantar la aplicación para comprobar un cambio de verdad. |

---

## 7. Documentos del proyecto

| Documento | Rol |
|---|---|
| [spec.md](spec.md) | Este archivo. Memoria: qué es, cómo está hecho, invariantes y metodología. |
| [plan.md](plan.md) | Trabajo: estado actual, pendiente por fases e histórico condensado. |
| [README.md](README.md) | Escaparate público del repositorio en GitHub. |
| [GRAPH_REPORT.md](GRAPH_REPORT.md) | Informe del grafo de código: tamaño, hotspots, comunidades, rutas. |
| [CLAUDE.md](CLAUDE.md) | Reglas de trabajo que se cargan en cada sesión de Claude Code. |
