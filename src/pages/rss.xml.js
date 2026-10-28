import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = (await getCollection('blog'))
    .filter((post) => !post.data.draft)
    .map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/blog/${post.id}/`,
    }));

  const articles = (await getCollection('articles'))
    .filter((article) => !article.data.draft)
    .map((article) => ({
      title: article.data.title,
      description: article.data.summary,
      pubDate: article.data.publishedAt,
      link: `/articles/${article.data.slug}/`,
    }));

  const items = [...posts, ...articles].sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());

  return rss({
    title: 'zuricata.dev',
    description: 'Privacy, security & AI — by zuricata',
    site: context.site,
    items,
  });
}
