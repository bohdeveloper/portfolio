import { verifyAuth } from '../_auth-util';

interface Env { DB: D1Database; JWT_SECRET: string; ANTHROPIC_API_KEY: string }

const H = { 'Content-Type': 'application/json' };

const SYSTEM_PROMPT = `Eres un escritor didáctico especializado en crear contenido educativo claro, estructurado y ameno. Tu estilo es accesible pero riguroso: usas ejemplos concretos, analogías útiles y una estructura clara con subtítulos. Escribes exclusivamente en Markdown. Cada capítulo tiene entre 400 y 600 palabras, con esta estructura: una introducción breve (1-2 frases), el desarrollo con 2-3 subtítulos (##), y un párrafo de cierre. No incluyas el título del capítulo al inicio del contenido.`;

const CATEGORY_COLORS: Record<string, string> = {
  'programación':  '#00e7eb', 'filosofía':     '#a78bfa', 'ciencia':       '#34d399',
  'idiomas':       '#fb923c', 'historia':      '#f59e0b', 'psicología':    '#ec4899',
  'literatura':    '#38bdf8', 'novela':        '#f472b6', 'matemáticas':   '#818cf8',
  'economía':      '#4ade80', 'salud':         '#f87171', 'autoayuda':     '#a3e635',
  'tecnología':    '#facc15', 'arte':          '#e879f9', 'espiritualidad':'#67e8f9',
  'educación':     '#fdba74',
};

// Haiku 4.5 — significativamente más rápido que Sonnet, ideal para generación en Workers
async function callClaude(apiKey: string, userPrompt: string): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key':         apiKey,
      'anthropic-version': '2023-06-01',
      'content-type':      'application/json',
    },
    body: JSON.stringify({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      system:     SYSTEM_PROMPT,
      messages:   [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => `HTTP ${res.status}`);
    throw new Error(`Claude API ${res.status}: ${text.slice(0, 300)}`);
  }

  const data = await res.json() as { content: { type: string; text: string }[] };
  const content = data.content?.find(b => b.type === 'text')?.text ?? '';
  if (!content) throw new Error('Claude no devolvió contenido de texto');
  return content;
}

