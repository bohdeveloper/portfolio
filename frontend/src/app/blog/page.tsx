'use client';

import { useEffect, useState, useRef, Suspense, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface Post {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image: string;
  tags: string;
  published: number;
  views: number;
  reading_time: number;
  created_at: string;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
}
function tagList(tags: string): string[] {
  return tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];
}

/* ── Tag pill reutilizable ── */
function TagPill({ tag, active, onClick }: { tag: string; active?: boolean; onClick?: () => void }) {
  return (
    <span
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      className={[
        'text-xs px-2.5 py-1 rounded-full border transition-all select-none',
        active
          ? 'bg-primary/10 border-primary text-primary font-medium'
          : 'border-primary/30 text-primary hover:bg-primary/10 hover:border-primary',
        onClick ? 'cursor-pointer' : '',
      ].join(' ')}
    >
      {tag}
    </span>
  );
}

const POST_CONTENT_STYLES = `
  .post-body {
    font-size: 16px; line-height: 1.8;
    color: #1f2937;
  }
  html.dark .post-body { color: #d1d5db; }

  .post-body h1 { font-size: 1.85em; font-weight: 700; margin: 1.4em 0 0.5em; color: #111827; line-height: 1.25; }
  .post-body h2 { font-size: 1.4em;  font-weight: 600; margin: 1.3em 0 0.45em; color: #111827; line-height: 1.3; }
  .post-body h3 { font-size: 1.15em; font-weight: 600; margin: 1.1em 0 0.4em;  color: #111827; }
  html.dark .post-body h1,
  html.dark .post-body h2,
  html.dark .post-body h3 { color: #f3f4f6; }

  .post-body p { margin: 0.85em 0; }
  .post-body ul, .post-body ol { padding-left: 1.6em; margin: 0.85em 0; }
  .post-body li { margin: 0.3em 0; }
  .post-body li > p { margin: 0; }

  .post-body strong { font-weight: 700; color: #111827; }
  html.dark .post-body strong { color: #f9fafb; }
  .post-body em { font-style: italic; }
  .post-body u  { text-decoration: underline; }

  .post-body a { color: var(--primary); text-decoration: underline; text-underline-offset: 3px; }
  .post-body a:hover { opacity: 0.8; }

  .post-body code {
    background: #f1f5f9; padding: 2px 6px; border-radius: 4px;
    font-size: 0.875em; font-family: ui-monospace, monospace; color: #0891b2;
  }
  html.dark .post-body code { background: #1e293b; color: #00e7eb; }

  .post-body pre {
    background: #f1f5f9; padding: 1rem 1.25rem; border-radius: 8px;
    overflow-x: auto; margin: 1.1em 0; border: 1px solid #e2e8f0;
  }
  html.dark .post-body pre { background: #0f172a; border-color: #1e293b; }
  .post-body pre code { background: none; padding: 0; color: #334155; font-size: 13.5px; }
  html.dark .post-body pre code { color: #cbd5e1; }

  .post-body blockquote {
    border-left: 3px solid var(--primary); margin: 1.1em 0;
    padding: 0.5em 1.1em; color: #6b7280; font-style: italic;
  }
  html.dark .post-body blockquote { color: #9ca3af; }

  .post-body hr { border: none; border-top: 1px solid #e5e7eb; margin: 1.75em 0; }
  html.dark .post-body hr { border-color: #374151; }

  .post-body table { width: 100%; border-collapse: collapse; margin: 1.1em 0; font-size: 14px; }
  .post-body th, .post-body td { border: 1px solid #e5e7eb; padding: 8px 14px; text-align: left; }
  html.dark .post-body th, html.dark .post-body td { border-color: #374151; }
  .post-body th { background: #f9fafb; font-weight: 600; }
  html.dark .post-body th { background: #1e293b; color: #f3f4f6; }
`;

