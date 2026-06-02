'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

/* ── Tipos ─────────────────────────────────────────────────────────── */
interface Book {
  id: number; title: string; category: string; description: string | null;
  level: string; language: string; num_chapters: number; cover_color: string;
  status: string; word_count: number; created_at: string; chapters_done: number;
}
interface Chapter {
  chapter_index: number; title: string; content: string; word_count: number;
}

/* ── Constantes ──────────────────────────────────────────────────────── */
const CATEGORIES = ['programación', 'filosofía', 'ciencia', 'idiomas', 'historia', 'psicología'];
const LEVELS     = ['básico', 'intermedio', 'avanzado'];
const LANGUAGES  = ['español', 'inglés', 'francés', 'alemán'];

const CAT_COLORS: Record<string, string> = {
  'programación': '#00e7eb', 'filosofía': '#a78bfa', 'ciencia': '#34d399',
  'idiomas': '#fb923c', 'historia': '#f59e0b', 'psicología': '#ec4899',
};

/* ── Helpers ────────────────────────────────────────────────────────── */
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}
function fmtWords(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

/* ── Renderizado Markdown a HTML (via marked CDN en runtime) ─────────── */
function MarkdownView({ content }: { content: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    // marked.js está disponible via CDN en el layout admin — si no está, mostramos texto plano
    if (typeof window !== 'undefined' && (window as unknown as { marked?: { parse: (s: string) => string } }).marked) {
      ref.current.innerHTML = (window as unknown as { marked: { parse: (s: string) => string } }).marked.parse(content);
    } else {
      // Fallback: saltos de línea visibles
      ref.current.innerHTML = content.replace(/\n/g, '<br>');
    }
  }, [content]);

  return <div ref={ref} className="tintai-prose" />;
}

