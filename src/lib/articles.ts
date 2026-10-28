import type { CollectionEntry } from 'astro:content';

export function publishedArticles(articles: CollectionEntry<'articles'>[]) {
  return articles
    .filter((article) => !article.data.draft)
    .sort((a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf());
}
