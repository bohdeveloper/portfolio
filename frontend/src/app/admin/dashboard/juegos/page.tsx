'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Game {
  id: number;
  name: string;
  slug: string;
  description: string;
  url: string;
  screenshot: string;
  is_top: number;
  ai_generated: number;
  sort_order: number;
  created_at: string;
}

interface Leader {
  rank: number;
  alias: string;
  score: number;
  visitor_id: number;
}

type View = 'list' | 'editor' | 'ranking';

const EMPTY: Omit<Game, 'id' | 'created_at'> = {
  name: '', slug: '', description: '', url: '', screenshot: '', is_top: 0, ai_generated: 0, sort_order: 0,
};

const MEDALS = ['🥇', '🥈', '🥉'];

const STYLES = `
  .gbtn { border-radius: 7px; font-size: 12px; font-weight: 500; cursor: pointer; font-family: inherit; background: transparent; padding: 7px 14px; transition: background 0.15s, color 0.15s, border-color 0.15s; }
  .gbtn:disabled { opacity: 0.5; cursor: not-allowed; pointer-events: none; }
  .gbtn-p { border: 1px solid var(--primary); color: var(--primary); }
  .gbtn-p:hover { background: var(--primary); color: #000; }
  .gbtn-d { border: 1px solid #D85A30; color: #D85A30; }
  .gbtn-d:hover { background: #D85A30; color: #fff; }
  .gbtn-g { border: 1px solid var(--adm-border); color: var(--adm-text); }
  .gbtn-g:hover { border-color: var(--primary); color: var(--primary); }
  .gbtn-top { border: 1px solid #ffc800; color: #ffc800; }
  .gbtn-top:hover { background: #ffc800; color: #000; }
  .gbtn-rank { border: 1px solid #6366f1; color: #818cf8; }
  .gbtn-rank:hover { background: #6366f1; color: #fff; }
  .rank-tab { padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: 500; cursor: pointer; font-family: inherit; border: 1px solid var(--adm-border); background: none; color: var(--adm-muted); transition: all 0.15s; }
  .rank-tab.active { background: var(--primary); border-color: var(--primary); color: #000; }
  .rank-tab:not(.active):hover { border-color: var(--primary); color: var(--primary); }
  .rank-header { display: grid; grid-template-columns: 40px 1fr 80px 100px; gap: 0; }
  .rank-row    { display: grid; grid-template-columns: 40px 1fr 80px 100px; align-items: center; gap: 0; }
  @media (max-width: 600px) {
    .rank-header { grid-template-columns: 36px 1fr 70px; }
    .rank-row    { grid-template-columns: 36px 1fr 70px; }
    .rank-col-actions { display: none !important; }
    .gbtn { padding: 6px 10px; }
  }
`;

function slugify(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 80);
}

