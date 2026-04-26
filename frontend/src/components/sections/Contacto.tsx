export default function Contacto() {
  return (
    <section id="contacto" className="max-w-3xl mx-auto px-6 py-56 text-center">
      <h2 className="text-3xl font-bold text-black dark:text-white">
        Siguiente paso
      </h2>

      <h3 className="text-4xl font-extrabold mt-2 text-cyan-400">
        Contacta conmigo
      </h3>

      <p className="text-gray-700 dark:text-gray-300 mt-6 leading-relaxed">
        Aunque actualmente no estoy buscando nuevas oportunidades laborales,
        mi bandeja de entrada siempre está abierta.  
        Estaré encantado de responder cualquier pregunta o saludo.  
        <span className="block mt-1 font-medium text-black dark:text-white">
          ¡Estoy deseando leerte!
        </span>
      </p>

      <a
        href="mailto:ohb_1@outlook.com"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block mt-10 px-8 py-3 rounded-lg border border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black dark:hover:text-black transition-all hover:scale-[1.03] cursor-pointer"
      >
        Dime algo
      </a>
    </section>
  );
}
