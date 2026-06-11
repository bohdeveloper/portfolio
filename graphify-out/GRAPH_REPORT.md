# Graph Report - portfolio  (2026-06-10)

## Corpus Check
- 102 files · ~172,346 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 652 nodes · 798 edges · 69 communities (45 shown, 24 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `68841a25`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]

## God Nodes (most connected - your core abstractions)
1. `verifyAuth()` - 84 edges
2. `compilerOptions` - 17 edges
3. `validateInt()` - 10 edges
4. `validateStr()` - 9 edges
5. `Portfolio personal — bohdeveloper.com` - 9 edges
6. `validateFloat()` - 7 edges
7. `useCardHolo()` - 7 edges
8. `checkRole()` - 6 edges
9. `onRequestPost()` - 6 edges
10. `unauthorized()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `onRequestDelete()` --calls--> `verifyAuth()`  [EXTRACTED]
  frontend/functions/api/bioptima/biometrics.ts → frontend/functions/api/_auth-util.ts
- `onRequestGet()` --calls--> `verifyAuth()`  [EXTRACTED]
  frontend/functions/api/bioptima/biometrics.ts → frontend/functions/api/_auth-util.ts
- `onRequestGet()` --calls--> `verifyAuth()`  [EXTRACTED]
  frontend/functions/api/bioptima/daily.ts → frontend/functions/api/_auth-util.ts
- `onRequestGet()` --calls--> `verifyAuth()`  [EXTRACTED]
  frontend/functions/api/bioptima/profile.ts → frontend/functions/api/_auth-util.ts
- `onRequestGet()` --calls--> `verifyAuth()`  [EXTRACTED]
  frontend/functions/api/bioptima/stats.ts → frontend/functions/api/_auth-util.ts

## Import Cycles
- None detected.

## Communities (69 total, 24 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.02
Nodes (90): ✅ 16 categorías: programación, literatura, novela, ciencia, filosofía..., ✅ 2 inputs + 2 botones independientes: calorías quemadas / ingeridas, ✅ Action modal en day-cfg: completar/perder, comentario, copy-forward y botón "✎ Editar", ✅ Admin /dashboard/blog: editor WYSIWYG TipTap, lista, publicar/borrador, ✅ Admin /dashboard/juegos: CRUD + set TOP, ✅ Admin /dashboard/usuarios: CRUD de usuarios + activar/desactivar, ✅ AdminNavbar: sin enlaces en login, dinámico según ruta, ✅ Alertas visuales al superar el presupuesto (+82 more)

### Community 1 - "Community 1"
Cohesion: 0.07
Nodes (36): validateFloat(), validateHexColor(), validateHttpsUrl(), validateInt(), validateStr(), BiometricLatest, DailyRow, Env (+28 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (16): useCardHolo(), useFadeInOnScroll(), Aprendizaje(), beneficios, ClaudeIA(), intereses, tabs, EMOJIS (+8 more)

### Community 3 - "Community 3"
Cohesion: 0.06
Nodes (11): inter, metadata, viewport, ADMIN_APPS, EMOJIS, Game, Leader, MEDALS (+3 more)

### Community 4 - "Community 4"
Cohesion: 0.06
Nodes (31): dependencies, bcryptjs, jose, next, react, react-dom, @tiptap/extension-link, @tiptap/extension-placeholder (+23 more)

### Community 5 - "Community 5"
Cohesion: 0.10
Nodes (15): CAT_CLS, DynCat, getDays(), getWS(), RawTask, StateRecord, Activity, Cat (+7 more)

### Community 6 - "Community 6"
Cohesion: 0.13
Nodes (15): verifyAuth(), Env, onRequestPost(), Env, onRequestPost(), Env, H, onRequestDelete() (+7 more)

### Community 7 - "Community 7"
Cohesion: 0.10
Nodes (20): compilerOptions, allowJs, esModuleInterop, ignoreDeprecations, incremental, isolatedModules, jsx, lib (+12 more)

### Community 8 - "Community 8"
Cohesion: 0.16
Nodes (14): ACTIVITY_LABELS, balanceBadge(), Biometric, bmiLabel(), DailyRec, n0(), n1(), Profile (+6 more)

### Community 9 - "Community 9"
Cohesion: 0.14
Nodes (9): Comment, CommentItem(), EMOJIS, fmtRelative(), PostCard(), PostView(), tagList(), fmtDate() (+1 more)

### Community 10 - "Community 10"
Cohesion: 0.11
Nodes (9): Book, CAT_COLORS, CATEGORIES, Chapter, LANGUAGES, LEVELS, ReaderState, Tab (+1 more)

### Community 11 - "Community 11"
Cohesion: 0.13
Nodes (10): JWTPayload, Env, onRequestPost(), BulkRecord, Env, onRequestPost(), Env, onRequestGet() (+2 more)

### Community 12 - "Community 12"
Cohesion: 0.14
Nodes (3): APP_ICONS, APPS, Node

### Community 13 - "Community 13"
Cohesion: 0.19
Nodes (11): COLORS, fmt(), formatLastMod(), HistoryRow, Item, ItemRow(), MonetaPage(), monthLabel() (+3 more)

### Community 14 - "Community 14"
Cohesion: 0.14
Nodes (13): Apps en producción, Arquitectura, Base de datos D1, Blog técnico (`/blog`), Deploy, Estructura del proyecto, Instalación local, Minijuegos (`/public/games/`) (+5 more)

### Community 15 - "Community 15"
Cohesion: 0.15
Nodes (4): AdminComment, EMPTY, View, Post

### Community 16 - "Community 16"
Cohesion: 0.24
Nodes (10): BiometricRow, calcBMI(), calcBMR(), calcBodyFat(), Env, H, onRequestDelete(), onRequestGet() (+2 more)

### Community 17 - "Community 17"
Cohesion: 0.18
Nodes (3): EMPTY, Project, View

### Community 18 - "Community 18"
Cohesion: 0.44
Nodes (9): bad(), Env, H, onRequestDelete(), onRequestGet(), onRequestPatch(), onRequestPost(), unauthorized() (+1 more)

### Community 19 - "Community 19"
Cohesion: 0.40
Nodes (9): bad(), Env, forbidden(), H, onRequestDelete(), onRequestPatch(), onRequestPost(), onRequestPut() (+1 more)

### Community 20 - "Community 20"
Cohesion: 0.25
Nodes (8): Env, H, hashIp(), onRequestDelete(), onRequestGet(), onRequestPatch(), onRequestPost(), PH

### Community 21 - "Community 21"
Cohesion: 0.22
Nodes (5): EMPTY, Game, Leader, MEDALS, View

### Community 22 - "Community 22"
Cohesion: 0.46
Nodes (7): bad(), Env, H, onRequestDelete(), onRequestPatch(), onRequestPost(), touchLastModified()

### Community 23 - "Community 23"
Cohesion: 0.32
Nodes (4): Project, ProjectCard(), ProjectView(), tagList()

### Community 24 - "Community 24"
Cohesion: 0.33
Nodes (3): Env, H, VALID_EMOJIS

### Community 25 - "Community 25"
Cohesion: 0.33
Nodes (3): ADMIN_APPS, AppPos, NNode

### Community 26 - "Community 26"
Cohesion: 0.47
Nodes (5): bad(), Env, H, onRequestDelete(), onRequestPost()

### Community 27 - "Community 27"
Cohesion: 0.33
Nodes (5): Env, H, ItemRow, onRequestGet(), SummaryRow

### Community 28 - "Community 28"
Cohesion: 0.33
Nodes (5): BookRow, Env, H, onRequestDelete(), onRequestGet()

### Community 29 - "Community 29"
Cohesion: 0.40
Nodes (3): Env, H, VALID_EMOJIS

### Community 32 - "Community 32"
Cohesion: 0.40
Nodes (4): Env, H, HistoryRow, onRequestGet()

### Community 33 - "Community 33"
Cohesion: 0.50
Nodes (3): Env, H, onRequestGet()

### Community 36 - "Community 36"
Cohesion: 0.50
Nodes (3): Env, H, onRequestPost()

### Community 37 - "Community 37"
Cohesion: 0.50
Nodes (3): Env, H, onRequestPost()

### Community 38 - "Community 38"
Cohesion: 0.50
Nodes (3): Env, H, onRequestPost()

### Community 40 - "Community 40"
Cohesion: 0.50
Nodes (3): Env, H, onRequestGet()

### Community 48 - "Community 48"
Cohesion: 0.67
Nodes (3): HTML standalone — minijuegos sin dependencias externas, 🔄 MEJORAS POST-LANZAMIENTO, Tracker

## Knowledge Gaps
- **315 isolated node(s):** `eslintConfig`, `Env`, `JWTPayload`, `Env`, `H` (+310 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **24 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `verifyAuth()` connect `Community 6` to `Community 32`, `Community 1`, `Community 33`, `Community 36`, `Community 37`, `Community 38`, `Community 40`, `Community 11`, `Community 16`, `Community 18`, `Community 19`, `Community 20`, `Community 22`, `Community 26`, `Community 27`, `Community 28`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `Env`, `JWTPayload` to the rest of the system?**
  _315 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.02197802197802198 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.07171717171717172 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.06906906906906907 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.058823529411764705 - nodes in this community are weakly interconnected._
- **Should `Community 4` be split into smaller, more focused modules?**
  _Cohesion score 0.0625 - nodes in this community are weakly interconnected._