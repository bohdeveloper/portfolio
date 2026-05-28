'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface Game {
  id: number; name: string; slug: string; description: string;
  url: string; screenshot: string; is_top: number;
  reactions: Record<string, number>;
}
interface Leader { rank: number; alias: string; score: number; visitor_id: number }
interface Visitor { id: number; alias: string }

const MEDALS = ['🥇', '🥈', '🥉'];

/* ── Leaderboard mini ── */
function Leaderboard({ leaders, visitorId, className = '' }: { leaders: Leader[]; visitorId?: number; className?: string }) {
  if (leaders.length === 0) {
    return <p style={{ color: 'var(--jg-muted)', fontSize: '11px', fontStyle: 'italic', margin: 0 }}>Sé el primero en jugar</p>;
  }
  return (
    <div className={className}>
      {leaders.map(l => (
        <div key={l.rank} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '4px 0', borderBottom: l.rank < leaders.length ? '1px solid var(--jg-border-subtle)' : 'none',
          background: l.visitor_id === visitorId ? 'rgba(0,231,235,0.07)' : 'none',
          borderRadius: l.visitor_id === visitorId ? '4px' : 0,
          paddingLeft: l.visitor_id === visitorId ? '4px' : 0,
        }}>
          <span style={{ fontSize: '14px', width: '20px' }}>{MEDALS[l.rank - 1]}</span>
          <span style={{ flex: 1, fontSize: '12px', color: 'var(--jg-text)', fontWeight: l.visitor_id === visitorId ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {l.alias}{l.visitor_id === visitorId ? ' (tú)' : ''}
          </span>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--jg-primary)', fontVariantNumeric: 'tabular-nums' }}>{l.score}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Game card ── */
function GameCard({ game, leaders, isTop, visitorId, onPlay }: {
  game: Game; leaders: Leader[]; isTop: boolean; visitorId?: number; onPlay: () => void;
}) {
  return (
    <div style={{
      background: 'var(--jg-card)', border: `1px solid ${isTop ? 'rgba(0,231,235,0.3)' : 'var(--jg-border)'}`,
      borderRadius: '14px', overflow: 'hidden',
      boxShadow: isTop ? '0 0 24px rgba(0,231,235,0.08)' : 'none',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Screenshot */}
      <div style={{ position: 'relative', aspectRatio: isTop ? '16/7' : '16/9', overflow: 'hidden', background: '#0a0a0a' }}>
        {game.screenshot ? (
          <img src={game.screenshot} alt={game.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isTop ? '64px' : '40px', opacity: 0.4 }}>🎮</div>
        )}
        {isTop && (
          <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,231,235,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(0,231,235,0.4)', borderRadius: '6px', padding: '3px 10px', fontSize: '10px', fontWeight: 700, color: '#00e7eb', letterSpacing: '1px', textTransform: 'uppercase' }}>
            ⭐ Destacado
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: isTop ? '1.25rem' : '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div>
          <h3 style={{ color: 'var(--jg-text)', fontSize: isTop ? '18px' : '14px', fontWeight: 600, marginBottom: '4px' }}>{game.name}</h3>
          {game.description && <p style={{ color: 'var(--jg-muted)', fontSize: '12px', lineHeight: 1.55, margin: 0 }}>{game.description}</p>}
        </div>

        {/* Ranking */}
        <div>
          <p style={{ color: 'var(--jg-muted)', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 600, marginBottom: '6px' }}>Ranking</p>
          <Leaderboard leaders={leaders} visitorId={visitorId} />
        </div>

        <button
          onClick={onPlay}
          style={{
            marginTop: 'auto', padding: isTop ? '10px 0' : '8px 0',
            background: 'transparent', border: `1px solid var(--jg-primary)`,
            borderRadius: '8px', color: 'var(--jg-primary)',
            fontSize: isTop ? '14px' : '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            transition: 'background 0.18s, color 0.18s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--jg-primary)'; e.currentTarget.style.color = '#000'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--jg-primary)'; }}
        >
          Jugar →
        </button>
      </div>
    </div>
  );
}

/* ── Main section ── */
export default function JuegosSection() {
  const [games,        setGames]        = useState<Game[]>([]);
  const [loaded,       setLoaded]       = useState(false);
  const [leaders,      setLeaders]      = useState<Record<number, Leader[]>>({});
  const [activeGame,   setActiveGame]   = useState<Game | null>(null);
  const [visitor,      setVisitor]      = useState<Visitor | null>(null);
  const [showLogin,    setShowLogin]    = useState(false);
  const [loginAlias,   setLoginAlias]   = useState('');
  const [loginSaving,  setLoginSaving]  = useState(false);
  const [pendingScore, setPendingScore] = useState<number | null>(null);
  const [scoreResult,  setScoreResult]  = useState<{ score: number; rank: number; isRecord: boolean } | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const loadLeaderboard = useCallback((gameId: number) => {
    fetch(`/api/games/score?game_id=${gameId}&limit=3`)
      .then(r => r.json())
      .then((res: { ok: boolean; data?: Leader[] }) => {
        if (res.ok) setLeaders(prev => ({ ...prev, [gameId]: res.data ?? [] }));
      }).catch(() => {});
  }, []);

  useEffect(() => {
    fetch('/api/games/list')
      .then(r => r.json())
      .then((res: { ok: boolean; games?: Game[] }) => {
        if (res.ok) {
          setGames(res.games ?? []);
          for (const g of (res.games ?? [])) loadLeaderboard(g.id);
        }
        setLoaded(true);
      }).catch(() => setLoaded(true));

    // Restaurar visitante de localStorage
    try {
      const v = localStorage.getItem('boh_visitor');
      if (v) {
        const parsed = JSON.parse(v) as Visitor;
        // Verificar que sigue existiendo en BD
        fetch(`/api/games/visitor?id=${parsed.id}`)
          .then(r => r.json())
          .then((res: { ok: boolean; id?: number; alias?: string }) => {
            if (res.ok) setVisitor({ id: res.id!, alias: res.alias! });
            else { localStorage.removeItem('boh_visitor'); }
          }).catch(() => {});
      }
    } catch {}
  }, [loadLeaderboard]);

  // Escuchar postMessage del iframe
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type !== 'boh_score' || !activeGame) return;
      const score = Number(e.data.score) || 0;
      if (visitor) {
        doSubmitScore(activeGame.id, visitor.id, score);
      } else {
        setPendingScore(score);
        setShowLogin(true);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [activeGame, visitor]); // eslint-disable-line

  function doSubmitScore(gameId: number, visitorId: number, score: number) {
    fetch('/api/games/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ game_id: gameId, visitor_id: visitorId, score }),
    }).then(r => r.json())
      .then((res: { ok: boolean; rank?: number; isRecord?: boolean }) => {
        if (res.ok) {
          setScoreResult({ score, rank: res.rank ?? 99, isRecord: !!res.isRecord });
          loadLeaderboard(gameId);
        }
      }).catch(() => {});
  }

  async function handleLogin() {
    if (!loginAlias.trim()) return;
    setLoginSaving(true);
    try {
      const res = await fetch('/api/games/visitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alias: loginAlias.trim() }),
      });
      const data: { ok: boolean; id?: number; alias?: string } = await res.json();
      if (data.ok && data.id) {
        const v = { id: data.id, alias: data.alias! };
        setVisitor(v);
        try { localStorage.setItem('boh_visitor', JSON.stringify(v)); } catch {}
        setShowLogin(false);
        setLoginAlias('');
        if (pendingScore !== null && activeGame) {
          doSubmitScore(activeGame.id, data.id, pendingScore);
          setPendingScore(null);
        }
      }
    } catch {}
    setLoginSaving(false);
  }

  function playGame(game: Game) {
    setActiveGame(game);
    setScoreResult(null);
    setPendingScore(null);
  }

  function closeGame() {
    setActiveGame(null);
    setScoreResult(null);
    setShowLogin(false);
    setPendingScore(null);
  }

  if (!loaded || games.length === 0) return null;

  const topGame = games.find(g => g.is_top === 1) ?? null;
  const otherGames = games.filter(g => g.is_top !== 1);

  return (
    <>
      {/* CSS vars */}
      <style>{`
        html.light  { --jg-bg:#f9fafb; --jg-card:#fff; --jg-border:#e5e7eb; --jg-border-subtle:#f0f0f0; --jg-text:#111827; --jg-muted:#6b7280; --jg-primary:#00a8bf; }
        html.dark, html:not(.light) { --jg-bg:#0a0a0a; --jg-card:#111; --jg-border:#1f2937; --jg-border-subtle:#1a1a1a; --jg-text:#f3f4f6; --jg-muted:#9ca3af; --jg-primary:#00e7eb; }
      `}</style>

      <section id="juegos" style={{ background: 'var(--jg-bg)', padding: '5rem 1.5rem', fontFamily: 'system-ui,sans-serif' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>

          {/* Header */}
          <div style={{ marginBottom: '2.5rem' }}>
            <p style={{ color: 'var(--jg-primary)', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>Minijuegos</p>
            <h2 style={{ color: 'var(--jg-text)', fontSize: 'clamp(24px,4vw,36px)', fontWeight: 300, letterSpacing: '-0.5px', margin: 0 }}>
              Juega & compite
            </h2>
            <p style={{ color: 'var(--jg-muted)', fontSize: '14px', marginTop: '8px' }}>
              Juegos desarrollados para el portfolio. Supera el récord y entra en el ranking.
            </p>
            {visitor && (
              <div style={{ marginTop: '10px', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 12px', background: 'rgba(0,231,235,0.08)', border: '1px solid rgba(0,231,235,0.2)', borderRadius: '20px' }}>
                <span style={{ fontSize: '13px', color: 'var(--jg-primary)' }}>🎮 {visitor.alias}</span>
                <button onClick={() => { localStorage.removeItem('boh_visitor'); setVisitor(null); }} style={{ background: 'none', border: 'none', color: 'var(--jg-muted)', cursor: 'pointer', fontSize: '12px', padding: 0, fontFamily: 'inherit' }}>cambiar</button>
              </div>
            )}
          </div>

          {/* TOP game */}
          {topGame && (
            <div style={{ marginBottom: '1.5rem' }}>
              <GameCard game={topGame} leaders={leaders[topGame.id] ?? []} isTop visitorId={visitor?.id} onPlay={() => playGame(topGame)} />
            </div>
          )}

          {/* Other games grid */}
          {otherGames.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
              {otherGames.map(g => (
                <GameCard key={g.id} game={g} leaders={leaders[g.id] ?? []} isTop={false} visitorId={visitor?.id} onPlay={() => playGame(g)} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Game modal ── */}
      {activeGame && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
          onClick={e => { if (e.target === e.currentTarget) closeGame(); }}
        >
          <div style={{ width: '100%', maxWidth: '900px', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 280px', gap: '16px', alignItems: 'start' }}
               className="game-modal-grid">
            <style>{`@media(max-width:640px){.game-modal-grid{grid-template-columns:1fr!important}}`}</style>

            {/* Left: game + header */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ color: '#e8e6e0', fontSize: '15px', fontWeight: 600 }}>🎮 {activeGame.name}</span>
                <button onClick={closeGame} style={{ color: '#666', background: 'none', border: 'none', cursor: 'pointer', fontSize: '26px', lineHeight: 1, fontFamily: 'inherit' }} aria-label="Cerrar">×</button>
              </div>
              <iframe
                ref={iframeRef}
                src={activeGame.url || undefined}
                style={{ width: '100%', aspectRatio: '1/1', border: 'none', borderRadius: '10px', display: 'block', background: '#0a0a0a' }}
                title={activeGame.name}
                allow="fullscreen"
              />
              {!visitor && !showLogin && (
                <p style={{ color: '#444', fontSize: '11px', textAlign: 'center', marginTop: '8px' }}>
                  <button onClick={() => setShowLogin(true)} style={{ color: '#00e7eb', background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', fontFamily: 'inherit', textDecoration: 'underline', padding: 0 }}>
                    Inicia sesión
                  </button>{' '}para guardar tu puntuación en el ranking
                </p>
              )}
            </div>

            {/* Right: ranking + score result */}
            <div style={{ background: '#111', border: '1px solid #1f2937', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <p style={{ color: '#9ca3af', fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 600, marginBottom: '10px' }}>Ranking</p>
                <Leaderboard leaders={leaders[activeGame.id] ?? []} visitorId={visitor?.id} />
              </div>

              {scoreResult && (
                <div style={{ borderTop: '1px solid #1f2937', paddingTop: '16px' }}>
                  <p style={{ color: '#9ca3af', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>Tu partida</p>
                  <p style={{ color: '#00e7eb', fontSize: '32px', fontWeight: 800, margin: '0 0 4px', lineHeight: 1 }}>{scoreResult.score}</p>
                  <p style={{ color: scoreResult.rank <= 3 ? '#ffc800' : '#6b7280', fontSize: '13px', marginBottom: '12px' }}>
                    {scoreResult.isRecord ? '🏆 ¡Nuevo récord!' : scoreResult.rank <= 3 ? `${MEDALS[scoreResult.rank - 1]} Posición #${scoreResult.rank}` : `Posición #${scoreResult.rank}`}
                  </p>
                  <button
                    onClick={() => { setScoreResult(null); iframeRef.current?.contentWindow?.location.reload(); }}
                    style={{ width: '100%', padding: '8px', background: 'transparent', border: '1px solid #00e7eb', borderRadius: '7px', color: '#00e7eb', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    Jugar de nuevo
                  </button>
                </div>
              )}

              {!scoreResult && (
                <p style={{ color: '#333', fontSize: '11px', lineHeight: 1.5 }}>Juega y supera el récord para aparecer aquí</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Mini login modal ── */}
      {showLogin && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
          onClick={e => { if (e.target === e.currentTarget) setShowLogin(false); }}>
          <div style={{ background: '#111', border: '1px solid #1f2937', borderRadius: '14px', padding: '2rem', width: '100%', maxWidth: '340px', textAlign: 'center' }}>
            <p style={{ fontSize: '32px', marginBottom: '12px' }}>🎮</p>
            <h3 style={{ color: '#f3f4f6', fontSize: '16px', fontWeight: 500, marginBottom: '4px' }}>¿Cómo te llamas?</h3>
            <p style={{ color: '#6b7280', fontSize: '12px', marginBottom: '20px' }}>
              Solo tu alias — para el ranking de puntuaciones.
            </p>
            <input
              type="text"
              value={loginAlias}
              onChange={e => setLoginAlias(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleLogin(); }}
              placeholder="Tu nombre o alias"
              maxLength={30}
              autoFocus
              style={{ width: '100%', padding: '10px 14px', background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#f3f4f6', fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', marginBottom: '12px' }}
            />
            {pendingScore !== null && (
              <p style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '12px' }}>Puntuación a guardar: <strong style={{ color: '#00e7eb' }}>{pendingScore}</strong></p>
            )}
            <button
              onClick={handleLogin}
              disabled={loginSaving || !loginAlias.trim()}
              style={{ width: '100%', padding: '10px', background: '#00e7eb', border: 'none', borderRadius: '8px', color: '#000', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', opacity: loginSaving || !loginAlias.trim() ? 0.5 : 1 }}
            >
              {loginSaving ? 'Guardando...' : pendingScore !== null ? 'Guardar en el ranking' : 'Continuar'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
