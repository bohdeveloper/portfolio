'use client';

import { useEffect, useState, useRef } from 'react';

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
  updated_at: string;
}

type View = 'list' | 'editor';

const EMPTY: Omit<Post, 'id' | 'views' | 'created_at' | 'updated_at'> = {
  slug: '', title: '', excerpt: '', content: '', tags: '', published: 0, reading_time: 0,
};

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

export default function AdminBlogPage() {
  const [view, setView]         = useState<View>('list');
  const [posts, setPosts]       = useState<Post[]>([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [msg, setMsg]           = useState('');
  const [preview, setPreview]   = useState(false);
  const markedRef               = useRef(false);

  const [form, setForm] = useState<Omit<Post, 'id' | 'views' | 'created_at' | 'updated_at'>>(EMPTY);
  const [editId, setEditId] = useState<number | null>(null);

  function loadPosts() {
    setLoading(true);
    fetch('/api/blog/list?admin=true')
      .then(r => r.json())
      .then((res: { ok: boolean; data?: Post[] }) => { if (res.ok) setPosts(res.data ?? []); })
      .finally(() => setLoading(false));
  }
  useEffect(loadPosts, []);

  function openNew() {
    setEditId(null);
    setForm(EMPTY);
    setPreview(false);
    setMsg('');
    setView('editor');
  }
  function openEdit(p: Post) {
    setEditId(p.id);
    setForm({ slug: p.slug, title: p.title, excerpt: p.excerpt, content: p.content, tags: p.tags, published: p.published, reading_time: p.reading_time });
    setPreview(false);
    setMsg('');
    setView('editor');
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
    const res = await fetch('/api/blog/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...(editId ? { id: editId } : {}), ...form }),
    });
    const data = await res.json();
    setSaving(false);
    if (data.ok) { setMsg('✓ Guardado'); loadPosts(); setView('list'); }
    else setMsg('Error: ' + (data.error ?? 'desconocido'));
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar este post?')) return;
    setDeleting(id);
    const res = await fetch('/api/blog/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    setDeleting(null);
    if (data.ok) loadPosts();
  }

  /* Load marked for preview */
  useEffect(() => {
    if (!preview || markedRef.current) return;
    const w = window as unknown as { marked?: { parse(s: string): string } };
    const render = () => {
      const el = document.getElementById('blog-preview-content');
      if (el && w.marked) { el.innerHTML = w.marked.parse(form.content); markedRef.current = true; }
    };
    if (w.marked) { render(); return; }
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/marked/9.1.6/marked.min.js';
    s.onload = render;
    document.head.appendChild(s);
  }, [preview, form.content]);
  useEffect(() => {
    if (!preview) { markedRef.current = false; return; }
    const w = window as unknown as { marked?: { parse(s: string): string } };
    const el = document.getElementById('blog-preview-content');
    if (el && w.marked) { el.innerHTML = w.marked.parse(form.content); }
  }, [preview, form.content]);

  /* ── Styles ── */
  const inp: React.CSSProperties = {
    width: '100%', background: 'var(--adm-input)', border: '1px solid var(--adm-border)',
    borderRadius: '8px', padding: '9px 12px', color: 'var(--adm-text)', fontSize: '13px',
    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
  };
  const label: React.CSSProperties = {
    display: 'block', color: 'var(--adm-label)', fontSize: '11px',
    letterSpacing: '0.5px', marginBottom: '5px', textTransform: 'uppercase',
  };
  const btn = (bg: string, col = '#fff'): React.CSSProperties => ({
    padding: '7px 14px', background: bg, border: 'none', borderRadius: '7px',
    color: col, fontSize: '12px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
    transition: 'opacity 0.15s',
  });

  /* ── List view ── */
  if (view === 'list') return (
    <div style={{ minHeight: 'calc(100vh - 88px)', background: 'var(--adm-bg)', fontFamily: 'system-ui, sans-serif', padding: '1.5rem' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ color: 'var(--adm-text)', fontSize: '18px', fontWeight: 500 }}>Blog</h1>
            <p style={{ color: 'var(--adm-muted)', fontSize: '11px', marginTop: '2px' }}>{posts.length} artículos</p>
          </div>
          <button style={btn('#1D6B45')} onClick={openNew}>+ Nuevo post</button>
        </div>

        {loading && <p style={{ color: 'var(--adm-muted)', fontSize: '13px' }}>Cargando...</p>}

        {!loading && posts.length === 0 && (
          <div style={{ background: 'var(--adm-card)', border: '1px solid var(--adm-border)', borderRadius: '10px', padding: '2rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--adm-muted)', fontSize: '13px', marginBottom: '1rem' }}>No hay artículos todavía.</p>
            <button style={btn('#1D6B45')} onClick={openNew}>Crear el primer post</button>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {posts.map(p => (
            <div key={p.id} style={{ background: 'var(--adm-card)', border: '1px solid var(--adm-border)', borderRadius: '10px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
                <button style={btn('var(--adm-input)', 'var(--adm-text)')} onClick={() => openEdit(p)}>Editar</button>
                <button
                  style={{ ...btn('#7a2a1a'), opacity: deleting === p.id ? 0.5 : 1 }}
                  onClick={() => handleDelete(p.id)}
                  disabled={deleting === p.id}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  /* ── Editor view ── */
  return (
    <div style={{ minHeight: 'calc(100vh - 88px)', background: 'var(--adm-bg)', fontFamily: 'system-ui, sans-serif', padding: '1.5rem' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => setView('list')} style={{ ...btn('var(--adm-input)', 'var(--adm-muted)'), padding: '6px 10px' }}>←</button>
            <h1 style={{ color: 'var(--adm-text)', fontSize: '16px', fontWeight: 500 }}>
              {editId ? 'Editar post' : 'Nuevo post'}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {msg && <span style={{ fontSize: '12px', color: msg.startsWith('✓') ? '#5DCAA5' : '#D85A30' }}>{msg}</span>}
            <button style={{ ...btn('var(--adm-input)', 'var(--adm-text)') }} onClick={() => setPreview(v => !v)}>
              {preview ? 'Editar' : 'Vista previa'}
            </button>
            <button style={{ ...btn('#1D6B45'), opacity: saving ? 0.6 : 1 }} onClick={handleSave} disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>

        {preview ? (
          /* ── Preview ── */
          <div style={{ background: 'var(--adm-card)', border: '1px solid var(--adm-border)', borderRadius: '10px', padding: '2rem' }}>
            <h2 style={{ color: 'var(--adm-text)', fontSize: '22px', fontWeight: 300, marginBottom: '0.5rem' }}>{form.title || 'Sin título'}</h2>
            <p style={{ color: 'var(--adm-muted)', fontSize: '11px', marginBottom: '1.5rem' }}>{form.excerpt}</p>
            <div id="blog-preview-content" style={{ color: 'var(--adm-text)', fontSize: '14px', lineHeight: '1.7' }}>
              <p style={{ color: 'var(--adm-muted)', fontSize: '12px', fontStyle: 'italic' }}>Renderizando...</p>
            </div>
          </div>
        ) : (
          /* ── Form ── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={label}>Título</label>
                <input style={inp} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Mi primer post técnico" />
              </div>
              <div>
                <label style={label}>Slug (URL)</label>
                <input style={{ ...inp, fontFamily: 'monospace', fontSize: '12px' }} value={form.slug} onChange={e => set('slug', slugify(e.target.value))} placeholder="mi-primer-post-tecnico" />
              </div>
            </div>

            <div>
              <label style={label}>Extracto</label>
              <input style={inp} value={form.excerpt} onChange={e => set('excerpt', e.target.value)} placeholder="Breve descripción para la lista del blog..." />
            </div>

            <div>
              <label style={label}>Tags (separados por coma)</label>
              <input style={inp} value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="Next.js, Cloudflare, D1" />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <label style={{ ...label, margin: 0 }}>Contenido (Markdown)</label>
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
                  style={{ width: '16px', height: '16px', accentColor: '#1D6B45' }}
                />
                Publicar (visible en /blog)
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
