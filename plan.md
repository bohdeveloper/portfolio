# plan.md — bohdeveloper.com

> Plan de trabajo vivo (Spec-Driven Development). Contexto y metodología en [spec.md](spec.md).
> Reglas: nada se implementa sin su punto aquí · al terminar se marca `[x]` con fecha ·
> las tareas grandes se desglosan en fases antes de empezar.
> El detalle punto por punto de lo completado vive en el historial de git.

---

## Estado actual — 16 de septiembre de 2026

| Hito | Estado |
|---|---|
| Fases 0-7 y 10-11 — portfolio, blog, apps y juegos | ✅ Cerradas el 2 jun 2026 |
| Fase 8 — visibilidad y retención | ⏸ Aplazada indefinidamente |
| Fase 9 — SSR y SEO avanzado | 🚫 Descartada |
| Reposicionamiento hacia Java / sector público | ✅ Completado (ago 2026) |
| Migración del grafo a codebase-memory-mcp | ✅ Completada (11 ago 2026) |
| Adopción de Spec-Driven Development | ✅ Completada (11 ago 2026) |
| CV de septiembre + ubicación norte de España | ✅ Completado (16 sep 2026) |

El proyecto está **en mantenimiento**: no hay fases nuevas de desarrollo. El
trabajo que entra es ajuste de contenido, corrección de bugs y apoyo a la
búsqueda de empleo.

### Pendiente inmediato

- [ ] **REXIA en el portfolio.** Ocupa el primer puesto de la sección de proyectos
      y todavía no tiene repositorio público ni código. En cuanto exista:
      - [ ] `UPDATE projects SET github_url='https://github.com/bohdeveloper/rexia' WHERE slug='rexia';`
      - [ ] Añadirlo al CV de sector público, donde aún no figura
      - [ ] Revisar si sigue mereciendo el primer puesto o pasa detrás de BAKO
- [ ] **Artículo técnico en el blog** sobre desplegar Spring Boot en Kubernetes con
      Minikube, documentando `ayudas_gv`. Es el punto de mayor retorno pendiente:
      contenido indexable en términos que sí busca el público objetivo y prueba
      pública de competencia. Título orientado a búsqueda:
      «Desplegar una aplicación Spring Boot en Kubernetes con Minikube».
- [ ] **Sustituir los dos CV en `/cv/` por la versión con AB10 corregido**
      (17 sep 2026). Borja compartió los PDF nuevos en la conversación, pero
      Claude no tiene forma de extraer el binario de un documento pegado en el
      chat — hay que guardarlos en disco (p. ej. `Downloads/CV/`, como las
      veces anteriores) para poder copiarlos a
      `frontend/public/cv/borja-olazabal-backend-sector-publico.pdf` y
      `.../borja-olazabal-fullstack-producto.pdf`.

---

## Mantenimiento del portfolio

- [ ] Revisar que el modal del selector de CV no se corte en móvil apaisado
      (pantallas de ~360 px de alto). Si se corta: `max-h` con scroll interno.
- [ ] Reevaluar `architecture` y `tags` de Unyona en D1 cuando la aplicación
      exista de verdad — hoy describen el stack en construcción, no lo desplegado.
- [ ] Eliminar la carpeta muerta `backend/` (solo contiene `node_modules`).
- [ ] Decidir si se recupera el typecheck en el build o se asume la deuda de
      forma permanente (`NEXT_DISABLE_TYPECHECK=1` + `ignoreBuildErrors`).

## Fase 8 — Visibilidad y retención ⏸

Aplazada indefinidamente: no es prioritaria con el volumen de tráfico actual.

- [ ] Analytics propios en D1, sin terceros
- [ ] Newsletter con envío de nuevos posts
- [ ] Caché en Cloudflare KV para posts populares
- [ ] Notificaciones push con Service Worker

---

## Histórico de fases completadas

<details>
<summary><strong>Fases 0-11 · Construcción del portfolio y las apps (abr — jun 2026)</strong></summary>

**Fase 0 — Panel admin y tracker.** Primer backend real en producción. D1
`bohdeveloper-admin` con `admin_users`, `tracker_records` y `tracker_notes`.
Pages Functions de autenticación (`/api/auth/login`, `/logout`, `/me`), middleware
de protección de `/admin/*`, JWT en cookie httpOnly. Tracker con horario visual,
leyenda dinámica y tooltips.

**Fase 1 — Blog técnico.** Tabla `blog_posts`, API pública y de administración,
editor WYSIWYG TipTap con toolbar completa, CSS de ProseMirror sincronizado con la
vista pública, portada con compresión en Canvas a base64, filtro por tags,
reacciones emoji y comentarios con moderación.

