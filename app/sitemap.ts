import type { MetadataRoute } from "next";
import { postsNewestFirst } from "@/data/blogs";
import { siteUrl } from "@/data/resume";

/** Static /sitemap.xml: the home page, the blog index and every post. */
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastPostChange = postsNewestFirst
    .map((post) => post.dateModified ?? post.datePublished)
    .sort()
    .at(-1);

  return [
    { url: `${siteUrl}/`, changeFrequency: "monthly", priority: 1 },
    {
      url: `${siteUrl}/blogs/`,
      lastModified: lastPostChange,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...postsNewestFirst.map((post) => ({
      url: `${siteUrl}/blogs/${post.slug}/`,
      lastModified: post.dateModified ?? post.datePublished,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
