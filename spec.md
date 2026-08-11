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

**Suite de aplicaciones personales (privada).** Tras `/admin`, un conjunto de apps
de uso cotidiano del propietario: tracker de rutinas, control presupuestal,
seguimiento dietético-deportivo, generador de ebooks y gestión de contenidos del
propio portfolio. No son demos: son las aplicaciones que el autor usa a diario, y
esa es precisamente su credibilidad como muestra de trabajo.

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
| Frontend | Next.js 15.1.6 (`output: "export"`) · React 18 · TypeScript · Tailwind CSS 3 |
| API | Cloudflare Pages Functions — serverless en el edge, TypeScript |
| Base de datos | Cloudflare D1 — SQLite distribuido, base única `bohdeveloper-admin` |
| Auth | JWT (`jose`) + `bcryptjs`, cookie httpOnly `admin_token` |
| Editor | TipTap — WYSIWYG en blog y proyectos |
| IA | Claude API (Haiku 4.5) vía fetch nativo, solo en TintAI |
| Gráficas | SVG a mano — sin Chart.js ni librerías de charting |
| Deploy | Cloudflare Pages · `git push origin main` → despliegue automático |

### Arquitectura

```
Cloudflare Pages (CDN global, ~300 PoPs)
├── Next.js estático (output: "export")   → HTML/JS servido desde el edge
└── Pages Functions (frontend/functions/) → API serverless
    └── D1 (bohdeveloper-admin)           → datos junto al código
```

Sin servidor central. `frontend/functions/admin/_middleware.ts` protege todo
`/admin/*`; `frontend/functions/_middleware.ts` aplica cabeceras de seguridad
globales.

### Estructura del repositorio

```
portfolio/
├── frontend/
│   ├── src/app/                 Páginas (App Router, exportadas a estático)
│   ├── src/components/          layout/ · sections/ · ui/
│   ├── src/hooks/               useCardHolo · useFadeInOnScroll
│   ├── functions/api/           API por dominio (auth, blog, tracker…)
│   ├── public/cv/               Los dos PDF de currículum
│   ├── public/games/            Minijuegos HTML standalone
│   └── schema.sql               Tablas base
├── migrations/                  Cambios de datos versionados, un fichero por cambio
├── schema-*.sql                 Esquemas por app (moneta, bioptima, tintai)
├── .claude/agents/              Agentes del proyecto (§6)
└── .mcp.json                    Grafo de código (codebase-memory-mcp)
```

### Patrones establecidos

- **Auth centralizada.** `functions/api/_auth-util.ts` expone `verifyAuth` y
  `checkRole`. Es el nodo más conectado del grafo (fan-in 54): **todo endpoint
  autenticado pasa por él**. Cualquier cambio en su firma exige `detect_changes`
  antes de darlo por bueno.
- **Validación centralizada.** `functions/api/_security.ts` expone `validateStr`,
  `validateInt`, `validateFloat`, `validateHttpsUrl`, `validateHexColor` y
  `dbError`. Todo endpoint nuevo valida su entrada con estos helpers; nunca
  se escribe validación ad hoc ni se devuelve el error de D1 en crudo.
- **Caché de edge en lecturas públicas.** Los endpoints públicos usan
  `caches.default` con TTL (p. ej. 300 s en `/api/projects/list`) para que los
  bots no agoten la cuota de D1. Consecuencia práctica: tras escribir en D1, los
  cambios tardan hasta el TTL en verse; para verificar al instante, añadir una
  query string distinta.
- **Contenido en D1, no en el código.** Proyectos, posts y juegos viven en base de
  datos y se gestionan desde `/admin`. Los arrays `FALLBACK` del código solo se
  usan si la API falla, y hay que mantenerlos sincronizados.
- **Query params en vez de rutas dinámicas.** `output: "export"` no genera rutas
  dinámicas, así que el detalle se sirve como `/blog?slug=xxx` y
  `/projects?slug=xxx`.
- **CSS variables por ámbito.** `--primary` / `--bg` / `--text` en el sitio
  público; `--adm-*` en el panel de administración.

### Modelo de dominio

