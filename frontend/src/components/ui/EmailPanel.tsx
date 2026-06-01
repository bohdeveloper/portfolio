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
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 flex md:hidden z-50">
        <a
          href="mailto:ohb_1@outlook.com"
          aria-label="Enviar correo electrónico a Borja Olazabal"
          className="flex items-center justify-center w-10 h-10 rounded-full bg-white/80 dark:bg-black/80 backdrop-blur-md border border-gray-300 dark:border-gray-700 shadow-lg text-gray-700 dark:text-white hover:text-primary transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </a>
      </div>
    </>
  );
}
