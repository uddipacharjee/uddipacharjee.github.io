import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getPost, relatedPosts } from "@/data/blogs";
import { profile, siteUrl } from "@/data/resume";
import { formatDate } from "@/lib/dates";
import { alternatesFor } from "@/lib/seo";

const postPath = (slug: string) => `/blogs/${slug}/`;

/** A post page's metadata: `export const metadata = postMetadata(SLUG);` */
export function postMetadata(slug: string): Metadata {
  const post = getPost(slug);
  return {
    // Absolute: the post title is the keyword-bearing part, and the root
    // template's " — <name>" suffix would push it past what results show.
    title: { absolute: post.title },
    description: post.description,
    keywords: post.tags,
    authors: [{ name: profile.name, url: siteUrl }],
    alternates: alternatesFor(postPath(slug)),
    openGraph: {
      type: "article",
      url: `${siteUrl}${postPath(slug)}`,
      siteName: `${profile.name} — Blog`,
      title: post.title,
      description: post.description,
      publishedTime: post.datePublished,
      modifiedTime: post.dateModified ?? post.datePublished,
      authors: [profile.name],
      section: post.category,
      tags: post.tags,
      locale: "en_US",
    },
    twitter: {
      card: "summary",
      title: post.title,
      description: post.description,
    },
  };
}

/**
 * Frame for a single post: back link, title, byline, dates, the article
 * JSON-LD and related posts all come from the post's entry in
 * data/blogs.ts, so the page file only holds the writing itself.
 */
export default function BlogPost({
  slug,
  children,
}: {
  slug: string;
  children: ReactNode;
}) {
  const post = getPost(slug);
  const url = `${siteUrl}${postPath(slug)}`;
  const modified = post.dateModified ?? post.datePublished;
  const related = relatedPosts(slug);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      headline: post.title,
      description: post.description,
      url,
      ...(post.image && { image: `${siteUrl}${post.image}` }),
      datePublished: post.datePublished,
      dateModified: modified,
      author: {
        "@type": "Person",
        name: profile.name,
        url: siteUrl,
        jobTitle: profile.role,
      },
      publisher: { "@type": "Person", name: profile.name, url: siteUrl },
      isPartOf: { "@type": "Blog", name: `${profile.name} — Blog`, url: `${siteUrl}/blogs/` },
      articleSection: post.category,
      keywords: post.tags.join(", "),
      inLanguage: "en",
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${siteUrl}/blogs/` },
        { "@type": "ListItem", position: 3, name: post.title, item: url },
      ],
    },
  ];

  return (
    <article className="pb-24 pt-12 md:pb-32 md:pt-20">
      <script
        type="application/ld+json"
        // Static, author-controlled JSON — safe to inline.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/*
        minmax(0, 1fr) on phones too: an auto column would stretch to fit the
        longest code line and push the page wider than the screen.
      */}
      <div className="shell grid grid-cols-[minmax(0,1fr)] gap-y-8 md:grid-cols-[10rem_minmax(0,1fr)] md:gap-x-12 lg:grid-cols-[13rem_minmax(0,1fr)]">
        <a href="/blogs/" className="link self-start text-[15px] text-muted md:mt-3">
          All posts
        </a>

        <div className="max-w-[42rem]">
          <header>
            <h1 className="text-balance text-[2.5rem] font-semibold leading-[1.02] tracking-[-0.02em] font-stretch-condensed md:text-6xl">
              {post.title}
            </h1>
            <p className="mt-6 flex flex-wrap gap-x-5 gap-y-1 text-[15px] text-muted">
              <span>
                By{" "}
                <a href="/" rel="author" className="link text-ink">
                  {profile.name}
                </a>
              </span>
              <time dateTime={post.datePublished}>
                {formatDate(post.datePublished)}
              </time>
              {modified !== post.datePublished && (
                <span>
                  Updated <time dateTime={modified}>{formatDate(modified)}</time>
                </span>
              )}
              <span>{post.readingMinutes} min read</span>
            </p>
          </header>

          <div className="prose-post mt-12 md:mt-14">{children}</div>

          <footer className="mt-20 border-t border-rule pt-10">
            {related.length > 0 && (
              <nav aria-labelledby="related-heading">
                <h2 id="related-heading" className="text-[15px] font-semibold">
                  Related posts
                </h2>
                <ul className="mt-5 space-y-5">
                  {related.map((p) => (
                    <li key={p.slug}>
                      <a
                        href={postPath(p.slug)}
                        className="text-lg font-semibold leading-snug tracking-tight transition-colors hover:text-accent-ink"
                      >
                        {p.title}
                      </a>
                      <p className="mt-1 text-[15px] leading-relaxed text-muted">
                        {p.description}
                      </p>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
            <a
              href="/blogs/"
              className={`link inline-block text-[15px] text-muted${related.length > 0 ? " mt-10" : ""}`}
            >
              All posts
            </a>
          </footer>
        </div>
      </div>
    </article>
  );
}
