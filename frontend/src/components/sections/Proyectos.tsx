"use client";

import { useEffect, useState } from "react";
import { useCardHolo } from "@/hooks/useCardHolo";

interface Project {
  id?: number;
  slug: string;
  title: string;
  excerpt?: string;
  tags: string;
  github_url?: string;
  demo_url?: string;
  architecture?: string;
  content?: string;
  has_content?: number;
  featured?: number;
  /* campos legacy del array estático */
  nombre?: string;
  descripcion?: string;
  descripcion1?: string;
  descripcion2?: string;
  landing?: string;
  github?: string;
  tecnologias?: string[];
}

/* Orden editorial de la home: refleja la importancia real del proyecto, no la
   fecha de creación ni el flag featured de la BD. Los slugs que no estén aquí
   se colocan al final respetando el orden que devuelve la API. */
const ORDEN_SLUGS = ["rexia", "bako", "ayudas-gv", "unyona", "diamadmin", "devhelper", "nitflex"];

/* Estado del proyecto. Por defecto se deduce de si hay landing publicada;
   BAKO no tiene landing pero está desplegado y operativo 24/7. */
const ESTADO_OVERRIDE: Record<string, string> = { bako: "En producción" };

const FALLBACK: Project[] = [
  {
    nombre: "REXIA — Rexistro de Identificación Animal",
    slug: "rexia",
    descripcion1:
      "Registro autonómico de identificación de animales de compañía construido con el stack del sector público: trazabilidad del microchip al titular con histórico completo, series de chips asignadas a veterinarios habilitados y máquina de estados del animal.",
    descripcion2:
      "Reimplementación original inspirada en el REGIAC de la Xunta, con datos ficticios. Sincronización con un registro nacional simulado y consulta pública por microchip diseñada para no exponer datos personales del titular.",
    architecture: "JEE en capas · UDA (EJIE) + Spring + Oracle",
    tags: "UDA (EJIE),Java,Spring,Spring Data JPA,Hibernate,Oracle XE,PL/SQL,JSP,JSTL,Tiles,Bootstrap,jQuery,Spring Security,JUnit 5,Docker,Maven",
    tecnologias: ["UDA (EJIE)", "Java", "Spring", "Spring Data JPA", "Hibernate", "Oracle XE", "PL/SQL", "JSP", "JSTL", "Tiles", "Bootstrap", "jQuery", "Spring Security", "JUnit 5", "Docker", "Maven"],
  },
  {
    nombre: "BAKO — Autonomous Knowledge Operator",
    slug: "bako",
    descripcion1:
      "Asistente personal voice-first vía Telegram, desplegado 24/7. Orquestador dual de modelos de lenguaje con failover automático entre Ollama local (expuesto mediante Cloudflare Tunnel) y Groq cloud.",
    descripcion2:
      "Transcripción con Whisper, síntesis de voz neural y capa de privacidad que detecta contenido sensible y fuerza su procesamiento en local. Ocho integraciones de API — GitHub, Notion, Google Calendar (OAuth2), Open-Meteo, RSS y Cloudflare D1. Coste de operación: 0 €/mes.",
    architecture: "Orquestador dual LLM · local + cloud",
    tags: "Express,TypeScript,MongoDB Atlas,Cloudflare D1,Render,Telegram Bot API,Groq,Ollama,Whisper",
    tecnologias: ["Express", "TypeScript", "MongoDB Atlas", "Cloudflare D1", "Render", "Telegram Bot API", "Groq", "Ollama", "Whisper"],
    github: "https://github.com/bohdeveloper/bako",
  },
  {
    nombre: "Unyona",
    slug: "unyona",
    descripcion1: "Plataforma social de conexión local por geolocalización e intereses, con autenticación de doble factor y gestión de perfiles múltiples.",
    landing: "https://unyona.com",
    architecture: "Monorepo · SPA React + API REST Node.js + PostgreSQL",
    tags: "React,TypeScript,Tailwind CSS,Vite,Node.js,Express,Prisma,PostgreSQL,JWT",
    tecnologias: ["React", "TypeScript", "Tailwind CSS", "Vite", "Node.js", "Express", "Prisma", "PostgreSQL", "JWT"],
    github: "https://github.com/bohdeveloper/unyona-landing",
  },
  {
    nombre: "Diamadmin",
    slug: "diamadmin",
    descripcion1: "ERP modular para pymes con landing de captación, backend Spring Boot y arquitectura extensible por dominios.",
    landing: "https://diamadmin.com",
    architecture: "Next.js SSG (landing) + Java Spring Boot (API REST) + PostgreSQL",
    tags: "Next.js,TypeScript,Tailwind CSS,Framer Motion,Java 21,Spring Boot,Hibernate,JPA,PostgreSQL",
    tecnologias: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion", "Java 21", "Spring Boot", "Hibernate", "JPA", "PostgreSQL"],
    github: "https://github.com/bohdeveloper/diamadmin-landing",
  },
  {
    nombre: "ayudas_gv",
    slug: "ayudas-gv",
    descripcion:
      "Proyecto de práctica sobre contenerización y orquestación: manifiestos, servicios, ingress y gestión de configuración en Minikube.",
    architecture: "Contenerización y orquestación",
    tags: "Spring Boot,Docker,Kubernetes",
    tecnologias: ["Spring Boot", "Docker", "Kubernetes"],
    github: "https://github.com/bohdeveloper/ayudas-gv",
  },
  {
    nombre: "Nitflex",
    slug: "nitflex",
    descripcion: "Aplicación web de streaming educativo inspirada en Netflix, desarrollada como proyecto de aprendizaje full stack.",
    architecture: "Web App didáctica NoSQL",
    tags: "React,TypeScript,Tailwind,Express,Mongoose,MongoDB,TMDB API",
    tecnologias: ["React", "TypeScript", "Tailwind", "Express", "Mongoose", "MongoDB", "TMDB API"],
    github: "https://github.com/bohdeveloper/nitflex",
  },
  {
    nombre: "DevHelper",
    slug: "devhelper",
    descripcion: "Herramienta de apoyo al desarrollo web full stack, orientada a productividad.",
    architecture: "Monorepo",
    tags: "JSP,HTML,CSS,Bootstrap,JavaScript,jQuery,AJAX,Spring Boot MVC,SQLite",
    tecnologias: ["JSP", "HTML", "CSS", "Bootstrap", "JavaScript", "jQuery", "AJAX", "Spring Boot MVC", "SQLite"],
    github: "https://github.com/bohdeveloper/devhelper",
  },
];

