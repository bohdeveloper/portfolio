'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Post {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
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
    fetch('/api/blog/post?slug=' + encodeURIComponent(slug))
      .then(r => r.json())
      .then((res: { ok: boolean; data?: Post }) => {
        if (res.ok && res.data) setPost(res.data);
        else setNotFound(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  /* load marked from CDN and render content */
  useEffect(() => {
    if (!post || markedRef.current) return;
    const w = window as unknown as { marked?: { parse(s: string): string } };
    const render = () => {
      const el = document.getElementById('blog-content');
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
    <article className="max-w-2xl mx-auto px-4 py-12">
      <button
        onClick={() => router.push('/blog')}
        className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition mb-8 flex items-center gap-1"
      >
        ← Volver al blog
      </button>

      <header className="mb-8">
        <div className="flex flex-wrap gap-2 mb-3">
          {tagList(post.tags).map(t => (
            <span key={t} className="text-xs px-2 py-0.5 rounded-full border border-primary/30 text-primary">{t}</span>
          ))}
        </div>
        <h1 className="text-3xl font-light tracking-tight text-gray-900 dark:text-gray-100 mb-4 leading-snug">
          {post.title}
        </h1>
        <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
          <span>{fmtDate(post.created_at)}</span>
          <span>·</span>
          <span>{post.reading_time} min de lectura</span>
          <span>·</span>
          <span>{post.views} lecturas</span>
        </div>
      </header>

      <div
        id="blog-content"
        className="prose prose-invert dark:prose-invert max-w-none text-gray-300 dark:text-gray-300
          prose-headings:text-gray-100 prose-headings:font-medium
          prose-a:text-primary prose-a:no-underline hover:prose-a:underline
          prose-code:text-primary prose-code:bg-gray-900 prose-code:px-1 prose-code:rounded
          prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-800
          prose-blockquote:border-l-primary prose-blockquote:text-gray-400
          prose-strong:text-gray-100"
      >
        <p className="text-gray-400 text-sm italic">Cargando contenido...</p>
      </div>
    </article>
  );
}

/* ── Post card ── */
function PostCard({ post, onClick }: { post: Post; onClick: () => void }) {
  return (
    <article
      onClick={onClick}
      className="group cursor-pointer border border-gray-200 dark:border-gray-800 rounded-xl p-6
        hover:border-primary/40 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-all"
    >
      <div className="flex flex-wrap gap-1.5 mb-3">
        {tagList(post.tags).map(t => (
          <span key={t} className="text-xs px-2 py-0.5 rounded-full border border-primary/30 text-primary">{t}</span>
        ))}
      </div>
      <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2 group-hover:text-primary transition">
        {post.title}
      </h2>
      {post.excerpt && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{post.excerpt}</p>
      )}
      <div className="flex items-center gap-3 text-xs text-gray-400">
        <span>{fmtDate(post.created_at)}</span>
        <span>·</span>
        <span>{post.reading_time} min</span>
        <span className="ml-auto text-primary opacity-0 group-hover:opacity-100 transition text-sm">Leer →</span>
      </div>
    </article>
  );
}

/* ── Blog list ── */
function BlogList() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/blog/list')
      .then(r => r.json())
      .then((res: { ok: boolean; data?: Post[] }) => { if (res.ok) setPosts(res.data ?? []); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-10">
        <p className="text-primary text-xs tracking-widest uppercase font-medium mb-2">Blog</p>
        <h1 className="text-3xl font-light tracking-tight text-gray-900 dark:text-gray-100 mb-2">
          Artículos técnicos
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Next.js · Cloudflare Workers · D1 · Full Stack
        </p>
      </div>

      {loading && <p className="text-gray-500 text-sm">Cargando...</p>}

      {!loading && posts.length === 0 && (
        <p className="text-gray-400 text-sm">Próximamente — el primer artículo está en camino.</p>
      )}

      <div className="flex flex-col gap-4">
        {posts.map(p => (
          <PostCard
            key={p.id}
            post={p}
            onClick={() => router.push('/blog?slug=' + p.slug)}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Root: switch between list and post view ── */
function BlogInner() {
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug');
  return slug ? <PostView slug={slug} /> : <BlogList />;
}

export default function BlogPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-500 text-sm">Cargando...</div>}>
      <BlogInner />
    </Suspense>
  );
}
