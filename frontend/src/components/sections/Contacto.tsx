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
    </section>
  );
}