function normalize(p: Project): {
  slug: string; title: string; description: string; description2: string;
  landing: string; architecture: string; tecnologias: string[];
  github: string; hasContent: boolean; estado: string; activo: boolean;
} {
  const landing = p.demo_url || p.landing || "";
  const estado = ESTADO_OVERRIDE[p.slug] ?? (landing ? "Online" : "En desarrollo");
  return {
    slug: p.slug,
    title: p.title || p.nombre || "",
    description: p.excerpt || p.descripcion1 || p.descripcion || "",
    description2: p.descripcion2 || "",
    landing,
    architecture: p.architecture || "",
    tecnologias: p.tecnologias || (p.tags ? p.tags.split(",").map(t => t.trim()).filter(Boolean) : []),
    github: p.github_url || p.github || "",
    hasContent: !!(p.has_content === 1 || (p.content && p.content.trim() && p.content !== "<p></p>")),
    estado,
    activo: estado !== "En desarrollo",
  };
}

/** Ordena por ORDEN_SLUGS; lo no listado queda detrás en su orden original. */
function ordenar(list: Project[]): Project[] {
  const peso = (slug: string) => {
    const i = ORDEN_SLUGS.indexOf(slug);
    return i === -1 ? ORDEN_SLUGS.length : i;
  };
  return [...list].sort((a, b) => peso(a.slug) - peso(b.slug));
}

