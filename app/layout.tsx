import type { Metadata, Viewport } from "next";
import { Instrument_Sans } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { profile, socials } from "@/data/resume";

// One family for everything. The width axis lets the hero name run
// condensed (font-stretch) while body text stays at normal width.
const instrumentSans = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

const siteUrl = "https://uddipacharjee.github.io";
const description = `${profile.role} in ${profile.location}, building Spring Boot services, Spring Batch pipelines and integration APIs on Java 21 and PostgreSQL.`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${profile.name} — ${profile.role}`,
    template: `%s — ${profile.name}`,
  },
  description,
  keywords: [
    profile.name,
    "Java developer",
    "Spring Boot",
    "Spring Batch",
    "backend engineer Bangladesh",
    "PostgreSQL",
  ],
  authors: [{ name: profile.name, url: siteUrl }],
  creator: profile.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: `${profile.name} — Portfolio`,
    title: `${profile.name} — ${profile.role}`,
    description,
    locale: "en_US",
    ...(profile.photo && { images: [{ url: profile.photo }] }),
  },
  twitter: {
    card: "summary",
    title: `${profile.name} — ${profile.role}`,
    description,
  },
  // The site is kept out of search results, as on the site this one was
  // built from. This emits <meta name="robots" content="noindex, nofollow">
  // alongside the Disallow rules in app/robots.ts; remove both to be indexed.
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f7f9" },
    { media: "(prefers-color-scheme: dark)", color: "#11151b" },
  ],
  colorScheme: "light dark",
};

/** schema.org Person markup so search engines read the profile correctly. */
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: profile.role,
  url: siteUrl,
  ...(profile.photo && { image: `${siteUrl}${profile.photo}` }),
  address: {
    "@type": "PostalAddress",
    addressLocality: "Dhaka",
    addressCountry: "BD",
  },
  sameAs: [socials.github, socials.linkedin].filter(Boolean),
  knowsAbout: ["Java", "Spring Boot", "Spring Batch", "Spring Modulith", "PostgreSQL"],
  description: profile.intro,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={instrumentSans.variable}>
      <body className="antialiased">
        <script
          type="application/ld+json"
          // Static, author-controlled JSON — safe to inline.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />

        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-paper"
        >
          Skip to content
        </a>

        <Nav />
        <main id="content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
