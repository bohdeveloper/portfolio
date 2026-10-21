"use client";

/* ============================
   IA EN LA PRÁCTICA

   Prueba de uso real que respalda la dirección del hero («Ingeniería de IA
   aplicada»). La hoja de ruta de Formación dice lo que voy a aprender; esta
   franja dice lo que ya hago. Solo hechos comprobables: lo que está en
   desarrollo se marca como tal (invariante 5). Va después de proyectos y
   formación (invariante 3).
============================ */

const SKILLS_PROPIAS = [
  "frontend-designer",
  "grafo-designer",
  "kickstack",
  "marketing-team-skills",
  "security-master",
  "spec-driven",
];

const PRUEBAS: { titulo: string; donde: string; texto: string; tags: string[]; enDesarrollo?: boolean }[] = [
  {
    titulo: "Agentes de código",
    donde: "A diario",
    texto: "Claude Code sobre el repositorio, con hooks, subagentes, memoria y skills propias para tareas recurrentes.",
    tags: ["Claude Code", "hooks", "subagentes", "skills"],
  },
  {
    titulo: "Spec-Driven Development",
    donde: "Este portfolio",
    texto: "Especificación y plan vivos que el agente lee antes de tocar código, con invariantes que no puede saltarse.",
    tags: ["spec.md", "plan.md", "agentes"],
  },
  {
    titulo: "Servidores MCP",
    donde: "Mis repositorios",
    texto: "Grafo de código consultable por el agente con codebase-memory-mcp, en vez de releer archivos enteros.",
    tags: ["MCP", "codebase-memory-mcp"],
  },
  {
    titulo: "Orquestación de LLM",
    donde: "BAKO",
    texto: "Failover entre Ollama local y Groq, transcripción con Whisper y capa de privacidad que fuerza lo sensible a local.",
    tags: ["Ollama", "Groq", "Whisper"],
  },
  {
    titulo: "RAG con Spring AI",
    donde: "ayudas_gv",
    texto: "Asistente que responde dudas sobre una ayuda usando la normativa como fuente.",
    tags: ["Spring AI", "RAG"],
    enDesarrollo: true,
  },
];

export default function ClaudeIA() {
  return (
    <section id="ia" className="max-w-6xl mx-auto px-6 py-24">
      <h2 className="text-3xl font-bold text-black dark:text-white mb-4 flex items-center gap-3">
        <span className="text-primary text-4xl">⌁</span>
        IA en la práctica
      </h2>

      <p className="text-gray-700 dark:text-gray-300 max-w-3xl leading-relaxed">
        La IA me ha hecho más productivo escribiendo código. Donde sigo aportando
        es en <strong className="text-black dark:text-white">decidir qué construir</strong> y en{" "}
        <strong className="text-black dark:text-white">validar que lo generado es correcto y mantenible</strong>.
        Esto es lo que ya uso hoy; lo que viene está en la{" "}
        <a href="#ruta-ia-aplicada" className="text-primary hover:underline">
          hoja de ruta
        </a>
        .
      </p>

      {/* Franja de pruebas: cinco columnas en escritorio, separadas por una
          línea vertical en vez de tarjetas, para que se lea como un registro */}
      <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5 lg:gap-0">
        {PRUEBAS.map((p) => (
          <li key={p.titulo} className="lg:px-5 lg:first:pl-0 lg:border-l lg:first:border-l-0 border-gray-200 dark:border-gray-800">
            <p className="font-mono text-[11px] uppercase tracking-widest text-gray-500 dark:text-gray-400">
              {p.donde}
              {p.enDesarrollo && <span className="text-primary"> · en desarrollo</span>}
            </p>
            <h3 className="mt-1 font-semibold text-black dark:text-white">{p.titulo}</h3>
            <p className="mt-1.5 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{p.texto}</p>
            <div className="flex flex-wrap gap-1 mt-3">
              {p.tags.map((t) => (
                <span key={t} className="px-1.5 py-0.5 text-[11px] font-mono rounded border border-cyan-400/40 text-primary">
                  {t}
                </span>
              ))}
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-10 text-xs text-gray-500 dark:text-gray-400">
        Skills propias para Claude Code:{" "}
        {SKILLS_PROPIAS.map((s, i) => (
          <span key={s}>
            <span className="font-mono text-gray-600 dark:text-gray-300">{s}</span>
            {i < SKILLS_PROPIAS.length - 1 ? " · " : ""}
          </span>
        ))}
      </p>
    </section>
  );
}
