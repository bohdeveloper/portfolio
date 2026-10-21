import CVDownload from "@/components/ui/CVDownload";

/* Pasado (oficio), presente (desarrollo Java) y futuro (IA aplicada). El
   futuro es una dirección declarada, no experiencia: no se le añaden
   tecnologías como si ya se dominaran (invariante 5). */
const TRAYECTORIA: { periodo: string; etapa: string; detalle: string; tipo: "pasado" | "presente" | "futuro" }[] = [
  {
    periodo: "2010 – 2020",
    etapa: "Industria",
    detalle: "Mecanizado, electricidad y carpintería: planos, tolerancias y piezas que tienen que encajar.",
    tipo: "pasado",
  },
  {
    periodo: "2021 – 2026",
    etapa: "Desarrollo Java",
    detalle: "Cinco años construyendo aplicaciones para el Gobierno Vasco.",
    tipo: "presente",
  },
  {
    periodo: "Siguiente paso",
    etapa: "Ingeniería de IA aplicada",
    detalle: "IA integrada en sistemas Java: Spring AI, RAG, MCP y agentes.",
    tipo: "futuro",
  },
];

export default function Hero() {
  return (
    /* Altura con tope: Googlebot renderiza con un viewport tan alto como la
       página, y con min-h-screen el texto centrado quedaba fuera de la
       captura de la Inspección de URL. */
    <section
      id="inicio"
      className="min-h-[min(100vh,56rem)] flex flex-col justify-center max-w-6xl mx-auto px-6 pt-32"
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
            Java · Spring · Spring Boot · Oracle
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
          Disponible · Norte de España · Remoto
        </span>
      </div>

      {/* TRAYECTORIA — de dónde vengo, qué soy y hacia dónde voy. Sustituye
          al antiguo «doble perfil» y al distintivo «Potenciado por Claude»:
          la IA aparece como dirección, no como titular (invariante 3), y el
          oficio como origen, no como segundo perfil (invariante 14). */}
      <ol className="mt-8 grid gap-3 sm:grid-cols-3 sm:gap-0 max-w-3xl" aria-label="Trayectoria profesional">
        {TRAYECTORIA.map((t, i) => (
          <li key={t.etapa} className="relative flex sm:block items-start gap-3 sm:pr-6">
            {/* Pista: tramo sólido hasta el presente, discontinuo hacia el futuro */}
            <div className="hidden sm:flex items-center mb-3" aria-hidden="true">
              <span
                className={`w-3 h-3 rounded-full flex-shrink-0 ${
                  t.tipo === "futuro"
                    ? "border-2 border-primary bg-transparent claude-pulse motion-reduce:animate-none"
                    : t.tipo === "presente"
                      ? "bg-primary shadow-[0_0_10px_rgba(34,211,238,0.7)]"
                      : "bg-gray-400 dark:bg-gray-600"
                }`}
              />
              {i < TRAYECTORIA.length - 1 && (
                <span
                  className={`flex-1 ml-2 border-t-2 ${
                    TRAYECTORIA[i + 1].tipo === "futuro"
                      ? "border-dashed border-primary/60"
                      : "border-solid border-gray-400 dark:border-gray-600"
                  }`}
                />
              )}
            </div>
            <span
              className={`sm:hidden mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                t.tipo === "pasado" ? "bg-gray-400 dark:bg-gray-600" : t.tipo === "presente" ? "bg-primary" : "border-2 border-primary"
              }`}
              aria-hidden="true"
            />
            <div>
              <p className="text-[11px] uppercase tracking-widest text-gray-500 dark:text-gray-400">
                {t.periodo}
              </p>
              <p
                className={`font-semibold leading-snug ${
                  t.tipo === "pasado" ? "text-gray-700 dark:text-gray-300" : "text-primary"
                }`}
              >
                {t.etapa}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                {t.detalle}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <p className="text-gray-700 dark:text-gray-300 max-w-2xl mt-8 text-base sm:text-lg md:text-xl leading-relaxed">
        Especializado en <strong>aplicaciones web empresariales</strong>, diseñando, desarrollando y manteniendo:
      </p>

      <ul className="
        list-disc list-inside mt-4 font-medium text-primary
        text-xs sm:text-sm md:text-base
      ">
        <li>Aplicaciones web empresariales con Java, Spring y Spring Boot.</li>
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
