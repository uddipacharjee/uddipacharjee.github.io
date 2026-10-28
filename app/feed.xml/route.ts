import { blogIntro, postsNewestFirst } from "@/data/blogs";
import { profile, siteUrl } from "@/data/resume";

/** Static RSS 2.0 feed of every post, written to /feed.xml at build time. */
export const dynamic = "force-static";

const escapeXml = (text: string) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

// RSS wants RFC 822 dates; post dates are calendar days, so use UTC midnight.
const rssDate = (isoDate: string) => new Date(isoDate).toUTCString();

export function GET() {
  const items = postsNewestFirst
    .map((post) => {
      const url = `${siteUrl}/blogs/${post.slug}/`;
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(post.description)}</description>
      <category>${escapeXml(post.category)}</category>
      <pubDate>${rssDate(post.datePublished)}</pubDate>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`${profile.name} — Blog`)}</title>
    <link>${siteUrl}/blogs/</link>
    <description>${escapeXml(blogIntro)}</description>
    <language>en</language>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
