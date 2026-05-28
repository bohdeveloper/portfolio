'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Post {
  id: number; slug: string; title: string; excerpt: string;
  cover_image: string; reading_time: number; created_at: string;
}
interface Game {
  id: number; name: string; slug: string; description: string;
  url: string; screenshot: string; is_top: number;
  vote_count: number; is_community_top: number;
  reactions: Record<string, number>;
}

type Tab = 'blog' | 'juegos';

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
  @keyframes top-pulse-dark {
    0%,100% { box-shadow: 0 0 0 0 rgba(0,231,235,0); }
    50%      { box-shadow: 0 0 8px 3px rgba(0,231,235,0.18); }
  }
  @keyframes top-pulse-light {
    0%,100% { box-shadow: 0 0 0 0 rgba(0,168,191,0); }
    50%      { box-shadow: 0 0 8px 3px rgba(0,168,191,0.16); }
  }
  html:not(.light) .blog-toggle-btn { animation: blog-pulse-dark 3s ease-in-out infinite; }
  html.light        .blog-toggle-btn { animation: blog-pulse-light 3s ease-in-out infinite; }
  html:not(.light) .top-game-float  { animation: top-pulse-dark 3s ease-in-out infinite; }
  html.light        .top-game-float  { animation: top-pulse-light 3s ease-in-out infinite; }
  .blog-post-card:hover { background: var(--pnl-hover); }
  .game-card:hover { background: var(--pnl-hover); }
  .pnl-tab-bar { display: flex; border-bottom: 1px solid var(--pnl-border); background: var(--pnl-hdr); flex-shrink: 0; }
  .pnl-tab { flex: 1; padding: 9px 8px; background: none; border: none; border-bottom: 2px solid transparent; cursor: pointer; font-size: 12px; font-weight: 500; color: var(--pnl-muted); font-family: inherit; display: flex; align-items: center; justify-content: center; gap: 5px; transition: color 0.15s; }
  .pnl-tab:hover { color: var(--pnl-text); }
  .pnl-tab.active { color: var(--primary); border-bottom-color: var(--primary); }
  .game-top-badge { display: inline-flex; align-items: center; gap: 2px; background: rgba(255,200,0,0.12); border: 1px solid rgba(255,200,0,0.35); border-radius: 4px; padding: 1px 6px; font-size: 9px; font-weight: 700; color: #e6b400; letter-spacing: 0.4px; }
  .game-react-btn { display: inline-flex; align-items: center; gap: 3px; padding: 2px 7px; border-radius: 12px; font-size: 11px; cursor: pointer; border: 1px solid var(--pnl-border); background: none; color: var(--pnl-muted); font-family: inherit; transition: all 0.12s; }
  .game-react-btn:hover { border-color: var(--primary); color: var(--primary); }
  .game-react-btn.reacted { background: var(--primary); border-color: var(--primary); color: #fff; opacity: 0.9; }
`;

const EMOJIS = ['👍', '❤️', '🔥', '💡'] as const;

function BlogIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="2" width="13" height="18" rx="2" />
      <path d="M6 7h7M6 11h7M6 15h4" />
    </svg>
  );
}
function GameIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="6" width="20" height="12" rx="3" />
      <path d="M6 12h4M8 10v4" />
      <circle cx="15" cy="11" r="1" fill="currentColor" stroke="none" />
      <circle cx="18" cy="13" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function BlogPanel() {
  const pathname = usePathname();
  const [open,         setOpen]         = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [activeTab,    setActiveTab]    = useState<Tab>('blog');
  const [posts,        setPosts]        = useState<Post[]>([]);
  const [games,        setGames]        = useState<Game[]>([]);
  const [postsLoaded,  setPostsLoaded]  = useState(false);
  const [gamesLoaded,  setGamesLoaded]  = useState(false);
  const [topGame,      setTopGame]      = useState<Game | null>(null);
  const [gameReacted,  setGameReacted]  = useState<Record<string, Set<string>>>({});
  const [gameCounts,   setGameCounts]   = useState<Record<number, Record<string, number>>>({});
  const [gameModal,    setGameModal]    = useState<{ url: string; name: string } | null>(null);

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

    fetch('/api/games/list')
      .then(r => r.json())
      .then((res: { ok: boolean; games?: Game[]; top?: Game | null }) => {
        if (res.ok) {
          const gList = res.games ?? [];
          setGames(gList);
          // TOP = comunidad (más votos) o admin's pick como fallback
          setTopGame(res.top ?? gList.find((g: Game) => g.is_community_top === 1) ?? gList.find((g: Game) => g.is_top === 1) ?? null);
          // Inicializar conteos desde API
          const counts: Record<number, Record<string, number>> = {};
          for (const g of (res.games ?? [])) counts[g.id] = g.reactions;
          setGameCounts(counts);
        }
        setGamesLoaded(true);
      })
      .catch(() => setGamesLoaded(true));

    // Cargar reacciones guardadas en localStorage
    try {
      const stored = localStorage.getItem('game_reacted');
      if (stored) {
        const parsed = JSON.parse(stored) as Record<string, string[]>;
        const result: Record<string, Set<string>> = {};
        for (const [key, arr] of Object.entries(parsed)) result[key] = new Set(arr);
        setGameReacted(result);
      }
    } catch {}

    setOpen(true);
  }, [hide]);

  if (hide) return null;

  function openOnTab(tab: Tab) {
    setActiveTab(tab);
    setOpen(true);
    setMobileOpen(true);
  }

  function reactToGame(gameId: number, emoji: string) {
    const key = String(gameId);
    const reacted = gameReacted[key] ?? new Set<string>();
    const hasReacted = reacted.has(emoji);
    const delta = hasReacted ? -1 : 1;

    // Optimistic update
    const newReacted = new Set(reacted);
    if (hasReacted) newReacted.delete(emoji); else newReacted.add(emoji);
    const newMap = { ...gameReacted, [key]: newReacted };
    setGameReacted(newMap);
    try {
      const toStore: Record<string, string[]> = {};
      for (const [k, v] of Object.entries(newMap)) toStore[k] = [...v];
      localStorage.setItem('game_reacted', JSON.stringify(toStore));
    } catch {}

    setGameCounts(prev => ({
      ...prev,
      [gameId]: { ...prev[gameId], [emoji]: Math.max(0, ((prev[gameId]?.[emoji]) ?? 0) + delta) },
    }));

    fetch('/api/games/react', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ game_id: gameId, emoji, delta }),
    }).then(r => r.json()).then((res: { ok: boolean; count?: number }) => {
      if (res.ok && res.count !== undefined) {
        setGameCounts(prev => ({ ...prev, [gameId]: { ...prev[gameId], [emoji]: res.count! } }));
      }
    }).catch(() => {});
  }

  /* ── Post card ── */
  function PostCard({ post, onNavigate }: { post: Post; onNavigate: () => void }) {
    return (
      <Link
        href={`/blog?slug=${post.slug}`}
        onClick={onNavigate}
        className="blog-post-card block"
        style={{ borderBottom: '1px solid var(--pnl-border)', padding: '0.875rem 1.25rem', textDecoration: 'none', transition: 'background 0.15s', display: 'block' }}
      >
        {post.cover_image && (
          <img src={post.cover_image} alt="" style={{ width: '100%', height: '72px', objectFit: 'cover', borderRadius: '6px', marginBottom: '8px' }} />
        )}
        <h3 style={{ color: 'var(--pnl-text)', fontSize: '13px', fontWeight: 500, lineHeight: '1.45', marginBottom: '4px' }}>{post.title}</h3>
        {post.excerpt && (
          <p style={{ color: 'var(--pnl-muted)', fontSize: '11px', lineHeight: '1.5', marginBottom: '4px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{post.excerpt}</p>
        )}
        <p style={{ color: 'var(--pnl-muted)', fontSize: '10px' }}>{fmtDate(post.created_at)} · {post.reading_time} min</p>
      </Link>
    );
  }

  /* ── Game card ── */
  function GameCard({ game, onNavigate }: { game: Game; onNavigate: () => void }) {
    const counts  = gameCounts[game.id] ?? {};
    const reacted = gameReacted[String(game.id)] ?? new Set<string>();
    const hasReactions = EMOJIS.some(e => (counts[e] ?? 0) > 0 || reacted.has(e));

    return (
      <div className="game-card" style={{ borderBottom: '1px solid var(--pnl-border)', padding: '0.875rem 1.25rem', transition: 'background 0.15s' }}>
        {(game.is_community_top === 1 || game.is_top === 1) && (
          <div style={{ marginBottom: '6px', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
            {game.is_community_top === 1 && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.35)', borderRadius: '4px', padding: '1px 6px', fontSize: '9px', fontWeight: 700, color: '#ff6060', letterSpacing: '0.4px' }}>🔥 TOP</span>}
            {game.is_top === 1 && <span className="game-top-badge">⭐ Favorito</span>}
          </div>
        )}
        {game.screenshot ? (
          <img src={game.screenshot} alt={game.name} style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '6px', marginBottom: '8px' }} />
        ) : (
          <div style={{ width: '100%', height: '50px', borderRadius: '6px', background: 'var(--pnl-border)', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🎮</div>
        )}
        <h3 style={{ color: 'var(--pnl-text)', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>{game.name}</h3>
        {game.description && (
          <p style={{ color: 'var(--pnl-muted)', fontSize: '11px', lineHeight: '1.5', marginBottom: '8px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{game.description}</p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
          {/* Reacciones */}
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {(hasReactions ? EMOJIS : EMOJIS.slice(0, 2)).map(emoji => (
              <button
                key={emoji}
                className={`game-react-btn${reacted.has(emoji) ? ' reacted' : ''}`}
                onClick={() => reactToGame(game.id, emoji)}
              >
                <span>{emoji}</span>
                {(counts[emoji] ?? 0) > 0 && <span style={{ fontSize: '10px', fontWeight: 600 }}>{counts[emoji]}</span>}
              </button>
            ))}
          </div>
          {/* Jugar */}
          {game.url ? (
            <button
              onClick={() => {
                if (game.url.startsWith('/')) {
                  setGameModal({ url: game.url, name: game.name });
                } else {
                  window.open(game.url, '_blank', 'noopener,noreferrer');
                  onNavigate();
                }
              }}
              style={{ color: 'var(--primary)', fontSize: '11px', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0, padding: 0 }}
            >
              Jugar →
            </button>
          ) : (
            <span style={{ color: 'var(--pnl-muted)', fontSize: '11px', fontStyle: 'italic' }}>Próximamente</span>
          )}
        </div>
      </div>
    );
  }

  function EmptyState({ msg }: { msg: string }) {
    return <p style={{ color: 'var(--pnl-muted)', fontSize: '12px', padding: '2rem 1.25rem', textAlign: 'center', fontStyle: 'italic' }}>{msg}</p>;
  }

  /* ── Contenido del panel según pestaña activa ── */
  function PanelContent({ onNavigate }: { onNavigate: () => void }) {
    if (activeTab === 'blog') {
      return (
        <>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {!postsLoaded && <p style={{ color: 'var(--pnl-muted)', fontSize: '12px', padding: '1rem 1.25rem' }}>Cargando...</p>}
            {postsLoaded && posts.length === 0 && <EmptyState msg="Próximamente — el primer artículo está en camino." />}
            {posts.map(p => <PostCard key={p.id} post={p} onNavigate={onNavigate} />)}
          </div>
          <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid var(--pnl-border)', background: 'var(--pnl-hdr)', flexShrink: 0 }}>
            <Link href="/blog" onClick={onNavigate} style={{ color: 'var(--primary)', fontSize: '12px', textDecoration: 'none' }}>
              Ver todos los artículos →
            </Link>
          </div>
        </>
      );
    }
    return (
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {!gamesLoaded && <p style={{ color: 'var(--pnl-muted)', fontSize: '12px', padding: '1rem 1.25rem' }}>Cargando...</p>}
        {gamesLoaded && games.length === 0 && <EmptyState msg="Próximamente — los minijuegos están en camino." />}
        {games.map(g => <GameCard key={g.id} game={g} onNavigate={onNavigate} />)}
      </div>
    );
  }

  return (
    <>
      <style>{PANEL_STYLES}</style>

      {/* ══ TOP game float — below logo ══ */}
      {topGame && (
        <button
          onClick={() => setGameModal({ url: topGame.url, name: topGame.name })}
          className="top-game-float"
          aria-label={`Jugar a ${topGame.name}`}
          style={{
            position: 'fixed', top: '96px', left: '16px', zIndex: 50,
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 14px',
            background: 'var(--pnl-bg)',
            border: '1.5px solid rgba(0,231,235,0.6)',
            borderRadius: '10px', cursor: 'pointer', fontFamily: 'inherit',
            color: 'var(--pnl-text)',
            transition: 'transform 0.15s, border-color 0.15s',
            boxShadow: '0 2px 12px rgba(0,231,235,0.08)',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'rgba(0,231,235,1)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(0,231,235,0.6)'; }}
        >
          <span style={{ fontSize: '13px', background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.4)', borderRadius: '5px', padding: '1px 6px', color: '#ff6060', fontWeight: 700, letterSpacing: '0.5px', flexShrink: 0 }}>🔥 TOP</span>
          <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--pnl-text)', whiteSpace: 'nowrap' }}>Juega a {topGame.name}</span>
        </button>
      )}

      {/* ══════════════ DESKTOP ══════════════ */}

      {/* Toggle buttons (cuando el panel está cerrado) */}
      {!open && (
        <div
          className="hidden md:flex flex-col"
          style={{ position: 'fixed', top: '100px', right: '0', zIndex: 50, gap: '1px' }}
        >
          {(['blog', 'juegos'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setOpen(true); }}
              aria-label={tab === 'blog' ? 'Abrir panel de blog' : 'Abrir panel de juegos'}
              className="blog-toggle-btn flex flex-col items-center justify-center gap-1"
              style={{
                width: '34px', height: '54px',
                background: 'var(--pnl-bg)', border: '1px solid',
                borderRadius: tab === 'blog' ? '8px 0 0 0' : '0 0 0 8px',
                cursor: 'pointer', color: 'var(--primary)', fontFamily: 'inherit',
                borderRight: 'none', transition: 'width 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.width = '38px'; }}
              onMouseLeave={e => { e.currentTarget.style.width = '34px'; }}
            >
              {tab === 'blog' ? <BlogIcon size={14} /> : <GameIcon size={14} />}
              <span style={{ fontSize: '7px', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                {tab === 'blog' ? 'Blog' : 'Games'}
              </span>
            </button>
          ))}
        </div>
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
        {/* Header con tabs */}
        <div style={{ flexShrink: 0 }}>
          <div style={{ padding: '0.75rem 1.25rem 0', background: 'var(--pnl-hdr)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ color: 'var(--primary)', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700 }}>
              {activeTab === 'blog' ? 'Artículos técnicos' : 'Minijuegos'}
            </p>
            <button
              onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--pnl-muted)', fontSize: '20px', lineHeight: 1, padding: '2px 6px', borderRadius: '4px', fontFamily: 'inherit' }}
              aria-label="Cerrar"
            >×</button>
          </div>
          <div className="pnl-tab-bar">
            <button className={`pnl-tab${activeTab === 'blog' ? ' active' : ''}`} onClick={() => setActiveTab('blog')}>
              <BlogIcon size={12} /> Blog
            </button>
            <button className={`pnl-tab${activeTab === 'juegos' ? ' active' : ''}`} onClick={() => setActiveTab('juegos')}>
              <GameIcon size={12} /> Juegos
            </button>
          </div>
        </div>

        <PanelContent onNavigate={() => setOpen(false)} />
      </div>

      {/* ══════════════ MOBILE ══════════════ */}

      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        aria-label="Abrir panel"
        className="blog-toggle-btn md:hidden flex flex-col items-center justify-center gap-1"
        style={{
          position: 'fixed', bottom: '56px', right: '8px', zIndex: 50,
          width: '36px', height: '54px',
          background: 'transparent', border: '1px solid',
          borderRadius: '10px', cursor: 'pointer',
          color: 'var(--primary)', fontFamily: 'inherit',
        }}
      >
        <BlogIcon size={13} />
        <GameIcon size={13} />
      </button>

      {/* Mobile fullscreen overlay */}
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
        <div style={{ flexShrink: 0 }}>
          <div style={{ padding: '1rem 1.25rem', background: 'var(--pnl-hdr)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button
              onClick={() => setMobileOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--pnl-muted)', fontSize: '13px', fontFamily: 'inherit', padding: 0, display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              ← Volver al portfolio
            </button>
            <span style={{ color: 'var(--primary)', fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
              {activeTab === 'blog' ? 'Blog' : 'Juegos'}
            </span>
          </div>
          <div className="pnl-tab-bar">
            <button className={`pnl-tab${activeTab === 'blog' ? ' active' : ''}`} onClick={() => setActiveTab('blog')}>
              <BlogIcon size={12} /> Blog
            </button>
            <button className={`pnl-tab${activeTab === 'juegos' ? ' active' : ''}`} onClick={() => setActiveTab('juegos')}>
              <GameIcon size={12} /> Juegos
            </button>
          </div>
        </div>

        <PanelContent onNavigate={() => setMobileOpen(false)} />
      </div>

      {/* ══ Game iframe modal ══ */}
      {gameModal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.92)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '16px',
          }}
          onClick={e => { if (e.target === e.currentTarget) setGameModal(null); }}
        >
          <div style={{ width: '100%', maxWidth: '640px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ color: '#e8e6e0', fontSize: '15px', fontWeight: 600 }}>{gameModal.name}</span>
              <button
                onClick={() => setGameModal(null)}
                style={{ color: '#666', background: 'none', border: 'none', cursor: 'pointer', fontSize: '28px', lineHeight: 1, padding: '0 4px', fontFamily: 'inherit' }}
                aria-label="Cerrar juego"
              >×</button>
            </div>
            <div style={{ border: '2px solid rgba(0,231,235,0.35)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 0 32px rgba(0,231,235,0.08)' }}>
              <iframe
                src={gameModal.url}
                style={{ width: '100%', aspectRatio: '1 / 1', border: 'none', display: 'block', background: '#0a0a0a' }}
                title={gameModal.name}
                allow="fullscreen"
              />
            </div>
            <p style={{ color: '#2a2a2a', fontSize: '10px', textAlign: 'center', marginTop: '8px' }}>Esc o click fuera para cerrar</p>
          </div>
        </div>
      )}
    </>
  );
}
