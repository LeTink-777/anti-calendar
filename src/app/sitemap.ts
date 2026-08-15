import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/content';
import { POSTS } from '@/lib/blog-posts';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || SITE.url;
  const lastModified = new Date();

  return [
    { url: `${base}/`, lastModified, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/blog`, lastModified, changeFrequency: 'weekly', priority: 0.8 },
    ...POSTS.map((post) => ({
      url: `${base}/blog/${post.slug}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    { url: `${base}/privacy`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/offer`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
