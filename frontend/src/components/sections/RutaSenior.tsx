"use client";

import { useCardHolo } from "@/hooks/useCardHolo";

/* ============================
   RUTA HACIA SENIOR

   Plan de formación ordenado por peso en ofertas reales de Java senior
   (consultoras de sector público, banca y producto, octubre de 2026): lo
   más pedido primero. Solo recursos gratuitos; los exámenes oficiales de
   pago quedan fuera de la ruta.

   Para avanzar basta con cambiar `estado` (y poner `fecha` al completar):
   el nodo, el tramo de circuito y la tarjeta cambian de aspecto solos
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

/* Unión discriminada: un bloque completado sin fecha no compila. */
type Bloque = {
  titulo: string;
  porque: string;
  tecnologias: string[];
  recursos: Recurso[];
  proyecto: string;
  /** Lo ya practicado dentro del bloque antes de empezarlo formalmente. */
  base?: string;
} & (
  | { estado: "pendiente" | "en-curso" }
  | { estado: "completado"; /** Mes y año, p. ej. «nov 2026». */ fecha: string }
);

const RUTA: Bloque[] = [
  {
    titulo: "Fundamentos y Java moderno",
    porque: "La base que se da por supuesta en cualquier puesto senior.",
    tecnologias: ["Java 21", "Estructuras de datos y algoritmos", "Concurrencia · virtual threads", "SOLID", "Clean Code", "Patrones de diseño"],
    recursos: [
      { nombre: "Learn Java", fuente: "dev.java · Oracle", url: "https://dev.java/learn/" },
      { nombre: "Patrones de diseño", fuente: "Refactoring.Guru", url: "https://refactoring.guru/design-patterns" },
    ],
    proyecto: "REXIA",
    estado: "pendiente",
  },
  {
    titulo: "Spring Boot moderno",
    porque: "Aparece en prácticamente todas las ofertas Java backend.",
    tecnologias: ["Spring Boot 3", "Spring Data JPA", "Spring Security", "OAuth2 · JWT", "API REST", "OpenAPI"],
    recursos: [
      { nombre: "Cursos de Spring Academy", fuente: "Spring · Broadcom", url: "https://spring.academy/courses" },
      { nombre: "Guías oficiales", fuente: "spring.io", url: "https://spring.io/guides" },
    ],
    proyecto: "REXIA",
    estado: "pendiente",
  },
  {
    titulo: "Arquitectura de software",
    porque: "Lo que separa un perfil senior de uno intermedio en las ofertas.",
    tecnologias: ["Arquitectura hexagonal", "Clean Architecture", "DDD", "Microservicios", "API Gateway", "Patrones de resiliencia"],
    recursos: [
      { nombre: "Patrones de microservicios", fuente: "microservices.io", url: "https://microservices.io/patterns/" },
      { nombre: "Domain-Driven Design Reference", fuente: "Eric Evans", url: "https://www.domainlanguage.com/ddd/reference/" },
    ],
    proyecto: "ayudas_gv",
    estado: "pendiente",
  },
  {
    titulo: "Testing y calidad",
    porque: "TDD y BDD figuran como requisito explícito en las ofertas senior.",
    tecnologias: ["TDD", "BDD", "JUnit 5", "Mockito", "Testcontainers", "Cucumber"],
    recursos: [
      { nombre: "JUnit 5 User Guide", fuente: "junit.org", url: "https://junit.org/junit5/docs/current/user-guide/" },
      { nombre: "Guías de Testcontainers", fuente: "testcontainers.com", url: "https://testcontainers.com/guides/" },
      { nombre: "BDD en 10 minutos", fuente: "Cucumber", url: "https://cucumber.io/docs/guides/10-minute-tutorial/" },
    ],
    proyecto: "ayudas_gv",
    estado: "pendiente",
  },
  {
    titulo: "Mensajería y eventos",
    porque: "Kafka es el requisito más repetido tras Spring Boot.",
    tecnologias: ["Apache Kafka", "Kafka Streams", "Arquitectura orientada a eventos", "Saga", "Outbox"],
    recursos: [
      { nombre: "Cursos de Kafka", fuente: "Confluent Developer", url: "https://developer.confluent.io/courses/" },
    ],
    proyecto: "ayudas_gv",
    estado: "pendiente",
  },
  {
    titulo: "Contenedores y orquestación",
    porque: "OpenShift es el estándar en sector público y banca.",
    tecnologias: ["Docker", "Kubernetes", "OpenShift", "Helm", "CI/CD · GitHub Actions", "Observabilidad"],
    recursos: [
      { nombre: "Get started", fuente: "Docker", url: "https://docs.docker.com/get-started/" },
      { nombre: "Introduction to Kubernetes (LFS158)", fuente: "Linux Foundation", url: "https://training.linuxfoundation.org/training/introduction-to-kubernetes/" },
      { nombre: "Developer Sandbox de OpenShift", fuente: "Red Hat", url: "https://developers.redhat.com/developer-sandbox" },
    ],
    proyecto: "ayudas_gv",
    base: "Ya practicado: Docker y Kubernetes en Minikube (ayudas_gv).",
    estado: "pendiente",
  },
  {
    titulo: "Cloud · AWS",
    porque: "El proveedor cloud más pedido en las ofertas Java.",
    tecnologias: ["AWS", "EC2", "S3", "RDS", "Lambda", "IAM", "EKS"],
    recursos: [
      { nombre: "AWS Cloud Practitioner Essentials", fuente: "AWS Skill Builder", url: "https://aws.amazon.com/training/digital/aws-cloud-practitioner-essentials/" },
    ],
    proyecto: "ayudas_gv",
    estado: "pendiente",
  },
  {
    titulo: "IA aplicada al desarrollo",
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
    proyecto: "BAKO · ayudas_gv",
    base: "Ya en marcha: Claude Code a diario, orquestación de LLM en BAKO y un asistente RAG con Spring AI en desarrollo en ayudas_gv.",
    estado: "pendiente",
  },
  {
    titulo: "Programación reactiva",
    porque: "Pedida en sistemas de alto tráfico; menos frecuente que el resto.",
    tecnologias: ["Spring WebFlux", "Project Reactor", "RxJava", "Backpressure"],
    recursos: [
      { nombre: "Spring WebFlux", fuente: "Documentación oficial", url: "https://docs.spring.io/spring-framework/reference/web/webflux.html" },
      { nombre: "Learn Reactor", fuente: "projectreactor.io", url: "https://projectreactor.io/learn" },
    ],
    proyecto: "ayudas_gv",
    estado: "pendiente",
  },
  {
    titulo: "Frontend y full stack",
    porque: "Las consultoras gallegas buscan perfiles Java + Angular.",
    tecnologias: ["Angular", "TypeScript", "React", "Next.js", "PostgreSQL", "MongoDB"],
    recursos: [
      { nombre: "Tutoriales de Angular", fuente: "angular.dev", url: "https://angular.dev/tutorials" },
      { nombre: "Learn React", fuente: "react.dev", url: "https://react.dev/learn" },
    ],
    proyecto: "Diamadmin · Unyona",
    estado: "pendiente",
  },
];

