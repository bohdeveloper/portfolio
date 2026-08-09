"use client";

/* ============================
   IA — bloque compacto

   Sigue siendo un diferencial, pero ocupa el lugar que le corresponde:
   después de proyectos y formación, sin ocupar pantalla completa.
   Lo que se conserva es lo que demuestra criterio: graphify, una
   herramienta propia con métricas concretas.
============================ */

export default function ClaudeIA() {
  return (
    <section id="ia" className="max-w-6xl mx-auto px-6 py-24">

      <h2 className="text-3xl font-bold text-black dark:text-white mb-4 flex items-center gap-3">
        <span className="text-primary text-4xl">⌁</span>
        IA en mi flujo de trabajo
      </h2>

      <p className="text-gray-700 dark:text-gray-300 max-w-3xl mb-4 leading-relaxed">
        Integro <strong>Claude de Anthropic</strong> en mi desarrollo diario:
        exploración de código, generación asistida, refactor y automatización de
        tareas repetitivas mediante hooks y agentes.
      </p>

      <p className="text-gray-600 dark:text-gray-400 max-w-3xl mb-12 leading-relaxed">
        La IA me ha hecho más productivo escribiendo código. Donde sigo aportando
        es en <strong className="text-black dark:text-white">decidir qué construir</strong> y en{" "}
        <strong className="text-black dark:text-white">validar que lo generado es correcto y mantenible</strong>.
      </p>

      {/* HERRAMIENTA PROPIA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* graphify */}
        <div className="p-5 rounded-lg border border-cyan-400/30 bg-white dark:bg-[#0d0d0d] hover:border-primary/60 transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-primary font-mono text-base leading-none">⬡</span>
            <h3 className="font-semibold text-black dark:text-white text-sm">graphify</h3>
            <span className="ml-auto text-xs font-mono px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-800 text-gray-400">
              herramienta propia · CLI
            </span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            Transforma cualquier repositorio en un{" "}
            <strong className="text-gray-800 dark:text-gray-200">grafo de conocimiento</strong>:{" "}
            nodos, comunidades y relaciones entre funciones, componentes y módulos.
            El agente navega el código sin leer archivo por archivo — con contexto
            siempre actualizado. Un hook{" "}
            <code className="font-mono text-primary/80">Stop</code> regenera el grafo
            tras cada sesión.
          </p>
          <div className="grid grid-cols-3 gap-2 mb-4 text-center">
            {[
              /* Cifras reales del grafo de este propio portfolio. */
              { v: "703", l: "nodos" },
              { v: "855", l: "conexiones" },
              { v: "75",  l: "comunidades" },
            ].map(({ v, l }) => (
              <div key={l} className="py-2 rounded bg-cyan-400/5 border border-cyan-400/10">
                <div className="text-sm font-bold text-primary">{v}</div>
                <div className="text-xs text-gray-500">{l}</div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {["query", "path", "explain", "update", "watch"].map(cmd => (
              <span
                key={cmd}
                className="px-2 py-0.5 text-xs font-mono text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-800 rounded"
              >
                graphify {cmd}
              </span>
            ))}
          </div>
        </div>

        {/* Claude Code */}
        <div className="p-5 rounded-lg border border-cyan-400/20 bg-white dark:bg-[#0d0d0d] hover:border-primary/40 transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <svg viewBox="0 0 100 100" className="w-4 h-4 text-primary flex-shrink-0" fill="currentColor" aria-hidden="true">
              <rect x="44" y="8"  width="12" height="84" rx="6" />
              <rect x="44" y="8"  width="12" height="84" rx="6" transform="rotate(60,50,50)" />
              <rect x="44" y="8"  width="12" height="84" rx="6" transform="rotate(120,50,50)" />
            </svg>
            <h3 className="font-semibold text-black dark:text-white text-sm">Claude Code</h3>
            <span className="ml-auto text-xs font-mono px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-800 text-gray-400">CLI</span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            Agente que opera directamente sobre el repositorio: lee, edita y ejecuta
            código. Hooks personalizados que automatizan tareas al inicio y al final
            de cada sesión, manteniendo el contexto del proyecto siempre vigente.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {["hooks", "subagentes", "MCP servers", "memory", "skills"].map(tag => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs font-mono text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-800 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

      </div>

    </section>
  );
}