/* ── POST /api/tintai/generate ─────────────────────────────────────────
   step=toc      → genera índice + crea libro en DB
   step=chapter  → genera un capítulo y lo guarda
   step=finalize → marca el libro como 'ready'                         */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  // Try-catch global — cualquier excepción no prevista devuelve JSON, nunca 1101
  try {
    const auth = await verifyAuth(request, env.JWT_SECRET);
    if (!auth)
      return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401, headers: H });

    if (!env.ANTHROPIC_API_KEY)
      return new Response(JSON.stringify({ ok: false, error: 'ANTHROPIC_API_KEY no configurada' }), { status: 500, headers: H });

    let body: Record<string, unknown>;
    try { body = await request.json(); } catch {
      return new Response(JSON.stringify({ ok: false, error: 'Invalid JSON' }), { status: 400, headers: H });
    }

    const step = body.step as string;

    /* ── Paso 1: TOC ── */
    if (step === 'toc') {
      const { title, category, description, level, language, num_chapters } = body as {
        title: string; category: string; description?: string;
        level: string; language: string; num_chapters: number;
      };

      if (!title || !category || !level || !language || !num_chapters)
        return new Response(JSON.stringify({ ok: false, error: 'Faltan campos obligatorios' }), { status: 400, headers: H });

      const tocPrompt = `Crea un índice para un ebook titulado "${title}" sobre "${category}". Nivel: ${level}. Idioma: ${language}. Tendrá exactamente ${num_chapters} capítulos.${description ? ` Descripción: ${description}` : ''}

Devuelve ÚNICAMENTE este JSON, sin texto adicional:
{"description":"descripción del libro en 1-2 frases","chapters":["Título cap 1","Título cap 2",...]}`;

      let tocText: string;
      try {
        tocText = await callClaude(env.ANTHROPIC_API_KEY, tocPrompt);
      } catch (err: unknown) {
        return new Response(JSON.stringify({ ok: false, error: err instanceof Error ? err.message : 'Error generando índice' }), { status: 500, headers: H });
      }

      const jsonMatch = tocText.match(/\{[\s\S]*\}/);
      if (!jsonMatch)
        return new Response(JSON.stringify({ ok: false, error: `Respuesta inesperada de Claude: ${tocText.slice(0, 200)}` }), { status: 500, headers: H });

      let parsed: { description: string; chapters: string[] };
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch {
        return new Response(JSON.stringify({ ok: false, error: 'JSON de índice inválido' }), { status: 500, headers: H });
      }

      if (!Array.isArray(parsed.chapters) || parsed.chapters.length === 0)
        return new Response(JSON.stringify({ ok: false, error: 'El índice generado no tiene capítulos' }), { status: 500, headers: H });

      const cover_color = CATEGORY_COLORS[category] ?? '#00e7eb';
      const finalDesc   = description || parsed.description || '';

      const { meta } = await env.DB.prepare(
        `INSERT INTO tintai_books (user_id, title, category, description, level, language, num_chapters, cover_color, toc, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'generating')`
      ).bind(auth.user_id, title, category, finalDesc, level, language, parsed.chapters.length, cover_color, JSON.stringify(parsed.chapters)).run();

      return new Response(JSON.stringify({ ok: true, book_id: meta.last_row_id, description: finalDesc, toc: parsed.chapters }), { status: 200, headers: H });
    }

    /* ── Paso 2: capítulo ── */
    if (step === 'chapter') {
      const { book_id, chapter_index } = body as { book_id: number; chapter_index: number };
      if (book_id === undefined || chapter_index === undefined)
        return new Response(JSON.stringify({ ok: false, error: 'book_id y chapter_index requeridos' }), { status: 400, headers: H });

      const { results } = await env.DB.prepare(
        'SELECT title, category, level, language, toc FROM tintai_books WHERE id = ? AND user_id = ?'
      ).bind(book_id, auth.user_id).all<{ title: string; category: string; level: string; language: string; toc: string }>();

      const book = results[0];
      if (!book)
        return new Response(JSON.stringify({ ok: false, error: 'Libro no encontrado' }), { status: 404, headers: H });

      const toc: string[]  = JSON.parse(book.toc ?? '[]');
      const chapterTitle   = toc[chapter_index] ?? `Capítulo ${chapter_index + 1}`;

      const chapterPrompt = `Escribe el capítulo ${chapter_index + 1} del ebook "${book.title}" (categoría: ${book.category}, nivel: ${book.level}, idioma: ${book.language}).

Índice:
${toc.map((t, i) => `${i + 1}. ${t}`).join('\n')}

Escribe ahora: "${chapterTitle}". Entre 400-600 palabras, subtítulos ##, sin repetir el título.`;

      let content: string;
      try {
        content = await callClaude(env.ANTHROPIC_API_KEY, chapterPrompt);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error generando capítulo';
        await env.DB.prepare("UPDATE tintai_books SET status='error', error_msg=? WHERE id=?").bind(msg, book_id).run();
        return new Response(JSON.stringify({ ok: false, error: msg }), { status: 500, headers: H });
      }

      const word_count = content.split(/\s+/).filter(Boolean).length;

      await env.DB.prepare(
        `INSERT INTO tintai_chapters (book_id, chapter_index, title, content, word_count)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(book_id, chapter_index) DO UPDATE SET title=excluded.title, content=excluded.content, word_count=excluded.word_count`
      ).bind(book_id, chapter_index, chapterTitle, content, word_count).run();

      return new Response(JSON.stringify({ ok: true, title: chapterTitle, word_count }), { status: 200, headers: H });
    }

    /* ── Paso 3: finalizar ── */
    if (step === 'finalize') {
      const { book_id } = body as { book_id: number };
      if (!book_id)
        return new Response(JSON.stringify({ ok: false, error: 'book_id requerido' }), { status: 400, headers: H });

      const { results } = await env.DB.prepare(
        'SELECT COALESCE(SUM(word_count), 0) AS total FROM tintai_chapters WHERE book_id = ?'
      ).bind(book_id).all<{ total: number }>();

      await env.DB.prepare(
        "UPDATE tintai_books SET status='ready', word_count=? WHERE id=? AND user_id=?"
      ).bind(results[0]?.total ?? 0, book_id, auth.user_id).run();

      return new Response(JSON.stringify({ ok: true, word_count: results[0]?.total ?? 0 }), { status: 200, headers: H });
    }

    return new Response(JSON.stringify({ ok: false, error: 'step inválido (toc|chapter|finalize)' }), { status: 400, headers: H });

  } catch (err: unknown) {
    // Captura cualquier excepción no prevista — evita el error 1101
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ ok: false, error: `Error interno: ${msg}` }), { status: 500, headers: H });
  }
};
