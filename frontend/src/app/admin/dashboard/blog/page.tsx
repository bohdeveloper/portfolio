'use client';

import { useEffect, useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TiptapLink from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';

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
  ai_generated: number;
  created_at: string;
  updated_at: string;
}

type View = 'list' | 'editor' | 'comments';
interface AdminComment { id: number; post_id: number; parent_id: number | null; alias: string; body: string; ip_hash: string; created_at: string; approved: number; slug: string; title: string; }

const EMPTY: Omit<Post, 'id' | 'views' | 'created_at' | 'updated_at'> = {
  slug: '', title: '', excerpt: '', content: '', cover_image: '', tags: '', published: 0, reading_time: 0, ai_generated: 0,
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

  /* ── Rich editor ── */
  .rich-toolbar { display: flex; flex-wrap: wrap; gap: 3px; padding: 8px 10px; border-bottom: 1px solid var(--adm-border); background: var(--adm-hdr); }
  .rich-toolbar-sep { width: 1px; background: var(--adm-border); margin: 0 2px; align-self: stretch; }
  .tbtn {
    background: transparent; border: 1px solid transparent;
    border-radius: 4px; padding: 3px 7px; font-size: 12px; font-weight: 500;
    cursor: pointer; font-family: inherit; color: var(--adm-text);
    min-width: 28px; line-height: 1.5; transition: background 0.1s, color 0.1s, border-color 0.1s;
  }
  .tbtn:hover { border-color: var(--primary); color: var(--primary); }
  .tbtn.active { background: var(--primary); color: #000 !important; border-color: var(--primary); }

  .ProseMirror {
    padding: 1.1rem 1.25rem; min-height: 380px; outline: none;
    color: var(--adm-text); font-size: 16px; line-height: 1.8;
    font-family: system-ui, sans-serif;
  }
  .ProseMirror h1 { font-size: 1.85em; font-weight: 700; margin: 1.4em 0 0.5em; color: var(--adm-text); line-height: 1.25; }
  .ProseMirror h2 { font-size: 1.4em;  font-weight: 600; margin: 1.3em 0 0.45em; color: var(--adm-text); line-height: 1.3; }
  .ProseMirror h3 { font-size: 1.15em; font-weight: 600; margin: 1.1em 0 0.4em;  color: var(--adm-text); }
  .ProseMirror p { margin: 0.85em 0; }
  .ProseMirror ul, .ProseMirror ol { padding-left: 1.6em; margin: 0.85em 0; }
  .ProseMirror li { margin: 0.3em 0; }
  .ProseMirror li > p { margin: 0; }
  .ProseMirror code { background: var(--adm-border); padding: 2px 6px; border-radius: 4px; font-size: 0.875em; font-family: ui-monospace, monospace; color: var(--primary); }
  .ProseMirror pre { background: var(--adm-border); padding: 1rem 1.25rem; border-radius: 8px; overflow-x: auto; margin: 1.1em 0; border: 1px solid var(--adm-border); }
  .ProseMirror pre code { background: none; padding: 0; color: var(--adm-text); font-size: 13.5px; }
  .ProseMirror blockquote { border-left: 3px solid var(--primary); margin: 1.1em 0; padding: 0.5em 1.1em; color: var(--adm-muted); font-style: italic; }
  .ProseMirror hr { border: none; border-top: 1px solid var(--adm-border); margin: 1.75em 0; }
  .ProseMirror a { color: var(--primary); text-decoration: underline; text-underline-offset: 3px; }
  .ProseMirror strong { color: var(--adm-text); font-weight: 700; }
  .ProseMirror em { font-style: italic; }
  .ProseMirror u { text-decoration: underline; }
  .ProseMirror p.is-editor-empty:first-child::before {
    content: attr(data-placeholder); float: left;
    color: var(--adm-muted); pointer-events: none; height: 0; font-style: italic;
  }

  @media (max-width: 600px) {
    .blog-card { flex-wrap: wrap !important; }
    .blog-card-slug { display: none !important; }
    .blog-card-actions {
      width: 100% !important; flex-shrink: unset !important;
      border-top: 1px solid var(--adm-border); padding-top: 10px; margin-top: 2px;
    }
    .blog-card-actions .abtn { flex: 1; text-align: center; }
    .blog-editor-hdr { flex-direction: column !important; align-items: flex-start !important; gap: 10px !important; }
    .blog-editor-hdr-right { width: 100% !important; flex-wrap: wrap !important; }
    .blog-editor-hdr-right .abtn { flex: 1; text-align: center; }
    .blog-editor-hdr-right span { width: 100%; }
    .rich-toolbar { gap: 2px; padding: 6px 8px; }
    .ProseMirror { min-height: 200px !important; font-size: 15px !important; }
  }
`;

function slugify(title: string) {
  return title.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '').trim()
    .replace(/\s+/g, '-');
}
function calcReadingTime(html: string) {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return Math.max(1, Math.ceil(text.split(/\s+/).filter(Boolean).length / 200));
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

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

/* ── Toolbar button ── */
function TBtn({ active, onClick, title, children }: { active?: boolean; onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button type="button" className={`tbtn${active ? ' active' : ''}`} onClick={onClick} title={title}>
      {children}
    </button>
  );
}

/* ── Toolbar ── */
function Toolbar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  const addLink = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('URL del enlace:');
    if (url) editor.chain().focus().setLink({ href: url, target: '_blank' }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="rich-toolbar">
      {/* Deshacer / Rehacer */}
      <TBtn active={false} onClick={() => editor.chain().focus().undo().run()} title="Deshacer (Ctrl+Z)">↩</TBtn>
      <TBtn active={false} onClick={() => editor.chain().focus().redo().run()} title="Rehacer (Ctrl+Y)">↪</TBtn>
      <div className="rich-toolbar-sep" />

      {/* Formato de texto */}
      <TBtn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} title="Negrita (Ctrl+B)"><strong>B</strong></TBtn>
      <TBtn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} title="Cursiva (Ctrl+I)"><em>I</em></TBtn>
      <TBtn active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Subrayado (Ctrl+U)"><u>U</u></TBtn>
      <div className="rich-toolbar-sep" />

      {/* Encabezados */}
      <TBtn active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="Título H1">H1</TBtn>
      <TBtn active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Título H2">H2</TBtn>
      <TBtn active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Título H3">H3</TBtn>
      <div className="rich-toolbar-sep" />

      {/* Listas */}
      <TBtn active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Lista de viñetas">• Lista</TBtn>
      <TBtn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Lista numerada">1. Lista</TBtn>
      <div className="rich-toolbar-sep" />

      {/* Código */}
      <TBtn active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()} title="Código inline">{`<c>`}</TBtn>
      <TBtn active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()} title="Bloque de código">{'```'}</TBtn>
      <div className="rich-toolbar-sep" />

      {/* Extras */}
      <TBtn active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Cita">" Cita</TBtn>
      <TBtn active={false} onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Línea separadora">—</TBtn>
      <TBtn active={editor.isActive('link')} onClick={addLink} title="Insertar enlace">↗ Link</TBtn>
      {editor.isActive('link') && (
        <TBtn active={false} onClick={() => editor.chain().focus().unsetLink().run()} title="Quitar enlace">✕ Link</TBtn>
      )}
    </div>
  );
}

