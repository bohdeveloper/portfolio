'use client';

import { useEffect, useState, useRef, Suspense, useMemo } from 'react';
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

  /* HTML (TipTap) directo; markdown legacy via marked.js */
  useEffect(() => {
    if (!post || markedRef.current) return;
    const el = document.getElementById('blog-content');
    if (!el) return;

    if (post.content.trimStart().startsWith('<')) {
      el.innerHTML = post.content;
      markedRef.current = true;
      return;
    }

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
        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
          <span>{fmtDate(post.created_at)}</span>
          <span>·</span>
          <span>{post.reading_time} min de lectura</span>
          <span>·</span>
          <span>{post.views} lecturas</span>
        </div>
      </header>

      {/* Prose: sin prose-invert en light mode para texto legible */}
      <div
        id="blog-content"
        className="prose dark:prose-invert max-w-none
          text-gray-800 dark:text-gray-300
          prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-headings:font-medium
          prose-p:text-gray-800 dark:prose-p:text-gray-300
          prose-a:text-primary prose-a:no-underline hover:prose-a:underline
          prose-code:text-primary prose-code:bg-gray-100 dark:prose-code:bg-gray-900 prose-code:px-1 prose-code:rounded
          prose-pre:bg-gray-100 dark:prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-200 dark:prose-pre:border-gray-800
          prose-blockquote:border-l-primary prose-blockquote:text-gray-600 dark:prose-blockquote:text-gray-400
          prose-strong:text-gray-900 dark:prose-strong:text-gray-100
          prose-li:text-gray-800 dark:prose-li:text-gray-300"
      >
        <p className="text-gray-400 text-sm italic">Cargando contenido...</p>
      </div>
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
