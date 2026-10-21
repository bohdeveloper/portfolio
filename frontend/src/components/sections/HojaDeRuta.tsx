"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* ============================
   HOJA DE RUTA — DEL BACKEND SENIOR A LA IA APLICADA

   Plan de formación ordenado por peso en ofertas reales de Java senior
   (consultoras de sector público, banca y producto, octubre de 2026): lo
   más pedido primero. Solo recursos gratuitos; los exámenes oficiales de
   pago quedan fuera de la ruta.

   Para avanzar basta con cambiar `estado` (y poner `fecha` al completar):
   el nodo, el tramo de circuito y la ficha cambian de aspecto solos
   (verde con check al completar, como los estados «Online» de §4).
   Nada pasa a «en curso» o «completado» si no lo está de verdad
   (invariante 5). Enlaces comprobados (invariante 4).
============================ */

type Estado = "pendiente" | "en-curso" | "completado";

interface Recurso {
  nombre: string;
  fuente: string;
  url: string;
}

/* Proyectos donde se practica cada bloque, por slug de D1. Proyectos.tsx
   deriva de aquí qué bloques enlaza cada grupo: la relación vive en un solo
   sitio. */
export const NOMBRE_PROYECTO: Record<string, string> = {
  rexia: "REXIA",
  "ayudas-gv": "ayudas_gv",
  bako: "BAKO",
  "unyona-app": "Unyona",
};

/* Unión discriminada: un bloque completado sin fecha no compila. */
type Bloque = {
  /** Identificador estable para enlaces (#ruta-<id>): no depende del orden. */
  id: string;
  titulo: string;
  /** Etiqueta bajo el nodo en la vista de una línea. */
  corto: string;
  porque: string;
  tecnologias: string[];
  recursos: Recurso[];
  /** Slugs de los proyectos donde se practica (ver NOMBRE_PROYECTO). */
  practica: string[];
  /** Lo ya practicado dentro del bloque antes de empezarlo formalmente. */
  base?: string;
} & (
  | { estado: "pendiente" | "en-curso" }
  | { estado: "completado"; /** Mes y año, p. ej. «nov 2026». */ fecha: string }
);

