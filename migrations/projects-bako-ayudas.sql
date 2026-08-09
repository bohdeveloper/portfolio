-- Alineación del portfolio con el CV (agosto 2026)
-- Añade BAKO y ayudas_gv a la tabla projects.
--
-- El orden de la home NO depende de esta tabla: lo fija ORDEN_SLUGS en
-- src/components/sections/Proyectos.tsx (BAKO, Diamadmin, Unyona, ayudas_gv,
-- DevHelper, Nitflex). Aun así se marca BAKO como featured para que también
-- encabece la lista en /projects y en el panel de administración.
--
-- Ejecutar:
--   wrangler d1 execute bohdeveloper-admin --remote --file=./migrations/projects-bako-ayudas.sql

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
