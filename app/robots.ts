import type { MetadataRoute } from "next";

/**
 * Keeps the site out of search engines.
 *
 * This is the crawl-level block (bots are asked not to fetch the pages at
 * all); the `robots` field in app/layout.tsx metadata is the index-level
 * block (noindex/nofollow meta tags). Both are needed: robots.txt alone does
 * not stop a URL that is linked from elsewhere being listed.
 *
 * Emitted as a static /robots.txt. `output: "export"` requires route handlers
 * to opt into static rendering explicitly, hence the `dynamic` export below.
 */
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}