function compressImage(file: File, tw = 800, th = 450, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = tw; canvas.height = th;
        const ctx = canvas.getContext('2d')!;
        const imgR = img.width / img.height;
        const tgtR = tw / th;
        let sw: number, sh: number, sx: number, sy: number;
        if (imgR > tgtR) {
          sh = img.height; sw = Math.round(img.height * tgtR);
          sy = 0;          sx = Math.round((img.width - sw) / 2);
        } else {
          sw = img.width;  sh = Math.round(img.width / tgtR);
          sx = 0;          sy = Math.round((img.height - sh) / 2);
        }
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, tw, th);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target!.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function JuegosAdminPage() {
  const router = useRouter();
  const [view,          setView]          = useState<View>('list');
  const [games,         setGames]         = useState<Game[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [saving,        setSaving]        = useState(false);
  const [deleting,      setDeleting]      = useState<number | null>(null);
  const [msg,           setMsg]           = useState('');
  const [imgUploading,  setImgUploading]  = useState(false);
  const [form,          setForm]          = useState<Omit<Game, 'id' | 'created_at'>>(EMPTY);
  const [editId,        setEditId]        = useState<number | null>(null);
  // Drag-and-drop reordering
  const [dragIdx,       setDragIdx]       = useState<number | null>(null);
  const [dragOverIdx,   setDragOverIdx]   = useState<number | null>(null);
  // Ranking
  const [rankGameId,    setRankGameId]    = useState<number | null>(null);
  const [rankLeaders,   setRankLeaders]   = useState<Leader[]>([]);
  const [rankLoading,   setRankLoading]   = useState(false);
  const [rankDeleting,  setRankDeleting]  = useState<number | null>(null);
  const [rankMsg,       setRankMsg]       = useState('');

  const inp: React.CSSProperties = {
    width: '100%', background: 'var(--adm-input)', border: '1px solid var(--adm-border)',
    borderRadius: '8px', padding: '9px 12px', color: 'var(--adm-text)', fontSize: '13px',
    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
  };
  const lbl: React.CSSProperties = {
    display: 'block', color: 'var(--adm-label)', fontSize: '11px',
    letterSpacing: '0.5px', marginBottom: '5px', textTransform: 'uppercase',
  };

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then((res: { ok: boolean; role?: string }) => {
        if (!res.ok || res.role !== 'super_admin') router.replace('/admin/dashboard');
      })
      .catch(() => router.replace('/admin/dashboard'));
  }, [router]);

  function loadGames() {
    setLoading(true);
    fetch('/api/games/list')
      .then(r => r.json())
      .then((res: { ok: boolean; games?: Game[] }) => { if (res.ok) setGames(res.games ?? []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }
  useEffect(loadGames, []);

  function loadRanking(gameId: number) {
    setRankLoading(true);
    setRankLeaders([]);
    setRankMsg('');
    fetch(`/api/games/score?game_id=${gameId}&limit=100&admin=true`)
      .then(r => r.json())
      .then((res: { ok: boolean; data?: Leader[] }) => {
        if (res.ok) setRankLeaders(res.data ?? []);
        else setRankMsg('Error al cargar el ranking');
      })
      .catch(() => setRankMsg('Error de conexión'))
      .finally(() => setRankLoading(false));
  }

  async function handleDeleteScore(visitorId: number, gameId: number) {
    if (!confirm('¿Eliminar todas las puntuaciones de este jugador en este juego?')) return;
    setRankDeleting(visitorId);
    try {
      const res = await fetch(`/api/games/score?visitor_id=${visitorId}&game_id=${gameId}`, { method: 'DELETE' });
      const data: { ok: boolean } = await res.json();
      if (data.ok) loadRanking(gameId);
      else setRankMsg('Error al eliminar');
    } catch { setRankMsg('Error de conexión'); }
    setRankDeleting(null);
  }

  function openRanking() {
    setView('ranking');
    const firstGame = games[0];
    if (firstGame && !rankGameId) {
      setRankGameId(firstGame.id);
      loadRanking(firstGame.id);
    } else if (rankGameId) {
      loadRanking(rankGameId);
    }
  }

  function set(k: keyof typeof form, v: string | number) {
    setForm(prev => {
      const next = { ...prev, [k]: v };
      if (k === 'name' && !editId) next.slug = slugify(v as string);
      return next;
    });
  }

  function openNew() {
    setEditId(null);
    setForm(EMPTY);
    setMsg('');
    setView('editor');
  }
  function openEdit(g: Game) {
    setEditId(g.id);
    setForm({ name: g.name, slug: g.slug, description: g.description, url: g.url, screenshot: g.screenshot, is_top: g.is_top, ai_generated: g.ai_generated ?? 0 });
    setMsg('');
    setView('editor');
  }

  async function handleSave() {
    if (!form.name.trim()) { setMsg('El nombre es obligatorio.'); return; }
    setSaving(true); setMsg('');
    try {
      const res = await fetch('/api/games/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...(editId ? { id: editId } : {}), ...form }),
      });
      const data: { ok: boolean; error?: string } = await res.json().catch(() => ({ ok: false, error: 'Respuesta inválida' }));
      if (data.ok) { setMsg('✓ Guardado'); loadGames(); setView('list'); }
      else setMsg('Error: ' + (data.error ?? 'desconocido'));
    } catch { setMsg('Error de conexión'); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar este juego?')) return;
    setDeleting(id);
    try {
      await fetch(`/api/games/manage?id=${id}`, { method: 'DELETE' });
      loadGames();
    } catch { /* ignore */ }
    setDeleting(null);
  }

  // Reordena localmente y persiste el nuevo orden en la BD via PUT /api/games/manage
  async function handleReorder(fromIdx: number, toIdx: number) {
    if (fromIdx === toIdx) return;
    const reordered = [...games];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    setGames(reordered);
    setDragIdx(null);
    setDragOverIdx(null);
    try {
      await fetch('/api/games/manage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: reordered.map(g => g.id) }),
      });
    } catch { /* orden local ya actualizado */ }
  }

  async function handleSetTop(id: number) {
    try {
      await fetch(`/api/games/manage?id=${id}`, { method: 'PATCH' });
      loadGames();
    } catch { /* ignore */ }
  }

  async function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImgUploading(true);
    try { set('screenshot', await compressImage(file)); } catch { /* ignore */ }
    setImgUploading(false);
    e.target.value = '';
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 88px)', background: 'var(--adm-bg)', fontFamily: 'system-ui, sans-serif', padding: '1.5rem' }}>
      <style>{STYLES}</style>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        {/* ── Lista de juegos ── */}
        {view === 'list' && (
          <>
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h1 style={{ color: 'var(--adm-text)', fontSize: '18px', fontWeight: 500 }}>Juegos</h1>
                <p style={{ color: 'var(--adm-muted)', fontSize: '11px', marginTop: '2px' }}>{games.length} juego{games.length !== 1 ? 's' : ''} — arrastra ⠿ para reordenar · el orden aquí es el orden en el portfolio</p>
              </div>
              <button className="gbtn gbtn-rank" onClick={openRanking}>🏆 Ranking</button>
            </div>

            {loading && <p style={{ color: 'var(--adm-muted)', fontSize: '13px' }}>Cargando...</p>}

            {!loading && games.length === 0 && (
              <div style={{ background: 'var(--adm-card)', border: '1px solid var(--adm-border)', borderRadius: '10px', padding: '2rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--adm-muted)', fontSize: '13px' }}>Los juegos se añaden desde el código.</p>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {games.map((g, i) => (
                <div
                  key={g.id}
                  draggable
                  onDragStart={() => setDragIdx(i)}
                  onDragOver={e => { e.preventDefault(); setDragOverIdx(i); }}
                  onDragLeave={() => setDragOverIdx(null)}
                  onDrop={e => { e.preventDefault(); if(dragIdx !== null) handleReorder(dragIdx, i); }}
                  onDragEnd={() => { setDragIdx(null); setDragOverIdx(null); }}
                  style={{
                    background: 'var(--adm-card)',
                    border: `1px solid ${dragOverIdx === i && dragIdx !== i ? 'var(--primary)' : g.is_top ? '#ffc80040' : 'var(--adm-border)'}`,
                    borderRadius: '10px', padding: '0.9rem 1.25rem',
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    opacity: dragIdx === i ? 0.45 : 1,
                    transition: 'opacity 0.15s, border-color 0.12s',
                    boxShadow: dragOverIdx === i && dragIdx !== i ? '0 0 0 2px rgba(0,231,235,0.2)' : undefined,
                  }}
                >
                  {/* Grip handle — arrastrar para reordenar */}
                  <span
                    title="Arrastrar para reordenar"
                    style={{ color: 'var(--adm-muted)', cursor: 'grab', fontSize: '16px', flexShrink: 0, lineHeight: 1, userSelect: 'none', paddingRight: '4px' }}
                  >⠿</span>

                  {g.screenshot ? (
                    <img src={g.screenshot} alt="" style={{ width: '56px', height: '40px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: '56px', height: '40px', borderRadius: '6px', background: 'var(--adm-border)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🎮</div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px', flexWrap: 'wrap' }}>
                      <span style={{ color: 'var(--adm-muted)', fontSize: '10px', fontWeight: 500, flexShrink: 0, minWidth: '16px' }}>#{i + 1}</span>
                      <span style={{ color: 'var(--adm-text)', fontSize: '14px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.name}</span>
                      {g.is_top === 1 && (
                        <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '10px', background: '#ffc80020', color: '#ffc800', border: '1px solid #ffc80040', flexShrink: 0 }}>⭐ Favorito</span>
                      )}
                      {g.ai_generated === 1 && (
                        <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '10px', background: 'rgba(0,231,235,0.08)', color: 'var(--primary)', border: '1px solid rgba(0,231,235,0.25)', flexShrink: 0 }}>✦ IA</span>
                      )}
                    </div>
                    <div style={{ color: 'var(--adm-muted)', fontSize: '11px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {g.description && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>{g.description}</span>}
                      {g.url && <span style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>{g.url.slice(0, 40)}{g.url.length > 40 ? '...' : ''}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0, flexWrap: 'wrap' }}>
                    {g.is_top === 0 && (
                      <button className="gbtn gbtn-top" onClick={() => handleSetTop(g.id)} title="Marcar como Favorito">⭐ Favorito</button>
                    )}
                    <button className="gbtn gbtn-g" onClick={() => openEdit(g)}>Editar</button>
                    <button className="gbtn gbtn-d" onClick={() => handleDelete(g.id)} disabled={deleting === g.id}>Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Editor de juego ── */}
        {view === 'editor' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
              <button className="gbtn gbtn-g" style={{ padding: '6px 10px' }} onClick={() => setView('list')}>←</button>
              <h1 style={{ color: 'var(--adm-text)', fontSize: '16px', fontWeight: 500 }}>Editar juego</h1>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {msg && <span style={{ fontSize: '12px', color: msg.startsWith('✓') ? '#5DCAA5' : '#D85A30' }}>{msg}</span>}
                <button className="gbtn gbtn-p" onClick={handleSave} disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={lbl}>Nombre</label>
                  <input style={inp} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Mi primer juego" />
                </div>
                <div>
                  <label style={lbl}>Slug (URL)</label>
                  <input style={{ ...inp, fontFamily: 'monospace', fontSize: '12px' }} value={form.slug} onChange={e => set('slug', slugify(e.target.value))} placeholder="mi-primer-juego" />
                </div>
              </div>

              <div>
                <label style={lbl}>Descripción</label>
                <input style={inp} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Breve descripción del juego..." />
              </div>

              <div>
                <label style={lbl}>URL del juego</label>
                <input style={{ ...inp, opacity: 0.5, cursor: 'not-allowed' }} value={form.url} readOnly tabIndex={-1} />
                <p style={{ color: 'var(--adm-muted)', fontSize: '10px', marginTop: '4px' }}>La URL la gestiona el código del juego.</p>
              </div>

              <div>
                <label style={lbl}>Screenshot / Imagen</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <label htmlFor="game-img-input" className={`gbtn gbtn-g${imgUploading ? ' gbtn:disabled' : ''}`} style={{ display: 'inline-block', cursor: imgUploading ? 'not-allowed' : 'pointer', opacity: imgUploading ? 0.5 : 1 }}>
                    {imgUploading ? 'Procesando...' : (form.screenshot ? 'Cambiar imagen' : '+ Subir imagen')}
                  </label>
                  {form.screenshot && <button type="button" className="gbtn gbtn-d" onClick={() => set('screenshot', '')}>Quitar</button>}
                  <input id="game-img-input" type="file" accept="image/*" onChange={handleImageFile} disabled={imgUploading} style={{ display: 'none' }} />
                </div>
                {form.screenshot && (
                  <img src={form.screenshot} alt="" style={{ marginTop: '8px', width: '100%', maxHeight: '160px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--adm-border)' }} />
                )}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '20px', padding: '12px', background: 'var(--adm-card)', border: '1px solid var(--adm-border)', borderRadius: '8px' }}>
                <label style={{ color: 'var(--adm-text)', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" checked={form.is_top === 1} onChange={e => set('is_top', e.target.checked ? 1 : 0)} style={{ width: '16px', height: '16px', accentColor: '#ffc800' }} />
                  ⭐ Marcar como Favorito (el TOP lo decide la comunidad con reacciones)
                </label>
                <label style={{ color: 'var(--adm-text)', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }} title="Reglamento UE AI Act — obliga a etiquetar contenido donde la IA haya sido sustancial (desde agosto 2026)">
                  <input type="checkbox" checked={form.ai_generated === 1} onChange={e => set('ai_generated', e.target.checked ? 1 : 0)} style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }} />
                  <span>✦ Descripción generada con IA</span>
                  <span style={{ fontSize: '10px', color: 'var(--adm-muted)', fontWeight: 400 }}>(AI Act EU)</span>
                </label>
              </div>
            </div>
          </>
        )}

        {/* ── Ranking ── */}
        {view === 'ranking' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <button className="gbtn gbtn-g" style={{ padding: '6px 10px' }} onClick={() => setView('list')}>←</button>
              <h1 style={{ color: 'var(--adm-text)', fontSize: '16px', fontWeight: 500 }}>🏆 Ranking</h1>
              {rankMsg && <span style={{ fontSize: '12px', color: '#D85A30', marginLeft: 'auto' }}>{rankMsg}</span>}
            </div>

            {/* Tabs de juegos */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              {games.map(g => (
                <button
                  key={g.id}
                  className={`rank-tab${rankGameId === g.id ? ' active' : ''}`}
                  onClick={() => { setRankGameId(g.id); loadRanking(g.id); }}
                >
                  {g.name}
                </button>
              ))}
            </div>

            {/* Tabla de ranking */}
            <div style={{ background: 'var(--adm-card)', border: '1px solid var(--adm-border)', borderRadius: '10px', overflow: 'hidden' }}>
              {/* Header */}
              <div className="rank-header" style={{ padding: '8px 1rem', background: 'var(--adm-border)', fontSize: '10px', fontWeight: 700, color: 'var(--adm-muted)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                <span>#</span>
                <span>Jugador</span>
                <span style={{ textAlign: 'right' }}>Puntos</span>
                <span className="rank-col-actions" style={{ textAlign: 'right' }}>Acciones</span>
              </div>

              {rankLoading && (
                <p style={{ color: 'var(--adm-muted)', fontSize: '13px', padding: '1.5rem 1rem', textAlign: 'center' }}>Cargando...</p>
              )}

              {!rankLoading && rankLeaders.length === 0 && !rankMsg && rankGameId && (
                <p style={{ color: 'var(--adm-muted)', fontSize: '13px', padding: '1.5rem 1rem', textAlign: 'center', fontStyle: 'italic' }}>
                  Nadie ha jugado todavía
                </p>
              )}

              {!rankLoading && !rankGameId && (
                <p style={{ color: 'var(--adm-muted)', fontSize: '13px', padding: '1.5rem 1rem', textAlign: 'center', fontStyle: 'italic' }}>
                  Selecciona un juego arriba
                </p>
              )}

              {rankLeaders.map((l, idx) => (
                <div
                  key={l.visitor_id}
                  className="rank-row"
                  style={{
                    padding: '10px 1rem',
                    borderTop: idx > 0 ? '1px solid var(--adm-border)' : 'none',
                    background: rankDeleting === l.visitor_id ? 'rgba(216,90,48,0.05)' : 'none',
                  }}
                >
                  <span style={{ fontSize: l.rank <= 3 ? '18px' : '12px', color: l.rank <= 3 ? undefined : 'var(--adm-muted)', fontWeight: 600 }}>
                    {l.rank <= 3 ? MEDALS[l.rank - 1] : `#${l.rank}`}
                  </span>
                  <span style={{ color: 'var(--adm-text)', fontSize: '13px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {l.alias}
                  </span>
                  <span style={{ color: 'var(--primary)', fontSize: '14px', fontWeight: 700, fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>
                    {l.score}
                  </span>
                  <div className="rank-col-actions" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      className="gbtn gbtn-d"
                      style={{ padding: '4px 10px', fontSize: '11px' }}
                      disabled={rankDeleting === l.visitor_id}
                      onClick={() => rankGameId && handleDeleteScore(l.visitor_id, rankGameId)}
                    >
                      {rankDeleting === l.visitor_id ? '...' : 'Eliminar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {rankLeaders.length > 0 && (
              <p style={{ color: 'var(--adm-muted)', fontSize: '11px', marginTop: '8px', textAlign: 'right' }}>
                {rankLeaders.length} jugador{rankLeaders.length !== 1 ? 'es' : ''} — eliminar borra todas sus puntuaciones en este juego
              </p>
            )}
          </>
        )}

      </div>
    </div>
  );
}