**Fase 2 — Moneta.** Control presupuestal mensual previsto contra real con dos
perfiles, edición en línea, copia del mes anterior, cierre y reapertura de mes,
exportación CSV y gráfica SVG de evolución.

**Fase 3 — Interacción social en el blog.** Reacciones por post, comentarios con
hilos, moderación desde el panel, botón de compartir con Web Share API y baneo de
IPs.

**Fase 4 — Panel lateral.** Dos pestañas: blog y showcase de minijuegos, con
tarjetas, badge de juego destacado y reacciones.

**Fase 5 — Multiusuario y roles.** `super_admin` y `user`, payload del JWT con
`user_id` y `role`, filtrado de datos por usuario y CRUD de usuarios.

**Fase 6 — Proyectos dinámicos.** Tabla `projects` con contenido, tags y
arquitectura; página `/projects` con case study individual; case studies
publicados de Unyona y Diamadmin.

**Fase 7 — Minijuegos.** Snake, Tetris, 2048, Wordle en español y Flappy Bird.
HTML standalone, `postMessage` con el panel lateral, récord en localStorage,
controles de teclado y táctiles.

**Fase 10 — Bioptima.** Seguimiento dietético-deportivo: biometría, cálculo
automático de IMC, porcentaje de grasa (US Navy), masa muscular, TMB
(Mifflin-St Jeor) y TDEE. Balance calórico diario, semanal y mensual con gráficas
SVG e integración con el tracker.

**Fase 11 — TintAI.** Generación de ebooks didácticos con la API de Claude
(Haiku 4.5) vía fetch nativo. Generación incremental índice → capítulos →
finalizar, 16 categorías, plantillas XML de instrucciones, lector con paginación y
progreso guardado.

**Fase 9 — descartada.** Infraestructura SSR y SEO avanzado: riesgo alto de romper
el despliegue en Cloudflare para el beneficio real.

</details>

<details>
<summary><strong>Junio 2026 · Mejoras post-lanzamiento</strong></summary>

**Tracker:** corregido el `ON CONFLICT` de `save.ts`; endpoint `bulk` de upsert
masivo hasta 365 registros; propagación de un registro 52 semanas; panel de día
con estado de tracking; contraste automático de texto según la luminancia del
color de categoría; categoría «Sin categoría» editable.

**Moneta:** timestamp de última modificación persistente por perfil y mes; botón
de suma en línea que acumula sin borrar el valor previo; confirmación antes de
borrar.

**Responsive:** juegos, proyectos, blog, Bioptima, TintAI, usuarios y AdminNavbar
adaptados a móvil.

**Seguridad:** hardening completo de la API en 12 cambios (commit `bf52254`).

</details>

<details>
<summary><strong>Agosto 2026 · Reposicionamiento hacia Java y sector público</strong></summary>

Alineación del portfolio con el CV y LinkedIn. El mensaje pasa de «desarrollo web
con IA» a «programador con cinco años en Administración Pública autonómica,
disponible en Vigo o remoto».

**Hero** (`13b760b`): retirado el badge de Claude del punto de mayor jerarquía,
subtítulo Java · Spring Boot · Oracle, píldora de disponibilidad y servicios
reorientados a aplicaciones empresariales.

**Experiencia:** fecha de Inetum corregida a julio de 2026, marco de los cinco años
en EJIE, detalle real de las tres aplicaciones, Bilbomática con contenido propio,
SKOOTIK añadido y viñetas de IA sacadas de dentro del puesto.

**Acerca de mí y formación:** texto reescrito, tecnologías separadas en dos grupos,
certificado IFCD0112 destacado como titulación oficial, bloque de FP en DAW
eliminado y dos FP de grado medio añadidas.

**Proyectos** (`b8b86b2`): REXIA, BAKO y ayudas_gv añadidos, orden editorial por
`ORDEN_SLUGS`, badges reales de estado y nota «Repositorio próximamente».
Corregidos de paso dos enlaces de GitHub que llevaban a 404.

**CV** (`de8cd87`): dos versiones en `/cv/` con componente `CVDownload` accesible,
redirección 301 de la ruta antigua y sustitución posterior por la versión de
agosto manteniendo los nombres de fichero.

**Contacto** (`37a0d42`, `e4622ca`): email unificado a `ohb.seven@gmail.com`,
experiencia previa alineada con el CV y teléfono añadido.

**SEO:** metadatos hacia Java/Spring/AAPP/Galicia, JSON-LD de `Person` con
ubicación en Vigo, sitemap con los dos PDF y un solo `h1` en la home.

</details>

<details>
<summary><strong>11 de agosto de 2026 · Migración del grafo y adopción de SDD</strong></summary>

