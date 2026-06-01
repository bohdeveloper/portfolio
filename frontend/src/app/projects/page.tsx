'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface Project {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image: string;
  tags: string;
  github_url: string;
  demo_url: string;
  architecture: string;
  published: number;
  featured: number;
  views: number;
  created_at: string;
}

function tagList(tags: string): string[] {
  return tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];
}

const PROJECT_CONTENT_STYLES = `
  .project-body {
    font-size: 16px; line-height: 1.8;
    color: #1f2937;
  }
  html.dark .project-body { color: #d1d5db; }

  .project-body h1 { font-size: 1.85em; font-weight: 700; margin: 1.4em 0 0.5em; color: #111827; line-height: 1.25; }
  .project-body h2 { font-size: 1.4em;  font-weight: 600; margin: 1.3em 0 0.45em; color: #111827; line-height: 1.3; }
  .project-body h3 { font-size: 1.15em; font-weight: 600; margin: 1.1em 0 0.4em;  color: #111827; }
  html.dark .project-body h1,
  html.dark .project-body h2,
  html.dark .project-body h3 { color: #f3f4f6; }

  .project-body p { margin: 0.85em 0; }
  .project-body ul, .project-body ol { padding-left: 1.6em; margin: 0.85em 0; }
  .project-body li { margin: 0.3em 0; }
  .project-body li > p { margin: 0; }

  .project-body strong { font-weight: 700; color: #111827; }
  html.dark .project-body strong { color: #f9fafb; }
  .project-body em { font-style: italic; }
  .project-body u  { text-decoration: underline; }

  .project-body a { color: var(--primary); text-decoration: underline; text-underline-offset: 3px; }
  .project-body a:hover { opacity: 0.8; }

  .project-body code {
    background: #f1f5f9; padding: 2px 6px; border-radius: 4px;
    font-size: 0.875em; font-family: ui-monospace, monospace; color: #0891b2;
  }
  html.dark .project-body code { background: #1e293b; color: #00e7eb; }

  .project-body pre {
    background: #f1f5f9; padding: 1rem 1.25rem; border-radius: 8px;
    overflow-x: auto; margin: 1.1em 0; border: 1px solid #e2e8f0;
  }
  html.dark .project-body pre { background: #0f172a; border-color: #1e293b; }
  .project-body pre code { background: none; padding: 0; color: #334155; font-size: 13.5px; }
  html.dark .project-body pre code { color: #cbd5e1; }

  .project-body blockquote {
    border-left: 3px solid var(--primary); margin: 1.1em 0;
    padding: 0.5em 1.1em; color: #6b7280; font-style: italic;
  }
  html.dark .project-body blockquote { color: #9ca3af; }

  .project-body hr { border: none; border-top: 1px solid #e5e7eb; margin: 1.75em 0; }
  html.dark .project-body hr { border-color: #374151; }
`;

/* ── Vista individual del proyecto ── */
function ProjectView({ slug }: { slug: string }) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const renderedRef = useRef(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    renderedRef.current = false;
    fetch('/api/projects/post?slug=' + encodeURIComponent(slug))
      .then(r => r.json())
      .then((res: { ok: boolean; data?: Project }) => {
        if (res.ok && res.data) setProject(res.data);
        else setNotFound(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!project || renderedRef.current) return;
    const el = document.getElementById('project-content');
    if (!el) return;
    if (project.content?.trimStart().startsWith('<')) {
      el.innerHTML = project.content;
      renderedRef.current = true;
    }
  }, [project]);

  if (loading) return <div className="text-center py-20 text-gray-500 text-sm">Cargando...</div>;
  if (notFound) return (
    <div className="text-center py-20">
      <p className="text-gray-400 mb-4">Proyecto no encontrado.</p>
      <button onClick={() => router.push('/projects')} className="text-primary text-sm hover:underline">← Volver a proyectos</button>
    </div>
  );
  if (!project) return null;

  return (
    <article className="max-w-2xl mx-auto px-4 pt-[100px] pb-12">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.push('/')} className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition">
          ← Portfolio
        </button>
        <span className="text-gray-300 dark:text-gray-700">·</span>
        <button onClick={() => router.push('/projects')} className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition">
          Proyectos
        </button>
      </div>

      {project.cover_image && (
        <img src={project.cover_image} alt="" className="w-full max-h-80 object-cover rounded-xl mb-8" />
      )}

      <header className="mb-8">
        {project.architecture && (
          <p className="text-primary text-xs tracking-widest uppercase font-medium mb-2">{project.architecture}</p>
        )}
        <h1 className="text-3xl font-light tracking-tight text-gray-900 dark:text-gray-100 mb-4 leading-snug">
          {project.title}
        </h1>
        {project.excerpt && (
          <p className="text-gray-600 dark:text-gray-400 text-base mb-4">{project.excerpt}</p>
        )}

        {/* Tech stack */}
        {tagList(project.tags).length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tagList(project.tags).map(t => (
              <span key={t} className="text-xs px-2.5 py-1 rounded-full border border-primary/30 text-primary">
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Acciones */}
        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
          {project.demo_url && (
            <a
              href={project.demo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm px-4 py-2 rounded-lg bg-primary text-black font-medium hover:opacity-90 transition"
            >
              Ver demo →
            </a>
          )}
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm px-4 py-2 rounded-lg border border-primary text-primary hover:bg-primary hover:text-black transition"
            >
              Ver código en GitHub →
            </a>
          )}
        </div>
      </header>

      {project.content && project.content.trim() && project.content !== '<p></p>' && (
        <>
          <style>{PROJECT_CONTENT_STYLES}</style>
          <div id="project-content" className="project-body">
            <p className="text-gray-400 text-sm italic">Cargando contenido...</p>
          </div>
        </>
      )}
    </article>
  );
}

