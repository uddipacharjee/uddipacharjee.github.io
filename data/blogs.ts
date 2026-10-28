/**
 * Every blog post's details. The index at /blogs/ lists these newest first,
 * whatever their order here, and each post page reads its own entry for its
 * header, metadata and JSON-LD.
 *
 * Each entry needs a matching page at app/blogs/<slug>/page.tsx that wraps
 * its content in <BlogPost slug="...">. See "Adding a blog post" in the README.
 */

export type Post = {
  /** URL segment, and the name of the post's folder under app/blogs/. */
  slug: string;
  title: string;
  /** One or two sentences: shown on the index and used as the meta description. */
  description: string;
  category: string;
  /** Calendar dates as YYYY-MM-DD. */
  datePublished: string;
  dateModified?: string;
  readingMinutes: number;
  tags?: string[];
};

export const blogIntro =
  "Notes from building Java and Spring services: what worked, what broke, and why.";

export const posts: Post[] = [];

export const postsNewestFirst = [...posts].sort((a, b) =>
  b.datePublished.localeCompare(a.datePublished),
);

/** Fails the build if a post page names a slug with no entry above. */
export function getPost(slug: string): Post {
  const post = posts.find((p) => p.slug === slug);
  if (!post) throw new Error(`No entry for "${slug}" in data/blogs.ts`);
  return post;
}
