import CVDownload from "@/components/ui/CVDownload";

export default function Contacto() {
  return (
    <section
      id="contacto"
      className="max-w-3xl mx-auto px-6 py-40 text-center"
    >
      {/* DISPONIBILIDAD — antes del CTA: es lo que un recruiter necesita
          confirmar antes de decidir si escribe. */}
      <div className="text-left rounded-lg border border-cyan-400/50 bg-cyan-400/[0.04] dark:bg-cyan-400/[0.06] p-6 sm:p-8 mb-16">
        <p className="flex items-center gap-2.5 text-sm font-semibold uppercase tracking-widest text-primary">
          <span className="relative flex w-2 h-2" aria-hidden="true">
            <span className="absolute inline-flex w-full h-full rounded-full bg-primary opacity-60 claude-pulse" />
            <span className="relative inline-flex w-2 h-2 rounded-full bg-primary" />
          </span>
          Actualmente disponible
        </p>

        <p className="text-gray-700 dark:text-gray-300 mt-4 leading-relaxed">
          Me traslado a la zona de <strong>Vigo / Pontevedra</strong>. Disponible
          de inmediato en <strong>remoto</strong>, con incorporación presencial a
          partir de <strong>enero de 2027</strong>.
        </p>

        <p className="text-gray-700 dark:text-gray-300 mt-3 leading-relaxed">
          Busco posiciones de <strong>desarrollo backend o fullstack con Java y
          Spring Boot</strong>, preferentemente en Galicia o en remoto.
        </p>
      </div>

      {/* TÍTULO SEO LIMPIO */}
      <h2 className="text-3xl font-bold text-black dark:text-white">
        Contacto profesional
      </h2>

      {/* CTA PRINCIPAL */}
      <p className="text-4xl font-extrabold mt-3 text-primary">
        Hablemos
      </p>

      <p className="text-gray-700 dark:text-gray-300 mt-6 leading-relaxed">
        Si quieres ponerte en contacto conmigo por una oferta, una colaboración o
        un proyecto de <strong>desarrollo web</strong>, mi bandeja de entrada
        siempre está abierta.
        <span className="block mt-2 font-medium text-black dark:text-white">
          Estaré encantado de leerte.
        </span>
      </p>

      {/* CTA */}
      <div className="flex flex-wrap justify-center gap-4 mt-10">
        <a
          href="mailto:ohb.seven@gmail.com"
          className="inline-block px-8 py-3 rounded-lg border border-cyan-400 bg-cyan-400/10 text-primary hover:bg-cyan-400 hover:text-black transition-all hover:scale-[1.03]"
          aria-label="Enviar correo electrónico a Borja Olazabal"
        >
          Escríbeme
        </a>
        <CVDownload />
      </div>

      {/* Teléfono: en móvil es un enlace que marca directamente. */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-gray-600 dark:text-gray-400">
        <a
          href="tel:+34672987992"
          className="inline-flex items-center gap-2 hover:text-primary transition"
          aria-label="Llamar a Borja Olazabal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            className="w-4 h-4 text-primary"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
            />
          </svg>
          672 987 992
        </a>

        <span className="hidden sm:inline text-gray-300 dark:text-gray-700" aria-hidden>·</span>

        <span className="inline-flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            className="w-4 h-4 text-primary"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          Vigo / Pontevedra · Remoto
        </span>
      </div>
    </section>
  );
}
