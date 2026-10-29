import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const items = (await getCollection('articles'))
    .filter((article) => !article.data.draft)
    .map((article) => ({
      title: article.data.title,
      description: article.data.summary,
      pubDate: article.data.publishedAt,
      link: `/articles/${article.data.slug}/`,
    }))
    .sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());

  return rss({
    title: 'zuricata.dev',
    description: 'Privacy, security & AI — by zuricata',
    site: context.site,
    items,
  });
}
