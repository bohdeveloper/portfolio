"use client";

import { useCardHolo } from "@/hooks/useCardHolo";

const beneficios = [
  {
    titulo: "Claridad",
    descripcion: "Mayor precisión para analizar y resolver desafíos técnicos desde el primer enfoque.",
    path: "M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18",
  },
  {
    titulo: "Velocidad",
    descripcion: "Desarrollo y debugging más ágil sin sacrificar calidad ni criterio técnico.",
    path: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z",
  },
  {
    titulo: "Agentes",
    descripcion: "Creación de agentes inteligentes que automatizan tareas repetitivas.",
    path: "M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z",
  },
  {
    titulo: "Arquitectura",
    descripcion: "De la idea al código sin fricciones: concepto, diseño y ejecución en un flujo.",
    path: "M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244",
  },
];

const intereses = [
  "Integración de IA en productos reales",
  "Automatización y agentes inteligentes",
  "Desarrollo web moderno + IA co-piloto",
];

export default function ClaudeIA() {
  const holo = useCardHolo();

  return (
    <section id="ia" className="max-w-6xl mx-auto px-6 py-32">

      {/* HEADER */}
      <h2 className="text-3xl font-bold text-black dark:text-white mb-4 flex items-center gap-3">
        <span className="text-primary text-4xl">⌁</span>
        Desarrollo impulsado por IA
      </h2>

      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-3xl mb-10">
        Integro <strong>inteligencia artificial</strong> — concretamente{" "}
        <strong>Claude de Anthropic</strong> — en mi flujo de trabajo diario como{" "}
        <strong>desarrollador web</strong>. No se trata de programar más rápido,
        sino de pensar mejor, diseñar con más criterio y construir soluciones más robustas.
      </p>

      {/* QUOTE */}
      <blockquote className="relative pl-6 border-l-4 border-primary italic text-gray-700 dark:text-gray-300 text-lg max-w-2xl mb-6">
        "No se trata solo de programar más rápido, sino de pensar mejor y construir con más criterio."
      </blockquote>

      {/* LOGO CLAUDE — después de la frase */}
      <div className="flex items-center gap-3 mb-10">
        <svg viewBox="0 0 100 100" className="w-9 h-9 text-primary flex-shrink-0" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-label="Claude logo">
          <rect x="44" y="8"  width="12" height="84" rx="6" />
          <rect x="44" y="8"  width="12" height="84" rx="6" transform="rotate(60,  50, 50)" />
          <rect x="44" y="8"  width="12" height="84" rx="6" transform="rotate(120, 50, 50)" />
        </svg>
        <div>
          <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider leading-none mb-0.5">
            Impulsado por
          </p>
          <p className="text-sm font-semibold text-black dark:text-white leading-none">
            Claude — Anthropic
          </p>
        </div>
      </div>

      {/* INTERESES — pills */}
      <div className="flex flex-wrap gap-2 mb-12">
        {intereses.map((item, idx) => (
          <span
            key={idx}
            className="px-3 py-1.5 text-sm border border-primary/50 text-primary rounded-full bg-cyan-400/5"
          >
            {item}
          </span>
        ))}
      </div>

      {/* LAYOUT PRINCIPAL */}
      <div className="flex flex-col md:flex-row gap-6">

        {/* COLUMNA IZQUIERDA: 2×2 cards */}
        <div className="flex-1 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 h-full">
            {beneficios.map((b, i) => (
              <div
                key={i}
                {...holo}
                className="card-holo flex flex-col gap-3 p-4 rounded-lg border border-cyan-400/30 bg-white dark:bg-[#0d0d0d] hover:border-primary"
              >
                <span className="card-holo-shine" aria-hidden />
                <span className="card-holo-noise"  aria-hidden />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  className="w-5 h-5 text-primary"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={b.path} />
                </svg>
                <div>
                  <h3 className="font-semibold text-black dark:text-white text-sm mb-1">
                    {b.titulo}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    {b.descripcion}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMNA DERECHA: imagen artística */}
        <div className="flex-1 w-full min-h-[280px] md:min-h-0 claude-frame">
          <img
            src="/images/boh_claude-min.png"
            alt="Borja Olazabal con Claude AI"
            className="w-full h-full object-cover claude-img"
          />
          <div className="claude-shimmer" aria-hidden="true" />

          {/* Esquinas viewfinder */}
          <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-primary z-10 pointer-events-none" aria-hidden="true" />
          <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-primary z-10 pointer-events-none" aria-hidden="true" />
          <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-primary z-10 pointer-events-none" aria-hidden="true" />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-primary z-10 pointer-events-none" aria-hidden="true" />

          {/* Línea horizontal superior decorativa */}
          <div className="absolute top-4 left-[44px] right-[44px] h-px bg-primary/30 z-10 pointer-events-none" aria-hidden="true" />
          <div className="absolute bottom-4 left-[44px] right-[44px] h-px bg-primary/30 z-10 pointer-events-none" aria-hidden="true" />

        </div>

      </div>

      {/* HERRAMIENTAS */}
      <div className="mt-16">
        <h3 className="text-lg font-semibold text-black dark:text-white mb-1">
          Herramientas en producción
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-2xl">
          Más allá del chat: utilidades que integro directamente en el flujo de cada proyecto.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* graphify */}
          <div className="p-5 rounded-lg border border-cyan-400/20 bg-white dark:bg-[#0d0d0d] hover:border-primary/40 transition-colors">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-primary font-mono text-base leading-none">⬡</span>
              <h4 className="font-semibold text-black dark:text-white text-sm">graphify</h4>
              <span className="ml-auto text-xs font-mono px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-800 text-gray-400">CLI</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              Transforma cualquier repositorio en un{" "}
              <strong className="text-gray-800 dark:text-gray-200">grafo de conocimiento</strong>:{" "}
              nodos, comunidades y relaciones entre funciones, componentes y módulos.
              Claude navega el código sin leer archivo por archivo — con contexto siempre actualizado.
            </p>
            <div className="grid grid-cols-3 gap-2 mb-4 text-center">
              {[
                { v: "650+", l: "nodos" },
                { v: "800+", l: "conexiones" },
                { v: "69",   l: "comunidades" },
              ].map(({ v, l }) => (
                <div key={l} className="py-2 rounded bg-cyan-400/5 border border-cyan-400/10">
                  <div className="text-sm font-bold text-primary">{v}</div>
                  <div className="text-xs text-gray-500">{l}</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-600 italic mb-3">
              Un hook <code className="font-mono not-italic text-primary/70">Stop</code> regenera
              el grafo automáticamente tras cada sesión de desarrollo.
            </p>
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
              <h4 className="font-semibold text-black dark:text-white text-sm">Claude Code</h4>
              <span className="ml-auto text-xs font-mono px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-800 text-gray-400">CLI</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              Agente que opera directamente sobre el repositorio: lee, edita y ejecuta código.
              Hooks personalizados que automatizan tareas al inicio y al final de cada sesión,
              manteniendo el contexto del proyecto siempre vigente.
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
      </div>

    </section>
  );
}