/* ── Tarjeta de proyecto ── */
function ProjectCard({ project, onClick }: { project: Project; onClick: () => void }) {
  return (
    <article
      onClick={onClick}
      className="group cursor-pointer border border-gray-200 dark:border-gray-800 rounded-xl p-6
        hover:border-primary/40 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-all"
    >
      {project.cover_image && (
        <img src={project.cover_image} alt="" className="w-full h-40 object-cover rounded-lg mb-4" />
      )}

      {project.architecture && (
        <p className="text-primary text-xs tracking-widest uppercase font-medium mb-1">{project.architecture}</p>
      )}

      <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2 group-hover:text-primary transition">
        {project.title}
      </h2>

      {project.excerpt && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{project.excerpt}</p>
      )}

      {tagList(project.tags).length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {tagList(project.tags).map(t => (
            <span key={t} className="text-xs px-2 py-0.5 rounded-full border border-primary/30 text-primary/80">
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
        {project.github_url && (
          <a
            href={project.github_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="hover:text-primary transition"
          >
            GitHub →
          </a>
        )}
        {project.demo_url && (
          <a
            href={project.demo_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="hover:text-primary transition"
          >
            Demo →
          </a>
        )}
        <span className="ml-auto text-primary opacity-0 group-hover:opacity-100 transition text-sm">
          Case study →
        </span>
      </div>
    </article>
  );
}

/* ── Lista de proyectos ── */
function ProjectList() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    fetch('/api/projects/list')
      .then(r => r.json())
      .then((res: { ok: boolean; data?: Project[] }) => { if (res.ok) setProjects(res.data ?? []); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    document.title = 'Proyectos | Borja Olazabal';
    return () => { document.title = 'Borja Olazabal — Desarrollador Full Stack'; };
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 pt-[100px] pb-12">
      <div className="mb-10">
        <button
          onClick={() => router.push('/')}
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition flex items-center gap-1 mb-8"
        >
          ← Volver al portfolio
        </button>
        <p className="text-primary text-xs tracking-widest uppercase font-medium mb-2">Proyectos</p>
        <h1 className="text-3xl font-light tracking-tight text-gray-900 dark:text-gray-100 mb-2">
          Proyectos de desarrollo web
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          React · Angular · Spring Boot · Next.js · Full Stack
        </p>
      </div>

      {loading && <p className="text-gray-500 text-sm">Cargando...</p>}

      {!loading && projects.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Próximamente — los proyectos están en camino.
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {projects.map(p => (
          <ProjectCard
            key={p.id}
            project={p}
            onClick={() => router.push('/projects?slug=' + p.slug)}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Root ── */
function ProjectsInner() {
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug');
  return slug ? <ProjectView slug={slug} /> : <ProjectList />;
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-500 text-sm">Cargando...</div>}>
      <ProjectsInner />
    </Suspense>
  );
}
