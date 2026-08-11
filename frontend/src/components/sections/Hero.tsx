import CVDownload from "@/components/ui/CVDownload";

export default function Hero() {
  return (
    <section
      id="inicio"
      className="min-h-screen flex flex-col justify-center max-w-6xl mx-auto px-6 pt-32"
    >
      <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-lg">
        Hola, mi nombre es
      </p>

      <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-black dark:text-white mt-2 leading-tight">
        Borja Olazabal,
        <span className="block text-primary">
          programador web
        </span>
      </h1>

      {/* POSICIONAMIENTO — stack profesional y años de experiencia.
          Sustituye al antiguo badge de IA: es el punto de mayor jerarquía
          visual de la página y lo ocupa el perfil, no una herramienta. */}
      <div className="flex items-start gap-3 mt-5">
        <div className="w-px self-stretch bg-primary/60 flex-shrink-0" />
        <div>
          <p className="text-base sm:text-xl font-semibold text-black dark:text-white leading-snug">
            Java · Spring Boot · Oracle
          </p>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            Cinco años en proyectos de Administración Pública autonómica
          </p>
        </div>
      </div>

      {/* DISPONIBILIDAD — señal para recruiters, discreta pero visible */}
      <div className="mt-6">
        <span className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-cyan-400/50 bg-cyan-400/5 text-sm text-primary font-medium">
          <span className="relative flex w-2 h-2" aria-hidden="true">
            <span className="absolute inline-flex w-full h-full rounded-full bg-primary opacity-60 claude-pulse" />
            <span className="relative inline-flex w-2 h-2 rounded-full bg-primary" />
          </span>
          Disponible · Vigo / Pontevedra · Remoto
        </span>
      </div>

      {/* Mismo distintivo que la cabecera de los CV, para que el criterio sea
          el mismo en los dos documentos. Va después del stack y de la
          disponibilidad, no por delante: es un complemento, no el titular. */}
      <div className="flex items-center gap-2.5 mt-6">
        <svg
          viewBox="0 0 100 100"
          className="w-5 h-5 text-primary flex-shrink-0"
          fill="currentColor"
          aria-hidden="true"
        >
          <rect x="44" y="8" width="12" height="84" rx="6" />
          <rect x="44" y="8" width="12" height="84" rx="6" transform="rotate(60, 50, 50)" />
          <rect x="44" y="8" width="12" height="84" rx="6" transform="rotate(120, 50, 50)" />
        </svg>
        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest leading-none">
          Potenciado por{" "}
          <span className="font-semibold text-gray-700 dark:text-gray-300 normal-case tracking-normal">
            Claude — Anthropic
          </span>
        </p>
      </div>

      <p className="text-gray-700 dark:text-gray-300 max-w-2xl mt-8 text-base sm:text-lg md:text-xl leading-relaxed">
        Especializado en <strong>aplicaciones web empresariales</strong>, diseñando, desarrollando y manteniendo:
      </p>

      <ul className="
        list-disc list-inside mt-4 font-medium text-primary
        text-xs sm:text-sm md:text-base
      ">
        <li>Aplicaciones web empresariales con Java y Spring Boot.</li>
        <li>Sistemas de gestión y tramitación de datos.</li>
        <li>Integración entre sistemas mediante APIs REST.</li>
        <li>Frontend moderno con Angular, React y Next.js.</li>
      </ul>

      <div className="flex flex-wrap gap-4 mt-8">
        <CVDownload variant="primary" />
        <a
          href="https://github.com/bohdeveloper"
          target="_blank"
          className="text-center inline-block px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded hover:border-primary hover:text-primary transition"
        >
          Accede a mi código
        </a>
      </div>
    </section>
  );
}
