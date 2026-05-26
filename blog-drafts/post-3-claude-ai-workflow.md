# Post 3 — Claude AI workflow

**Título:** Un año usando Claude AI para programar: lo que funciona, lo que no, y lo que cambió todo
**Excerpt:** No te voy a hablar de prompts mágicos. Te cuento cómo integré Claude en mi flujo real de trabajo: debugging, arquitectura, code review, y en qué casos la IA todavía falla.
**Tags:** IA, Claude, Productividad, Herramientas

---

Llevo más de un año usando Claude AI en mi trabajo como desarrollador. Mi conclusión:

**No es la IA que genera código por ti. Es la que te ayuda a pensar mejor.**

## Por qué Claude y no GitHub Copilot

Copilot es bueno para autocompletar y no repetir el mismo patrón veinte veces. Pero ante un bug oscuro, una decisión de arquitectura o un refactor complejo, solo te ayuda a escribir más rápido — no a entender.

Claude razona diferente: explica el por qué, señala trade-offs y te dice cuándo está asumiendo cosas. Esa diferencia lo cambia todo.

## Los cuatro usos que de verdad me ahorran tiempo

### 1. Debugging que no entiendo — el más valioso

Pego el error, la función y el contexto. Claude identifica el problema en segundos y explica por qué ocurre.

Ejemplo real: botón "Guardando..." que se quedaba bloqueado para siempre. El problema era que `res.json()` lanzaba una excepción en errores 500 y `setSaving(false)` nunca llegaba a ejecutarse.

```ts
// Antes — podía quedarse colgado
const data = await res.json();
setSaving(false);

// Después — finally garantiza ejecución siempre
try {
  const data = await res.json().catch(() => ({ ok: false }));
} catch {
  setMsg('Error de conexión');
} finally {
  setSaving(false);
}
```

Antes: 20-30 minutos en ese tipo de bugs. Ahora: 2-3 minutos.

### 2. Decisiones de arquitectura como sparring

No para que me dé la respuesta — para explorar implicaciones de cada opción.

Ejemplo: elegir entre rutas `/blog/[slug]` y query params `/blog?slug=xxx` con Next.js static export. Dos minutos de conversación vs. una hora leyendo documentación dispersa.

### 3. Code review antes de hacer push

Comparto el diff y pido que busque edge cases no cubiertos, condiciones de carrera o problemas de seguridad sutiles. No siempre encuentra algo, pero cuando lo hace me ha ahorrado un bug en producción.

### 4. Transformaciones repetitivas

Añadir manejo de errores consistente a 15 funciones, migrar de una API a otra, adaptar un patrón en múltiples archivos. Claude lo ejecuta, yo reviso.

## Donde todavía falla

**Alucinaciones en APIs recientes** — si la librería salió hace tres meses puede inventarse métodos. Siempre verifica con la documentación oficial.

**Sin memoria entre sesiones** — cada conversación empieza de cero. En proyectos complejos dar contexto cuesta tiempo.

**Código funcional pero no idiomático** — genera código que funciona pero no siempre sigue las convenciones del proyecto. Necesitas criterio propio para revisarlo.

## Mi setup

**Claude Code** (CLI oficial) integrado en VS Code. Tiene acceso directo a los archivos del proyecto sin que tenga que pegar nada, y mantiene el hilo entre múltiples archivos. Para trabajo sostenido en un proyecto, es mucho más eficiente que el chat web.

## ¿Reemplaza al desarrollador?

No. La calidad del output depende directamente de la calidad del input. Claude es bueno cuando le das contexto preciso y una pregunta bien formulada — y eso requiere conocimiento técnico real.

Lo que sí ha cambiado: **invierto menos tiempo en recordar sintaxis y más en entender el problema**. Para mí eso es suficiente motivo.
