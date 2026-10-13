-- Refleja la integración de Spring AI (en desarrollo) en el proyecto ayudas_gv.
--
-- Motivo: ayudas_gv pasa de ser solo práctica de Docker/Kubernetes a incluir un
-- asistente RAG con Spring AI. Se muestra como «en desarrollo», no como
-- implementado (invariante 5 de spec.md). Mantener sincronizado con el
-- FALLBACK de src/components/sections/Proyectos.tsx.
--
-- Ejecutar:
--   wrangler d1 execute bohdeveloper-admin --remote --file=./migrations/projects-ayudas-gv-spring-ai.sql

UPDATE projects
SET
  excerpt = 'Proyecto de práctica sobre contenerización y orquestación: manifiestos, servicios, ingress y gestión de configuración en Minikube. En desarrollo: integración de Spring AI para un asistente RAG que responda dudas sobre una ayuda usando la normativa como fuente.',
  tags = 'Spring Boot,Spring AI,Docker,Kubernetes',
  architecture = 'Contenerización, orquestación y RAG'
WHERE slug = 'ayudas-gv';
