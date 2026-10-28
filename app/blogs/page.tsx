import type { Metadata } from "next";
import { blogIntro, postsNewestFirst } from "@/data/blogs";
import { profile, siteUrl, socials } from "@/data/resume";
import { formatDate } from "@/lib/dates";
import { alternatesFor } from "@/lib/seo";

const PAGE_PATH = "/blogs/";
const description = `Practical Java and Spring Boot guides by ${profile.name}: Spring Batch, Spring Modulith, JPA, testing, virtual threads and Spring AI, with diagrams and working code.`;

export const metadata: Metadata = {
  // Rendered through the root template as "Java and Spring Boot Blog — <name>".
  title: "Java and Spring Boot Blog",
  description,
  alternates: alternatesFor(PAGE_PATH),
  openGraph: {
    type: "website",
    url: `${siteUrl}${PAGE_PATH}`,
    title: `Java and Spring Boot Blog — ${profile.name}`,
    description,
  },
};

const collectionJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: `Blog — ${profile.name}`,
  description,
  url: `${siteUrl}${PAGE_PATH}`,
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: postsNewestFirst.length,
    itemListElement: postsNewestFirst.map((post, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: post.title,
      url: `${siteUrl}/blogs/${post.slug}/`,
      description: post.description,
    })),
  },
};

export default function Blogs() {
  return (
    <div className="pb-24 pt-12 md:pb-32 md:pt-20">
      <script
        type="application/ld+json"
        // Static, author-controlled JSON — safe to inline.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />

      <header className="shell">
        <h1 className="text-[3.25rem] font-semibold leading-[0.95] tracking-[-0.025em] font-stretch-condensed sm:text-7xl">
          Blog
        </h1>
        <p className="mt-6 max-w-[46ch] text-xl leading-snug text-muted md:mt-8 md:text-2xl">
          {blogIntro}
        </p>
      </header>

      {postsNewestFirst.length > 0 ? (
        <ol className="mt-16 border-b border-rule md:mt-24">
          {postsNewestFirst.map((post) => (
            <li key={post.slug} className="border-t border-rule">
              {/* Same columns as the home page sections: date left, post right. */}
              <article className="shell grid gap-y-2 py-8 md:grid-cols-[10rem_minmax(0,1fr)] md:gap-x-12 md:py-10 lg:grid-cols-[13rem_minmax(0,1fr)]">
                <time
                  dateTime={post.datePublished}
                  className="text-[15px] text-muted md:pt-1"
                >
                  {formatDate(post.datePublished)}
                </time>
                <div>
                  <h2 className="text-balance text-2xl font-semibold leading-snug tracking-tight">
                    <a
                      href={`/blogs/${post.slug}/`}
                      className="transition-colors hover:text-accent-ink"
                    >
                      {post.title}
                    </a>
                  </h2>
                  <p className="mt-2 max-w-[62ch] leading-relaxed text-muted">
                    {post.description}
                  </p>
                  <p className="mt-3 flex flex-wrap gap-x-5 text-sm text-faint">
                    <span>{post.category}</span>
                    <span>{post.readingMinutes} min read</span>
                  </p>
                </div>
              </article>
            </li>
          ))}
        </ol>
      ) : (
        <p className="shell mt-16 text-lg text-muted md:mt-24">
          No posts yet. Until the first one is up, the code is on{" "}
          <a
            href={socials.github}
            target="_blank"
            rel="noreferrer noopener"
            className="link text-ink"
          >
            GitHub
          </a>
          .
        </p>
      )}
    </div>
  );
}
