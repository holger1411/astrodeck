import rss from '@astrojs/rss';
import { getPublishedPosts } from '@/lib/blog';
import MarkdownIt from 'markdown-it';
import sanitizeHtml from 'sanitize-html';
import { site } from '@/config/site';

const parser = new MarkdownIt();

export async function GET(context: import('astro').APIContext) {
  const blog = await getPublishedPosts();
  const sortedPosts = blog.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  return rss({
    title: `${site.name} Blog`,
    description: `Articles, tutorials, and updates from the ${site.name} project`,
    site: context.site ?? site.url,
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      author: post.data.author,
      link: `/blog/${post.id}/`,
      categories: post.data.tags,
      // Full article body so feed readers can show the whole post
      content: sanitizeHtml(parser.render(post.body ?? ''), {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
      }),
    })),
    // RSS language code from the locale, e.g. en_US → en-us
    customData: `<language>${site.locale.replace('_', '-').toLowerCase()}</language>`,
  });
}
