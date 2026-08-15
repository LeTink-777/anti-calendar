import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { SITE } from '@/lib/content';
import { POSTS } from '@/lib/blog-posts';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || SITE.url;

export const metadata: Metadata = {
  title: `Блог — ${SITE.name}`,
  description: `Статьи и разборы по теме «${SITE.name}». Полезные материалы, ответы на частые вопросы и практические рекомендации.`,
  alternates: { canonical: '/blog' },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: `${siteUrl}/blog`,
    siteName: SITE.name,
    title: `Блог — ${SITE.name}`,
    description: `Статьи и разборы по теме «${SITE.name}».`,
  },
  robots: { index: true, follow: true },
};

export default function BlogIndexPage() {
  return (
    <main className="doc-wrap">
      <Link href="/" className="doc-back">
        <ArrowLeft size={15} strokeWidth={1.8} />
        На главную
      </Link>

      <h1 className="doc-title">Блог</h1>
      <p className="doc-meta">
        {POSTS.length} статей по теме «{SITE.name}»
      </p>

      {POSTS.map((post) => (
        <article className="doc-section" key={post.slug}>
          <h2>
            <Link href={`/blog/${post.slug}`}>{post.title}</Link>
          </h2>
          <p>{post.description}</p>
          <p>
            <Link href={`/blog/${post.slug}`} className="doc-back" style={{ marginBottom: 0 }}>
              Читать статью
              <ArrowRight size={15} strokeWidth={1.8} />
            </Link>
          </p>
        </article>
      ))}

      <footer className="doc-foot">
        Евдокимов Даниил Владимирович · ИНН 381928138362 · Самозанятый
        <br />
        danyavdkmvv3@gmail.com · @dvdkmv
      </footer>
    </main>
  );
}
