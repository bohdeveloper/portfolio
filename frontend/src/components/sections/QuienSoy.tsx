"use client";
import { useFadeInOnScroll } from "@/hooks/useFadeInOnScroll";

/* Dos grupos deliberadamente separados: lo usado en cliente real y lo usado
   en proyectos propios. Mezclarlos daría a entender experiencia profesional
   con stack que solo he aplicado en mis propios proyectos. */
const STACK_PROFESIONAL = [
  "Java", "Spring Boot", "Oracle SQL", "PL/SQL", "JSP", "JSTL", "Tiles",
  "Bootstrap", "jQuery", "JavaScript", "UDA (EJIE)", "Jenkins", "SonarQube",
  "SVN", "Eclipse", "Maven", "JUnit",
];

const STACK_PROPIO = [
  "Angular", "React", "Next.js", "TypeScript", "Tailwind", "Node.js",
  "Express", "PostgreSQL", "MongoDB", "Docker", "Kubernetes", "Cloudflare", "Git",
];

export default function QuienSoy() {
  const { ref, visible } = useFadeInOnScroll();
  return (
    <section
      id="quien-soy"
      className="max-w-6xl mx-auto px-6 py-28 flex flex-col md:flex-row items-center gap-2 md:gap-12"
    >

      {/* IMAGEN */}
      <div className="flex-1 flex justify-center md:justify-end">
        <img
          src="../../../images/Borja-Olazabal.png"
          alt="Borja Olazabal, desarrollador Java y Spring Boot en Vigo"
          ref={ref}
          className={`w-5/2 sm:w-3/4 md:w-full max-w-sm sm:max-w-md md:max-w-none opacity-0 ${visible ? "fade-in-up" : "opacity-0"}`}
        />
      </div>

      {/* TEXTO */}
      <div className="flex-1 space-y-6 text-lg leading-relaxed text-gray-700 dark:text-gray-300">
        <h2 className="text-3xl font-bold text-black dark:text-white flex items-center gap-3">
          <span className="text-primary text-4xl">⌁</span>
          Acerca de mí
        </h2>

        <p>
          Me llamo <strong>Borja Olazabal</strong> y llevo cinco años
          desarrollando aplicaciones para la <strong>Administración Pública
          autonómica</strong>.
        </p>

        <p>
          Entre 2021 y 2026 he trabajado para{" "}
          <a
            href="https://www.ejie.euskadi.eus/quienes-somos/-/somos-ejie/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            EJIE
          </a>
          , la sociedad informática del Gobierno Vasco, a través de Bilbomática e{" "}
          <a
            href="https://www.inetum.com/es/servicios/ingenieria-de-software/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Inetum
          </a>
          , en los departamentos de Turismo, Educación y Bienestar Social. Mi
          trabajo ha sido la tramitación electrónica de expedientes, la
          interoperabilidad entre sistemas y el mantenimiento evolutivo de
          aplicaciones de ámbito autonómico.
        </p>

        <p>
          Mi stack profesional es <strong>Java y Spring Boot sobre Oracle</strong>,
          con frontend en JSP, JSTL, Tiles, Bootstrap y jQuery, sobre el framework
          propietario{" "}
          <a
            href="https://github.com/UDA-EJIE"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            UDA
          </a>{" "}
          y su ciclo completo de integración continua.
        </p>

        <p>
          Llegué al desarrollo desde la industria. En 2019 empecé un curso de
          publicación web, hice las prácticas en 2020 y obtuve el certificado de
          profesionalidad de nivel 3 en 2021.{" "}
          <u>No fue un impulso: fueron dos años de transición planificada</u>.
        </p>

        <p>
          En paralelo mantengo{" "}
          <a href="#proyectos" className="text-primary hover:underline">
            proyectos propios
          </a>{" "}
          donde trabajo con stack moderno — Angular, React, Next.js, TypeScript,
          Docker y Kubernetes — e integro{" "}
          <a href="#ia" className="text-primary hover:underline">
            herramientas de IA
          </a>{" "}
          en mi flujo de desarrollo diario.
        </p>

        <p className="font-medium text-black dark:text-white">
          Me traslado a la zona de Vigo. Disponible de inmediato en remoto, con
          incorporación presencial a partir de enero.
        </p>

        {/* TECNOLOGÍAS — dos grupos etiquetados */}
        <div className="space-y-5 pt-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-black dark:text-white mb-3">
              Experiencia profesional
            </p>
            <ul className="flex flex-wrap gap-2">
              {STACK_PROFESIONAL.map((t) => (
                <li
                  key={t}
                  className="px-2.5 py-1 text-xs sm:text-sm font-medium rounded border border-cyan-400/60 bg-cyan-400/10 text-primary"
                >
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-black dark:text-white mb-3">
              Proyectos propios
            </p>
            <ul className="flex flex-wrap gap-2">
              {STACK_PROPIO.map((t) => (
                <li
                  key={t}
                  className="px-2.5 py-1 text-xs sm:text-sm font-medium rounded border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                >
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

    </section>
  );
}
