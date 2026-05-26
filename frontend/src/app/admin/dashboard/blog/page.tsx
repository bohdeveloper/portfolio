'use client';

import { useEffect, useState } from 'react';

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
  updated_at: string;
}

type View = 'list' | 'editor';

const EMPTY: Omit<Post, 'id' | 'views' | 'created_at' | 'updated_at'> = {
  slug: '', title: '', excerpt: '', content: '', cover_image: '', tags: '', published: 0, reading_time: 0,
};

const BLOG_STYLES = `
  .abtn {
    border-radius: 7px; font-size: 12px; font-weight: 500; cursor: pointer;
    font-family: inherit; transition: background 0.15s, color 0.15s, border-color 0.15s;
    background: transparent; padding: 7px 14px;
  }
  .abtn:disabled { opacity: 0.5; cursor: not-allowed; pointer-events: none; }
  .abtn-p { border: 1px solid var(--primary); color: var(--primary); }
  .abtn-p:hover { background: var(--primary); color: #000; }
  .abtn-d { border: 1px solid #D85A30; color: #D85A30; }
  .abtn-d:hover { background: #D85A30; color: #fff; }
  .abtn-g { border: 1px solid var(--adm-border); color: var(--adm-text); }
  .abtn-g:hover { border-color: var(--primary); color: var(--primary); }
`;

