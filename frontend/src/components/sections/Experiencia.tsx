"use client";
import { useState } from "react";

const tabs = [
  {
    id: 1,
    empresa: "Inetum",
    puesto: "Programador web",
    fecha: "Abril 2023 ┉ Actualidad",
    link: "https://www.inetum.com/es/servicios/ingenieria-de-software/",
    tareas: [
      <>
        He formado parte de un equipo profesional dentro de{" "}
        <a
          href="https://www.ejie.euskadi.eus/quienes-somos/-/somos-ejie/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          EJIE
        </a>{" "}
        en el departamento de educación, bienestar social, juventud y reto
        demográfico.
      </>,
      <>
        He trabajado en el desarrollo de aplicaciones web utilizando metodologías
        ágiles como Scrum (Jira), así como enfoques en Cascada y Kanban.
      </>,
      <>
        He utilizado tecnologías y frameworks como{" "}
        <a
          href="https://github.com/UDA-EJIE"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          UDA
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
          Oracle
        </a>
        , entre otras.
      </>,
      <>
        Actualmente continúo formándome en tecnologías modernas como{" "}
        <a
          href="https://es.react.dev/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          React
        </a>
        ,{" "}
        <a
          href="https://angular.dev/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          Angular
        </a>
        ,{" "}
        <a
          href="https://www.postgresql.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          PostgreSQL
        </a>{" "}
        y{" "}
        <a
          href="https://www.mongodb.com/es"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          MongoDB
        </a>
        .
      </>,
    ],
  },
  {
    id: 2,
    empresa: "Bilbomática",
    puesto: "Programador web",
    fecha: "Noviembre 2021 ┉ Marzo 2023",
    link: "https://www.bilbomatica.es/",
    tareas: [
      <>
        Formé parte de un equipo profesional dentro de{" "}
        <a
          href="https://www.ejie.euskadi.eus/quienes-somos/-/somos-ejie/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          EJIE
        </a>{" "}
        en el departamento de turismo.
      </>,
      <>
        Colaboré en el desarrollo de aplicaciones web utilizando tecnologías como
        UDA, HDIV, IberDok, JasperReports, así como Java, JSP, JSTL, Spring,
        JavaScript, jQuery, CSS, Bootstrap y Oracle SQL Developer.
      </>,
      <>
        Gestioné control de versiones con{" "}
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
    id: 3,
    empresa: "MegatronHQ",
    puesto: "Servicio técnico y desarrollo web",
    fecha: "Diciembre 2020 ┉ Febrero 2021",
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
    id: 4,
    empresa: "Likale",
    puesto: "Tornero de revestimientos elastoméricos",
    fecha: "Junio 2018 ┉ Diciembre 2019",
    link: "https://likale.com/",
    tareas: [
      <>Manejo de torno y maquinaria ligera, además de tareas de almacén.</>,
    ],
  },
  {
    id: 5,
    empresa: "W. Diamant / Winterstone",
    puesto: "Producción de herramientas de diamante",
    fecha: "Mayo 2016 ┉ Octubre 2018",
    link: "https://winterstone.net/",
    tareas: [
      <>
        Manejo de maquinaria ligera y pesada para la producción de herramientas
        industriales de diamante.
      </>,
    ],
  },
];


export default function Experiencia() {
  const [active, setActive] = useState(1);

  return (
    <section id="experiencia" className="max-w-6xl mx-auto px-6 py-32 mb-60">
      <h2 className="text-3xl font-bold text-black dark:text-white mb-4 flex items-center gap-3">
        <span className="text-primary text-4xl">⌁</span>
        Experiencia profesional
      </h2>

      {/* TEXTO SEO DISCRETO (VISIBLE PERO LOW‑KEY) */}
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-3xl mb-10 mr-12">
        A lo largo de mi trayectoria he trabajado como{" "}
        <strong>programador web</strong> en distintas empresas y proyectos,
        participando en el desarrollo de aplicaciones web y sistemas de gestión
        de datos para el sector público y privado.
      </p>

      <div className="flex flex-col md:flex-row gap-12">
        {/* TABS */}
        <div className="flex flex-col gap-4 md:w-1/4 w-full">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`text-left px-4 py-2 border-l-4 transition-all ${
                active === tab.id
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
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold">
              {tabs[active - 1].puesto}
            </h3>
            <a
              href={tabs[active - 1].link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
              aria-label={`Web de ${tabs[active - 1].empresa}`}
            >
              ↗
            </a>
          </div>

          <p className="text-gray-600 dark:text-gray-400">
            {tabs[active - 1].fecha}
          </p>

          <ul className="list-disc pl-6 space-y-3 text-gray-700 dark:text-gray-300">
            {tabs[active - 1].tareas.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* TEXTO SEO SECUNDARIO COLAPSABLE */}
      <details className="mt-12 max-w-3xl">
        <summary className="cursor-pointer text-sm text-primary hover:underline">
          Ver contexto profesional
        </summary>
        <p className="mt-4 mr-20 text-gray-700 dark:text-gray-300">
          Esta experiencia forma parte de mi trayectoria como{" "}
          <strong>programador web</strong>, y se complementa con
          proyectos personales, formación continua y especialización en
          tecnologías modernas de desarrollo web.
        </p>
      </details>

      {/* BOTÓN CV */}
      <a
        href="../../../borja-olazabal-programador-web-cv.pdf"
        target="_blank"
        aria-label="Currículum de Borja Olazabal, programador web"
        className="inline-block mt-10 px-6 py-3 border border-cyan-400 text-primary rounded hover:bg-cyan-400 hover:text-black transition"
      >
        Accede a mi CV
      </a>
    </section>
  );
}