- Retirado **graphify**: carpeta `graphify-out/`, skill local, regla de CLAUDE.md y
  hook `Stop` que reindexaba y hacía auto-commit en cada parada.
- Instalado **codebase-memory-mcp** 0.10.1 e indexado el repositorio
  (1.127 nodos, 2.600 aristas). Declarado en `.mcp.json` con scope de proyecto.
- Hooks `PreToolUse` reescritos para orientar hacia `search_graph` / `trace_path`
  en vez de `graphify query`.
- `GRAPH_REPORT.md` regenerado con hotspots, comunidades y rutas HTTP.
- Agentes `seo-master`, `git-master` y `ux-ui-designer` instalados en
  `.claude/agents/` y versionados; `.gitignore` afinado para que viajen con el
  repo sin arrastrar `settings.local.json`, que contiene credenciales.
- Adoptado Spec-Driven Development: `spec.md` y `plan.md` creados, `ROADMAP.md`
  fusionado aquí y eliminado.

</details>

<details>
<summary><strong>16 de septiembre de 2026 · CV de septiembre y ubicación abierta</strong></summary>

Los dos CV se actualizan (mismos nombres de fichero, invariante 7). Traen dos
cambios de fondo que obligan a tocar la web:

- **Ubicación.** El destino deja de ser Vigo/Pontevedra para pasar a «norte de
  España», sin ciudad decidida entre Galicia, Asturias o Cantabria. Cambiado en
  Hero, QuienSoy, Experiencia, Contacto, metadatos de `layout.tsx` (title,
  description, keywords, OG, Twitter) y JSON-LD (`address` simplificado a solo
  `addressCountry`, `homeLocation` y `seeks` con el texto nuevo).
- **Spring Boot → Spring en lo visible.** El CV describe la experiencia
  profesional como Java y Spring (no Spring Boot), con WebLogic. La prosa visible
  de la web (hero, «Acerca de mí», stack de Inetum) sigue ese matiz; title, meta
  description, keywords, OG, Twitter y JSON-LD mantienen «Spring Boot» por ser el
  término que se busca en ofertas de empleo. Registrado como invariante 13 en
  spec.md.

**Contenido de Inetum y Bilbomática alineado con los CV (mismo día, a petición
expresa de «tiene que prevalecer los CV nuevos»):**

- Inetum: `AB10B — Ayudas de Familia` → `AB10A — Ayudas a familias` con las
  cuatro líneas de negocio del decreto (conciliación, contratación, nacimientos,
  paternidad). Añadido el bullet de reintegro de pagos y la mención a Dokusi.
  Retirado «Aplicación de tramitación telemática de expedientes», que no aparece
  en ningún CV. Stack del puesto actualizado a Java, Spring, Oracle SQL,
  WebLogic, JSP, JSTL, Tiles, Bootstrap, jQuery — sin Jenkins/SonarQube/SVN, que
  el CV ya no lista para este puesto.
- Bilbomática: retirados los dos bullets que ningún CV corrobora (stack
  HDIV/IberDok/JasperReports y control de versiones SVN/Trello). Quedan los dos
  bullets que sí están en ambos CV.
- QuienSoy: WebLogic añadido a la frase de stack profesional y a
  `STACK_PROFESIONAL`.

</details>

<details>
<summary><strong>17 de septiembre de 2026 · AB10 sin letra y Spring Boot de vuelta</strong></summary>

Dos correcciones directas de Borja sobre lo publicado el día anterior:

- **AB10A → AB10.** El nombre real del proyecto no lleva letra. Corregido en el
  único sitio donde aparecía (`Experiencia.tsx`, bullet de Inetum).
- **Java, Spring y Spring Boot — los tres profesionales.** Corrige el invariante
  13 de spec.md, que asumía (a partir del CV) que solo «Spring» era profesional
  y reservaba «Spring Boot» para metadatos indexables. Borja confirmó que
  también usó Spring Boot en el puesto. Añadido junto a Spring en todo lo
  visible: Hero (headline y lista de servicios), QuienSoy (`STACK_PROFESIONAL`,
  alt de la foto, frase de stack), marco EJIE y stack de Inetum en Experiencia,
  Contacto, y JSON-LD (`jobTitle`, `knowsAbout`). Ya no hay distinción entre
  prosa visible y metadato — invariante 13 reescrito para reflejarlo.
- Pendiente: los dos CV en `/cv/` siguen siendo la versión que solo dice
  «Spring» (sin Spring Boot) en el puesto de Inetum, y todavía tienen «AB10A».
  Borja ha compartido dos PDF nuevos en la conversación que ya corrigen AB10,
  pero no llegaron a disco: hay que guardarlos y sustituir los ficheros en
  `frontend/public/cv/` (ver plan pendiente abajo).

</details>
