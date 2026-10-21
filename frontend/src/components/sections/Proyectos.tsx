"use client";

import { useEffect, useState } from "react";
import { useCardHolo } from "@/hooks/useCardHolo";
import { RUTA } from "@/components/sections/HojaDeRuta";

interface Project {
  id?: number;
  slug: string;
  title?: string;
  nombre?: string;
  excerpt?: string;
  descripcion?: string;
  tags: string;
  github_url?: string;
  github?: string;
  demo_url?: string;
  landing?: string;
  architecture?: string;
  content?: string;
  has_content?: number;
}

/* ============================
   PROYECTOS

   Dos secciones según el estado real (invariante 5): «Terminados» y «En
   desarrollo». Dentro de cada una, los proyectos se agrupan por stack y cada
   grupo enlaza con los bloques de la hoja de ruta de Formación que practica
   (#ruta-N abre su ficha).

   El estado lo fija ESTADO, no se deduce de si hay landing: BAKO está
   desplegado pero sigue en desarrollo, y la landing de Unyona está terminada
   mientras la app no. Diamadmin está despublicado en D1; Nitflex y DevHelper,
   aparcados, nunca llegaron a D1 y salen también del FALLBACK.
============================ */

type Estado = "terminado" | "en-desarrollo";

const ESTADO: Record<string, Estado> = {
  unyona: "terminado",
};

/* Orden de los grupos y de los proyectos dentro de cada uno: editorial
   (invariante 6). Primero el stack profesional, después la IA. Los bloques
   de la hoja de ruta de cada grupo no se escriben aquí: se derivan de
   RUTA[].practica, para que la relación viva en un solo sitio. */
const GRUPOS: { titulo: string; slugs: string[] }[] = [
  { titulo: "Java y Spring", slugs: ["rexia", "ayudas-gv"] },
  { titulo: "IA y modelos de lenguaje", slugs: ["bako"] },
  { titulo: "JavaScript full stack", slugs: ["unyona-app", "unyona"] },
];

/** Bloques de la hoja de ruta que se practican en alguno de estos proyectos. */
function bloquesDe(slugs: string[]) {
  return RUTA.map((b, i) => ({ b, n: i + 1 })).filter(({ b }) => b.practica.some((p) => slugs.includes(p)));
}

const FALLBACK: Project[] = [
  {
    nombre: "REXIA — Rexistro de Identificación Animal",
    slug: "rexia",
    descripcion:
      "Registro autonómico de identificación de animales de compañía construido con el stack del sector público: trazabilidad del microchip al titular con histórico completo, series de chips asignadas a veterinarios habilitados y máquina de estados del animal. Reimplementación original inspirada en el REGIAC de la Xunta, con datos ficticios. Sincronización con un registro nacional simulado y consulta pública por microchip diseñada para no exponer datos personales del titular.",
    architecture: "JEE en capas · UDA (EJIE) + Spring + Oracle",
    tags: "UDA (EJIE),Java,Spring,Spring Data JPA,Hibernate,Oracle XE,PL/SQL,JSP,JSTL,Tiles,Bootstrap,jQuery,Spring Security,JUnit 5,Docker,Maven",
  },
  {
    nombre: "ayudas_gv",
    slug: "ayudas-gv",
    descripcion:
      "Laboratorio de mi hoja de ruta. Hoy: contenerización y orquestación con Docker y Kubernetes en Minikube. En desarrollo: asistente RAG con Spring AI que responde dudas sobre una ayuda usando la normativa como fuente. Planificado: arquitectura hexagonal con DDD, eventos con Kafka, despliegue en OpenShift y servidor MCP.",
    architecture: "Laboratorio · contenerización, orquestación y RAG",
    tags: "Spring Boot,Spring AI,Docker,Kubernetes",
    github: "https://github.com/bohdeveloper/ayudas-gv",
  },
  {
    nombre: "BAKO — Autonomous Knowledge Operator",
    slug: "bako",
    descripcion:
      "Asistente personal voice-first vía Telegram, desplegado 24/7. Orquestador dual de modelos de lenguaje con failover automático entre Ollama local (expuesto mediante Cloudflare Tunnel) y Groq cloud. Transcripción con Whisper, síntesis de voz neural y capa de privacidad que detecta contenido sensible y fuerza su procesamiento en local. Ocho integraciones de API: GitHub, Notion, Google Calendar (OAuth2), Open-Meteo, RSS y Cloudflare D1. Coste de operación: 0 €/mes.",
    architecture: "Orquestador dual LLM · local + cloud",
    tags: "Express,TypeScript,MongoDB Atlas,Cloudflare D1,Render,Telegram Bot API,Groq,Ollama,Whisper",
    github: "https://github.com/bohdeveloper/bako",
  },
  {
    nombre: "Unyona — aplicación",
    slug: "unyona-app",
    descripcion:
      "La red social en sí: perfiles múltiples por cuenta, radar local por geolocalización e intereses y quedadas en persona como objetivo final, no el tiempo en pantalla. En desarrollo, tras validar el interés con la landing.",
    architecture: "Monorepo · SPA React + API REST Node.js + PostgreSQL",
    tags: "React,TypeScript,Tailwind CSS,Vite,Node.js,Express,Prisma,PostgreSQL,JWT,Zod",
  },
  {
    nombre: "Unyona — landing",
    slug: "unyona",
    descripcion:
      "Landing oficial de Unyona, red social local para conocer gente con tus intereses y quedar en persona. Explica el producto, capta la lista de espera de la beta y fija la identidad de marca antes de construir la aplicación.",
    landing: "https://unyona.com",
    architecture: "Landing estática · Next.js en Cloudflare Pages",
    tags: "Next.js,React,TypeScript,Tailwind CSS,Motion,Resend,Cloudflare Pages",
    github: "https://github.com/bohdeveloper/unyona-landing",
  },
];

