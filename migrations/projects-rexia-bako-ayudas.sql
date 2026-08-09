-- Alineación del portfolio con el CV (agosto 2026)
-- Añade REXIA, BAKO y ayudas_gv a la tabla projects.
--
-- El orden de la home NO depende de esta tabla: lo fija ORDEN_SLUGS en
-- src/components/sections/Proyectos.tsx (REXIA, BAKO, ayudas_gv, Unyona,
-- Diamadmin). Aquí se marcan REXIA y BAKO como featured para que también
-- encabecen la lista en /projects y en el panel de administración.
--
-- REXIA va sin github_url a propósito: el repositorio todavía no existe y un
-- enlace a un 404 resta más de lo que suma. En cuanto esté publicado:
--   UPDATE projects SET github_url='https://github.com/bohdeveloper/rexia'
--   WHERE slug='rexia';
--
-- Ejecutar:
--   wrangler d1 execute bohdeveloper-admin --remote --file=./migrations/projects-rexia-bako-ayudas.sql

INSERT OR IGNORE INTO projects
  (slug, title, excerpt, content, tags, github_url, demo_url, architecture, published, featured)
VALUES (
  'rexia',
  'REXIA — Rexistro de Identificación Animal',
  'Registro autonómico de identificación de animales de compañía construido con el stack del sector público: trazabilidad del microchip al titular con histórico completo, series de chips asignadas a veterinarios habilitados y máquina de estados del animal. Reimplementación original inspirada en el REGIAC de la Xunta, con datos ficticios. Sincronización con un registro nacional simulado y consulta pública por microchip diseñada para no exponer datos personales del titular.',
  '',
  'UDA (EJIE),Java,Spring,Spring Data JPA,Hibernate,Oracle XE,PL/SQL,JSP,JSTL,Tiles,Bootstrap,jQuery,Spring Security,JUnit 5,Docker,Maven',
  '',
  '',
  'JEE en capas · UDA (EJIE) + Spring + Oracle',
  1,
  1
);

INSERT OR IGNORE INTO projects
  (slug, title, excerpt, content, tags, github_url, demo_url, architecture, published, featured)
VALUES (
  'bako',
  'BAKO — Autonomous Knowledge Operator',
  'Asistente personal voice-first vía Telegram, desplegado 24/7. Orquestador dual de modelos de lenguaje con failover automático entre Ollama local (expuesto mediante Cloudflare Tunnel) y Groq cloud. Transcripción con Whisper, síntesis de voz neural y capa de privacidad que detecta contenido sensible y fuerza su procesamiento en local. Ocho integraciones de API: GitHub, Notion, Google Calendar (OAuth2), Open-Meteo, RSS y Cloudflare D1. Coste de operación: 0 €/mes.',
  '',
  'Express,TypeScript,MongoDB Atlas,Cloudflare D1,Render,Telegram Bot API,Groq,Ollama,Whisper',
  'https://github.com/bohdeveloper/bako',
  '',
  'Orquestador dual LLM · local + cloud',
  1,
  1
);

INSERT OR IGNORE INTO projects
  (slug, title, excerpt, content, tags, github_url, demo_url, architecture, published, featured)
VALUES (
  'ayudas-gv',
  'ayudas_gv',
  'Proyecto de práctica sobre contenerización y orquestación: manifiestos, servicios, ingress y gestión de configuración en Minikube.',
  '',
  'Spring Boot,Docker,Kubernetes',
  'https://github.com/bohdeveloper/ayudas-gv',
  '',
  'Contenerización y orquestación',
  1,
  0
);
