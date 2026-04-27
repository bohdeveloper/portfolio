export default function Contacto() {
  return (
    <section
      id="contacto"
      className="max-w-3xl mx-auto px-6 py-56 text-center"
    >
      {/* TÍTULO SEO LIMPIO */}
      <h2 className="text-3xl font-bold text-black dark:text-white">
        Contacto profesional
      </h2>

      {/* CTA PRINCIPAL */}
      <h3 className="text-4xl font-extrabold mt-3 text-primary">
        Hablemos
      </h3>

      {/* TEXTO CONTEXTUAL (SEO DISCRETO) */}
      <p className="text-gray-700 dark:text-gray-300 mt-6 leading-relaxed">
        Si quieres ponerte en contacto conmigo por una posible colaboración,
        un proyecto de <strong>desarrollo web</strong> o simplemente para
        saludar, mi bandeja de entrada siempre está abierta.
        <span className="block mt-2 font-medium text-black dark:text-white">
          Estaré encantado de leerte.
        </span>
      </p>

      {/* CTA */}
      <a
        href="mailto:ohb_1@outlook.com"
        className="inline-block mt-10 px-8 py-3 rounded-lg border border-cyan-400 text-primary hover:bg-cyan-400 hover:text-black transition-all hover:scale-[1.03]"
        aria-label="Enviar correo electrónico a Borja Olazabal"
      >
        Escríbeme
      </a>
    </section>
  );
}