export const RUTA: Bloque[] = [
  {
    id: "java",
    titulo: "Fundamentos y Java moderno",
    corto: "Java 21",
    porque: "La base que se da por supuesta en cualquier puesto senior.",
    tecnologias: ["Java 21", "Estructuras de datos y algoritmos", "Concurrencia · virtual threads", "Clean Code", "Refactoring"],
    recursos: [
      { nombre: "Learn Java", fuente: "dev.java · Oracle", url: "https://dev.java/learn/" },
      { nombre: "Refactoring", fuente: "Refactoring.Guru", url: "https://refactoring.guru/refactoring" },
    ],
    practica: ["rexia"],
    estado: "pendiente",
  },
  {
    id: "spring-boot",
    titulo: "Spring Boot moderno",
    corto: "Spring Boot",
    porque: "Aparece en prácticamente todas las ofertas Java backend.",
    tecnologias: ["Spring Boot 3", "Spring Data JPA", "Spring Security", "OAuth2 · JWT", "API REST", "OpenAPI"],
    recursos: [
      { nombre: "Cursos de Spring Academy", fuente: "Spring · Broadcom", url: "https://spring.academy/courses" },
      { nombre: "Guías oficiales", fuente: "spring.io", url: "https://spring.io/guides" },
    ],
    practica: ["rexia"],
    estado: "pendiente",
  },
  {
    id: "arquitectura",
    titulo: "Arquitectura de software",
    corto: "Arquitectura",
    porque: "Lo que separa un perfil senior de uno intermedio, y la base para diseñar sistemas con IA y agentes.",
    tecnologias: [
      "Principios SOLID",
      "Patrones de diseño",
      "Arquitectura hexagonal · Clean",
      "DDD",
      "Microservicios",
      "Arquitectura de IA y agentes",
      "Ingeniería de prompts",
    ],
    recursos: [
      { nombre: "Los cinco principios SOLID", fuente: "DigitalOcean", url: "https://www.digitalocean.com/community/conceptual-articles/s-o-l-i-d-the-first-five-principles-of-object-oriented-design" },
      { nombre: "Patrones de diseño", fuente: "Refactoring.Guru", url: "https://refactoring.guru/design-patterns" },
      { nombre: "Software Architecture Guide", fuente: "Martin Fowler", url: "https://martinfowler.com/architecture/" },
      { nombre: "Estilos de arquitectura", fuente: "Microsoft Learn", url: "https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/" },
      { nombre: "Patrones de microservicios", fuente: "microservices.io", url: "https://microservices.io/patterns/" },
      { nombre: "Domain-Driven Design Reference", fuente: "Eric Evans", url: "https://www.domainlanguage.com/ddd/reference/" },
      { nombre: "Building effective agents", fuente: "Anthropic", url: "https://www.anthropic.com/engineering/building-effective-agents" },
      { nombre: "Tutorial interactivo de ingeniería de prompts", fuente: "Anthropic", url: "https://github.com/anthropics/prompt-eng-interactive-tutorial" },
    ],
    practica: ["ayudas-gv", "bako"],
    estado: "pendiente",
  },
  {
    id: "testing",
    titulo: "Testing y calidad",
    corto: "TDD · BDD",
    porque: "TDD y BDD figuran como requisito explícito en las ofertas senior.",
    tecnologias: ["TDD", "BDD", "JUnit 5", "Mockito", "Testcontainers", "Cucumber"],
    recursos: [
      { nombre: "JUnit 5 User Guide", fuente: "junit.org", url: "https://junit.org/junit5/docs/current/user-guide/" },
      { nombre: "Guías de Testcontainers", fuente: "testcontainers.com", url: "https://testcontainers.com/guides/" },
      { nombre: "BDD en 10 minutos", fuente: "Cucumber", url: "https://cucumber.io/docs/guides/10-minute-tutorial/" },
    ],
    practica: ["ayudas-gv"],
    estado: "pendiente",
  },
  {
    id: "kafka",
    titulo: "Mensajería y eventos",
    corto: "Kafka",
    porque: "Kafka es el requisito más repetido tras Spring Boot.",
    tecnologias: ["Apache Kafka", "Kafka Streams", "Arquitectura orientada a eventos", "Saga", "Outbox"],
    recursos: [
      { nombre: "Cursos de Kafka", fuente: "Confluent Developer", url: "https://developer.confluent.io/courses/" },
    ],
    practica: ["ayudas-gv"],
    estado: "pendiente",
  },
  {
    id: "contenedores",
    titulo: "Contenedores y orquestación",
    corto: "Kubernetes",
    porque: "OpenShift es el estándar en sector público y banca.",
    tecnologias: ["Docker", "Kubernetes", "OpenShift", "Helm", "CI/CD · GitHub Actions", "Observabilidad"],
    recursos: [
      { nombre: "Get started", fuente: "Docker", url: "https://docs.docker.com/get-started/" },
      { nombre: "Introduction to Kubernetes (LFS158)", fuente: "Linux Foundation", url: "https://training.linuxfoundation.org/training/introduction-to-kubernetes/" },
      { nombre: "Developer Sandbox de OpenShift", fuente: "Red Hat", url: "https://developers.redhat.com/developer-sandbox" },
    ],
    practica: ["ayudas-gv"],
    base: "Ya practicado: Docker y Kubernetes en Minikube (ayudas_gv).",
    estado: "pendiente",
  },
  {
    id: "aws",
    titulo: "Cloud · AWS",
    corto: "AWS",
    porque: "El proveedor cloud más pedido en las ofertas Java.",
    tecnologias: ["AWS", "EC2", "S3", "RDS", "Lambda", "IAM", "EKS"],
    recursos: [
      { nombre: "AWS Cloud Practitioner Essentials", fuente: "AWS Skill Builder", url: "https://aws.amazon.com/training/digital/aws-cloud-practitioner-essentials/" },
    ],
    practica: ["ayudas-gv"],
    estado: "pendiente",
  },
  {
    id: "ia-aplicada",
    titulo: "IA aplicada al desarrollo",
    corto: "IA aplicada",
    porque: "Cómo se trabaja ya: agentes de código, especificación y MCP.",
    tecnologias: ["Agentes de código", "Spec-Driven Development", "MCP · crear y consumir", "Spring AI", "RAG", "LangChain4j"],
    recursos: [
      { nombre: "Claude Code in Action", fuente: "Anthropic Academy", url: "https://anthropic.skilljar.com/claude-code-in-action" },
      { nombre: "Spec-Driven Development with Coding Agents", fuente: "DeepLearning.AI", url: "https://www.deeplearning.ai/short-courses/spec-driven-development-with-coding-agents/" },
      { nombre: "Introduction to Model Context Protocol", fuente: "Anthropic Academy", url: "https://anthropic.skilljar.com/introduction-to-model-context-protocol" },
      { nombre: "MCP: Advanced Topics", fuente: "Anthropic Academy", url: "https://anthropic.skilljar.com/model-context-protocol-advanced-topics" },
      { nombre: "Spring AI", fuente: "Documentación oficial", url: "https://docs.spring.io/spring-ai/reference/" },
      { nombre: "AI Agents Course", fuente: "Hugging Face", url: "https://huggingface.co/learn/agents-course" },
    ],
    practica: ["bako", "ayudas-gv"],
    base: "Ya en marcha: Claude Code a diario, orquestación de LLM en BAKO y un asistente RAG con Spring AI en desarrollo en ayudas_gv.",
    estado: "pendiente",
  },
  {
    id: "reactiva",
    titulo: "Programación reactiva",
    corto: "Reactiva",
    porque: "Pedida en sistemas de alto tráfico; menos frecuente que el resto.",
    tecnologias: ["Spring WebFlux", "Project Reactor", "RxJava", "Backpressure"],
    recursos: [
      { nombre: "Spring WebFlux", fuente: "Documentación oficial", url: "https://docs.spring.io/spring-framework/reference/web/webflux.html" },
      { nombre: "Learn Reactor", fuente: "projectreactor.io", url: "https://projectreactor.io/learn" },
    ],
    practica: ["ayudas-gv"],
    estado: "pendiente",
  },
  {
    id: "full-stack",
    titulo: "Frontend y full stack",
    corto: "Full stack",
    porque: "Las consultoras gallegas buscan perfiles Java + Angular.",
    tecnologias: ["Angular", "TypeScript", "React", "Next.js", "PostgreSQL", "MongoDB"],
    recursos: [
      { nombre: "Tutoriales de Angular", fuente: "angular.dev", url: "https://angular.dev/tutorials" },
      { nombre: "Learn React", fuente: "react.dev", url: "https://react.dev/learn" },
    ],
    practica: ["unyona-app"],
    estado: "pendiente",
  },
];