function slugify(title: string) {
  return title.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '').trim()
    .replace(/\s+/g, '-');
}
function calcReadingTime(content: string) {
  return Math.max(1, Math.ceil(content.trim().split(/\s+/).length / 200));
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

/* Resize + compress image file to JPEG base64 — keeps D1 row size manageable */
function compressImage(file: File, maxWidth = 1200, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const ratio = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement('canvas');
        canvas.width  = Math.round(img.width  * ratio);
        canvas.height = Math.round(img.height * ratio);
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target!.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AdminBlogPage() {
  const [view, setView]             = useState<View>('list');
  const [posts, setPosts]           = useState<Post[]>([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [deleting, setDeleting]     = useState<number | null>(null);
  const [msg, setMsg]               = useState('');
  const [preview, setPreview]       = useState(false);
  const [parsedHtml, setParsedHtml] = useState('');
  const [imgUploading, setImgUploading] = useState(false);

  const [form, setForm] = useState<Omit<Post, 'id' | 'views' | 'created_at' | 'updated_at'>>(EMPTY);
  const [editId, setEditId] = useState<number | null>(null);

  function loadPosts() {
    setLoading(true);
    fetch('/api/blog/list?admin=true')
      .then(r => r.json())
      .then((res: { ok: boolean; data?: Post[] }) => { if (res.ok) setPosts(res.data ?? []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }
  useEffect(loadPosts, []);

  function openNew() {
    setEditId(null); setForm(EMPTY); setPreview(false); setMsg(''); setView('editor');
  }
  function openEdit(p: Post) {
    setEditId(p.id);
    setForm({ slug: p.slug, title: p.title, excerpt: p.excerpt, content: p.content, cover_image: p.cover_image || '', tags: p.tags, published: p.published, reading_time: p.reading_time });
    setPreview(false); setMsg(''); setView('editor');
  }

  function set(k: keyof typeof form, v: string | number) {
    setForm(prev => {
      const next = { ...prev, [k]: v };
      if (k === 'title' && !editId) next.slug = slugify(v as string);
      if (k === 'content') next.reading_time = calcReadingTime(v as string);
      return next;
    });
  }

  async function handleSave() {
    if (!form.title || !form.slug || !form.content) { setMsg('Título, slug y contenido son obligatorios.'); return; }
    setSaving(true); setMsg('');
    try {
      const res = await fetch('/api/blog/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...(editId ? { id: editId } : {}), ...form }),
      });
      const data: { ok: boolean; error?: string } = await res.json().catch(() => ({ ok: false, error: 'Respuesta inválida del servidor' }));
      if (data.ok) { setMsg('✓ Guardado'); loadPosts(); setView('list'); }
      else setMsg('Error: ' + (data.error ?? 'desconocido'));
    } catch {
      setMsg('Error de conexión');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar este post?')) return;
    setDeleting(id);
    try {
      const res = await fetch('/api/blog/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.ok) loadPosts();
    } catch { /* ignore */ }
    setDeleting(null);
  }

  async function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImgUploading(true);
    try {
      const compressed = await compressImage(file);
      set('cover_image', compressed);
    } catch { /* ignore */ }
    setImgUploading(false);
    e.target.value = '';
  }

  /* Markdown preview — stores parsed HTML in state to avoid direct DOM mutation */
  useEffect(() => {
    if (!preview) { setParsedHtml(''); return; }
    const w = window as unknown as { marked?: { parse(s: string): string } };
    const doRender = () => { if (w.marked) setParsedHtml(w.marked.parse(form.content || '')); };
    if (w.marked) { doRender(); return; }
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/marked/9.1.6/marked.min.js';
    s.onload = doRender;
    document.head.appendChild(s);
  }, [preview, form.content]);

  const inp: React.CSSProperties = {
    width: '100%', background: 'var(--adm-input)', border: '1px solid var(--adm-border)',
    borderRadius: '8px', padding: '9px 12px', color: 'var(--adm-text)', fontSize: '13px',
    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
  };
  const lbl: React.CSSProperties = {
    display: 'block', color: 'var(--adm-label)', fontSize: '11px',
    letterSpacing: '0.5px', marginBottom: '5px', textTransform: 'uppercase',
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 88px)', background: 'var(--adm-bg)', fontFamily: 'system-ui, sans-serif', padding: '1.5rem' }}>
      <style>{BLOG_STYLES}</style>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        {view === 'list' ? (
          /* ── List view ── */
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h1 style={{ color: 'var(--adm-text)', fontSize: '18px', fontWeight: 500 }}>Blog</h1>
                <p style={{ color: 'var(--adm-muted)', fontSize: '11px', marginTop: '2px' }}>{posts.length} artículos</p>
              </div>
              <button className="abtn abtn-p" onClick={openNew}>+ Nuevo post</button>
            </div>

            {loading && <p style={{ color: 'var(--adm-muted)', fontSize: '13px' }}>Cargando...</p>}

            {!loading && posts.length === 0 && (
              <div style={{ background: 'var(--adm-card)', border: '1px solid var(--adm-border)', borderRadius: '10px', padding: '2rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--adm-muted)', fontSize: '13px', marginBottom: '1rem' }}>No hay artículos todavía.</p>
                <button className="abtn abtn-p" onClick={openNew}>Crear el primer post</button>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {posts.map(p => (
                <div key={p.id} style={{ background: 'var(--adm-card)', border: '1px solid var(--adm-border)', borderRadius: '10px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {p.cover_image && (
                    <img src={p.cover_image} alt="" style={{ width: '56px', height: '40px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                      <span style={{ color: 'var(--adm-text)', fontSize: '14px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</span>
                      <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '10px', background: p.published ? '#1D6B4520' : '#33333360', color: p.published ? '#5DCAA5' : '#777', border: `1px solid ${p.published ? '#1D6B4540' : '#444'}`, flexShrink: 0 }}>
                        {p.published ? 'Publicado' : 'Borrador'}
                      </span>
                    </div>
                    <div style={{ color: 'var(--adm-muted)', fontSize: '11px', display: 'flex', gap: '10px' }}>
                      <span>{fmtDate(p.created_at)}</span>
                      <span>·</span>
                      <span>{p.reading_time} min</span>
                      <span>·</span>
                      <span>{p.views} lecturas</span>
                      <span>·</span>
                      <span style={{ color: 'var(--adm-label)', fontFamily: 'monospace' }}>/blog?slug={p.slug}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <button className="abtn abtn-g" onClick={() => openEdit(p)}>Editar</button>
                    <button
                      className="abtn abtn-d"
                      onClick={() => handleDelete(p.id)}
                      disabled={deleting === p.id}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* ── Editor view ── */
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button className="abtn abtn-g" style={{ padding: '6px 10px' }} onClick={() => setView('list')}>←</button>
                <h1 style={{ color: 'var(--adm-text)', fontSize: '16px', fontWeight: 500 }}>
                  {editId ? 'Editar post' : 'Nuevo post'}
                </h1>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {msg && <span style={{ fontSize: '12px', color: msg.startsWith('✓') ? '#5DCAA5' : '#D85A30' }}>{msg}</span>}
                <button className="abtn abtn-g" onClick={() => setPreview(v => !v)}>
                  {preview ? 'Editar' : 'Vista previa'}
                </button>
                <button className="abtn abtn-p" onClick={handleSave} disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>

            {preview ? (
              /* ── Preview ── */
              <div style={{ background: 'var(--adm-card)', border: '1px solid var(--adm-border)', borderRadius: '10px', padding: '2rem' }}>
                {form.cover_image && (
                  <img src={form.cover_image} alt="" style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1.5rem' }} />
                )}
                <h2 style={{ color: 'var(--adm-text)', fontSize: '22px', fontWeight: 300, marginBottom: '0.5rem' }}>{form.title || 'Sin título'}</h2>
                <p style={{ color: 'var(--adm-muted)', fontSize: '11px', marginBottom: '1.5rem' }}>{form.excerpt}</p>
                <div
                  id="blog-preview-content"
                  dangerouslySetInnerHTML={{ __html: parsedHtml || '<p style="color:var(--adm-muted);font-style:italic;font-size:12px">Renderizando...</p>' }}
                  style={{ color: 'var(--adm-text)', fontSize: '14px', lineHeight: '1.7' }}
                />
              </div>
            ) : (
              /* ── Form ── */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={lbl}>Título</label>
                    <input style={inp} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Mi primer post técnico" />
                  </div>
                  <div>
                    <label style={lbl}>Slug (URL)</label>
                    <input style={{ ...inp, fontFamily: 'monospace', fontSize: '12px' }} value={form.slug} onChange={e => set('slug', slugify(e.target.value))} placeholder="mi-primer-post-tecnico" />
                  </div>
                </div>

                <div>
                  <label style={lbl}>Extracto</label>
                  <input style={inp} value={form.excerpt} onChange={e => set('excerpt', e.target.value)} placeholder="Breve descripción para la lista del blog..." />
                </div>

                <div>
                  <label style={lbl}>Imagen de portada</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <label
                      htmlFor="cover-img-input"
                      className={`abtn abtn-g${imgUploading ? ' abtn:disabled' : ''}`}
                      style={{ display: 'inline-block', cursor: imgUploading ? 'not-allowed' : 'pointer', opacity: imgUploading ? 0.5 : 1 }}
                    >
                      {imgUploading ? 'Procesando...' : (form.cover_image ? 'Cambiar imagen' : '+ Subir imagen')}
                    </label>
                    {form.cover_image && (
                      <button type="button" className="abtn abtn-d" onClick={() => set('cover_image', '')}>
                        Quitar
                      </button>
                    )}
                    <input
                      id="cover-img-input"
                      type="file"
                      accept="image/*"
                      onChange={handleImageFile}
                      disabled={imgUploading}
                      style={{ display: 'none' }}
                    />
                  </div>
                  {form.cover_image && (
                    <img src={form.cover_image} alt="" style={{ marginTop: '8px', width: '100%', maxHeight: '160px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--adm-border)' }} />
                  )}
                </div>

                <div>
                  <label style={lbl}>Tags (separados por coma)</label>
                  <input style={inp} value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="Next.js, Cloudflare, D1" />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                    <label style={{ ...lbl, margin: 0 }}>Contenido (Markdown)</label>
                    <span style={{ color: 'var(--adm-muted)', fontSize: '10px' }}>{form.reading_time} min de lectura</span>
                  </div>
                  <textarea
                    style={{ ...inp, minHeight: '380px', resize: 'vertical', lineHeight: '1.6' }}
                    value={form.content}
                    onChange={e => set('content', e.target.value)}
                    placeholder={`# Título del artículo\n\nIntroducción al tema...\n\n## Primera sección\n\nContenido...\n\n\`\`\`ts\n// Ejemplo de código\nconst hello = 'world';\n\`\`\``}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: 'var(--adm-card)', border: '1px solid var(--adm-border)', borderRadius: '8px' }}>
                  <label style={{ color: 'var(--adm-text)', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      checked={form.published === 1}
                      onChange={e => set('published', e.target.checked ? 1 : 0)}
                      style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                    />
                    Publicar (visible en /blog)
                  </label>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
