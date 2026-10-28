import type { Metadata } from "next";
import { profile } from "@/data/resume";

/**
 * Canonical URL plus the RSS feed link. A page that sets `alternates`
 * replaces the root layout's entirely, so every page builds them here to
 * keep the feed discoverable site-wide.
 */
export function alternatesFor(path: string): Metadata["alternates"] {
  return {
    canonical: path,
    types: {
      "application/rss+xml": [
        { url: "/feed.xml", title: `${profile.name} — Blog` },
      ],
    },
  };
}
