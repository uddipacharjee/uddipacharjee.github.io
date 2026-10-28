import type { MetadataRoute } from "next";
import { siteUrl } from "@/data/resume";

/**
 * Lets every crawler in and points it at the sitemap.
 *
 * Emitted as a static /robots.txt. `output: "export"` requires route handlers
 * to opt into static rendering explicitly, hence the `dynamic` export below.
 */
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
