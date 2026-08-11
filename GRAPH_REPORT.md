# 🕸 GRAPH_REPORT — bohdeveloper.com

> Grafo de conocimiento estructural generado con **codebase-memory-mcp**
> Proyecto indexado: `C-aplic-portfolio` · Índice local en `~/.cache/codebase-memory-mcp`
> Última indexación: 11 de agosto de 2026

---

## 📊 Tamaño del grafo

| Métrica | Valor |
|---|---|
| Nodos | 1.014 |
| Aristas | 2.480 |
| Labels de nodo | 12 |
| Tipos de arista | 12 |
| Archivos indexados | 114 |

### Nodos por tipo

| Label | Nº | Label | Nº |
|---|---|---|---|
| Function | 387 | Route | 52 |
| Variable | 144 | Folder | 39 |
| File | 114 | Type | 8 |
| Module | 112 | Class | 1 |
| Interface | 93 | Branch | 1 |
| Section | 62 | Project | 1 |

### Aristas por tipo

`DEFINES` 807 · `USAGE` 539 · `CALLS` 504 · `IMPORTS` 145 ·
`SEMANTICALLY_RELATED` 121 · `CONTAINS_FILE` 114 · `FILE_CHANGES_WITH` 106 ·
`HTTP_CALLS` 82 · `CONTAINS_FOLDER` 36 · `SIMILAR_TO` 21 · `WRITES` 4 · `HAS_BRANCH` 1

### Lenguajes

TypeScript 86 archivos · SQL 10 · HTML 5 · JavaScript 3 · CSS 2 · TOML 1

---

## 🔥 Hotspots — los tres nodos más conectados

### 1 · `verifyAuth` — fan-in 54
`frontend/functions/api/_auth-util.ts`

El nodo más conectado del proyecto con diferencia. Prácticamente **toda** la API
serverless pasa por él: cada endpoint autenticado de tracker, moneta, bioptima,
tintai, blog, juegos, proyectos y usuarios lo invoca antes de tocar D1.

**Implicación:** es el punto de fallo único de la autenticación. Cualquier cambio
en la verificación del JWT o en la lectura de la cookie `admin_token` tiene un
blast radius de 54 llamadas. Antes de tocarlo, ejecutar
`detect_changes` y `trace_path(function_name="verifyAuth", direction="in")`.

### 2 · `react` — fan-in 47
`frontend/src/app/blog/page.tsx`

Manejador de reacciones emoji del blog, reutilizado por la lista de posts, la
vista individual, los comentarios y el panel lateral.

### 3 · `ak` — fan-in 10
`frontend/src/app/admin/dashboard/tracker/page.tsx`

Constructor de claves de actividad del tracker. Nombre de una sola sílaba para un
nodo con diez dependientes: candidato claro a renombrado si alguna vez se toca
esa página.

Le siguen `getCatInfo` (8), `dk` (7), `getDays` (6), `fmt` (6), `onUpdate` (5),
`validateInt` (5) y `validateStr` (5) — todos concentrados en el tracker y en la
capa de validación de la API.

---

## 🧩 Comunidades detectadas

Clusters detectados dentro del paquete `frontend`. Los seis mayores:

| Cluster | Miembros | Cohesión | Nodos principales |
|---|---|---|---|
| API serverless | 66 | 0,956 | `verifyAuth`, `validateStr`, `validateInt`, `onRequestPost` |
| Tracker | 48 | 0,991 | `initTracker`, `renderWeek`, `ak`, `renderAll` |
| Blog | 45 | 0,692 | `react`, `PostView`, `BlogList`, `CommentsSection` |
| Moneta | 23 | 0,839 | `ItemRow`, `ProfileColumn`, `StatsView`, `MonetaPage` |
| Bioptima | 16 | 0,826 | `VistaBiometria`, `VistaDiario`, `VistaEvolucion` |
| Layout público | 16 | 0,789 | `BlogPanel`, `RootLayout`, `Navbar`, `ThemeToggle` |

El cluster de la **home pública** (15 miembros, cohesión 0,773) agrupa `Home`,
`CVDownload`, `Proyectos`, `Experiencia` y `QuienSoy`: es donde vive el
portfolio propiamente dicho, separado de las apps del admin.

La cohesión baja del cluster de blog (0,692) refleja que mezcla vista pública,
comentarios y panel lateral en un mismo archivo.

---

## 🚪 Entry points

20 detectados, todos manejadores de Cloudflare Pages Functions
(`onRequestGet` / `onRequestPost` / `onRequestPatch` / `onRequestDelete`) más los
dos middleware:

- `frontend/functions/_middleware.ts` — cabeceras de seguridad globales
- `frontend/functions/admin/_middleware.ts` — protección de `/admin/*`
- `frontend/functions/api/_auth-util.ts` — `verifyAuth`, `checkRole`
- `frontend/functions/api/_security.ts` — `validateStr`, `validateInt`, `validateFloat`, `validateHttpsUrl`, `validateHexColor`, `dbError`

---

## 🌐 Rutas HTTP

52 nodos `Route` y 82 aristas `HTTP_CALLS`. Agrupadas por dominio:

| Dominio | Rutas |
|---|---|
| Auth | `/api/auth/login`, `/logout`, `/me` |
| Admin | `/api/admin/users` |
| Blog | `/api/blog/list`, `/post`, `/save`, `/delete` |
| Proyectos | `/api/projects/list`, `/save`, `/delete` |
| Tracker | `/api/tracker/save`, `/schedule`, `/categories`, `/tasks` |
| Juegos | `/api/games/list`, `/score`, `/visitor`, `/react` |
| Externa | `https://api.anthropic.com/v1/messages` (TintAI) |

---

## 💬 Preguntas para explorar el grafo

```
search_graph   { "project": "C-aplic-portfolio", "label": "Function", "name_pattern": ".*[Aa]uth.*" }
trace_path     { "project": "C-aplic-portfolio", "function_name": "verifyAuth", "direction": "in" }
detect_changes { "project": "C-aplic-portfolio" }
query_graph    { "project": "C-aplic-portfolio", "query": "MATCH (f:Function) WHERE f.complexity > 10 RETURN f.name, f.complexity" }
get_code_snippet { "project": "C-aplic-portfolio", "qualified_name": "C-aplic-portfolio.frontend.functions.api._auth-util.verifyAuth" }
```

- ¿Qué endpoints se rompen si cambio la firma de `verifyAuth`?
- ¿Qué funciones del tracker superan el umbral de complejidad cognitiva?
- ¿Qué archivos cambian históricamente juntos? (aristas `FILE_CHANGES_WITH`)
- ¿Qué rutas de la API no pasan por `checkRole`?

---

## 💰 Coste

El indexado es **AST puro en C, sin LLM y sin coste de tokens**. Se paga una vez
y el auto-sync lo mantiene al día; solo hace falta reindexar a mano tras cambios
estructurales grandes.

Frente a responder preguntas de arquitectura leyendo archivos: las 114 fuentes
indexadas suman decenas de miles de tokens si se leen enteras, mientras que un
`search_graph` o un `trace_path` devuelven un subgrafo acotado.

---

## 🔧 Reconstruir el índice

```bash
pip install codebase-memory-mcp
codebase-memory-mcp cli index_repository '{"repo_path": "C:/aplic/portfolio"}'
```

El servidor MCP está declarado en `.mcp.json`, en el scope del proyecto.
