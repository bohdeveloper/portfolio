'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Post {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  cover_image: string;
  reading_time: number;
  created_at: string;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

const PANEL_STYLES = `
  html.light {
    --pnl-bg: #ffffff; --pnl-hdr: #f8f9fa; --pnl-border: #e5e7eb;
    --pnl-text: #111827; --pnl-muted: #6b7280; --pnl-hover: #f3f4f6;
  }
  html.dark, html:not(.light) {
    --pnl-bg: #0d0d0d; --pnl-hdr: #111827; --pnl-border: #1f2937;
    --pnl-text: #f3f4f6; --pnl-muted: #9ca3af; --pnl-hover: #1a2332;
  }
  @keyframes blog-pulse-dark {
    0%,100% { border-color: rgba(0,231,235,0.5); box-shadow: 0 0 0 0 rgba(0,231,235,0); }
    50%      { border-color: rgba(0,231,235,1);   box-shadow: 0 0 10px 2px rgba(0,231,235,0.22); }
  }
  @keyframes blog-pulse-light {
    0%,100% { border-color: rgba(0,168,191,0.5); box-shadow: 0 0 0 0 rgba(0,168,191,0); }
    50%      { border-color: rgba(0,168,191,1);   box-shadow: 0 0 10px 2px rgba(0,168,191,0.2); }
  }
  html:not(.light) .blog-toggle-btn { animation: blog-pulse-dark 3s ease-in-out infinite; }
  html.light        .blog-toggle-btn { animation: blog-pulse-light 3s ease-in-out infinite; }
  .blog-post-card:hover { background: var(--pnl-hover); }
`;

function BlogIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="2" width="13" height="18" rx="2" />
      <path d="M6 7h7M6 11h7M6 15h4" />
      <path d="M15 14l4 4-2 2-4-4 .5-2.5z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function BlogPanel() {
  const pathname = usePathname();
  const [open, setOpen]               = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [posts, setPosts]             = useState<Post[]>([]);
  const [postsLoaded, setPostsLoaded] = useState(false);

  const hide = pathname.startsWith('/admin') || pathname.startsWith('/blog');

  useEffect(() => {
    if (hide) return;

    fetch('/api/blog/list')
      .then(r => r.json())
      .then((res: { ok: boolean; data?: Post[] }) => {
        if (res.ok) setPosts(res.data ?? []);
        setPostsLoaded(true);
      })
      .catch(() => setPostsLoaded(true));

    /* auto-open desktop panel on every page load */
    setOpen(true);
  }, [hide]);

  if (hide) return null;

  /* ── Post card (shared between desktop panel and mobile overlay) ── */
  function PostCard({ post, onNavigate }: { post: Post; onNavigate: () => void }) {
    return (
      <Link
        href={`/blog?slug=${post.slug}`}
        onClick={onNavigate}
        className="blog-post-card block"
        style={{
          borderBottom: '1px solid var(--pnl-border)',
          padding: '0.875rem 1.25rem',
          textDecoration: 'none',
          transition: 'background 0.15s',
          display: 'block',
        }}
      >
        {post.cover_image && (
          <img
            src={post.cover_image}
            alt=""
            style={{ width: '100%', height: '72px', objectFit: 'cover', borderRadius: '6px', marginBottom: '8px' }}
          />
        )}
        <h3 style={{ color: 'var(--pnl-text)', fontSize: '13px', fontWeight: 500, lineHeight: '1.45', marginBottom: '4px' }}>
          {post.title}
        </h3>
        {post.excerpt && (
          <p style={{ color: 'var(--pnl-muted)', fontSize: '11px', lineHeight: '1.5', marginBottom: '4px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {post.excerpt}
          </p>
        )}
        <p style={{ color: 'var(--pnl-muted)', fontSize: '10px' }}>
          {fmtDate(post.created_at)} · {post.reading_time} min
        </p>
      </Link>
    );
  }

  function EmptyState() {
    return (
      <p style={{ color: 'var(--pnl-muted)', fontSize: '12px', padding: '2rem 1.25rem', textAlign: 'center', fontStyle: 'italic' }}>
        Próximamente — el primer artículo está en camino.
      </p>
    );
  }

  return (
    <>
      <style>{PANEL_STYLES}</style>

      {/* ══════════════ DESKTOP ══════════════ */}

      {/* Toggle button — only visible when panel is closed, so it never overlaps content */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Abrir panel de blog"
          title="Blog"
          className="blog-toggle-btn hidden md:flex flex-col items-center justify-center gap-1"
          style={{
            position: 'fixed', bottom: '200px', right: '24px', zIndex: 50,
            width: '38px', height: '60px',
            background: 'transparent', border: '1px solid',
            borderRadius: '10px', cursor: 'pointer',
            color: 'var(--primary)', fontFamily: 'inherit',
            transition: 'transform 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.07)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <BlogIcon size={15} />
          <span style={{ fontSize: '7.5px', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase' }}>Blog</span>
        </button>
      )}

      {/* Side panel */}
      <div
        className="hidden md:flex flex-col"
        style={{
          position: 'fixed', top: '88px', right: 0,
          width: '320px', height: 'calc(100vh - 88px)',
          zIndex: 40,
          background: 'var(--pnl-bg)',
          borderLeft: '1px solid var(--pnl-border)',
          boxShadow: open ? '-6px 0 28px rgba(0,0,0,0.12)' : 'none',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Header */}
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--pnl-border)', background: 'var(--pnl-hdr)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <p style={{ color: 'var(--primary)', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '2px' }}>Blog</p>
            <p style={{ color: 'var(--pnl-text)', fontSize: '13px', fontWeight: 400 }}>Artículos técnicos</p>
          </div>
          <button
            onClick={() => setOpen(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--pnl-muted)', fontSize: '20px', lineHeight: 1, padding: '2px 6px', borderRadius: '4px', fontFamily: 'inherit' }}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        {/* Posts list */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {!postsLoaded && (
            <p style={{ color: 'var(--pnl-muted)', fontSize: '12px', padding: '1rem 1.25rem' }}>Cargando...</p>
          )}
          {postsLoaded && posts.length === 0 && <EmptyState />}
          {posts.map(p => (
            <PostCard key={p.id} post={p} onNavigate={() => setOpen(false)} />
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid var(--pnl-border)', background: 'var(--pnl-hdr)', flexShrink: 0 }}>
          <Link
            href="/blog"
            onClick={() => setOpen(false)}
            style={{ color: 'var(--primary)', fontSize: '12px', textDecoration: 'none' }}
          >
            Ver todos los artículos →
          </Link>
        </div>
      </div>

      {/* ══════════════ MOBILE ══════════════ */}

      {/* Mobile toggle button — above EmailPanel mobile (bottom-2 right-2) */}
      <button
        onClick={() => setMobileOpen(true)}
        aria-label="Abrir blog"
        className="blog-toggle-btn md:hidden flex flex-col items-center justify-center gap-1"
        style={{
          position: 'fixed', bottom: '56px', right: '8px', zIndex: 50,
          width: '36px', height: '54px',
          background: 'transparent', border: '1px solid',
          borderRadius: '10px', cursor: 'pointer',
          color: 'var(--primary)', fontFamily: 'inherit',
        }}
      >
        <BlogIcon size={14} />
        <span style={{ fontSize: '7px', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase' }}>Blog</span>
      </button>

      {/* Mobile fullscreen overlay — slides up from bottom */}
      <div
        className="md:hidden flex flex-col"
        style={{
          position: 'fixed', inset: 0, zIndex: 60,
          background: 'var(--pnl-bg)',
          transform: mobileOpen ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Mobile header */}
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--pnl-border)', background: 'var(--pnl-hdr)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <button
            onClick={() => setMobileOpen(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--pnl-muted)', fontSize: '13px', fontFamily: 'inherit', padding: 0, display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            ← Volver al portfolio
          </button>
          <span style={{ color: 'var(--primary)', fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' }}>Blog</span>
        </div>

        {/* Posts list */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {!postsLoaded && (
            <p style={{ color: 'var(--pnl-muted)', fontSize: '13px', padding: '1.5rem' }}>Cargando...</p>
          )}
          {postsLoaded && posts.length === 0 && <EmptyState />}
          {posts.map(p => (
            <PostCard key={p.id} post={p} onNavigate={() => setMobileOpen(false)} />
          ))}
        </div>
      </div>
    </>
  );
}
