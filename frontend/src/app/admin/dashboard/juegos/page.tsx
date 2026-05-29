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
  created_at: string;
}

type View = 'list' | 'editor';

const EMPTY: Omit<Game, 'id' | 'created_at'> = {
  name: '', slug: '', description: '', url: '', screenshot: '', is_top: 0,
};

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
        // Crop centrado para rellenar 16:9
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
  const [view,         setView]         = useState<View>('list');
  const [games,        setGames]        = useState<Game[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [deleting,     setDeleting]     = useState<number | null>(null);
  const [msg,          setMsg]          = useState('');
  const [imgUploading, setImgUploading] = useState(false);
  const [form,         setForm]         = useState<Omit<Game, 'id' | 'created_at'>>(EMPTY);
  const [editId,       setEditId]       = useState<number | null>(null);

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
    setForm({ name: g.name, slug: g.slug, description: g.description, url: g.url, screenshot: g.screenshot, is_top: g.is_top });
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

        {view === 'list' ? (
          <>
            <div style={{ marginBottom: '1.5rem' }}>
              <h1 style={{ color: 'var(--adm-text)', fontSize: '18px', fontWeight: 500 }}>Juegos</h1>
              <p style={{ color: 'var(--adm-muted)', fontSize: '11px', marginTop: '2px' }}>{games.length} juego{games.length !== 1 ? 's' : ''} — el TOP lo decide la comunidad · tú marcas tu Favorito</p>
            </div>

            {loading && <p style={{ color: 'var(--adm-muted)', fontSize: '13px' }}>Cargando...</p>}

            {!loading && games.length === 0 && (
              <div style={{ background: 'var(--adm-card)', border: '1px solid var(--adm-border)', borderRadius: '10px', padding: '2rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--adm-muted)', fontSize: '13px' }}>Los juegos se añaden desde el código.</p>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {games.map(g => (
                <div key={g.id} style={{ background: 'var(--adm-card)', border: `1px solid ${g.is_top ? '#ffc80040' : 'var(--adm-border)'}`, borderRadius: '10px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {g.screenshot ? (
                    <img src={g.screenshot} alt="" style={{ width: '56px', height: '40px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: '56px', height: '40px', borderRadius: '6px', background: 'var(--adm-border)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🎮</div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px', flexWrap: 'wrap' }}>
                      <span style={{ color: 'var(--adm-text)', fontSize: '14px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.name}</span>
                      {g.is_top === 1 && (
                        <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '10px', background: '#ffc80020', color: '#ffc800', border: '1px solid #ffc80040', flexShrink: 0 }}>⭐ Favorito</span>
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
        ) : (
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

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: 'var(--adm-card)', border: '1px solid var(--adm-border)', borderRadius: '8px' }}>
                <label style={{ color: 'var(--adm-text)', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" checked={form.is_top === 1} onChange={e => set('is_top', e.target.checked ? 1 : 0)} style={{ width: '16px', height: '16px', accentColor: '#ffc800' }} />
                  ⭐ Marcar como Favorito (el TOP lo decide la comunidad con reacciones)
                </label>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