Una sola base D1 con tablas agrupadas por app. `admin_users` (con `role`:
`super_admin` o `user`) es la raíz de la autenticación y el criterio de filtrado
de datos por usuario. `projects`, `blog_posts` y `games` alimentan el sitio
público —con sus tablas satélite de reacciones, comentarios y votos—. `tracker_*`,
`moneta_*`, `bioptima_*` y `tintai_*` son los cuatro dominios de las apps
privadas, independientes entre sí salvo una integración: al guardar el balance
diario en Bioptima se escribe una nota automática en el tracker.

---

## 3. Decisiones de producto e invariantes

Decisiones ya tomadas. No se reabren sin decisión explícita del usuario.

1. **El portfolio se posiciona como Java / Spring Boot / sector público.** El
   argumento central son los cinco años continuados para EJIE (Gobierno Vasco).
   Ante cualquier duda de contenido, gana lo que demuestre stack de administración
   pública sobre lo que demuestre stack moderno.
2. **La separación entre stack profesional y stack de proyectos propios es
   explícita y visible.** En «Acerca de mí» son dos grupos con tratamiento visual
   distinto. El motivo es evitar que en una entrevista se dé por supuesto que
   React o Docker se han usado profesionalmente.
3. **La IA es un complemento, no el titular.** Puede aparecer en el hero como
   distintivo discreto —para unificar criterio con la cabecera de los CV— pero
   nunca por delante del stack ni de la disponibilidad. La sección de IA va por
   debajo de proyectos y formación.
4. **Nunca se publica un enlace roto.** Un proyecto sin repositorio muestra
   «Repositorio próximamente» en lugar de un botón que lleve a un 404.
5. **La web no afirma más de lo que afirma el CV.** Si el CV dice que un producto
   está en validación, la web no lo describe como operativo.
6. **El orden de la sección de proyectos es editorial, no cronológico.** Lo fija
   `ORDEN_SLUGS` en `Proyectos.tsx`, no `featured` ni `created_at` de D1. Orden
   actual: REXIA · BAKO · ayudas_gv · Unyona · Diamadmin.
7. **Dos CV, mismos nombres de fichero para siempre.** `backend-sector-publico` y
   `fullstack-producto` en `/cv/`. Al actualizarlos se sustituye el contenido pero
   nunca el nombre, porque las URLs están en el sitemap, en la redirección 301 de
   la ruta antigua y posiblemente enlazadas desde fuera.
8. **Un solo `<h1>` por página**, el del hero. Las secciones son `<h2>`.
9. **Cumplimiento del EU AI Act.** Todo contenido generado con IA lleva aviso
   visible: artículos del blog y descripciones de juegos.
10. **Sin SSR.** Se evaluó y se descartó por riesgo de romper el despliegue en
    Cloudflare para el beneficio real que aportaba.
11. **Sin librerías de gráficas.** Las visualizaciones de Moneta y Bioptima son
    SVG escrito a mano.
12. **Los minijuegos son HTML standalone**, sin dependencias, comunicándose con el
    panel lateral por `postMessage`.

---

## 4. Sistema de diseño y convenciones UI

### Paleta

| Token | Claro | Oscuro |
|---|---|---|
| `--primary` | `#00a8bf` | `#00e7eb` |
| `--bg` | `#fdfefe` | `#0d0d0d` |
| `--text` | `#1a1a1a` | `#f5f5f5` |

El panel de administración usa su propio juego de variables `--adm-*`.

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
- ❌ Dependencias por CDN externo salvo las ya existentes (`marked.js` en TintAI)
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

`frontend/.dev.vars` (nunca versionado):

```
JWT_SECRET=...
ANTHROPIC_API_KEY=sk-ant-...   # solo para TintAI
```

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
- Variables: `JWT_SECRET` y `ANTHROPIC_API_KEY` en el panel de Cloudflare.
- Redirecciones y cabeceras: `frontend/public/_redirects`.

### Deuda aceptada deliberadamente

- `NEXT_DISABLE_TYPECHECK=1` en el build y `ignoreBuildErrors` en `next.config.js`.
  El typecheck no bloquea el despliegue; hay que ejecutarlo aparte si se quiere.
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
- Todo endpoint nuevo: `verifyAuth` / `checkRole` + validación con `_security.ts`.
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
| `/dataviz` | Antes de tocar las gráficas SVG de Moneta o Bioptima. |
| `/claude-api` | Antes de tocar la integración de TintAI con la API de Claude. |
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
