export default function Hero() {
  return (
    <section id="inicio" className="min-h-screen flex flex-col justify-center gap-4">
      <p className="text-gray-500 dark:text-gray-400">Hola, mi nombre es</p>

      <h1 className="text-5xl font-bold">
        Borja Olazabal <span className="block text-primary">Desarrollador Web Fullstack</span>
      </h1>

      <p className="max-w-xl text-lg text-gray-600 dark:text-gray-300">
        Soy ingeniero de software especializado en diseñar y crear páginas web, sistemas de control para mantenimientos de datos e información.
      </p>

      <a
        href="https://github.com/bohdeveloper"
        target="_blank"
        className="mt-4 inline-block px-6 py-3 border rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition"
      >
        Accede a mi código
      </a>
    </section>
  );
}
