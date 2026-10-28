import type { Metadata, Viewport } from "next";
import { Instrument_Sans } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { education, experience, profile, siteUrl, socials } from "@/data/resume";
import { alternatesFor } from "@/lib/seo";

// One family for everything. The width axis lets the hero name run
// condensed (font-stretch) while body text stays at normal width.
const instrumentSans = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

const description = `${profile.role} in ${profile.location}: Java microservices for airlines and high-traffic platforms, and research on LLMs for biology and health.`;

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
    "microservices",
    "NDC airline integration",
    "backend engineer Bangladesh",
    "machine learning research",
    "LLM agents bioinformatics",
  ],
  authors: [{ name: profile.name, url: siteUrl }],
  creator: profile.name,
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
  // Indexable, and Google may show full-size image previews and snippets of
  // any length (useful for the blog's diagrams and code-heavy posts).
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: alternatesFor("/"),
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
  sameAs: [socials.github, socials.linkedin, socials.scholar].filter(Boolean),
  ...(profile.email && { email: `mailto:${profile.email}` }),
  worksFor: { "@type": "Organization", name: experience[0].company },
  alumniOf: education.map((e) => ({ "@type": "CollegeOrUniversity", name: e.school })),
  knowsAbout: ["Java", "Spring Boot", "Microservices", "NDC", "Machine learning", "Large language models", "Bioinformatics"],
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
