import { verifyAuth } from '../_auth-util';

interface Env { DB: D1Database; JWT_SECRET: string; ANTHROPIC_API_KEY: string }

const H = { 'Content-Type': 'application/json' };

/* ── Prompt sistema cacheado — define el estilo del escritor ── */
const SYSTEM_PROMPT = `Eres un escritor didáctico especializado en crear contenido educativo claro, estructurado y ameno. Tu estilo es accesible pero riguroso: usas ejemplos concretos, analogías útiles y una estructura clara con subtítulos. Escribes exclusivamente en Markdown. Cada capítulo tiene entre 450 y 700 palabras, con esta estructura: una introducción breve (1-2 frases), el desarrollo con 2-3 subtítulos (##), y un párrafo de cierre o resumen. No incluyas el título del capítulo al inicio del contenido — ya viene dado en el índice.`;

/* ── Colores por categoría ── */
const CATEGORY_COLORS: Record<string, string> = {
  'programación': '#00e7eb',
  'filosofía':    '#a78bfa',
  'ciencia':      '#34d399',
  'idiomas':      '#fb923c',
  'historia':     '#f59e0b',
  'psicología':   '#ec4899',
};

async function callClaude(apiKey: string, userPrompt: string): Promise<string> {
  // Abort a los 25s — Cloudflare Pages Functions corta a los 30s de wall-clock
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);

  let res: Response;
  try {
    res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'x-api-key':         apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta':    'prompt-caching-2024-07-31',
        'content-type':      'application/json',
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-6',
        max_tokens: 2048,
        system: [
          {
            type: 'text',
            text: SYSTEM_PROMPT,
            cache_control: { type: 'ephemeral' },
          },
        ],
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });
  } catch (err: unknown) {
    clearTimeout(timer);
    const isAbort = err instanceof Error && err.name === 'AbortError';
    throw new Error(isAbort ? 'Timeout: Claude tardó demasiado. Inténtalo de nuevo.' : String(err));
  }
  clearTimeout(timer);

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API error ${res.status}: ${err}`);
  }

  const data = await res.json() as { content: { type: string; text: string }[] };
  return data.content.find(b => b.type === 'text')?.text ?? '';
}

/* ── POST /api/tintai/generate ─────────────────────────────────────────────
   Tres pasos orquestados desde el cliente:
   · step=toc      → genera índice + crea libro en DB  → devuelve book_id y toc
   · step=chapter  → genera un capítulo y lo guarda    → devuelve title y word_count
   · step=finalize → marca el libro como 'ready'       → devuelve ok                 */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
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

  /* ── Paso 1: generar índice y crear libro ── */
  if (step === 'toc') {
    const { title, category, description, level, language, num_chapters } = body as {
      title: string; category: string; description?: string;
      level: string; language: string; num_chapters: number;
    };

    if (!title || !category || !level || !language || !num_chapters)
      return new Response(JSON.stringify({ ok: false, error: 'Faltan campos obligatorios' }), { status: 400, headers: H });

    const tocPrompt = `Crea un índice para un ebook titulado "${title}" sobre "${category}".
Nivel: ${level}. Idioma: ${language}.
El ebook tendrá exactamente ${num_chapters} capítulos.
${description ? `Descripción adicional: ${description}` : ''}

Devuelve ÚNICAMENTE un JSON válido con esta estructura exacta, sin texto adicional:
{
  "description": "Una descripción del libro en 1-2 frases",
  "chapters": ["Título capítulo 1", "Título capítulo 2", ...]
}`;

    let tocText: string;
    try {
      tocText = await callClaude(env.ANTHROPIC_API_KEY, tocPrompt);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error generando índice';
      return new Response(JSON.stringify({ ok: false, error: msg }), { status: 500, headers: H });
    }

    // Extraer JSON del texto (Claude a veces añade ```json ... ```)
    const jsonMatch = tocText.match(/\{[\s\S]*\}/);
    if (!jsonMatch)
      return new Response(JSON.stringify({ ok: false, error: 'Respuesta de Claude inválida' }), { status: 500, headers: H });

    let parsed: { description: string; chapters: string[] };
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      return new Response(JSON.stringify({ ok: false, error: 'JSON de índice inválido' }), { status: 500, headers: H });
    }

    const cover_color = CATEGORY_COLORS[category] ?? '#00e7eb';
    const finalDesc   = description || parsed.description;

    const { meta } = await env.DB.prepare(`
      INSERT INTO tintai_books (user_id, title, category, description, level, language, num_chapters, cover_color, toc, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'generating')
    `).bind(
      auth.user_id, title, category, finalDesc, level, language, num_chapters,
      cover_color, JSON.stringify(parsed.chapters)
    ).run();

    return new Response(JSON.stringify({
      ok: true, book_id: meta.last_row_id,
      description: finalDesc, toc: parsed.chapters,
    }), { status: 200, headers: H });
  }

  /* ── Paso 2: generar un capítulo ── */
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

    const toc: string[] = JSON.parse(book.toc ?? '[]');
    const chapterTitle  = toc[chapter_index] ?? `Capítulo ${chapter_index + 1}`;

    const chapterPrompt = `Escribe el capítulo ${chapter_index + 1} del ebook "${book.title}" (categoría: ${book.category}, nivel: ${book.level}, idioma: ${book.language}).

Índice completo del libro:
${toc.map((t, i) => `${i + 1}. ${t}`).join('\n')}

Escribe ahora el capítulo: "${chapterTitle}"
Recuerda: 450-700 palabras, estructura con subtítulos ##, sin repetir el título al inicio.`;

    let content: string;
    try {
      content = await callClaude(env.ANTHROPIC_API_KEY, chapterPrompt);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error generando capítulo';
      // Marcamos el libro con error para que el cliente pueda reintentar
      await env.DB.prepare(
        "UPDATE tintai_books SET status='error', error_msg=? WHERE id=?"
      ).bind(msg, book_id).run();
      return new Response(JSON.stringify({ ok: false, error: msg }), { status: 500, headers: H });
    }

    const word_count = content.split(/\s+/).filter(Boolean).length;

    await env.DB.prepare(`
      INSERT INTO tintai_chapters (book_id, chapter_index, title, content, word_count)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(book_id, chapter_index) DO UPDATE SET
        title = excluded.title, content = excluded.content, word_count = excluded.word_count
    `).bind(book_id, chapter_index, chapterTitle, content, word_count).run();

    return new Response(JSON.stringify({ ok: true, title: chapterTitle, word_count }), { status: 200, headers: H });
  }

  /* ── Paso 3: finalizar libro ── */
  if (step === 'finalize') {
    const { book_id } = body as { book_id: number };
    if (!book_id)
      return new Response(JSON.stringify({ ok: false, error: 'book_id requerido' }), { status: 400, headers: H });

    // Suma el total de palabras de todos los capítulos
    const { results } = await env.DB.prepare(
      'SELECT COALESCE(SUM(word_count), 0) AS total FROM tintai_chapters WHERE book_id = ?'
    ).bind(book_id).all<{ total: number }>();

    const total_words = results[0]?.total ?? 0;

    await env.DB.prepare(
      "UPDATE tintai_books SET status='ready', word_count=? WHERE id=? AND user_id=?"
    ).bind(total_words, book_id, auth.user_id).run();

    return new Response(JSON.stringify({ ok: true, word_count: total_words }), { status: 200, headers: H });
  }

  return new Response(JSON.stringify({ ok: false, error: 'step inválido (toc|chapter|finalize)' }), { status: 400, headers: H });
};