interface Normalizado {
  slug: string;
  title: string;
  description: string;
  landing: string;
  architecture: string;
  tecnologias: string[];
  github: string;
  hasContent: boolean;
  estado: Estado;
}

function normalize(p: Project): Normalizado {
  return {
    slug: p.slug,
    title: p.title || p.nombre || "",
    description: p.excerpt || p.descripcion || "",
    landing: p.demo_url || p.landing || "",
    architecture: p.architecture || "",
    tecnologias: p.tags ? p.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    github: p.github_url || p.github || "",
    hasContent: !!(p.has_content === 1 || (p.content && p.content.trim() && p.content !== "<p></p>")),
    estado: ESTADO[p.slug] ?? "en-desarrollo",
  };
}

/* Tarjeta compacta: tres por fila en escritorio. La descripción se recorta a
   cuatro líneas y las tecnologías van en chips en vez de lista. */
function Tarjeta({ n }: { n: Normalizado }) {
  const holo = useCardHolo();
  const terminado = n.estado === "terminado";

  return (
    <article
      {...holo}
      className={`card-holo flex flex-col h-full rounded-lg p-5 bg-white dark:bg-[#0d0d0d] border ${
        terminado ? "border-emerald-500/70" : "border-gray-300 dark:border-gray-700"
      }`}
    >
      <span className="card-holo-shine" aria-hidden />
      <span className="card-holo-noise" aria-hidden />

      <div className="flex items-start justify-between gap-3">
        <h4 className="text-lg font-semibold text-black dark:text-white leading-snug">
          {n.landing ? (
            <a
              href={n.landing}
              target="_blank"
              rel="noopener noreferrer"
              className="after:absolute after:inset-0 focus:outline-none hover:text-primary"
              aria-label={`Ver ${n.title}`}
            >
              {n.title}
            </a>
          ) : (
            n.title
          )}
        </h4>
        <span
          className={`shrink-0 inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full border ${
            terminado
              ? "border-emerald-500/70 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
              : "border-cyan-400 text-primary bg-cyan-400/10"
          }`}
        >
          {terminado && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden />}
          {/* «Online» solo si hay algo desplegado a lo que enlazar */}
          {terminado ? (n.landing ? "Online" : "Terminado") : "En desarrollo"}
        </span>
      </div>

      {n.architecture && <p className="text-sm text-primary font-medium mt-1">{n.architecture}</p>}

      {n.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 line-clamp-4" title={n.description}>
          {n.description}
        </p>
      )}

      <ul className="flex flex-wrap gap-1 mt-4 mb-4">
        {n.tecnologias.map((t) => (
          <li key={t} className="px-1.5 py-0.5 text-[11px] rounded border border-cyan-400/40 text-primary">
            {t}
          </li>
        ))}
      </ul>

      <div className="relative z-10 mt-auto flex flex-wrap gap-2">
        {n.github && (
          <a
            href={n.github}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 border border-cyan-400 text-primary rounded hover:bg-cyan-400 hover:text-black transition font-medium text-xs"
          >
            GitHub →
          </a>
        )}
        {n.hasContent && (
          <a
            href={`/projects?slug=${n.slug}`}
            className="px-3 py-1.5 border border-gray-400 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded hover:border-primary hover:text-primary transition font-medium text-xs"
          >
            Case study →
          </a>
        )}
        {/* Sin repositorio ni case study: se dice, no se deja un enlace roto */}
        {!n.github && !n.hasContent && (
          <span className="px-3 py-1.5 rounded border border-dashed border-gray-300 dark:border-gray-700 text-gray-500 text-xs">
            Repositorio próximamente
          </span>
        )}
      </div>
    </article>
  );
}

