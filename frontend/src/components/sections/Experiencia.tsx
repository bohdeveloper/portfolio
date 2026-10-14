"use client";
import { useState } from "react";
import CVDownload from "@/components/ui/CVDownload";

interface Empleo {
  empresa: string;
  puesto: string;
  fecha: string;
  ubicacion?: string;
  cliente?: string;
  link?: string;
  tareas: React.ReactNode[];
}

const tabs: Empleo[] = [
  {
    empresa: "Inetum",
    puesto: "Programador web",
    fecha: "Abril 2023 ┉ Julio 2026",
    ubicacion: "Donostia (remoto)",
    cliente: "EJIE — Gobierno Vasco",
    link: "https://www.inetum.com/es/servicios/ingenieria-de-software/",
    tareas: [
      <>
        Integrado en un equipo de 10-15 personas, desarrollo y mantenimiento
        evolutivo y correctivo de tres aplicaciones de ámbito autonómico para los
        departamentos de Educación y de Bienestar Social, Juventud y Reto
        Demográfico.
      </>,
      <>
        <strong>AB10 — Ayudas a familias</strong>: aplicación con cuatro líneas
        de negocio diferenciadas (conciliación, contratación, nacimientos y
        paternidad), cada una con su propia lógica de cálculo según el decreto
        aplicable.
      </>,
      <>
        Desarrollo del proceso de reintegro de pagos: flujo multipantalla con
        cálculo de diferencias e integración con API externa para la obtención
        de liquidaciones.
      </>,
      <>
        <strong>Berdindu</strong>: aplicación del servicio de atención a personas
        LGTBI, para casos de inclusión y acoso.
      </>,
      <>
        Interoperabilidad con sistemas externos de cobros, reintegros y pagos, y
        con el gestor documental Dokusi.
      </>,
      <>
        <strong>NewGipe / AD77</strong> (Departamento de Educación) en entorno
        J2EE-UDA, entre 2023 y 2024.
      </>,
      <>
        Stack: Java,{" "}
        <a
          href="https://spring.io"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          Spring
        </a>
        ,{" "}
        <a
          href="https://spring.io/projects/spring-boot"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          Spring Boot
        </a>
        ,{" "}
        <a
          href="https://www.oracle.com/es/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          Oracle SQL
        </a>
        ,{" "}
        <a
          href="https://www.oracle.com/middleware/technologies/weblogic.html"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          WebLogic
        </a>
        , JSP, JSTL, Tiles, Bootstrap, jQuery.
      </>,
      <>Metodologías: Scrum con Jira, Kanban y Cascada.</>,
    ],
  },
  {
    empresa: "Bilbomática",
    puesto: "Programador web",
    fecha: "Noviembre 2021 ┉ Marzo 2023",
    ubicacion: "Bilbao (remoto)",
    cliente: "EJIE — Gobierno Vasco",
    link: "https://www.bilbomatica.es/",
    tareas: [
      <>
        Desarrollo de aplicaciones para el Departamento de Turismo, desde el
        prototipado inicial hasta la implementación de la lógica de negocio.
      </>,
      <>
        Participación en el ciclo completo: análisis de requisitos, prototipado,
        desarrollo y adaptación iterativa a las exigencias del cliente.
      </>,
    ],
  },
  {
    empresa: "MegatronHQ",
    puesto: "Asistente técnico · Web developer",
    fecha: "Diciembre 2020 ┉ Marzo 2021",
    ubicacion: "Donostia",
    link: "https://www.linkedin.com/company/megatron-hq/",
    tareas: [
      <>
        Responsable del departamento técnico y de la creación de páginas web con{" "}
        <a
          href="https://es.wix.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          WIX
        </a>
        , aplicando optimización SEO y estrategias básicas de marketing digital.
      </>,
    ],
  },
  {
    empresa: "SKOOTIK",
    puesto: "Desarrollador web",
    fecha: "Febrero ┉ Mayo 2020",
    ubicacion: "Donostia · Contrato de prácticas",
    link: "https://www.linkedin.com/company/skootik/",
    tareas: [
      <>
        Desarrollo y maquetación de una plataforma de formación online sobre
        inteligencia artificial.
      </>,
      <>Prácticas del curso de confección y publicación web.</>,
    ],
  },
];

/* Experiencia de oficio, previa al cambio de carrera. Mismos puestos y fechas
   que el CV técnico (invariante 5: la web no afirma más que el CV). Sin
   enlace ni ubicación: el CV no los recoge y no se inventan. */
const TECNICA: Empleo[] = [
  {
    empresa: "Puertas Jokin",
    puesto: "Carpintero de puertas",
    fecha: "Septiembre ┉ Noviembre 2020",
    tareas: [<>Fabricación y montaje de puertas.</>],
  },
  {
    empresa: "Muebles Amets",
    puesto: "Carpintero y montador",
    fecha: "Mayo ┉ Agosto 2019",
    tareas: [<>Montaje de muebles y cocinas.</>],
  },
  {
    empresa: "Likale",
    puesto: "Especialista en torno convencional",
    fecha: "Diciembre 2018 ┉ Mayo 2019",
    tareas: [<>Mecanizado de piezas en torno convencional.</>],
  },
  {
    empresa: "W. Diamant",
    puesto: "Operario fabricante",
    fecha: "Noviembre 2016 ┉ Noviembre 2018",
    tareas: [<>Fabricación de herramientas de diamante.</>],
  },
];

type Perfil = "programacion" | "tecnica";

const PERFILES: { id: Perfil; etiqueta: string }[] = [
  { id: "programacion", etiqueta: "Programación" },
  { id: "tecnica", etiqueta: "Técnica" },
];

