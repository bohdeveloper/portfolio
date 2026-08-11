"use client";
import { useState } from "react";
import CVDownload from "@/components/ui/CVDownload";

interface Empleo {
  empresa: string;
  puesto: string;
  fecha: string;
  ubicacion: string;
  cliente?: string;
  link: string;
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
        <strong>AB10B — Ayudas de Familia</strong>: gestión de ayudas económicas a
        familias de toda Euskadi, con consumo de APIs de otras aplicaciones de la
        administración.
      </>,
      <>
        <strong>Berdindu</strong>: aplicación del servicio de atención a personas
        LGTBI, para casos de inclusión y acoso.
      </>,
      <>Aplicación de tramitación telemática de expedientes.</>,
      <>
        <strong>NewGipe / AD77</strong> (Departamento de Educación) en entorno
        J2EE-UDA, entre 2023 y 2024.
      </>,
      <>
        Interoperabilidad con 2-3 sistemas externos para pagos, reintegros y
        liquidaciones.
      </>,
      <>
        Stack: Java,{" "}
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
        , JSP, JSTL, Tiles, Bootstrap, jQuery, framework{" "}
        <a
          href="https://github.com/UDA-EJIE"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          UDA
        </a>
        , Jenkins, SonarQube, SVN.
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
      <>
        Tecnologías: UDA, HDIV, IberDok, JasperReports, Java, JSP, JSTL, Spring,
        JavaScript, jQuery, CSS, Bootstrap y Oracle SQL Developer.
      </>,
      <>
        Control de versiones con{" "}
        <a
          href="https://subversion.apache.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          SVN
        </a>{" "}
        y seguimiento de tareas mediante{" "}
        <a
          href="https://trello.com/es"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          Trello
        </a>
        .
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

/* Etapa anterior al cambio de carrera. Va agrupada y no como pestañas: son
   seis puestos que no aportan nada técnico y, en una lista de pestañas,
   diluirían los cuatro que sí cuentan. Es la misma separación que hace el CV. */
const PREVIA = [
  { empresa: "Puertas Jokin",  puesto: "Carpintero de puertas",                        fecha: "sep 2020 ┉ nov 2020" },
  { empresa: "Muebles Amets",  puesto: "Carpintero y montador de muebles y cocina",    fecha: "may 2019 ┉ ago 2019" },
  { empresa: "Likale",         puesto: "Especialista en torno convencional",           fecha: "dic 2018 ┉ may 2019" },
  { empresa: "W. Diamant",     puesto: "Operario fabricante · herramientas de diamante", fecha: "nov 2016 ┉ nov 2018" },
];

export default function Experiencia() {
  // Índice del array, no un id correlativo: añadir o reordenar empleos
  // no obliga a renumerar nada.
  const [active, setActive] = useState(0);
  const empleo = tabs[active];

  return (
    <section id="experiencia" className="max-w-6xl mx-auto px-6 py-32 mb-40">
      <h2 className="text-3xl font-bold text-black dark:text-white mb-4 flex items-center gap-3">
        <span className="text-primary text-4xl">⌁</span>
        Experiencia profesional
      </h2>

      {/* MARCO EJIE — el argumento más fuerte del perfil, antes de las pestañas */}
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
          {["5 años continuados", "3 departamentos", "2 consultoras", "Java · Spring Boot · Oracle"].map((d) => (
            <span
              key={d}
              className="px-2.5 py-1 text-xs font-medium rounded-full border border-cyan-400/50 bg-cyan-400/5 text-primary"
            >
              {d}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-12">
        {/* TABS */}
        <div className="flex flex-col gap-4 md:w-1/4 w-full">
          {tabs.map((tab, i) => (
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
            <a
              href={empleo.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
              aria-label={`Web de ${empleo.empresa}`}
            >
              ↗
            </a>
          </div>

          <p className="text-gray-600 dark:text-gray-400">
            {empleo.fecha} · {empleo.ubicacion}
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

      {/* EXPERIENCIA PREVIA — antes del cambio de carrera */}
      <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-5">
          Experiencia previa · industria y carpintería
        </h3>

        <ul className="space-y-2.5 max-w-3xl">
          {PREVIA.map((p) => (
            <li
              key={p.empresa}
              className="flex flex-col sm:flex-row sm:items-baseline sm:gap-4 text-sm"
            >
              <span className="font-medium text-gray-700 dark:text-gray-300 sm:w-40 flex-shrink-0">
                {p.empresa}
              </span>
              <span className="text-gray-600 dark:text-gray-400 flex-1">
                {p.puesto}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-500 sm:text-right flex-shrink-0">
                {p.fecha}
              </span>
            </li>
          ))}
        </ul>

        <p className="mt-5 text-sm text-gray-600 dark:text-gray-400 max-w-3xl">
          Cambio de carrera al desarrollo de software en 2020, con formación por
          cuenta propia y certificación oficial de nivel 3.
        </p>
      </div>

      {/* TEXTO SEO SECUNDARIO COLAPSABLE */}
      <details className="mt-12 max-w-3xl">
        <summary className="cursor-pointer text-sm text-primary hover:underline">
          Ver contexto profesional
        </summary>
        <p className="mt-4 text-gray-700 dark:text-gray-300">
          Esta trayectoria como <strong>programador web</strong> en proyectos de{" "}
          <strong>Administración Pública</strong> se complementa con proyectos
          propios, formación continua y especialización en tecnologías modernas de
          desarrollo web. Busco posiciones de <strong>backend o fullstack con Java
          y Spring Boot</strong> en Galicia o en remoto.
        </p>
      </details>

      {/* CV — selector de versión */}
      <div className="mt-10">
        <CVDownload variant="primary" />
      </div>
    </section>
  );
}
