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

      <p className="text-gray-700 dark:text-gray-300 max-w-2xl mt-6 text-xl leading-relaxed">
        Especializado en <strong>desarrollo web</strong>, diseñando, desarrollando y manteniendo:
      </p>

      
      <ul className="
        list-disc list-inside mt-4 font-medium text-primary
        text-xs sm:text-sm md:text-base
      ">
        <li>Páginas web estáticas y landings profesionales.</li>
        <li>Sistemas de gestión y mantenimiento de datos (CMS).</li>
        <li>Flujos de información y comunicación mediante APIs.</li>
      </ul>

      <a
        href="https://github.com/bohdeveloper"
        target="_blank"
        className="max-w-xs mt-8 text-center inline-block px-6 py-3 border border-cyan-400 text-primary rounded hover:bg-cyan-400 hover:text-black transition"
      >
        Accede a mi código
      </a>
    </section>
  );
}