/* ── Share button ── */
function ShareButton({ title, slug }: { title: string; slug: string }) {
  const [copied, setCopied] = useState(false);
  const share = async () => {
    const url = window.location.origin + '/blog?slug=' + encodeURIComponent(slug);
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (e) {
        // AbortError = usuario canceló el share nativo → no caer al clipboard
        if (e instanceof Error && e.name === 'AbortError') return;
        // Otro error (ej: no soportado en contexto) → intentar clipboard
      }
    }
    await navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };
  return (
    <button
      onClick={share}
      className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all ${
        copied
          ? 'border-green-400 text-green-600 dark:text-green-400'
          : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-primary/50 hover:text-primary'
      }`}
    >
      {copied ? '✓ Enlace copiado' : '↗ Compartir'}
    </button>
  );
}

/* ── Reactions bar ── */
const EMOJIS = ['👍', '❤️', '🔥', '💡'] as const;

function ReactionsBar({ slug }: { slug: string }) {
  const [counts,  setCounts]  = useState<Record<string, number>>({});
  const [reacted, setReacted] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch('/api/blog/reactions?slug=' + encodeURIComponent(slug))
      .then(r => r.json())
      .then((res: { ok: boolean; data?: Record<string, number> }) => {
        if (res.ok && res.data) setCounts(res.data);
      });
    try {
      const stored = localStorage.getItem('blog_reacted_' + slug);
      if (stored) setReacted(new Set(JSON.parse(stored)));
    } catch {}
  }, [slug]);

  const react = async (emoji: string) => {
    const hasReacted = reacted.has(emoji);
    const delta = hasReacted ? -1 : 1;
    // Optimistic update
    setCounts(prev => ({ ...prev, [emoji]: Math.max(0, (prev[emoji] ?? 0) + delta) }));
    const next = new Set(reacted);
    if (hasReacted) next.delete(emoji); else next.add(emoji);
    setReacted(next);
    try { localStorage.setItem('blog_reacted_' + slug, JSON.stringify([...next])); } catch {}
    // API call
    fetch('/api/blog/reactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, emoji, delta }),
    }).then(r => r.json()).then((res: { ok: boolean; count?: number }) => {
      if (res.ok && res.count !== undefined) setCounts(prev => ({ ...prev, [emoji]: res.count! }));
    }).catch(() => {});
  };

  return (
    <div className="flex flex-wrap items-center gap-2 my-8 py-6 border-t border-b border-gray-200 dark:border-gray-800">
      <span className="text-xs text-gray-400 mr-1 w-full sm:w-auto">¿Te ha gustado?</span>
      {EMOJIS.map(emoji => (
        <button
          key={emoji}
          onClick={() => react(emoji)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all border ${
            reacted.has(emoji)
              ? 'bg-primary/10 border-primary text-primary font-medium'
              : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary/40 hover:text-primary'
          }`}
        >
          <span>{emoji}</span>
          {(counts[emoji] ?? 0) > 0 && (
            <span className="text-xs font-semibold">{counts[emoji]}</span>
          )}
        </button>
      ))}
    </div>
  );
}

/* ── Comments section ── */
interface Comment {
  id: number;
  parent_id: number | null;
  alias: string;
  body: string;
  created_at: string;
}

function fmtRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 2)   return 'ahora mismo';
  if (m < 60)  return `hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `hace ${h}h`;
  const d = Math.floor(h / 24);
  if (d < 30)  return `hace ${d} día${d !== 1 ? 's' : ''}`;
  return fmtDate(iso);
}

function CommentItem({ c, onReply, isReply }: { c: Comment; onReply?: () => void; isReply?: boolean }) {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">
        {(c.alias?.[0] || '?').toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{c.alias}</span>
          <span className="text-xs text-gray-400">{fmtRelative(c.created_at)}</span>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">{c.body}</p>
        {!isReply && onReply && (
          <button onClick={onReply} className="mt-1 text-xs text-gray-400 hover:text-primary transition">
            ↩ Responder
          </button>
        )}
      </div>
    </div>
  );
}

function CommentsSection({ slug }: { slug: string }) {
  const [comments,   setComments]   = useState<Comment[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [form,       setForm]       = useState({ alias: '', body: '' });
  const [replyTo,    setReplyTo]    = useState<{ id: number; alias: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const [error,      setError]      = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  const load = useCallback(() => {
    fetch('/api/blog/comments?slug=' + encodeURIComponent(slug))
      .then(r => r.json())
      .then((res: { ok: boolean; data?: Comment[] }) => { if (res.ok) setComments(res.data ?? []); })
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => { load(); }, [load]);

  // Resetear estado al cambiar de post
  useEffect(() => {
    setSubmitted(false);
    setReplyTo(null);
    setError('');
  }, [slug]);

  // Persist alias in localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('blog_alias');
      if (saved) setForm(f => ({ ...f, alias: saved }));
    } catch {}
  }, []);

  const topLevel = comments.filter(c => !c.parent_id);
  const replies  = (pid: number) => comments.filter(c => c.parent_id === pid);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.alias.trim() || !form.body.trim()) return;
    setSubmitting(true); setError('');
    try {
      const res = await fetch('/api/blog/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, alias: form.alias, body: form.body, parent_id: replyTo?.id ?? null }),
      });
      const data: { ok: boolean; error?: string } = await res.json();
      if (data.ok) {
        try { localStorage.setItem('blog_alias', form.alias.trim()); } catch {}
        setForm(f => ({ ...f, body: '' }));
        setReplyTo(null);
        setSubmitted(true);
      } else {
        setError(data.error ?? 'Error al enviar');
      }
    } catch {
      setError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  const startReply = (id: number, alias: string) => {
    setReplyTo({ id, alias });
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
      <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-6">
        💬 {loading ? 'Comentarios' : comments.length > 0 ? `${comments.length} comentario${comments.length !== 1 ? 's' : ''}` : 'Comentarios'}
      </h2>

      {/* Form */}
      {submitted ? (
        <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 px-4 py-3 mb-8 text-sm text-green-700 dark:text-green-400">
          ✓ Comentario enviado — aparecerá tras la moderación. ¡Gracias!
          <button onClick={() => setSubmitted(false)} className="ml-3 underline text-xs opacity-70">Escribir otro</button>
        </div>
      ) : (
        <form ref={formRef} onSubmit={submit} className="mb-10 space-y-3">
          {replyTo && (
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span>↩ Respondiendo a <strong className="text-gray-700 dark:text-gray-200">{replyTo.alias}</strong></span>
              <button type="button" onClick={() => setReplyTo(null)} className="text-gray-400 hover:text-primary">× cancelar</button>
            </div>
          )}
          <input
            type="text"
            placeholder="Nombre o alias *"
            value={form.alias}
            onChange={e => setForm(f => ({ ...f, alias: e.target.value }))}
            maxLength={50}
            required
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-primary transition"
          />
          <textarea
            placeholder="Escribe tu comentario... *"
            value={form.body}
            onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
            maxLength={2000}
            rows={3}
            required
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-primary transition resize-none"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-400 dark:text-gray-500">Los comentarios se publican tras moderación.</p>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm rounded-lg bg-primary text-black font-medium hover:opacity-90 disabled:opacity-50 transition"
            >
              {submitting ? 'Enviando...' : 'Enviar comentario'}
            </button>
          </div>
        </form>
      )}

      {/* List */}
      {loading && <p className="text-sm text-gray-400">Cargando comentarios...</p>}
      {!loading && comments.length === 0 && !submitted && (
        <p className="text-sm text-gray-400 dark:text-gray-500 italic">Sé el primero en comentar.</p>
      )}
      <div className="space-y-6">
        {topLevel.map(c => (
          <div key={c.id}>
            <CommentItem c={c} onReply={() => startReply(c.id, c.alias)} />
            {replies(c.id).length > 0 && (
              <div className="ml-11 mt-3 space-y-4 pl-4 border-l-2 border-gray-100 dark:border-gray-800">
                {replies(c.id).map(r => <CommentItem key={r.id} c={r} isReply />)}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Single post view ── */
function PostView({ slug }: { slug: string }) {
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const markedRef = useRef(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    markedRef.current = false;
    fetch('/api/blog/post?slug=' + encodeURIComponent(slug))
      .then(r => r.json())
      .then((res: { ok: boolean; data?: Post }) => {
        if (res.ok && res.data) setPost(res.data);
        else setNotFound(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  /* Renderiza el contenido del post con detección de formato:
     - Posts nuevos (TipTap): el contenido es HTML → se inserta directamente.
     - Posts legacy (Markdown): se usa marked.js cargado desde CDN solo si hace
       falta, para no añadir peso al bundle cuando el post ya es HTML. */
  useEffect(() => {
    if (!post || markedRef.current) return;
    const el = document.getElementById('blog-content');
    if (!el) return;

    if (post.content.trimStart().startsWith('<')) {
      /* HTML de TipTap: listo para insertar sin procesamiento adicional */
      el.innerHTML = post.content;
      markedRef.current = true;
      return;
    }

    /* Markdown legacy: carga marked.js desde CDN bajo demanda */
    const w = window as unknown as { marked?: { parse(s: string): string } };
    const render = () => {
      if (el && w.marked) { el.innerHTML = w.marked.parse(post.content); markedRef.current = true; }
    };
    if (w.marked) { render(); return; }
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/marked/9.1.6/marked.min.js';
    s.onload = render;
    document.head.appendChild(s);
  }, [post]);

  if (loading) return <div className="text-center py-20 text-gray-500 text-sm">Cargando...</div>;
  if (notFound) return (
    <div className="text-center py-20">
      <p className="text-gray-400 mb-4">Post no encontrado.</p>
      <button onClick={() => router.push('/blog')} className="text-primary text-sm hover:underline">← Volver al blog</button>
    </div>
  );
  if (!post) return null;

  return (
    <article className="max-w-2xl mx-auto px-4 pt-[100px] pb-12">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.push('/')} className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition">
          ← Portfolio
        </button>
        <span className="text-gray-300 dark:text-gray-700">·</span>
        <button onClick={() => router.push('/blog')} className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition">
          Blog
        </button>
      </div>

      {post.cover_image && (
        <img src={post.cover_image} alt="" className="w-full max-h-80 object-cover rounded-xl mb-8" />
      )}

      <header className="mb-8">
        {/* Tags clicables → filtran la lista del blog */}
        <div className="flex flex-wrap gap-2 mb-3">
          {tagList(post.tags).map(t => (
            <TagPill key={t} tag={t} onClick={() => router.push(`/blog?tag=${encodeURIComponent(t)}`)} />
          ))}
        </div>
        <h1 className="text-3xl font-light tracking-tight text-gray-900 dark:text-gray-100 mb-4 leading-snug">
          {post.title}
        </h1>
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-500">
          <span>{fmtDate(post.created_at)}</span>
          <span>·</span>
          <span>{post.reading_time} min de lectura</span>
          <span>·</span>
          <span>{post.views} lecturas</span>
          <span className="ml-auto"><ShareButton title={post.title} slug={post.slug} /></span>
        </div>
      </header>

      <style>{POST_CONTENT_STYLES}</style>
      <div id="blog-content" className="post-body">
        <p className="text-gray-400 text-sm italic">Cargando contenido...</p>
      </div>

      <ReactionsBar slug={post.slug} />
      <CommentsSection slug={post.slug} />
    </article>
  );
}

/* ── Post card ── */
function PostCard({ post, onClick, onTagClick }: { post: Post; onClick: () => void; onTagClick: (tag: string) => void }) {
  return (
    <article
      onClick={onClick}
      className="group cursor-pointer border border-gray-200 dark:border-gray-800 rounded-xl p-6
        hover:border-primary/40 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-all"
    >
      {/* stopPropagation para que el click en tag no abra el post */}
      <div className="flex flex-wrap gap-1.5 mb-3" onClick={e => e.stopPropagation()}>
        {tagList(post.tags).map(t => (
          <TagPill key={t} tag={t} onClick={() => onTagClick(t)} />
        ))}
      </div>
      <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2 group-hover:text-primary transition">
        {post.title}
      </h2>
      {post.excerpt && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{post.excerpt}</p>
      )}
      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
        <span>{fmtDate(post.created_at)}</span>
        <span>·</span>
        <span>{post.reading_time} min</span>
        <span className="ml-auto text-primary opacity-0 group-hover:opacity-100 transition text-sm">Leer →</span>
      </div>
    </article>
  );
}

/* ── Blog list con filtro por tags ── */
function BlogList({ initialTag }: { initialTag: string }) {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState(initialTag);

  useEffect(() => {
    fetch('/api/blog/list')
      .then(r => r.json())
      .then((res: { ok: boolean; data?: Post[] }) => { if (res.ok) setPosts(res.data ?? []); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { setActiveTag(initialTag); }, [initialTag]);

  /* SEO dinámico: actualiza <title> según tag activo */
  useEffect(() => {
    document.title = activeTag
      ? `${activeTag} — Blog | Borja Olazabal`
      : 'Blog | Borja Olazabal';
    return () => { document.title = 'Borja Olazabal — Desarrollador Full Stack'; };
  }, [activeTag]);

  const allTags = useMemo(() => {
    const seen = new Set<string>();
    posts.forEach(p => tagList(p.tags).forEach(t => seen.add(t)));
    return Array.from(seen).sort();
  }, [posts]);

  const filtered = activeTag
    ? posts.filter(p => tagList(p.tags).includes(activeTag))
    : posts;

  function selectTag(tag: string) {
    const next = tag === activeTag ? '' : tag;
    setActiveTag(next);
    router.replace(next ? `/blog?tag=${encodeURIComponent(next)}` : '/blog', { scroll: false });
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-[100px] pb-12">
      <div className="mb-6">
        <button
          onClick={() => router.push('/')}
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition flex items-center gap-1 mb-8"
        >
          ← Volver al portfolio
        </button>
        <p className="text-primary text-xs tracking-widest uppercase font-medium mb-2">Blog</p>
        <h1 className="text-3xl font-light tracking-tight text-gray-900 dark:text-gray-100 mb-2">
          {activeTag ? (
            <>Artículos sobre <span className="text-primary">{activeTag}</span></>
          ) : 'Artículos técnicos'}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Next.js · Cloudflare Workers · D1 · Full Stack
        </p>
      </div>

      {/* Barra de filtros por tag */}
      {!loading && allTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-8 pb-6 border-b border-gray-200 dark:border-gray-800">
          <span className="text-xs text-gray-400 dark:text-gray-500 mr-1">Filtrar:</span>
          {allTags.map(t => (
            <TagPill key={t} tag={t} active={t === activeTag} onClick={() => selectTag(t)} />
          ))}
          {activeTag && (
            <button
              onClick={() => selectTag(activeTag)}
              className="text-xs text-gray-400 dark:text-gray-500 hover:text-primary transition ml-1"
            >
              × limpiar
            </button>
          )}
        </div>
      )}

      {loading && <p className="text-gray-500 text-sm">Cargando...</p>}

      {!loading && filtered.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {activeTag
            ? `No hay artículos con la etiqueta "${activeTag}".`
            : 'Próximamente — el primer artículo está en camino.'}
        </p>
      )}

      <div className="flex flex-col gap-4">
        {filtered.map(p => (
          <PostCard
            key={p.id}
            post={p}
            onClick={() => router.push('/blog?slug=' + p.slug)}
            onTagClick={selectTag}
          />
        ))}
      </div>

      {activeTag && filtered.length > 0 && (
        <p className="mt-8 text-xs text-gray-400 dark:text-gray-500">
          {filtered.length} artículo{filtered.length !== 1 ? 's' : ''} con la etiqueta{' '}
          <strong className="text-primary font-medium">{activeTag}</strong>
        </p>
      )}
    </div>
  );
}

/* ── Root: switch entre lista y post, lee tag del URL ── */
function BlogInner() {
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug');
  const tag  = searchParams.get('tag') ?? '';
  return slug ? <PostView slug={slug} /> : <BlogList initialTag={tag} />;
}

export default function BlogPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-500 text-sm">Cargando...</div>}>
      <BlogInner />
    </Suspense>
  );
}