/* ── CSS ────────────────────────────────────────────────────────────── */
const STYLES = `
  .tintai-wrap { min-height:calc(100vh - 88px); background:var(--adm-bg); font-family:system-ui,sans-serif; color:var(--adm-text); }
  .tintai-topbar { display:flex; align-items:center; gap:12px; padding:1rem 1.5rem; border-bottom:1px solid var(--adm-border); background:var(--adm-hdr); }
  .tintai-title { font-size:17px; font-weight:600; color:var(--primary); margin-right:auto; }
  .tintai-tabs { display:flex; border-bottom:1px solid var(--adm-border); background:var(--adm-card); }
  .tintai-tab { padding:10px 20px; font-size:13px; font-weight:500; cursor:pointer; background:none; border:none; border-bottom:2px solid transparent; color:var(--adm-muted); font-family:inherit; transition:color .15s; }
  .tintai-tab.active { color:var(--primary); border-bottom-color:var(--primary); }
  .tintai-body { padding:1.5rem; max-width:780px; margin:0 auto; }
  .tintai-card { background:var(--adm-card); border:1px solid var(--adm-border); border-radius:10px; padding:1.25rem; margin-bottom:1rem; }
  .tintai-form-grid { display:grid; grid-template-columns:1fr 1fr; gap:.75rem; }
  .tintai-field { display:flex; flex-direction:column; gap:4px; }
  .tintai-label { font-size:11px; color:var(--adm-label); font-weight:500; text-transform:uppercase; letter-spacing:.04em; }
  .tintai-input { background:var(--adm-input); border:1px solid var(--adm-border); border-radius:6px; padding:8px 10px; color:var(--adm-text); font-size:14px; font-family:inherit; outline:none; transition:border-color .15s; }
  .tintai-input:focus { border-color:var(--primary); }
  .tintai-select { background:var(--adm-input); border:1px solid var(--adm-border); border-radius:6px; padding:8px 10px; color:var(--adm-text); font-size:14px; font-family:inherit; outline:none; cursor:pointer; }
  .tintai-btn { background:var(--primary); color:#000; border:none; border-radius:6px; padding:9px 20px; font-size:13px; font-weight:600; cursor:pointer; font-family:inherit; transition:opacity .15s; }
  .tintai-btn:hover { opacity:.85; }
  .tintai-btn:disabled { opacity:.35; cursor:default; }
  .tintai-btn-ghost { background:none; border:1px solid var(--adm-border); color:var(--adm-muted); border-radius:6px; padding:7px 14px; font-size:12px; cursor:pointer; font-family:inherit; transition:border-color .15s,color .15s; }
  .tintai-btn-ghost:hover { border-color:var(--primary); color:var(--primary); }
  .tintai-btn-ghost:disabled { opacity:.4; cursor:default; }
  .tintai-progress-bar { height:6px; background:var(--adm-border); border-radius:3px; overflow:hidden; margin:.75rem 0; }
  .tintai-progress-fill { height:100%; background:var(--primary); border-radius:3px; transition:width .4s ease; }
  .tintai-books-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:1rem; }
  .tintai-book-card { background:var(--adm-card); border:1px solid var(--adm-border); border-radius:10px; overflow:hidden; cursor:pointer; transition:border-color .15s,transform .15s; }
  .tintai-book-card:hover { border-color:var(--primary); transform:translateY(-2px); }
  .tintai-book-cover { height:90px; display:flex; align-items:center; justify-content:center; font-size:28px; }
  .tintai-book-info { padding:.9rem; }
  .tintai-book-title { font-size:14px; font-weight:600; margin-bottom:4px; line-height:1.3; }
  .tintai-book-meta { font-size:11px; color:var(--adm-muted); }
  .tintai-badge { display:inline-block; padding:2px 8px; border-radius:10px; font-size:10px; font-weight:600; }
  .tintai-reader { max-width:660px; margin:0 auto; }
  .tintai-reader-nav { display:flex; align-items:center; gap:12px; margin-bottom:1.5rem; }
  .tintai-chapter-progress { flex:1; }
  .tintai-prose { font-size:15px; line-height:1.85; color:var(--adm-text); }
  .tintai-prose h2 { font-size:16px; font-weight:600; color:var(--primary); margin:1.5rem 0 .5rem; }
  .tintai-prose h3 { font-size:14px; font-weight:600; margin:1.25rem 0 .4rem; }
  .tintai-prose p { margin:.75rem 0; }
  .tintai-prose ul,.tintai-prose ol { padding-left:1.5rem; margin:.5rem 0; }
  .tintai-prose li { margin:.25rem 0; }
  .tintai-prose code { background:var(--adm-input); padding:1px 5px; border-radius:3px; font-size:13px; }
  .tintai-prose pre { background:var(--adm-input); padding:1rem; border-radius:6px; overflow:auto; font-size:13px; margin:1rem 0; }
  .tintai-prose blockquote { border-left:3px solid var(--primary); padding-left:1rem; color:var(--adm-muted); margin:1rem 0; font-style:italic; }
  .tintai-toc { list-style:none; padding:0; margin:0; }
  .tintai-toc li { padding:6px 0; border-bottom:1px solid var(--adm-border); font-size:13px; display:flex; gap:8px; align-items:center; cursor:pointer; transition:color .15s; }
  .tintai-toc li:hover { color:var(--primary); }
  .tintai-toc-num { font-size:11px; color:var(--adm-muted); min-width:20px; }
  .tintai-section-title { font-size:13px; font-weight:600; color:var(--adm-label); text-transform:uppercase; letter-spacing:.05em; margin-bottom:1rem; }
  .tintai-saving-dot { display:inline-block; width:7px; height:7px; border-radius:50%; background:var(--primary); animation:tblink .7s infinite; margin-right:6px; }
  @keyframes tblink { 0%,100%{opacity:1} 50%{opacity:.2} }
  @media(max-width:600px) {
    .tintai-form-grid { grid-template-columns:1fr; }
    .tintai-books-grid { grid-template-columns:1fr 1fr; }
  }
`;

