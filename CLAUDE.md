# CLAUDE.md — reglas de trabajo

> Este archivo se carga en cada sesión y contiene **solo reglas de trabajo**.
> El conocimiento del proyecto —qué es, cómo está construido, decisiones— vive en
> [spec.md](spec.md). No dupliques aquí lo que ya está allí.

---

## Spec-Driven Development (OBLIGATORIO)

1. **Al empezar**, leer [spec.md §3 invariantes](spec.md) y [§6 metodología](spec.md).
2. **Nada se implementa sin su punto en [plan.md](plan.md).** Si la tarea no está,
   añadirla antes de empezar.
3. Si la tarea **choca con un invariante de §3**, avisar al usuario antes de
   implementar, no después.
4. **Al terminar**, marcar el punto en plan.md con fecha. Decisión nueva de
   producto o arquitectura → spec.md §3. Cambio de alcance o de stack → README.md.

---

## Grafo de código

El proyecto está indexado con **codebase-memory-mcp** (declarado en `.mcp.json`,
proyecto `C-aplic-portfolio`).

- Ejecutar `get_graph_schema` **una vez por sesión**, antes de la primera consulta.
- Para preguntas de arquitectura o dependencias, preferir `search_graph`,
  `trace_path`, `query_graph` y `get_code_snippet` a leer archivos enteros o hacer
  grep. Leer el archivo raw cuando vayas a **modificar o depurar** código concreto,
  o cuando el grafo no tenga el detalle.
- **Nunca inventar una relación.** Si `search_graph` no la encuentra, decirlo.
- Tras cambios estructurales grandes, reindexar con `index_repository`.
- Antes de dar por buena una refactorización, `detect_changes` para ver el blast
  radius real. Obligatorio si se toca `verifyAuth`: 54 llamadas dependen de él.
- Visión general en [GRAPH_REPORT.md](GRAPH_REPORT.md).

---

## Agentes y skills

Agentes en `.claude/agents/`: **`seo-master`** (indexación, metadatos, datos
estructurados), **`git-master`** (conflictos, rebase, estrategia de ramas — no
para un commit rutinario) y **`ux-ui-designer`** (todo lo que sea resultado
visual).

Skills obligatorias al cerrar trabajo: **`/code-review`** sobre el diff siempre, y
**`/security-review`** si se toca auth, endpoints o datos personales.

Tabla completa de cuándo usar cada una en [spec.md §6](spec.md).

---

## Entorno

- **Commits solo cuando el usuario los pida.** Mensajes en español, imperativo,
  con cuerpo que explique el porqué. Seguir el estilo del `git log`.
- **`git push origin main` despliega a producción.** No es un push cualquiera.
- **Todo cambio en D1 va en un fichero de `migrations/`**, con cabecera que
  explique el motivo y el comando. Nunca un comando suelto sin rastro en el repo.
- Las lecturas públicas de la API tienen caché de edge: tras escribir en D1, los
  cambios tardan hasta el TTL en verse. Para verificar al instante, usar una query
  string distinta.
- `wrangler` usa OAuth y el token caduca. Si falla en modo no interactivo,
  reautenticar con `wrangler login`.
- Comentarios técnicos **en español** en las partes complejas, no en lo obvio.
