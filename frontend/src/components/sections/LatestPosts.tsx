'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Post {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  cover_image: string;
  tags: string;
  reading_time: number;
  created_at: string;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
}

export default function LatestPosts() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetch('/api/blog/list')
      .then(r => r.json())
      .then((res: { ok: boolean; data?: Post[] }) => {
        if (res.ok) setPosts((res.data ?? []).slice(0, 3));
      })
      .catch(() => {});
  }, []);

  if (posts.length === 0) return null;

  return (
    <section id="blog" className="max-w-4xl mx-auto px-6 py-16">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-primary text-xs tracking-widest uppercase font-medium mb-2">Blog</p>
          <h2 className="text-2xl font-light tracking-tight text-gray-900 dark:text-gray-100">
            Últimos artículos
          </h2>
        </div>
        <Link
          href="/blog"
          className="text-sm text-primary hover:underline underline-offset-4 transition"
        >
          Ver todos →
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {posts.map(p => (
          <Link
            key={p.id}
            href={`/blog?slug=${p.slug}`}
            className="group flex flex-col border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden
              hover:border-primary/40 transition-all"
          >
            {p.cover_image ? (
              <img src={p.cover_image} alt="" className="w-full h-32 object-cover" />
            ) : (
              <div className="w-full h-32 bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 dark:text-gray-700">
                  <rect x="3" y="2" width="13" height="18" rx="2" />
                  <path d="M6 7h7M6 11h7M6 15h4" />
                  <path d="M15 14l4 4-2 2-4-4 .5-2.5z" fill="currentColor" stroke="none" />
                </svg>
              </div>
            )}
            <div className="p-4 flex flex-col flex-1 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
              <p className="text-xs text-gray-400 mb-2">{fmtDate(p.created_at)} · {p.reading_time} min</p>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 group-hover:text-primary transition line-clamp-2 flex-1">
                {p.title}
              </h3>
              {p.excerpt && (
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{p.excerpt}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
