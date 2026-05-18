export default function Hero() {
  return (
    <section
      id="inicio"
      className="min-h-screen flex flex-col justify-center max-w-6xl mx-auto px-6 pt-32"
    >
      <p className="text-gray-600 dark:text-gray-400 text-lg">
        Hola, mi nombre es
      </p>

      <h1 className="text-5xl md:text-6xl font-bold text-black dark:text-white mt-2">
        Borja Olazabal,
        <span className="block text-primary">
          programador web
        </span>
      </h1>

      {/* Claude AI — visible a primer vistazo */}
      <div className="flex items-center gap-3 mt-5">
        <div className="w-px h-10 bg-primary/60 flex-shrink-0" />
        <div className="flex items-center gap-2.5">
          <svg viewBox="0 0 100 100" className="w-8 h-8 text-primary flex-shrink-0" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-label="Claude logo">
            <rect x="44" y="8"  width="12" height="84" rx="6" />
            <rect x="44" y="8"  width="12" height="84" rx="6" transform="rotate(60,  50, 50)" />
            <rect x="44" y="8"  width="12" height="84" rx="6" transform="rotate(120, 50, 50)" />
          </svg>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest leading-none mb-0.5">
              Potenciado por
            </p>
            <p className="text-base font-semibold text-primary leading-none">
              Claude AI — Anthropic
            </p>
          </div>
        </div>
      </div>

      <p className="text-gray-700 dark:text-gray-300 max-w-2xl mt-8 text-xl leading-relaxed">
        Especializado en <strong>desarrollo web</strong>, diseñando, desarrollando y manteniendo:
      </p>

      <ul className="
        list-disc list-inside mt-4 font-medium text-primary
        text-xs sm:text-sm md:text-base
      ">
        <li>Páginas web estáticas y landings profesionales.</li>
        <li>Sistemas de gestión y mantenimiento de datos (CMS).</li>
        <li>Flujos de información y comunicación mediante APIs.</li>
        <li>Automatización e integración de IA en el desarrollo.</li>
      </ul>

      <div className="flex flex-wrap gap-4 mt-8">
        <a
          href="https://github.com/bohdeveloper"
          target="_blank"
          className="text-center inline-block px-6 py-3 border border-cyan-400 text-primary rounded hover:bg-cyan-400 hover:text-black transition"
        >
          Accede a mi código
        </a>
        <a
          href="#ia"
          className="text-center inline-block px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded hover:border-primary hover:text-primary transition"
        >
          IA en mi flujo de trabajo →
        </a>
      </div>
    </section>
  );
}