export default function Proyectos() {
  const holo = useCardHolo();
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    fetch("/api/projects/list")
      .then(r => r.json())
      .then((res: { ok: boolean; data?: Project[] }) => {
        if (res.ok && res.data && res.data.length > 0) setProjects(res.data);
        else setProjects(FALLBACK);
      })
      .catch(() => setProjects(FALLBACK));
  }, []);

  const list = ordenar(projects.length > 0 ? projects : FALLBACK);

  return (
    <section id="proyectos" className="max-w-6xl mx-auto px-6 py-32">
      {/* h2, no h1: el único h1 de la página es el nombre en el Hero */}
      <h2 className="text-3xl font-bold text-black dark:text-white mb-6 gap-3 flex items-center">
        <span className="text-primary text-4xl">⌁</span>
        Proyectos de desarrollo web
      </h2>

      <p className="text-gray-700 dark:text-gray-300 max-w-3xl mb-14 text-lg leading-relaxed">
        Proyectos propios donde trabajo con stack moderno, fuera del entorno
        corporativo: <strong>Angular, React, Next.js, TypeScript, Docker y
        Kubernetes</strong>. Cada uno refleja una arquitectura distinta y un
        enfoque en construir aplicaciones funcionales y mantenibles.
      </p>

      <div className="grid gap-10 md:grid-cols-2">
        {list.map((p, i) => {
          const n = normalize(p);
          return (
            <article
              key={i}
              {...holo}
              className={`card-holo flex flex-col h-full rounded-lg p-6 bg-white dark:bg-[#0d0d0d] border-2 ${
                n.landing ? "border-primary cursor-pointer" : "border-gray-300 dark:border-gray-700"
              }`}
            >
              <span className="card-holo-shine" aria-hidden />
              <span className="card-holo-noise"  aria-hidden />
              <div className="flex-1">
                {/* Estado real del proyecto: verde cuando está desplegado y
                    accesible, cian cuando sigue en construcción. */}
                <span
                  className={`absolute top-4 right-4 inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border ${
                    n.activo
                      ? "border-emerald-500/70 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                      : "border-cyan-400 text-primary bg-cyan-400/10 dark:bg-cyan-400/20"
                  }`}
                >
                  {n.activo && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" aria-hidden />
                  )}
                  {n.estado}
                </span>

                <h3 className="text-2xl font-semibold text-black dark:text-white pr-28">
                  {n.landing ? (
                    <a
                      href={n.landing}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="after:absolute after:inset-0 focus:outline-none"
                      aria-label={`Ver ${n.title}`}
                    >
                      {n.title}
                    </a>
                  ) : (
                    n.title
                  )}
                </h3>

                {n.description && (
                  <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">{n.description}</p>
                )}

                {n.description2 && (
                  <p className="text-sm text-primary mt-2 pr-14">{n.description2}</p>
                )}

                <div className={`my-6 border-t ${n.landing ? "border-primary" : "border-gray-200 dark:border-gray-700"}`} />

                {n.architecture && (
                  <p className="text-lg text-primary mt-3 font-medium">{n.architecture}</p>
                )}

                <div className={`my-6 border-t ${n.landing ? "border-primary" : "border-gray-200 dark:border-gray-700"}`} />

                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-black dark:text-white mb-2">
                    Tecnologías utilizadas
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
                    {n.tecnologias.map((t, idx) => (
                      <li key={idx}>{t}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="relative z-10 mt-6 flex flex-wrap gap-3">
                {n.github && (
                  <a
                    href={n.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-center px-4 py-2 border border-cyan-400 text-primary rounded hover:bg-cyan-400 hover:text-black transition font-medium text-sm"
                  >
                    Ver código en GitHub →
                  </a>
                )}
                {n.hasContent && (
                  <a
                    href={`/projects?slug=${n.slug}`}
                    className="inline-block text-center px-4 py-2 border border-gray-400 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded hover:border-primary hover:text-primary transition font-medium text-sm"
                  >
                    Case study →
                  </a>
                )}
                {/* Sin repositorio ni case study todavía: mejor decirlo que
                    dejar un enlace roto o un hueco sin explicar. */}
                {!n.github && !n.hasContent && (
                  <span className="inline-block px-4 py-2 rounded border border-dashed border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-500 text-sm">
                    Repositorio próximamente
                  </span>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
