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

const FALLBACK: Project[] = [
  {
    nombre: "Unyona",
    slug: "unyona",
    descripcion1: "Plataforma social orientada a eventos y gestión de comunidades.",
    descripcion2: "Se ha desarrollado una landing como demostración de la arquitectura y funcionalidades del proyecto, análisis del producto y captación de leads.",
    landing: "https://unyona.com",
    architecture: "Web App SQL",
    tags: "React,TypeScript,Tailwind,Express,Prisma,SQLite,PostgreSQL",
    tecnologias: ["React", "TypeScript", "Tailwind", "Express", "Prisma", "SQLite", "PostgreSQL"],
    github: "https://github.com/bohdeveloper/unyona",
  },
  {
    nombre: "Diamadmin",
    slug: "diamadmin",
    descripcion1: "Aplicación de gestión administrativa modular y altamente configurable.",
    descripcion2: "Se ha desarrollado una landing como demostración de la arquitectura y funcionalidades del proyecto, análisis del producto y captación de leads.",
    landing: "https://diamadmin.com",
    architecture: "Arquitectura modular",
    tags: "Angular,Spring Boot,PostgreSQL",
    tecnologias: ["Angular", "Spring Boot", "PostgreSQL"],
    github: "https://github.com/bohdeveloper/diamadmin",
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
  github: string; hasContent: boolean;
} {
  return {
    slug: p.slug,
    title: p.title || p.nombre || "",
    description: p.excerpt || p.descripcion1 || p.descripcion || "",
    description2: p.descripcion2 || "",
    landing: p.demo_url || p.landing || "",
    architecture: p.architecture || "",
    tecnologias: p.tecnologias || (p.tags ? p.tags.split(",").map(t => t.trim()).filter(Boolean) : []),
    github: p.github_url || p.github || "",
    hasContent: !!(p.has_content === 1 || (p.content && p.content.trim() && p.content !== "<p></p>")),
  };
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

  const list = projects.length > 0 ? projects : FALLBACK;

  return (
    <section id="proyectos" className="max-w-6xl mx-auto px-6 py-32">
      <h1 className="text-4xl font-bold text-black dark:text-white mb-6 gap-3 flex items-center">
        <span className="text-primary text-4xl">⌁</span>
        Proyectos de desarrollo web
      </h1>

      <p className="text-gray-700 dark:text-gray-300 max-w-3xl mb-14 text-lg leading-relaxed">
        En esta sección presento algunos de los{" "}
        <strong>proyectos de desarrollo web</strong> que he creado como{" "}
        <strong>programador web</strong>. Cada proyecto refleja mi experiencia
        trabajando con distintas arquitecturas, tecnologías frontend y backend,
        así como mi enfoque en crear aplicaciones funcionales y escalables.
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
                <span className="absolute top-4 right-4 text-xs px-3 py-1 rounded-full border border-cyan-400 text-primary bg-cyan-400/10 dark:bg-cyan-400/20">
                  En desarrollo
                </span>

                <h2 className="text-2xl font-semibold text-black dark:text-white">
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
                </h2>

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
                  <h3 className="text-sm font-semibold text-black dark:text-white mb-2">
                    Tecnologías utilizadas
                  </h3>
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
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