export default function Experiencia() {
  // Índice del array, no un id correlativo: añadir o reordenar empleos
  // no obliga a renumerar nada.
  const [perfil, setPerfil] = useState<Perfil>("programacion");
  const [active, setActive] = useState(0);
  const lista = perfil === "programacion" ? tabs : TECNICA;
  const empleo = lista[active];

  function cambiarPerfil(p: Perfil) {
    setPerfil(p);
    setActive(0);
  }

  return (
    <section id="experiencia" className="max-w-6xl mx-auto px-6 py-32 mb-40">
      <h2 className="text-3xl font-bold text-black dark:text-white mb-4 flex items-center gap-3">
        <span className="text-primary text-4xl">⌁</span>
        Experiencia profesional
      </h2>

      {/* CONMUTADOR DE PERFIL — programación (por defecto) o técnica */}
      <div
        role="group"
        aria-label="Tipo de experiencia"
        className="inline-flex mb-10 rounded border border-cyan-400/60 overflow-hidden"
      >
        {PERFILES.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => cambiarPerfil(p.id)}
            aria-pressed={perfil === p.id}
            className={`px-5 py-2 text-sm font-medium transition ${
              perfil === p.id
                ? "bg-cyan-400 text-black"
                : "text-primary hover:bg-cyan-400/10"
            }`}
          >
            {p.etiqueta}
          </button>
        ))}
      </div>

      {perfil === "tecnica" && (
        <p className="max-w-3xl mb-10 text-gray-700 dark:text-gray-300">
          Técnico en Instalaciones Eléctricas y Automáticas y Técnico en
          Mecanizado, con experiencia en taller como tornero y operario de
          fabricación, y como carpintero montador. Formación en el apartado{" "}
          <a href="#aprendizaje" className="text-primary hover:underline">
            Formación
          </a>
          .
        </p>
      )}

      {/* MARCO EJIE — el argumento más fuerte del perfil, antes de las pestañas */}
      {perfil === "programacion" && (
      <div className="max-w-3xl mb-10 pl-5 border-l-2 border-primary">
        <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          Entre <strong>noviembre de 2021 y julio de 2026</strong> he trabajado de
          forma continuada para{" "}
          <a
            href="https://www.ejie.euskadi.eus/quienes-somos/-/somos-ejie/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            EJIE
          </a>
          , la sociedad informática del Gobierno Vasco, a través de dos consultoras
          y en tres departamentos distintos.
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          {["5 años continuados", "3 departamentos", "2 consultoras", "Java · Spring · Spring Boot · Oracle"].map((d) => (
            <span
              key={d}
              className="px-2.5 py-1 text-xs font-medium rounded-full border border-cyan-400/50 bg-cyan-400/5 text-primary"
            >
              {d}
            </span>
          ))}
        </div>
      </div>
      )}

      <div className="flex flex-col md:flex-row gap-12">
        {/* TABS */}
        <div className="flex flex-col gap-4 md:w-1/4 w-full">
          {lista.map((tab, i) => (
            <button
              key={tab.empresa}
              onClick={() => setActive(i)}
              aria-pressed={active === i}
              className={`text-left px-4 py-2 border-l-4 transition-all ${
                active === i
                  ? "border-cyan-400 text-primary"
                  : "border-gray-400 dark:border-gray-700 hover:border-cyan-400"
              }`}
            >
              {tab.empresa}
            </button>
          ))}
        </div>

        {/* CONTENIDO */}
        <div className="md:w-3/4 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-xl font-semibold">
              {empleo.puesto} · {empleo.empresa}
            </h3>
            {empleo.link && (
              <a
                href={empleo.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
                aria-label={`Web de ${empleo.empresa}`}
              >
                ↗
              </a>
            )}
          </div>

          <p className="text-gray-600 dark:text-gray-400">
            {empleo.fecha}
            {empleo.ubicacion && ` · ${empleo.ubicacion}`}
          </p>

          {empleo.cliente && (
            <p className="text-sm">
              <span className="text-gray-500 dark:text-gray-500">Cliente: </span>
              <span className="text-primary font-medium">{empleo.cliente}</span>
            </p>
          )}

          <ul className="list-disc pl-6 space-y-3 text-gray-700 dark:text-gray-300">
            {empleo.tareas.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>
      </div>

      {perfil === "programacion" && (
        <p className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800 text-sm text-gray-600 dark:text-gray-400 max-w-3xl">
          Cambio de carrera al desarrollo de software en 2020, con formación por
          cuenta propia y certificación oficial de nivel 3. Antes, cuatro años de
          oficio en taller y carpintería:{" "}
          <button
            type="button"
            onClick={() => cambiarPerfil("tecnica")}
            className="text-primary hover:underline"
          >
            ver experiencia técnica
          </button>
          .
        </p>
      )}

      {/* TEXTO SEO SECUNDARIO COLAPSABLE — solo con el perfil de programación */}
      {perfil === "programacion" && (
        <details className="mt-12 max-w-3xl">
          <summary className="cursor-pointer text-sm text-primary hover:underline">
            Ver contexto profesional
          </summary>
          <p className="mt-4 text-gray-700 dark:text-gray-300">
            Esta trayectoria como <strong>programador web</strong> en proyectos de{" "}
            <strong>Administración Pública</strong> se complementa con proyectos
            propios, formación continua y especialización en tecnologías modernas de
            desarrollo web. Busco posiciones de <strong>backend o fullstack con Java,
            Spring y Spring Boot</strong> en el norte de España o en remoto.
          </p>
        </details>
      )}

      {/* CV — selector de versión */}
      <div className="mt-10">
        <CVDownload variant="primary" />
      </div>
    </section>
  );
}