function Seccion({ titulo, estado, lista }: { titulo: string; estado: Estado; lista: Normalizado[] }) {
  const deEstado = lista.filter((n) => n.estado === estado);
  if (deEstado.length === 0) return null;

  // Proyectos que la API devuelva y no estén en ningún grupo: al final.
  const agrupados = new Set(GRUPOS.flatMap((g) => g.slugs));
  const grupos = [
    ...GRUPOS.map((g) => {
      const items = g.slugs.map((s) => deEstado.find((n) => n.slug === s)).filter((n): n is Normalizado => !!n);
      return { ...g, items, bloques: bloquesDe(items.map((n) => n.slug)) };
    }),
    { titulo: "Otros", slugs: [], bloques: [], items: deEstado.filter((n) => !agrupados.has(n.slug)) },
  ].filter((g) => g.items.length > 0);

  return (
    <div className="mt-12">
      <h3
        className={`text-sm font-semibold uppercase tracking-widest mb-6 flex items-center gap-2 ${
          estado === "terminado" ? "text-emerald-600 dark:text-emerald-400" : "text-primary"
        }`}
      >
        <span
          className={`w-2 h-2 rounded-full ${estado === "terminado" ? "bg-emerald-500" : "bg-cyan-400 claude-pulse motion-reduce:animate-none"}`}
          aria-hidden="true"
        />
        {titulo}
      </h3>

      <div className="space-y-8">
        {grupos.map((g) => (
          <div key={g.titulo}>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5 mb-3">
              <h4 className="font-semibold text-black dark:text-white">{g.titulo}</h4>
              {g.bloques.length > 0 && (
                <span className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                  Hoja de ruta:
                  {g.bloques.map(({ b, n }) => (
                    <a
                      key={b.id}
                      href={`#ruta-${b.id}`}
                      className="font-mono px-1.5 py-0.5 rounded border border-gray-300 dark:border-gray-700 hover:border-cyan-400 hover:text-primary transition-colors"
                    >
                      {String(n).padStart(2, "0")} {b.corto}
                    </a>
                  ))}
                </span>
              )}
            </div>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {g.items.map((n) => (
                <Tarjeta key={n.slug} n={n} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Proyectos() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    fetch("/api/projects/list")
      .then((r) => r.json())
      .then((res: { ok: boolean; data?: Project[] }) => {
        if (res.ok && res.data && res.data.length > 0) setProjects(res.data);
        else setProjects(FALLBACK);
      })
      .catch(() => setProjects(FALLBACK));
  }, []);

  const lista = (projects.length > 0 ? projects : FALLBACK).map(normalize);

  return (
    <section id="proyectos" className="max-w-6xl mx-auto px-6 py-32">
      {/* h2, no h1: el único h1 de la página es el nombre en el Hero */}
      <h2 className="text-3xl font-bold text-black dark:text-white mb-6 gap-3 flex items-center">
        <span className="text-primary text-4xl">⌁</span>
        Proyectos propios
      </h2>

      <p className="text-gray-700 dark:text-gray-300 max-w-3xl leading-relaxed">
        Fuera del entorno corporativo, agrupados por stack. Cada grupo enlaza con
        los bloques de la{" "}
        <a href="#hoja-de-ruta" className="text-primary hover:underline">
          hoja de ruta
        </a>{" "}
        que practica: lo que aprendo, lo aplico aquí.
      </p>

      <Seccion titulo="Terminados" estado="terminado" lista={lista} />
      <Seccion titulo="En desarrollo" estado="en-desarrollo" lista={lista} />
    </section>
  );
}
