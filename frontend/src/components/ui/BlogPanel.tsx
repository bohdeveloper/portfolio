'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Post {
  id: number; slug: string; title: string; excerpt: string;
  cover_image: string; reading_time: number; created_at: string;
  ai_generated: number;
}
interface Game {
  id: number; name: string; slug: string; description: string;
  url: string; screenshot: string; is_top: number;
  vote_count: number; is_community_top: number;
  ai_generated: number;
  reactions: Record<string, number>;
}
interface Leader  { rank: number; alias: string; score: number; visitor_id: number }
interface Visitor { id: number; alias: string }

type Tab = 'blog' | 'juegos';

const MEDALS = ['🥇', '🥈', '🥉'];

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
  @keyframes pnlRankUp   { 0%{transform:translateY(5px);opacity:.5} 60%{transform:translateY(-2px)} 100%{transform:translateY(0);opacity:1} }
  @keyframes pnlRankDown { 0%{background:rgba(255,50,50,.22);transform:translateY(-3px)} 100%{background:transparent;transform:translateY(0)} }
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
  .pnl-game-grid { display: grid; grid-template-columns: minmax(0,1fr) 240px; gap: 16px; align-items: start; }
  @media(max-width:640px){ .pnl-game-grid { grid-template-columns: 1fr !important; } }
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
  const [open,           setOpen]           = useState(false);
  const [mobileOpen,     setMobileOpen]     = useState(false);
  const [activeTab,      setActiveTab]      = useState<Tab>('blog');
  const [posts,          setPosts]          = useState<Post[]>([]);
  const [games,          setGames]          = useState<Game[]>([]);
  const [postsLoaded,    setPostsLoaded]    = useState(false);
  const [gamesLoaded,    setGamesLoaded]    = useState(false);
  const [topGame,        setTopGame]        = useState<Game | null>(null);
  const [gameReacted,    setGameReacted]    = useState<Record<string, Set<string>>>({});
  const [gameCounts,     setGameCounts]     = useState<Record<number, Record<string, number>>>({});
  const [gameModal,      setGameModal]      = useState<{ url: string; name: string; id: number } | null>(null);

  // Visitor / login
  const [pnlVisitor,     setPnlVisitor]     = useState<Visitor | null>(null);
  const [pnlShowLogin,   setPnlShowLogin]   = useState(false);
  const [pnlLoginAlias,  setPnlLoginAlias]  = useState('');
  const [pnlLoginSaving, setPnlLoginSaving] = useState(false);
  const [pnlPendingScore,setPnlPendingScore]= useState<number | null>(null);
  const [pnlScoreResult, setPnlScoreResult] = useState<{ score: number; rank: number; isRecord: boolean } | null>(null);
  // Ranking live
  const [pnlLeaders,     setPnlLeaders]     = useState<Leader[]>([]);
  const [pnlLiveScore,   setPnlLiveScore]   = useState<number | null>(null);
  const [pnlMeKey,       setPnlMeKey]       = useState(0);
  const [pnlPassedKey,   setPnlPassedKey]   = useState<{ id: number; k: number } | null>(null);
  const pnlIframeRef  = useRef<HTMLIFrameElement>(null);
  const pnlPrevRank   = useRef<number | null>(null);
  const pnlDisplayRef = useRef<Leader[]>([]);

  // El panel se oculta completamente en rutas de admin y blog para no interferir
  const hide = pathname.startsWith('/admin') || pathname.startsWith('/blog');

  // Cargar visitor desde localStorage
  useEffect(() => {
    try {
      const v = localStorage.getItem('boh_visitor');
      if (v) {
        const parsed = JSON.parse(v) as Visitor;
        fetch(`/api/games/visitor?id=${parsed.id}`)
          .then(r => r.json())
          .then((res: { ok: boolean; id?: number; alias?: string }) => {
            if (res.ok) setPnlVisitor({ id: res.id!, alias: res.alias! });
            else localStorage.removeItem('boh_visitor');
          }).catch(() => {});
      }
    } catch {}
  }, []);

  // Al montar (y si la ruta es visible), precarga posts y juegos en paralelo
  // y abre el panel lateral automáticamente en desktop
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
          // Prioridad del TOP: campo explícito de la API > comunidad > favorito del admin
          setTopGame(res.top ?? gList.find((g: Game) => g.is_community_top === 1) ?? gList.find((g: Game) => g.is_top === 1) ?? null);
          const counts: Record<number, Record<string, number>> = {};
          for (const g of (res.games ?? [])) counts[g.id] = g.reactions;
          setGameCounts(counts);
        }
        setGamesLoaded(true);
      })
      .catch(() => setGamesLoaded(true));

    // Restaurar reacciones previas guardadas: se limita a 1 reacción por juego
    // (slice(0,1)) para mantener el invariante de una sola reacción activa
    try {
      const stored = localStorage.getItem('game_reacted');
      if (stored) {
        const parsed = JSON.parse(stored) as Record<string, string[]>;
        const result: Record<string, Set<string>> = {};
        for (const [key, arr] of Object.entries(parsed)) result[key] = new Set(arr.slice(0, 1));
        setGameReacted(result);
      }
    } catch {}

    setOpen(true);
  }, [hide]);

  // Cargar leaderboard al abrir juego
  useEffect(() => {
    if (!gameModal) { setPnlLeaders([]); setPnlLiveScore(null); return; }
    fetch(`/api/games/score?game_id=${gameModal.id}&limit=10`)
      .then(r => r.json())
      .then((res: { ok: boolean; data?: Leader[] }) => { if (res.ok) setPnlLeaders(res.data ?? []); })
      .catch(() => {});
  }, [gameModal?.id]); // eslint-disable-line

  // Escucha mensajes postMessage que envía el iframe del juego:
  // - 'boh_score_live': puntuación en curso para actualizar el ranking en tiempo real
  // - 'boh_score': puntuación final al terminar la partida; si no hay visitor
  //   registrado, guarda la puntuación como pendiente y abre el modal de login
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (!gameModal) return;
      if (e.data?.type === 'boh_score_live') {
        setPnlLiveScore(Number(e.data.score) || 0);
        return;
      }
      if (e.data?.type !== 'boh_score') return;
      const score = Number(e.data.score) || 0;
      if (pnlVisitor) {
        pnlSubmitScore(gameModal.id, pnlVisitor.id, score);
      } else {
        setPnlPendingScore(score);
        setPnlShowLogin(true);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [gameModal, pnlVisitor]); // eslint-disable-line

  // Construye el ranking visible en tiempo real: toma el leaderboard guardado,
  // elimina al jugador actual (para evitar duplicados), lo inserta en la posición
  // correcta según su puntuación en curso y recalcula los rangos del top 10
  const pnlDisplay = useMemo(() => {
    let d = [...pnlLeaders];
    if (pnlVisitor && pnlLiveScore !== null && pnlLiveScore > 0) {
      d = d.filter(l => l.visitor_id !== pnlVisitor!.id);
      const ins = d.findIndex(l => l.score < pnlLiveScore);
      const me: Leader = { rank: 0, alias: pnlVisitor!.alias, score: pnlLiveScore, visitor_id: pnlVisitor!.id };
      if (ins === -1) d.push(me);
      else d.splice(ins, 0, me);
      d = d.slice(0, 10).map((l, i) => ({ ...l, rank: i + 1 }));
    }
    return d;
  }, [pnlLeaders, pnlVisitor, pnlLiveScore]);

  pnlDisplayRef.current = pnlDisplay;
  const pnlMyRank = pnlDisplay.find(l => l.visitor_id === pnlVisitor?.id)?.rank ?? null;

  // Detecta cuando el jugador sube de posición en el ranking:
  // - Incrementa pnlMeKey para forzar la animación de subida en la fila propia
  // - Marca durante 700ms al jugador que acaba de ser superado para animarlo
  useEffect(() => {
    const prev = pnlPrevRank.current;
    pnlPrevRank.current = pnlMyRank;
    if (pnlMyRank !== null && prev !== null && pnlMyRank < prev) {
      const passed = pnlDisplayRef.current.find(l => l.rank === pnlMyRank + 1 && l.visitor_id !== pnlVisitor?.id);
      setPnlMeKey(k => k + 1);
      if (passed) {
        const k = Date.now();
        setPnlPassedKey({ id: passed.visitor_id, k });
        setTimeout(() => setPnlPassedKey(p => p?.k === k ? null : p), 700);
      }
    }
  }, [pnlMyRank]); // eslint-disable-line

  function pnlLoadLeaderboard(gameId: number) {
    fetch(`/api/games/score?game_id=${gameId}&limit=10`)
      .then(r => r.json())
      .then((res: { ok: boolean; data?: Leader[] }) => { if (res.ok) setPnlLeaders(res.data ?? []); })
      .catch(() => {});
  }

  function pnlSubmitScore(gameId: number, visitorId: number, score: number) {
    fetch('/api/games/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ game_id: gameId, visitor_id: visitorId, score }),
    }).then(r => r.json())
      .then((res: { ok: boolean; rank?: number; isRecord?: boolean }) => {
        if (res.ok) {
          setPnlScoreResult({ score, rank: res.rank ?? 99, isRecord: !!res.isRecord });
          pnlLoadLeaderboard(gameId);
          // Notificar a la sección Juegos para que refresque el ranking de la tarjeta
          window.dispatchEvent(new CustomEvent('boh_leaderboard_refresh', { detail: { gameId } }));
        }
      }).catch(() => {});
  }

  async function handlePnlLogin() {
    if (!pnlLoginAlias.trim()) return;
    setPnlLoginSaving(true);
    try {
      const res = await fetch('/api/games/visitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alias: pnlLoginAlias.trim() }),
      });
      const data: { ok: boolean; id?: number; alias?: string } = await res.json();
      if (data.ok && data.id) {
        const v = { id: data.id, alias: data.alias! };
        setPnlVisitor(v);
        try { localStorage.setItem('boh_visitor', JSON.stringify(v)); } catch {}
        setPnlShowLogin(false);
        setPnlLoginAlias('');
        if (pnlPendingScore !== null && gameModal) {
          pnlSubmitScore(gameModal.id, data.id, pnlPendingScore);
          setPnlPendingScore(null);
        }
      }
    } catch {}
    setPnlLoginSaving(false);
  }

  function openGame(game: { url: string; name: string; id: number }) {
    setGameModal(game);
    setPnlScoreResult(null);
    setPnlLiveScore(null);
    pnlPrevRank.current = null;
  }

  if (hide) return null;

  function openOnTab(tab: Tab) {
    setActiveTab(tab);
    setOpen(true);
    setMobileOpen(true);
  }

  // Sistema de reacciones con actualización optimista:
  // 1. Se aplica el cambio localmente de forma inmediata (UX fluida)
  // 2. Se persiste en localStorage para que sobreviva recargas
  // 3. Si el usuario cambia de emoji, se envía primero el delta -1 del anterior
  //    y luego el delta +1 del nuevo (dos llamadas independientes a la API)
  // 4. La respuesta de la API reconcilia el contador definitivo contra el optimista
  function reactToGame(gameId: number, emoji: string) {
    const key = String(gameId);
    const reacted = gameReacted[key] ?? new Set<string>();
    const current = [...reacted][0];
    const isToggling = current === emoji;
    const newReacted = new Set<string>(isToggling ? [] : [emoji]);

    const newMap = { ...gameReacted, [key]: newReacted };
    setGameReacted(newMap);
    try {
      const toStore: Record<string, string[]> = {};
      for (const [k, v] of Object.entries(newMap)) toStore[k] = [...v];
      localStorage.setItem('game_reacted', JSON.stringify(toStore));
    } catch {}

    setGameCounts(prev => {
      const c = { ...prev[gameId] };
      if (current && !isToggling) c[current] = Math.max(0, (c[current] ?? 0) - 1);
      c[emoji] = Math.max(0, (c[emoji] ?? 0) + (isToggling ? -1 : 1));
      return { ...prev, [gameId]: c };
    });

    if (current && !isToggling) {
      fetch('/api/games/react', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game_id: gameId, emoji: current, delta: -1 }),
      }).catch(() => {});
    }
    fetch('/api/games/react', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ game_id: gameId, emoji, delta: isToggling ? -1 : 1 }),
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
        <p style={{ color: 'var(--pnl-muted)', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span>{fmtDate(post.created_at)} · {post.reading_time} min</span>
          {post.ai_generated === 1 && (
            <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.4px', padding: '1px 5px', borderRadius: '3px', border: '1px solid rgba(0,231,235,0.3)', color: 'var(--primary)', background: 'rgba(0,231,235,0.06)', opacity: 0.8 }}>✦ IA</span>
          )}
        </p>
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
          <div style={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden', borderRadius: '6px', marginBottom: '8px', background: '#0a0a0a' }}>
            <img src={game.screenshot} alt={game.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        ) : (
          <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: '6px', background: 'var(--pnl-border)', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🎮</div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', flexWrap: 'wrap' }}>
          <h3 style={{ color: 'var(--pnl-text)', fontSize: '13px', fontWeight: 500, margin: 0 }}>{game.name}</h3>
          {game.ai_generated === 1 && (
            <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.4px', padding: '1px 5px', borderRadius: '3px', border: '1px solid rgba(0,231,235,0.3)', color: 'var(--primary)', background: 'rgba(0,231,235,0.06)', opacity: 0.8, flexShrink: 0 }}>✦ IA</span>
          )}
        </div>
        {game.description && (
          <p style={{ color: 'var(--pnl-muted)', fontSize: '11px', lineHeight: '1.5', marginBottom: '8px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{game.description}</p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
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
          {game.url ? (
            <button
              onClick={() => {
                if (game.url.startsWith('/')) {
                  openGame({ url: game.url, name: game.name, id: game.id });
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

      {/* ══════════════ DESKTOP ══════════════ */}

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

      {/* Panel lateral desktop: se desliza desde la derecha con CSS transform.
          Siempre está montado en el DOM; open controla si está visible u oculto
          para preservar el estado de scroll y evitar recargar los datos. */}
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

      {/* Botón flotante visible solo en móvil; combina los dos iconos para indicar
          que hay tanto blog como juegos disponibles en el panel */}
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

      {/* Panel móvil a pantalla completa: entra desde abajo con translateY.
          Usa inset: 0 para cubrir también la barra de navegación del portfolio. */}
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

      {/* ══ Game modal con ranking + login ══ */}
      {gameModal && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
            onClick={e => { if (e.target === e.currentTarget) { setGameModal(null); setPnlLiveScore(null); } }}
          >
            <div className="pnl-game-grid" style={{ width: '100%', maxWidth: '900px' }}>
              {/* Izquierda: juego */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ color: '#e8e6e0', fontSize: '15px', fontWeight: 600 }}>🎮 {gameModal.name}</span>
                  <button
                    onClick={() => { setGameModal(null); setPnlLiveScore(null); }}
                    style={{ color: '#666', background: 'none', border: 'none', cursor: 'pointer', fontSize: '26px', lineHeight: 1, fontFamily: 'inherit' }}
                    aria-label="Cerrar"
                  >×</button>
                </div>
                {/* El iframe se crea directamente con src al abrir el modal:
                    no hay lazy-load extra porque gameModal solo se establece
                    cuando el usuario pulsa "Jugar", lo que ya actúa como lazy trigger */}
                <iframe
                  ref={pnlIframeRef}
                  src={gameModal.url}
                  style={{ width: '100%', aspectRatio: '1/1', border: 'none', borderRadius: '10px', display: 'block', background: '#0a0a0a' }}
                  title={gameModal.name}
                  allow="fullscreen"
                />
                {!pnlVisitor && !pnlShowLogin && (
                  <p style={{ color: '#888', fontSize: '11px', textAlign: 'center', marginTop: '8px' }}>
                    <button
                      onClick={() => setPnlShowLogin(true)}
                      style={{ color: '#00e7eb', background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', fontFamily: 'inherit', textDecoration: 'underline', padding: 0 }}
                    >Inicia sesión</button>{' '}para guardar tu puntuación en el ranking
                  </p>
                )}
                {pnlVisitor && (
                  <div style={{ marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: 'rgba(0,231,235,0.08)', border: '1px solid rgba(0,231,235,0.2)', borderRadius: '20px' }}>
                    <span style={{ fontSize: '12px', color: '#00e7eb' }}>🎮 {pnlVisitor.alias}</span>
                  </div>
                )}
              </div>

              {/* Derecha: ranking */}
              <div style={{ background: '#111', border: '1px solid #1f2937', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <p style={{ color: '#9ca3af', fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 600, marginBottom: '10px' }}>Ranking</p>
                  {pnlDisplay.length === 0 && (
                    <p style={{ color: '#888', fontSize: '11px', fontStyle: 'italic', margin: 0 }}>Sé el primero en jugar</p>
                  )}
                  {pnlDisplay.map(l => {
                    const isMe     = l.visitor_id === pnlVisitor?.id;
                    const isPodium = l.rank <= 3;
                    const isPassed = pnlPassedKey?.id === l.visitor_id;
                    // La key cambia al subir de posición (meKey) o al superar a alguien
                    // (passedKey), forzando el remontaje y disparando pnlRankUp / pnlRankDown
                    const rowKey   = isMe ? `me-${pnlMeKey}` : isPassed ? `passed-${pnlPassedKey?.k}` : `p-${l.visitor_id}`;
                    return (
                      <div key={rowKey} style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: isPodium ? '6px 4px' : '4px 4px',
                        borderBottom: l.rank < pnlDisplay.length ? '1px solid rgba(255,255,255,0.04)' : 'none',
                        borderRadius: '4px',
                        background: isMe ? 'rgba(0,231,235,0.09)' : 'transparent',
                        animation: isMe ? 'pnlRankUp 0.5s ease' : isPassed ? 'pnlRankDown 0.4s ease' : 'none',
                      }}>
                        <span style={{ width: '24px', textAlign: 'center', flexShrink: 0, fontSize: isPodium ? '16px' : '10px', fontWeight: isPodium ? 700 : 500, color: isPodium ? undefined : '#666' }}>
                          {isPodium ? MEDALS[l.rank - 1] : `#${l.rank}`}
                        </span>
                        <span style={{ flex: 1, fontSize: isPodium ? '13px' : '11px', color: isMe ? '#00e7eb' : '#d1d5db', fontWeight: isMe ? 700 : isPodium ? 500 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {l.alias}{isMe ? ' ← tú' : ''}
                        </span>
                        <span style={{ fontSize: isPodium ? '13px' : '11px', fontWeight: 700, color: isMe ? '#00e7eb' : isPodium ? '#00e7eb' : '#666', fontVariantNumeric: 'tabular-nums' }}>
                          {l.score}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {pnlScoreResult && (
                  <div style={{ borderTop: '1px solid #1f2937', paddingTop: '16px' }}>
                    <p style={{ color: '#9ca3af', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>Tu partida</p>
                    <p style={{ color: '#00e7eb', fontSize: '32px', fontWeight: 800, margin: '0 0 4px', lineHeight: 1 }}>{pnlScoreResult.score}</p>
                    <p style={{ color: pnlScoreResult.rank <= 3 ? '#ffc800' : '#6b7280', fontSize: '13px', marginBottom: '12px' }}>
                      {pnlScoreResult.isRecord ? '🏆 ¡Nuevo récord!' : pnlScoreResult.rank <= 3 ? `${MEDALS[pnlScoreResult.rank - 1]} Posición #${pnlScoreResult.rank}` : `Posición #${pnlScoreResult.rank}`}
                    </p>
                    <button
                      onClick={() => { setPnlScoreResult(null); pnlIframeRef.current?.contentWindow?.location.reload(); }}
                      style={{ width: '100%', padding: '8px', background: 'transparent', border: '1px solid #00e7eb', borderRadius: '7px', color: '#00e7eb', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                      Jugar de nuevo
                    </button>
                  </div>
                )}

                {!pnlScoreResult && (
                  <p style={{ color: '#888', fontSize: '11px', lineHeight: 1.5 }}>Juega y supera el récord para aparecer aquí</p>
                )}
              </div>
            </div>
          </div>

          {/* Login modal */}
          {pnlShowLogin && (
            <div
              style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
              onClick={e => { if (e.target === e.currentTarget) setPnlShowLogin(false); }}
            >
              <div style={{ background: '#111', border: '1px solid #1f2937', borderRadius: '14px', padding: '2rem', width: '100%', maxWidth: '340px', textAlign: 'center' }}>
                <p style={{ fontSize: '32px', marginBottom: '12px' }}>🎮</p>
                <h3 style={{ color: '#f3f4f6', fontSize: '16px', fontWeight: 500, marginBottom: '4px' }}>¿Cómo te llamas?</h3>
                <p style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '20px' }}>Solo tu alias — para el ranking de puntuaciones.</p>
                <input
                  type="text"
                  value={pnlLoginAlias}
                  onChange={e => setPnlLoginAlias(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handlePnlLogin(); }}
                  placeholder="Tu nombre o alias"
                  maxLength={30}
                  autoFocus
                  style={{ width: '100%', padding: '10px 14px', background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#f3f4f6', fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', marginBottom: '12px' }}
                />
                {pnlPendingScore !== null && (
                  <p style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '12px' }}>Puntuación a guardar: <strong style={{ color: '#00e7eb' }}>{pnlPendingScore}</strong></p>
                )}
                <button
                  onClick={handlePnlLogin}
                  disabled={pnlLoginSaving || !pnlLoginAlias.trim()}
                  style={{ width: '100%', padding: '10px', background: '#00e7eb', border: 'none', borderRadius: '8px', color: '#000', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', opacity: pnlLoginSaving || !pnlLoginAlias.trim() ? 0.5 : 1 }}
                >
                  {pnlLoginSaving ? 'Guardando...' : pnlPendingScore !== null ? 'Guardar en el ranking' : 'Continuar'}
                </button>
                <button
                  onClick={() => setPnlShowLogin(false)}
                  style={{ marginTop: '10px', background: 'none', border: 'none', color: '#9ca3af', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' }}
                >
                  Jugar sin registro
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