const ETIQUETA: Record<Estado, string> = {
  pendiente: "Pendiente",
  "en-curso": "En curso",
  completado: "Completado",
};

const dos = (n: number) => String(n).padStart(2, "0");

/* Nodo del circuito: hueco si está pendiente, con pulso si está en curso,
   verde con check si está completado. */
function Nodo({ estado, n, size = "md" }: { estado: Estado; n: number; size?: "sm" | "md" }) {
  const dim = size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";
  if (estado === "completado") {
    return (
      <span className={`relative z-10 flex ${dim} items-center justify-center rounded-full bg-emerald-500 text-white shadow-[0_0_14px_rgba(16,185,129,0.55)]`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="w-4 h-4" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </span>
    );
  }
  if (estado === "en-curso") {
    return (
      <span className={`relative z-10 flex ${dim} items-center justify-center`}>
        <span className="absolute inset-0 rounded-full bg-cyan-400/40 claude-pulse motion-reduce:animate-none" aria-hidden="true" />
        <span className={`relative flex ${dim} items-center justify-center rounded-full border-2 border-cyan-400 bg-white dark:bg-[#0d0d0d] text-primary font-mono font-bold`}>
          {n}
        </span>
      </span>
    );
  }
  return (
    <span className={`relative z-10 flex ${dim} items-center justify-center rounded-full border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0d0d0d] text-gray-500 font-mono transition-colors group-hover:border-cyan-400 group-hover:text-primary`}>
      {n}
    </span>
  );
}

/* Ficha emergente de un bloque, con estética de hoja de datos técnica:
   cabecera con referencia «BLOQUE 03/10», cuerpo por apartados y pie con
   navegación al bloque anterior y siguiente. En móvil ocupa la pantalla y
   va centrada (§4: modales en móvil). */
function Ficha({
  i,
  onClose,
  onMove,
}: {
  i: number;
  onClose: () => void;
  onMove: (delta: number) => void;
}) {
  const b = RUTA[i];
  const cerrarRef = useRef<HTMLButtonElement>(null);
  const dialogoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    cerrarRef.current?.focus();
  }, [i]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      // Trampa de foco: Tab no puede salir del diálogo hacia la página tapada
      if (e.key === "Tab" && dialogoRef.current) {
        const foco = dialogoRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
        const primero = foco[0];
        const ultimo = foco[foco.length - 1];
        if (e.shiftKey && document.activeElement === primero) {
          e.preventDefault();
          ultimo?.focus();
        } else if (!e.shiftKey && document.activeElement === ultimo) {
          e.preventDefault();
          primero?.focus();
        }
      }
      if (e.key === "ArrowRight") onMove(1);
      if (e.key === "ArrowLeft") onMove(-1);
    }
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose, onMove]);

  const acento =
    b.estado === "completado"
      ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
      : b.estado === "en-curso"
        ? "border-cyan-400 text-primary bg-cyan-400/10"
        : "border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400";

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="presentation">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <div
        ref={dialogoRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ficha-titulo"
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-lg border border-cyan-400/60 bg-white dark:bg-[#0d0d0d] shadow-2xl shadow-black/30"
      >
        {/* Cabecera tipo hoja de datos */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-5 py-3 border-b border-dashed border-cyan-400/40 bg-white/95 dark:bg-[#0d0d0d]/95 backdrop-blur">
          <p className="font-mono text-xs tracking-widest text-gray-500 dark:text-gray-400">
            BLOQUE <span className="text-primary">{dos(i + 1)}</span>/{dos(RUTA.length)}
          </p>
          <button
            ref={cerrarRef}
            type="button"
            onClick={onClose}
            aria-label="Cerrar ficha"
            className="p-1.5 rounded text-gray-500 hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-5 pt-5 pb-6">
          <div className="flex items-start gap-4">
            <Nodo estado={b.estado} n={i + 1} />
            <div className="min-w-0">
              <h4 id="ficha-titulo" className="text-xl font-bold text-black dark:text-white leading-tight">
                {b.titulo}
              </h4>
              <span className={`inline-block mt-1.5 text-xs px-2.5 py-0.5 rounded-full border ${acento}`}>
                {ETIQUETA[b.estado]}
                {b.estado === "completado" ? ` · ${b.fecha}` : ""}
              </span>
            </div>
          </div>

          <dl className="mt-6 space-y-5 text-sm">
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-widest text-gray-500 mb-1">Por qué</dt>
              <dd className="text-gray-700 dark:text-gray-300">{b.porque}</dd>
              {b.base && <dd className="mt-1 text-primary text-xs">{b.base}</dd>}
            </div>

            <div>
              <dt className="font-mono text-[11px] uppercase tracking-widest text-gray-500 mb-2">Tecnologías</dt>
              <dd className="flex flex-wrap gap-1.5">
                {b.tecnologias.map((t) => (
                  <span key={t} className="px-2 py-0.5 text-xs font-medium rounded border border-cyan-400/60 bg-cyan-400/10 text-primary">
                    {t}
                  </span>
                ))}
              </dd>
            </div>

            <div>
              <dt className="font-mono text-[11px] uppercase tracking-widest text-gray-500 mb-2">
                Recursos gratuitos
              </dt>
              <dd>
                <ul className="space-y-2">
                  {b.recursos.map((r) => (
                    <li key={r.url}>
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/r flex items-baseline justify-between gap-3 rounded border border-gray-200 dark:border-gray-800 px-3 py-2 hover:border-cyan-400 transition-colors"
                      >
                        <span>
                          <span className="block text-gray-800 dark:text-gray-200 group-hover/r:text-primary">{r.nombre}</span>
                          <span className="block text-xs text-gray-500">{r.fuente}</span>
                        </span>
                        <span className="text-primary" aria-hidden="true">↗</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>

            <div>
              <dt className="font-mono text-[11px] uppercase tracking-widest text-gray-500 mb-1">Se practica en</dt>
              <dd className="text-gray-700 dark:text-gray-300">
                <a href="#proyectos" onClick={onClose} className="text-primary hover:underline">
                  {b.practica.map((p) => NOMBRE_PROYECTO[p] ?? p).join(" · ")}
                </a>
              </dd>
            </div>
          </dl>
        </div>

        {/* Pie: navegación entre bloques (también con ← →) */}
        <div className="flex border-t border-dashed border-cyan-400/40 text-sm">
          <button
            type="button"
            onClick={() => onMove(-1)}
            disabled={i === 0}
            className="flex-1 px-4 py-3 text-left text-gray-500 hover:text-primary disabled:opacity-30 disabled:hover:text-gray-500"
          >
            ← {i > 0 ? RUTA[i - 1].corto : ""}
          </button>
          <button
            type="button"
            onClick={() => onMove(1)}
            disabled={i === RUTA.length - 1}
            className="flex-1 px-4 py-3 text-right text-gray-500 hover:text-primary border-l border-dashed border-cyan-400/40 disabled:opacity-30 disabled:hover:text-gray-500"
          >
            {i < RUTA.length - 1 ? RUTA[i + 1].corto : ""} →
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HojaDeRuta() {
  const [abierto, setAbierto] = useState<number | null>(null);
  const origenRef = useRef<HTMLElement | null>(null);
  const hechos = RUTA.filter((b) => b.estado === "completado").length;

  const abrir = useCallback((i: number) => {
    origenRef.current = document.activeElement as HTMLElement | null;
    setAbierto(i);
  }, []);

  const cerrar = useCallback(() => {
    setAbierto(null);
    // Si se abrió desde un enlace #ruta-N, se limpia el hash para que
    // volver a pulsar el mismo enlace la abra de nuevo.
    if (window.location.hash.startsWith("#ruta-")) {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
    origenRef.current?.focus?.();
  }, []);

  const mover = useCallback((delta: number) => {
    setAbierto((i) => (i === null ? i : Math.min(RUTA.length - 1, Math.max(0, i + delta))));
  }, []);

  /* Enlaces externos a un bloque concreto (p. ej. desde Proyectos):
     #ruta-kafka abre la ficha de Kafka. Si el hash desaparece (botón Atrás),
     la ficha se cierra. */
  useEffect(() => {
    function desdeHash() {
      const id = window.location.hash.startsWith("#ruta-") ? window.location.hash.slice(6) : null;
      const i = id ? RUTA.findIndex((b) => b.id === id) : -1;
      if (i === -1) {
        setAbierto(null);
        return;
      }
      // El foco vuelve al enlace que abrió la ficha (p. ej. el chip de Proyectos)
      origenRef.current = document.activeElement as HTMLElement | null;
      document.getElementById("hoja-de-ruta")?.scrollIntoView({ behavior: "smooth", block: "start" });
      setAbierto(i);
    }
    desdeHash();
    window.addEventListener("hashchange", desdeHash);
    return () => window.removeEventListener("hashchange", desdeHash);
  }, []);

  return (
    <div id="hoja-de-ruta" className="mt-20 pt-10 border-t border-gray-200 dark:border-gray-800 scroll-mt-24">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-2">
            Hoja de ruta · en proceso
          </p>
          <h3 className="text-2xl font-bold text-black dark:text-white">
            Del backend senior a la IA aplicada
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-2xl mt-2">
            Lo que piden hoy las ofertas, de más a menos demandado. Cada bloque
            se practica en un proyecto propio y se marca solo cuando está
            terminado. Pulsa uno para ver qué incluye.
          </p>
        </div>

        {/* Medidor de progreso: un segmento por bloque, como una barra de LED */}
        <div className="shrink-0" role="img" aria-label={`${hechos} de ${RUTA.length} bloques completados`}>
          <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5 sm:text-right">
            Progreso · {hechos}/{RUTA.length}
          </p>
          <div className="flex gap-1" aria-hidden="true">
            {RUTA.map((b, i) => (
              <span
                key={i}
                className={`w-4 h-2 rounded-sm ${
                  b.estado === "completado"
                    ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]"
                    : b.estado === "en-curso"
                      ? "bg-cyan-400/40"
                      : "bg-gray-200 dark:bg-gray-800"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ESCRITORIO — una sola línea: nodos sobre una pista de circuito.
          El tramo que sale de un bloque completado se enciende en verde. */}
      <ol className="hidden md:flex mt-10">
        {RUTA.map((b, i) => (
          <li key={b.titulo} className="relative flex-1">
            {i < RUTA.length - 1 && (
              <span
                aria-hidden="true"
                className={`absolute top-5 left-1/2 w-full border-t-2 ${
                  b.estado === "completado"
                    ? "border-solid border-emerald-500"
                    : "border-dashed border-gray-300 dark:border-gray-700"
                }`}
              />
            )}
            <button
              type="button"
              onClick={() => abrir(i)}
              aria-haspopup="dialog"
              aria-label={`Bloque ${i + 1}: ${b.titulo} · ${ETIQUETA[b.estado]}`}
              className="group relative flex w-full flex-col items-center gap-2 rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"
            >
              <Nodo estado={b.estado} n={i + 1} />
              <span
                className={`text-xs text-center leading-tight px-1 transition-colors group-hover:text-primary ${
                  b.estado === "pendiente" ? "text-gray-500 dark:text-gray-400" : "text-black dark:text-white font-medium"
                }`}
              >
                {b.corto}
              </span>
              {/* La ficha solo se monta al abrirla; esto deja título y
                  tecnologías en el HTML exportado para buscadores (sin SSR,
                  invariante 10). El aria-label del botón evita la doble lectura. */}
              <span className="sr-only">
                {b.titulo}: {b.tecnologias.join(", ")}
              </span>
            </button>
          </li>
        ))}
      </ol>

      {/* MÓVIL — diez nodos no caben en fila: lista compacta, misma ficha */}
      <ol className="md:hidden mt-8 grid grid-cols-2 gap-2">
        {RUTA.map((b, i) => (
          <li key={b.titulo}>
            <button
              type="button"
              onClick={() => abrir(i)}
              aria-haspopup="dialog"
              className="group flex w-full items-center gap-2.5 rounded border border-gray-200 dark:border-gray-800 p-2 text-left"
            >
              <Nodo estado={b.estado} n={i + 1} size="sm" />
              <span className="text-xs leading-tight text-gray-700 dark:text-gray-300">{b.corto}</span>
            </button>
          </li>
        ))}
      </ol>

      {abierto !== null && <Ficha i={abierto} onClose={cerrar} onMove={mover} />}
    </div>
  );
}
