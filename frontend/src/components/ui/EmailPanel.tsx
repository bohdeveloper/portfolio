export default function EmailPanel() {
  return (
    <>
      {/* DESKTOP */}
      <div className="fixed bottom-6 right-6 hidden md:flex flex-col items-center text-xs">
        <span className="mb-2 text-gray-500 dark:text-gray-400">
          Contacto
        </span>

        <div className="w-px h-20 bg-gray-400 dark:bg-gray-600 mb-4"></div>

        <a
          href="mailto:ohb_1@outlook.com"
          aria-label="Enviar correo electrónico a Borja Olazabal"
          className="text-gray-700 dark:text-white hover:text-primary transition p-2 border-b border-gray-400 dark:border-white hover:border-cyan-400"
        >
          ohb_1@outlook.com
        </a>
      </div>

      {/* MOBILE */}
      <div className="fixed bottom-2 right-2 md:hidden bg-white/80 dark:bg-black/80 backdrop-blur-md px-3 py-1 rounded-full shadow-lg border border-gray-300 dark:border-gray-700">
        <a
          href="mailto:ohb_1@outlook.com"
          aria-label="Enviar correo electrónico a Borja Olazabal"
          className="text-sm text-gray-700 dark:text-white hover:text-primary transition"
        >
          ohb_1@outlook.com
        </a>
      </div>
    </>
  );
}