/* ── Subvista: Generar ───────────────────────────────────────────────── */
function VistaGenerar({ onBookReady }: { onBookReady: () => void }) {
  const [title, setTitle]         = useState('');
  const [category, setCategory]   = useState('programación');
  const [description, setDesc]    = useState('');
  const [level, setLevel]         = useState('intermedio');
  const [language, setLanguage]   = useState('español');
  const [numChapters, setNum]     = useState(6);

  const [generating, setGenerating] = useState(false);
  const [phase, setPhase]           = useState('');  // 'toc' | 'chapter-N' | 'done'
  const [progress, setProgress]     = useState(0);   // 0..numChapters+1
  const [total, setTotal]           = useState(0);
  const [log, setLog]               = useState<string[]>([]);
  const [error, setError]           = useState('');
  const [bookId, setBookId]         = useState<number | null>(null);
  const [toc, setToc]               = useState<string[]>([]);

  function addLog(msg: string) { setLog(prev => [...prev, msg]); }

  async function apiFetch(body: Record<string, unknown>): Promise<{ ok: boolean; [k: string]: unknown }> {
    // Timeout de 40s en cliente — da margen sobre el límite de 30s del servidor
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 40000);
    try {
      const res = await fetch('/api/tintai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (!res.ok) {
        const text = await res.text().catch(() => `HTTP ${res.status}`);
        return { ok: false, error: `Error del servidor (${res.status}): ${text.slice(0, 200)}` };
      }
      return res.json();
    } catch (err: unknown) {
      clearTimeout(timer);
      const isAbort = err instanceof Error && err.name === 'AbortError';
      return { ok: false, error: isAbort ? 'Timeout: el servidor tardó demasiado. Inténtalo de nuevo con menos capítulos.' : `Error de red: ${String(err)}` };
    }
  }

  async function generate() {
    setGenerating(true); setError(''); setLog([]); setProgress(0);
    setPhase('toc'); addLog('Generando índice de capítulos…');

    // Paso 1: TOC
    const tocJson = await apiFetch({ step: 'toc', title, category, description, level, language, num_chapters: numChapters }) as { ok: boolean; book_id?: number; toc?: string[]; error?: string };
    if (!tocJson.ok) { setError(tocJson.error ?? 'Error generando índice'); setGenerating(false); return; }

    const bid      = tocJson.book_id!;
    const chapters = tocJson.toc!;
    setBookId(bid); setToc(chapters); setTotal(chapters.length);
    addLog(`Índice generado: ${chapters.length} capítulos. Creando contenido…`);

    // Paso 2: capítulos uno a uno
    for (let i = 0; i < chapters.length; i++) {
      setPhase(`chapter-${i}`);
      addLog(`Escribiendo capítulo ${i + 1}/${chapters.length}: "${chapters[i]}"…`);
      const chJson = await apiFetch({ step: 'chapter', book_id: bid, chapter_index: i }) as { ok: boolean; word_count?: number; error?: string };
      if (!chJson.ok) { setError(chJson.error ?? `Error en capítulo ${i + 1}`); setGenerating(false); return; }
      addLog(`  ✓ ${chJson.word_count} palabras`);
      setProgress(i + 1);
    }

    // Paso 3: finalizar
    setPhase('finalize'); addLog('Finalizando libro…');
    const finJson = await apiFetch({ step: 'finalize', book_id: bid }) as { ok: boolean; word_count?: number; error?: string };
    if (!finJson.ok) { setError(finJson.error ?? 'Error finalizando'); setGenerating(false); return; }

    addLog(`¡Libro completado! ${fmtWords(finJson.word_count ?? 0)} palabras en total.`);
    setPhase('done'); setProgress(chapters.length + 1);
    setGenerating(false); onBookReady();
  }

  const pct = total > 0 ? Math.round((progress / (total + 1)) * 100) : 0;

  return (
    <div className="tintai-body">
      <div className="tintai-section-title">Nuevo ebook</div>
      <div className="tintai-card">
        <div className="tintai-form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="tintai-field" style={{ gridColumn: 'span 2' }}>
            <label className="tintai-label">Título del libro *</label>
            <input className="tintai-input" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="ej. Introducción a los algoritmos de grafos" />
          </div>
          <div className="tintai-field">
            <label className="tintai-label">Categoría</label>
            <select className="tintai-select" value={category} onChange={e => setCategory(e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </div>
          <div className="tintai-field">
            <label className="tintai-label">Nivel</label>
            <select className="tintai-select" value={level} onChange={e => setLevel(e.target.value)}>
              {LEVELS.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
            </select>
          </div>
          <div className="tintai-field">
            <label className="tintai-label">Idioma</label>
            <select className="tintai-select" value={language} onChange={e => setLanguage(e.target.value)}>
              {LANGUAGES.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
            </select>
          </div>
          <div className="tintai-field">
            <label className="tintai-label">Nº capítulos (3-12)</label>
            <input className="tintai-input" type="number" min="3" max="12" value={numChapters}
              onChange={e => setNum(parseInt(e.target.value) || 6)} />
          </div>
          <div className="tintai-field" style={{ gridColumn: 'span 2' }}>
            <label className="tintai-label">Descripción adicional (opcional)</label>
            <input className="tintai-input" value={description} onChange={e => setDesc(e.target.value)}
              placeholder="Aspectos concretos a cubrir, enfoque, audiencia…" />
          </div>
        </div>
        <div style={{ marginTop: '1rem' }}>
          <button className="tintai-btn" disabled={generating || !title} onClick={generate}>
            {generating ? <><span className="tintai-saving-dot" />Generando…</> : '✦ Generar ebook'}
          </button>
        </div>
      </div>

      {/* Progreso de generación */}
      {(generating || phase === 'done') && (
        <div className="tintai-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
            <span style={{ color: 'var(--adm-muted)' }}>
              {phase === 'toc' ? 'Generando índice…' :
               phase === 'done' ? '¡Listo!' :
               `Capítulo ${progress}/${total}`}
            </span>
            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{pct}%</span>
          </div>
          <div className="tintai-progress-bar">
            <div className="tintai-progress-fill" style={{ width: `${pct}%` }} />
          </div>
          {/* Índice generado */}
          {toc.length > 0 && (
            <ul className="tintai-toc" style={{ marginTop: '.75rem' }}>
              {toc.map((t, i) => (
                <li key={i} style={{ cursor: 'default' }}>
                  <span className="tintai-toc-num">{i + 1}</span>
                  <span style={{ color: i < progress ? '#22c55e' : i === progress ? 'var(--primary)' : 'var(--adm-muted)' }}>
                    {i < progress ? '✓ ' : i === progress && generating ? '✦ ' : ''}{t}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {phase === 'done' && bookId && (
            <div style={{ marginTop: '1rem', fontSize: 13, color: '#22c55e' }}>
              ✓ Ebook generado. Ve a <strong>Biblioteca</strong> para leerlo.
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="tintai-card" style={{ borderColor: '#ef444466' }}>
          <div style={{ fontSize: 13, color: '#ef4444' }}>⚠ {error}</div>
        </div>
      )}
    </div>
  );
}

/* ── Subvista: Biblioteca ────────────────────────────────────────────── */
function VistaBiblioteca({ books, onRefresh, onRead }: {
  books: Book[]; onRefresh: () => void; onRead: (book: Book) => void;
}) {
  const EMOJI: Record<string, string> = {
    'programación': '💻', 'filosofía': '🧠', 'ciencia': '🔬',
    'idiomas': '🌍', 'historia': '📜', 'psicología': '💡',
  };

  async function del(e: React.MouseEvent, id: number) {
    e.stopPropagation();
    if (!confirm('¿Eliminar este libro y todos sus capítulos?')) return;
    await fetch(`/api/tintai/books?id=${id}`, { method: 'DELETE' });
    onRefresh();
  }

  if (books.length === 0) return (
    <div className="tintai-body" style={{ textAlign: 'center', paddingTop: '3rem', color: 'var(--adm-muted)', fontSize: 14 }}>
      No hay libros generados aún. Ve a <strong>Generar</strong> para crear el primero.
    </div>
  );

  return (
    <div className="tintai-body">
      <div className="tintai-section-title">{books.length} libro{books.length !== 1 ? 's' : ''}</div>
      <div className="tintai-books-grid">
        {books.map(b => (
          <div key={b.id} className="tintai-book-card" onClick={() => b.status === 'ready' && onRead(b)}>
            <div className="tintai-book-cover" style={{ background: `${b.cover_color}22` }}>
              <span style={{ fontSize: 32 }}>{EMOJI[b.category] ?? '📚'}</span>
            </div>
            <div className="tintai-book-info">
              <div className="tintai-book-title">{b.title}</div>
              <div className="tintai-book-meta" style={{ marginBottom: 6 }}>
                {b.category} · {b.level} · {fmtDate(b.created_at)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                {b.status === 'ready'
                  ? <span className="tintai-badge" style={{ background: '#22c55e22', color: '#22c55e' }}>
                      {fmtWords(b.word_count)} palabras
                    </span>
                  : b.status === 'generating'
                  ? <span className="tintai-badge" style={{ background: '#f59e0b22', color: '#f59e0b' }}>
                      {b.chapters_done}/{b.num_chapters} caps
                    </span>
                  : <span className="tintai-badge" style={{ background: '#ef444422', color: '#ef4444' }}>Error</span>
                }
                <button className="tintai-btn-ghost" style={{ fontSize: 11, padding: '3px 8px' }}
                  onClick={e => del(e, b.id)}>✕</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Subvista: Lector ────────────────────────────────────────────────── */
function VistaLector({ book, onBack }: { book: Book; onBack: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [chapter, setChapter]           = useState<Chapter | null>(null);
  const [loading, setLoading]           = useState(false);
  const [showToc, setShowToc]           = useState(false);
  const toc: string[]                   = (() => { try { return JSON.parse((book as unknown as { toc: string }).toc ?? '[]'); } catch { return []; } })();

  const loadChapter = useCallback(async (index: number) => {
    setLoading(true);
    const r = await fetch(`/api/tintai/chapter?book_id=${book.id}&index=${index}`);
    const j = await r.json() as { ok: boolean; chapter?: Chapter };
    if (j.ok && j.chapter) setChapter(j.chapter);
    setLoading(false);
    // Guardar progreso
    fetch('/api/tintai/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ book_id: book.id, current_chapter: index }),
    });
  }, [book.id]);

  useEffect(() => {
    // Recuperar progreso guardado
    fetch(`/api/tintai/progress?book_id=${book.id}`)
      .then(r => r.json())
      .then((j: { ok: boolean; progress?: { current_chapter: number } }) => {
        const idx = j.ok ? (j.progress?.current_chapter ?? 0) : 0;
        setCurrentIndex(idx);
        loadChapter(idx);
      });
  }, [book.id, loadChapter]);

  function goTo(index: number) {
    if (index < 0 || index >= book.num_chapters) return;
    setCurrentIndex(index);
    loadChapter(index);
    setShowToc(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const pct = Math.round(((currentIndex + 1) / book.num_chapters) * 100);

  return (
    <div className="tintai-body tintai-reader">
      {/* Header del lector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem' }}>
        <button className="tintai-btn-ghost" onClick={onBack}>← Biblioteca</button>
        <span style={{ flex: 1, fontSize: 13, color: 'var(--adm-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.title}</span>
        <button className="tintai-btn-ghost" onClick={() => setShowToc(v => !v)}>
          {showToc ? 'Ocultar índice' : 'Índice ☰'}
        </button>
      </div>

      {/* Índice desplegable */}
      {showToc && toc.length > 0 && (
        <div className="tintai-card" style={{ marginBottom: '1rem' }}>
          <ul className="tintai-toc">
            {toc.map((t, i) => (
              <li key={i} onClick={() => goTo(i)}
                style={{ color: i === currentIndex ? 'var(--primary)' : undefined, fontWeight: i === currentIndex ? 600 : undefined }}>
                <span className="tintai-toc-num">{i + 1}</span>{t}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Barra de progreso */}
      <div className="tintai-reader-nav">
        <div className="tintai-chapter-progress">
          <div style={{ fontSize: 11, color: 'var(--adm-muted)', marginBottom: 3 }}>
            Capítulo {currentIndex + 1} de {book.num_chapters}
          </div>
          <div className="tintai-progress-bar" style={{ margin: 0 }}>
            <div className="tintai-progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <button className="tintai-btn-ghost" disabled={currentIndex === 0} onClick={() => goTo(currentIndex - 1)}>←</button>
        <button className="tintai-btn-ghost" disabled={currentIndex === book.num_chapters - 1} onClick={() => goTo(currentIndex + 1)}>→</button>
      </div>

      {/* Contenido del capítulo */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--adm-muted)', fontSize: 13 }}>
          <span className="tintai-saving-dot" />Cargando capítulo…
        </div>
      )}
      {!loading && chapter && (
        <div className="tintai-card">
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: '1.25rem', color: 'var(--primary)' }}>
            {chapter.title}
          </h2>
          <MarkdownView content={chapter.content} />
          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--adm-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--adm-muted)' }}>{chapter.word_count} palabras</span>
            <div style={{ display: 'flex', gap: 8 }}>
              {currentIndex > 0 && (
                <button className="tintai-btn-ghost" onClick={() => goTo(currentIndex - 1)}>← Anterior</button>
              )}
              {currentIndex < book.num_chapters - 1 && (
                <button className="tintai-btn" onClick={() => goTo(currentIndex + 1)}>Siguiente →</button>
              )}
              {currentIndex === book.num_chapters - 1 && (
                <span style={{ fontSize: 13, color: '#22c55e', fontWeight: 500 }}>✓ Completado</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Página principal ────────────────────────────────────────────────── */
type Tab = 'generar' | 'biblioteca' | 'lector';

export default function TintAIPage() {
  const [tab, setTab]         = useState<Tab>('generar');
  const [books, setBooks]     = useState<Book[]>([]);
  const [reading, setReading] = useState<Book | null>(null);

  const fetchBooks = useCallback(async () => {
    const r = await fetch('/api/tintai/books');
    const j = await r.json() as { ok: boolean; books: Book[] };
    if (j.ok) setBooks(j.books);
  }, []);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  function openReader(book: Book) {
    setReading(book);
    setTab('lector');
  }

  return (
    <div className="tintai-wrap">
      <style>{STYLES}</style>

      <div className="tintai-topbar">
        <span className="tintai-title">TintAI</span>
        <span style={{ fontSize: 12, color: 'var(--adm-muted)' }}>Ebooks didácticos con Claude</span>
      </div>

      <div className="tintai-tabs">
        {(['generar', 'biblioteca'] as Tab[]).map(t => (
          <button key={t} className={`tintai-tab${tab === t ? ' active' : ''}`}
            onClick={() => { setTab(t); if (t === 'biblioteca') fetchBooks(); }}>
            {{ generar: '✦ Generar', biblioteca: `Biblioteca${books.length > 0 ? ` (${books.length})` : ''}` }[t]}
          </button>
        ))}
        {reading && (
          <button className={`tintai-tab${tab === 'lector' ? ' active' : ''}`} onClick={() => setTab('lector')}>
            📖 {reading.title.length > 20 ? reading.title.slice(0, 20) + '…' : reading.title}
          </button>
        )}
      </div>

      {tab === 'generar' && (
        <VistaGenerar onBookReady={() => { fetchBooks(); setTab('biblioteca'); }} />
      )}
      {tab === 'biblioteca' && (
        <VistaBiblioteca books={books} onRefresh={fetchBooks} onRead={openReader} />
      )}
      {tab === 'lector' && reading && (
        <VistaLector book={reading} onBack={() => setTab('biblioteca')} />
      )}
    </div>
  );
}
