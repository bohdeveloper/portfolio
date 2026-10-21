-- ayudas_gv pasa a ser el laboratorio de la «Ruta hacia desarrollador senior»
-- de la sección Formación (Aprendizaje.tsx / RutaSenior.tsx).
--
-- Motivo: los bloques de arquitectura, testing, Kafka, contenedores, AWS, IA
-- y reactiva se practican en este proyecto. Lo no empezado se describe como
-- «planificado» y no entra en tags (invariante 5 de spec.md). Mantener
-- sincronizado con el FALLBACK de frontend/src/components/sections/Proyectos.tsx.
--
-- Ejecutar:
--   wrangler d1 execute bohdeveloper-admin --remote --file=./migrations/projects-ayudas-gv-laboratorio-ruta.sql

UPDATE projects
SET
  excerpt = 'Laboratorio de mi ruta hacia desarrollador senior. Hoy: contenerización y orquestación con Docker y Kubernetes en Minikube. En desarrollo: asistente RAG con Spring AI que responde dudas sobre una ayuda usando la normativa como fuente. Planificado: arquitectura hexagonal con DDD, eventos con Kafka, despliegue en OpenShift y servidor MCP.',
  architecture = 'Laboratorio · contenerización, orquestación y RAG'
WHERE slug = 'ayudas-gv';