/* ── Rich text editor con TipTap ── */
function RichEditor({ initialContent, onChange }: { initialContent: string; onChange: (html: string) => void }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TiptapLink.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Empieza a escribir el artículo...' }),
    ],
    content: initialContent || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <div style={{ border: '1px solid var(--adm-border)', borderRadius: '8px', overflow: 'hidden', background: 'var(--adm-input)' }}>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

export default function AdminBlogPage() {
  const [view, setView]             = useState<View>('list');
  const [posts, setPosts]           = useState<Post[]>([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [deleting, setDeleting]     = useState<number | null>(null);
  const [msg, setMsg]               = useState('');
  const [imgUploading, setImgUploading] = useState(false);
  const [editorKey, setEditorKey]   = useState(0);

  // ── Comments moderation state ─────────────────────────────────────────────
  const [comments,       setComments]       = useState<AdminComment[]>([]);
  const [commentFilter,  setCommentFilter]  = useState<'pending' | 'approved' | 'all'>('pending');
  const [commentsLoading,setCommentsLoading]= useState(false);
  const [pendingCount,   setPendingCount]   = useState(0);

  const [form, setForm] = useState<Omit<Post, 'id' | 'views' | 'created_at' | 'updated_at'>>(EMPTY);
  const [editId, setEditId] = useState<number | null>(null);

  function loadComments(filter = commentFilter) {
    setCommentsLoading(true);
    fetch(`/api/blog/comments?admin=1&filter=${filter}`)
      .then(r => r.json())
      .then((res: { ok: boolean; data?: AdminComment[]; pending?: number }) => {
        if (res.ok) { setComments(res.data ?? []); setPendingCount(res.pending ?? 0); }
      })
      .catch(() => {})
      .finally(() => setCommentsLoading(false));
  }

  async function approveComment(id: number) {
    await fetch('/api/blog/comments', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, approved: 1 }) });
    loadComments();
  }

  async function deleteComment(id: number, ban = false) {
    const msg = ban ? '¿Eliminar el comentario y banear la IP? No podrá comentar más.' : '¿Eliminar este comentario?';
    if (!confirm(msg)) return;
    await fetch(`/api/blog/comments?id=${id}${ban ? '&ban=1' : ''}`, { method: 'DELETE' });
    loadComments();
  }

  function loadPosts() {
    setLoading(true);
    fetch('/api/blog/list?admin=true')
      .then(r => r.json())
      .then((res: { ok: boolean; data?: Post[] }) => { if (res.ok) setPosts(res.data ?? []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }
  useEffect(() => {
    loadPosts();
    fetch('/api/blog/comments?admin=1&filter=pending')
      .then(r => r.json())
      .then((res: { ok: boolean; pending?: number }) => { if (res.ok) setPendingCount(res.pending ?? 0); })
      .catch(() => {});
  }, []);

  function openNew() {
    setEditId(null);
    setForm(EMPTY);
    setMsg('');
    setEditorKey(k => k + 1);
    setView('editor');
  }
  function openEdit(p: Post) {
    setEditId(p.id);
    setForm({ slug: p.slug, title: p.title, excerpt: p.excerpt, content: p.content, cover_image: p.cover_image || '', tags: p.tags, published: p.published, reading_time: p.reading_time, ai_generated: p.ai_generated ?? 0 });
    setMsg('');
    setEditorKey(k => k + 1);
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
    if (!form.title || !form.slug || !form.content || form.content === '<p></p>') {
      setMsg('Título, slug y contenido son obligatorios.'); return;
    }
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
      const res = await fetch('/api/blog/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      const data = await res.json();
      if (data.ok) loadPosts();
    } catch { /* ignore */ }
    setDeleting(null);
  }

  async function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImgUploading(true);
    try { set('cover_image', await compressImage(file)); } catch { /* ignore */ }
    setImgUploading(false);
    e.target.value = '';
  }

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

        {view === 'comments' ? (
          /* ── Vista moderación de comentarios ── */
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
              <button className="abtn abtn-g" style={{ padding: '6px 10px' }} onClick={() => setView('list')}>←</button>
              <h1 style={{ color: 'var(--adm-text)', fontSize: '16px', fontWeight: 500 }}>Comentarios</h1>
              {pendingCount > 0 && <span style={{ background: '#D85A30', color: '#fff', borderRadius: '10px', fontSize: '11px', padding: '2px 8px' }}>{pendingCount} pendientes</span>}
            </div>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '1.25rem' }}>
              {(['pending', 'approved', 'all'] as const).map(f => (
                <button
                  key={f}
                  className={`abtn ${commentFilter === f ? 'abtn-p' : 'abtn-g'}`}
                  onClick={() => { setCommentFilter(f); loadComments(f); }}
                >
                  {f === 'pending' ? 'Pendientes' : f === 'approved' ? 'Aprobados' : 'Todos'}
                </button>
              ))}
              <button className="abtn abtn-g" style={{ marginLeft: 'auto' }} onClick={() => loadComments()}>↺ Recargar</button>
            </div>
            {commentsLoading && <p style={{ color: 'var(--adm-muted)', fontSize: '13px' }}>Cargando...</p>}
            {!commentsLoading && comments.length === 0 && (
              <p style={{ color: 'var(--adm-muted)', fontSize: '13px' }}>No hay comentarios en esta categoría.</p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {comments.map(c => (
                <div key={c.id} style={{ background: 'var(--adm-card)', border: `1px solid ${c.approved ? 'var(--adm-border)' : '#D85A3030'}`, borderRadius: '10px', padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px', flexWrap: 'wrap' }}>
                        <span style={{ color: 'var(--adm-text)', fontWeight: 500, fontSize: '13px' }}>{c.alias}</span>
                        {c.parent_id && <span style={{ fontSize: '10px', color: 'var(--adm-muted)' }}>↩ respuesta</span>}
                        <span style={{ fontSize: '10px', padding: '1px 7px', borderRadius: '8px', background: c.approved ? '#1D6B4520' : '#D85A3020', color: c.approved ? '#5DCAA5' : '#D85A30', border: `1px solid ${c.approved ? '#1D6B4540' : '#D85A3040'}` }}>
                          {c.approved ? 'Aprobado' : 'Pendiente'}
                        </span>
                        <span style={{ fontSize: '10px', color: 'var(--adm-muted)' }}>
                          {new Date(c.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p style={{ color: 'var(--adm-muted)', fontSize: '11px', marginBottom: '6px' }}>
                        Post: <span style={{ color: 'var(--primary)' }}>{c.title}</span>
                        <span style={{ marginLeft: '8px', fontFamily: 'monospace', opacity: 0.5 }}>IP: {c.ip_hash}</span>
                      </p>
                      <p style={{ color: 'var(--adm-text)', fontSize: '13px', lineHeight: 1.55, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{c.body}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0, flexWrap: 'wrap' }}>
                      {!c.approved && <button className="abtn abtn-p" onClick={() => approveComment(c.id)}>✓ Aprobar</button>}
                      <button className="abtn abtn-d" onClick={() => deleteComment(c.id)}>Eliminar</button>
                      <button className="abtn abtn-d" style={{ opacity: 0.7 }} onClick={() => deleteComment(c.id, true)} title="Eliminar comentario y banear IP">🚫 Ban IP</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : view === 'list' ? (
          /* ── Vista lista ── */
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h1 style={{ color: 'var(--adm-text)', fontSize: '18px', fontWeight: 500 }}>Blog</h1>
                <p style={{ color: 'var(--adm-muted)', fontSize: '11px', marginTop: '2px' }}>{posts.length} artículos</p>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button className="abtn abtn-g" onClick={() => { setCommentFilter('pending'); loadComments('pending'); setView('comments'); }} style={{ position: 'relative' }}>
                  💬 Comentarios{pendingCount > 0 && <span style={{ marginLeft: '6px', background: '#D85A30', color: '#fff', borderRadius: '10px', fontSize: '10px', padding: '1px 6px' }}>{pendingCount}</span>}
                </button>
                <button className="abtn abtn-p" onClick={openNew}>+ Nuevo post</button>
              </div>
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
                <div key={p.id} className="blog-card" style={{ background: 'var(--adm-card)', border: '1px solid var(--adm-border)', borderRadius: '10px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {p.cover_image && (
                    <img src={p.cover_image} alt="" style={{ width: '56px', height: '40px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px', flexWrap: 'wrap' }}>
                      <span style={{ color: 'var(--adm-text)', fontSize: '14px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</span>
                      <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '10px', background: p.published ? '#1D6B4520' : '#33333360', color: p.published ? '#5DCAA5' : '#777', border: `1px solid ${p.published ? '#1D6B4540' : '#444'}`, flexShrink: 0 }}>
                        {p.published ? 'Publicado' : 'Borrador'}
                      </span>
                      {p.ai_generated === 1 && (
                        <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '10px', background: 'rgba(0,231,235,0.08)', color: 'var(--primary)', border: '1px solid rgba(0,231,235,0.25)', flexShrink: 0 }}>
                          ✦ IA
                        </span>
                      )}
                    </div>
                    <div style={{ color: 'var(--adm-muted)', fontSize: '11px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <span>{fmtDate(p.created_at)}</span>
                      <span>·</span>
                      <span>{p.reading_time} min</span>
                      <span>·</span>
                      <span>{p.views} lecturas</span>
                      <span className="blog-card-slug">·</span>
                      <span className="blog-card-slug" style={{ color: 'var(--adm-label)', fontFamily: 'monospace' }}>/blog?slug={p.slug}</span>
                    </div>
                  </div>
                  <div className="blog-card-actions" style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <button className="abtn abtn-g" onClick={() => openEdit(p)}>Editar</button>
                    <button className="abtn abtn-d" onClick={() => handleDelete(p.id)} disabled={deleting === p.id}>Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* ── Vista editor ── */
          <>
            <div className="blog-editor-hdr" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button className="abtn abtn-g" style={{ padding: '6px 10px' }} onClick={() => setView('list')}>←</button>
                <h1 style={{ color: 'var(--adm-text)', fontSize: '16px', fontWeight: 500 }}>
                  {editId ? 'Editar post' : 'Nuevo post'}
                </h1>
              </div>
              <div className="blog-editor-hdr-right" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {msg && <span style={{ fontSize: '12px', color: msg.startsWith('✓') ? '#5DCAA5' : '#D85A30' }}>{msg}</span>}
                <button className="abtn abtn-p" onClick={handleSave} disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>

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
                  <label htmlFor="cover-img-input" className={`abtn abtn-g${imgUploading ? ' abtn:disabled' : ''}`} style={{ display: 'inline-block', cursor: imgUploading ? 'not-allowed' : 'pointer', opacity: imgUploading ? 0.5 : 1 }}>
                    {imgUploading ? 'Procesando...' : (form.cover_image ? 'Cambiar imagen' : '+ Subir imagen')}
                  </label>
                  {form.cover_image && (
                    <button type="button" className="abtn abtn-d" onClick={() => set('cover_image', '')}>Quitar</button>
                  )}
                  <input id="cover-img-input" type="file" accept="image/*" onChange={handleImageFile} disabled={imgUploading} style={{ display: 'none' }} />
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
                  <label style={{ ...lbl, margin: 0 }}>Contenido</label>
                  <span style={{ color: 'var(--adm-muted)', fontSize: '10px' }}>{form.reading_time} min de lectura</span>
                </div>
                <RichEditor
                  key={editorKey}
                  initialContent={form.content}
                  onChange={html => set('content', html)}
                />
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '20px', padding: '12px', background: 'var(--adm-card)', border: '1px solid var(--adm-border)', borderRadius: '8px' }}>
                <label style={{ color: 'var(--adm-text)', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" checked={form.published === 1} onChange={e => set('published', e.target.checked ? 1 : 0)} style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }} />
                  Publicar (visible en /blog)
                </label>
                <label style={{ color: 'var(--adm-text)', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }} title="Reglamento UE AI Act — obliga a etiquetar contenido donde la IA haya sido sustancial (desde agosto 2026)">
                  <input type="checkbox" checked={form.ai_generated === 1} onChange={e => set('ai_generated', e.target.checked ? 1 : 0)} style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }} />
                  <span>✦ Generado con IA</span>
                  <span style={{ fontSize: '10px', color: 'var(--adm-muted)', fontWeight: 400 }}>(AI Act EU)</span>
                </label>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
