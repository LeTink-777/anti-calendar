import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { SITE } from '@/lib/content';
import { POSTS } from '@/lib/blog-posts';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || SITE.url;

export function generateStaticParams() {
  return POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = POSTS.find((p) => p.slug === slug);

  if (!post) return { title: `Статья не найдена — ${SITE.name}` };

  return {
    title: `${post.title} — ${SITE.name}`,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: 'article',
      locale: 'ru_RU',
      url: `${siteUrl}/blog/${post.slug}`,
      siteName: SITE.name,
      title: post.title,
      description: post.description,
    },
    robots: { index: true, follow: true },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = POSTS.find((p) => p.slug === slug);

  if (!post) notFound();

  // Контент хранится строкой: строки с «## » — подзаголовки, остальное — абзацы.
  const blocks = post.content
    .split('\n\n')
    .map((b) => b.trim())
    .filter(Boolean);

  return (
    <main className="doc-wrap">
      <Link href="/blog" className="doc-back">
        <ArrowLeft size={15} strokeWidth={1.8} />
        Все статьи
      </Link>

      <h1 className="doc-title">{post.title}</h1>
      <p className="doc-meta">{SITE.name}</p>

      <div className="doc-section">
        {blocks.map((block, i) =>
          block.startsWith('## ') ? (
            <h2 key={i}>{block.slice(3)}</h2>
          ) : (
            <p key={i}>{block}</p>
          )
        )}
      </div>

      <div className="doc-highlight">
        <h2>{post.ctaTitle}</h2>
        <p>{post.ctaText}</p>
        <p>
          <Link href="/" className="doc-back" style={{ marginBottom: 0 }}>
            Перейти к расчёту
            <ArrowRight size={15} strokeWidth={1.8} />
          </Link>
        </p>
      </div>

      <footer className="doc-foot">
        Евдокимов Даниил Владимирович · ИНН 381928138362 · Самозанятый
        <br />
        danyavdkmvv3@gmail.com · @dvdkmv
        <br />
        Материалы носят развлекательный и познавательный характер.
      </footer>
    </main>
  );
}