const ETIQUETA: Record<Estado, string> = {
  pendiente: "Pendiente",
  "en-curso": "En curso",
  completado: "Completado",
};

/* Nodo del circuito: hueco si está pendiente, con pulso si está en curso,
   relleno con check si está completado. */
function Nodo({ estado, n }: { estado: Estado; n: number }) {
  if (estado === "completado") {
    return (
      <span className="relative z-10 flex w-9 h-9 items-center justify-center rounded-full bg-emerald-500 text-white shadow-[0_0_14px_rgba(16,185,129,0.55)]">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="w-4 h-4" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </span>
    );
  }
  if (estado === "en-curso") {
    return (
      <span className="relative z-10 flex w-9 h-9 items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-cyan-400/40 claude-pulse motion-reduce:animate-none" aria-hidden="true" />
        <span className="relative flex w-9 h-9 items-center justify-center rounded-full border-2 border-cyan-400 bg-white dark:bg-[#0d0d0d] text-primary font-mono text-sm font-bold">
          {n}
        </span>
      </span>
    );
  }
  return (
    <span className="relative z-10 flex w-9 h-9 items-center justify-center rounded-full border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0d0d0d] text-gray-500 font-mono text-sm">
      {n}
    </span>
  );
}

export default function RutaSenior() {
  const holo = useCardHolo();
  const hechos = RUTA.filter((b) => b.estado === "completado").length;

  return (
    <div className="mt-16 pt-10 border-t border-gray-200 dark:border-gray-800">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-2">
            Hoja de ruta · en proceso
          </p>
          <h3 className="text-2xl font-bold text-black dark:text-white">
            Ruta hacia desarrollador senior
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-2xl mt-2">
            Lo que piden hoy las ofertas de Java senior, ordenado de más a menos
            demandado. Cada bloque se practica en un proyecto propio y se marca
            solo cuando está terminado. Recursos gratuitos.
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

      <ol className="mt-8">
        {RUTA.map((b, i) => {
          const ultimo = i === RUTA.length - 1;
          const completado = b.estado === "completado";
          const enCurso = b.estado === "en-curso";

          return (
            <li key={b.titulo} className="relative flex gap-4 sm:gap-6 pb-6">
              {/* Pista del circuito: encendida (verde) solo en el tramo que sale
                  de un bloque completado; el resto, apagada y discontinua. Los
                  dos casos usan el mismo borde para no desalinearse. */}
              {!ultimo && (
                <span
                  aria-hidden="true"
                  className={`absolute left-[17px] top-9 bottom-0 w-0 border-l-2 ${
                    completado
                      ? "border-solid border-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]"
                      : "border-dashed border-gray-300 dark:border-gray-700"
                  }`}
                />
              )}

              <Nodo estado={b.estado} n={i + 1} />

              <div
                {...(completado ? holo : {})}
                className={`flex-1 min-w-0 rounded-lg p-4 sm:p-5 transition-colors ${
                  completado
                    ? "card-holo border border-emerald-500/70 bg-emerald-500/[0.04] dark:bg-emerald-500/[0.06]"
                    : enCurso
                      ? "border border-cyan-400/70 bg-white dark:bg-[#0d0d0d]"
                      : "border border-gray-200 dark:border-gray-800"
                }`}
              >
                {completado && (
                  <>
                    <span className="card-holo-shine" aria-hidden />
                    <span className="card-holo-noise" aria-hidden />
                  </>
                )}

                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h4
                    className={`text-lg font-semibold ${
                      b.estado === "pendiente" ? "text-gray-800 dark:text-gray-200" : "text-black dark:text-white"
                    }`}
                  >
                    {b.titulo}
                  </h4>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full border ${
                      b.estado === "pendiente"
                        ? "border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400"
                        : completado
                          ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                          : "border-cyan-400 text-primary bg-cyan-400/10"
                    }`}
                  >
                    {ETIQUETA[b.estado]}
                    {b.estado === "completado" ? ` · ${b.fecha}` : ""}
                  </span>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{b.porque}</p>
                {b.base && (
                  <p className="text-xs text-primary mt-1">{b.base}</p>
                )}

                <ul className="flex flex-wrap gap-1.5 mt-3">
                  {b.tecnologias.map((t) => (
                    <li
                      key={t}
                      className={`px-2 py-0.5 text-xs font-medium rounded border ${
                        b.estado === "pendiente"
                          ? "border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                          : "border-cyan-400/60 text-primary"
                      }`}
                    >
                      {t}
                    </li>
                  ))}
                </ul>

                <details className="mt-3" open={enCurso}>
                  <summary className="cursor-pointer text-xs text-primary hover:underline select-none">
                    Recursos ({b.recursos.length}) · se practica en {b.proyecto}
                  </summary>
                  <ul className="mt-2 space-y-1.5">
                    {b.recursos.map((r) => (
                      <li key={r.url} className="text-sm">
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-700 dark:text-gray-300 hover:text-primary hover:underline underline-offset-4"
                        >
                          {r.nombre}
                        </a>
                        <span className="text-xs text-gray-500"> · {r.fuente}</span>
                      </li>
                    ))}
                  </ul>
                </details>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
