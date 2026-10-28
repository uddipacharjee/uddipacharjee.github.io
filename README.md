# uddipacharjee.github.io

Personal portfolio of **Uddip Acharjee Shuvo** — software engineer and researcher:
industry experience, publications, skills and a blog.

Live at <https://uddipacharjee.com/>.

Built on the same setup as [tulshidas39.github.io](https://github.com/TulshiDas39/tulshidas39.github.io),
restyled as a light, minimal, typography-led page.

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router, static export, Turbopack) |
| UI | React 19, Tailwind CSS 4 |
| Type | Instrument Sans (the hero name and post titles use its condensed width); JetBrains Mono for code in posts |
| Hosting | GitHub Pages, deployed by GitHub Actions; domain on Cloudflare DNS |

There is no client-side JavaScript of our own: every component is a server
component, and the one entrance animation in the hero is plain CSS.

## Getting started

```bash
npm install
npm run dev       # http://localhost:3000
```

## Scripts

| Script | Does |
|---|---|
| `npm run dev` | Dev server with Turbopack |
| `npm run build` | Static export → `docs/` (git-ignored; see Deployment) |
| `npm run lint` | ESLint — see the note below |
| `npm run typecheck` | `tsc --noEmit` |

### A note on `npm run lint`

Dependencies are pinned to the same versions as the site this was built from,
which puts `typescript@7` and `eslint@10` ahead of what the Next.js lint stack
supports, so `npm run lint` exits with an error for now. **`npm run build` and
`npm run typecheck` are unaffected.** To get linting back, pin the two packages
down a major:

```bash
npm install -D typescript@^5.9.3 eslint@^9.39.5
```

## Editing the content

**All site content lives in [`data/resume.ts`](data/resume.ts).** Nothing is hard-coded
in the components.

| Export | Section |
|---|---|
| `profile`, `focusAreas` | Hero and About |
| `experience` | Experience — one entry per role, newest first |
| `education`, `awards` | Under the roles in Experience |
| `researchInterests`, `publications` | Research — newest first; your name is bolded in author lists |
| `skillLayers`, `tooling` | Skills |
| `socials` | Profile links in the hero and footer (GitHub, LinkedIn, Google Scholar) |

Experience and education come from the résumé; publications from Google
Scholar, checked against Crossref and arXiv. When a new paper comes out, add it
to the top of `publications`.

`profile.resumeFile` is empty today. Point it at a PDF in `public/assets/` to add a
"Résumé (PDF)" link — remove the phone number and home address from it first,
since everything in `public/` is published.

### Profile photo

The hero shows `public/assets/profile.jpg`, currently the GitHub avatar. Replace
that file with any square photo (at least 192 × 192), or set `photo: null` to
hide it.

### Skills

Skills are grouped by where they sit in a service — API, application, batch &
integration, persistence, runtime — in `skillLayers`, and the page tints each
layer a little deeper than the one above it. Tooling that is not part of a layer
(build, test, containers) goes in `tooling`.

## Adding a blog post

Posts follow the same pattern as the LithiumGit site: each post is its own page,
written as JSX, at `app/blogs/<slug>/page.tsx`. The `/blogs/` index lists them
newest first.

**1. Add its details to [`data/blogs.ts`](data/blogs.ts).** The index, the post
header, the page metadata and the JSON-LD all read from this entry.

```ts
{
  slug: "loading-a-million-rows-with-spring-batch",
  title: "Loading a million rows with Spring Batch",   // also the <title>: under ~60 chars
  description: "140–160 characters for the index and search results.",
  category: "Spring Batch",
  datePublished: "2026-11-02",
  // dateModified: "2026-11-10",   shows "Updated ..." when set
  readingMinutes: 6,
  tags: ["Spring Batch", "PostgreSQL"],                // keywords, and how related posts are picked
  image: "/blogs/loading-a-million-rows-with-spring-batch/diagram.svg",  // main diagram, for JSON-LD
},
```

**2. Create `app/blogs/<slug>/page.tsx`** with the same slug:

```tsx
import BlogPost, { postMetadata } from "@/components/blog/BlogPost";
import Callout from "@/components/blog/Callout";
import CodeBlock from "@/components/blog/CodeBlock";
import Figure from "@/components/blog/Figure";

const SLUG = "loading-a-million-rows-with-spring-batch";

export const metadata = postMetadata(SLUG);

export default function Post() {
  return (
    <BlogPost slug={SLUG}>
      <p>Opening paragraph. Use <code>inline code</code> freely.</p>

      <h2>A section</h2>
      <p>Plain p, h2, h3, ul, ol, table and blockquote elements are styled for you.</p>

      <CodeBlock label="ImportJobConfig.java">{`
        @Bean
        public Step importStep(JobRepository jobs, PlatformTransactionManager tx) {
            return new StepBuilder("importStep", jobs)
                    .<Row, Row>chunk(500, tx)
                    .build();
        }
      `}</CodeBlock>

      <Callout title="Rule of thumb">
        <p>A side note, tip or warning.</p>
      </Callout>

      <Figure
        src="/blogs/loading-a-million-rows-with-spring-batch/diagram.png"
        alt="What the image shows"
        width={1200}
        height={600}
        caption="Optional caption."
      />
    </BlogPost>
  );
}
```

`CodeBlock` strips the leading and trailing blank lines and the indentation
shared by every line, so code can sit indented inside the JSX as above. Inside
the template literal, write `\${` for a literal `${` (Spring placeholders).
Put a post's images in `public/blogs/<slug>/`.

### Diagrams

Every diagram is a hand-written SVG in `public/blogs/<slug>/`. To match the
existing ones:

- **Theme:** an internal `<style>` with the site's light colours, plus an
  `@media (prefers-color-scheme: dark)` block, so the diagram follows the
  reader's theme even when opened on its own.
- **Fonts:** system font stacks (`ui-sans-serif, system-ui, …` and
  `ui-monospace, …`). An SVG shown through `<img>` cannot load the page's web
  fonts.
- **Accessibility and image search:** `role="img"`, plus `<title>` and `<desc>`
  elements, and a descriptive `alt` on the `<Figure>`.
- **Width:** a `viewBox` 640 wide, with text at 12.5px or larger, since the
  diagram is scaled down on phones. `Figure` links to the file so readers can
  open it full size.
- **Whitespace:** SVG collapses spaces, so indent code lines with `x` offsets,
  not leading spaces.

**3. Build** (`npm run build`). A page whose slug has no entry in `data/blogs.ts`
fails the build with a message naming the slug.

If you delete a post, delete both its folder and its entry. If `npm run typecheck`
then complains about the deleted page under `.next/types/`, run `npm run build`
once to regenerate those types.

## Search engines

The site is **indexable** and set up for search:

| | |
|---|---|
| `/robots.txt` | Allows all crawlers and points at the sitemap (`app/robots.ts`) |
| `/sitemap.xml` | Home, blog index and every post, with last-modified dates (`app/sitemap.ts`) |
| `/feed.xml` | RSS 2.0 feed of every post (`app/feed.xml/route.ts`), linked from every page |
| Metadata | Canonical URLs, Open Graph and Twitter cards on every page (`lib/seo.ts`, `postMetadata`) |
| JSON-LD | `Person` site-wide, `CollectionPage` on the blog index, `BlogPosting` + `BreadcrumbList` on each post |
| Internal links | "Writing" section on the home page, related posts under each post |

After the first deploy, add the site to [Google Search Console](https://search.google.com/search-console)
and submit `https://uddipacharjee.com/sitemap.xml`. Search Console's HTML-tag
verification can be added through `metadata.verification` in `app/layout.tsx`.

To keep the site out of search results instead, set `robots` in `app/layout.tsx` to
`{ index: false, follow: false }` and change `app/robots.ts` to `disallow: "/"`.

## Structure

```
app/
  layout.tsx        Font, metadata, schema.org Person JSON-LD
  page.tsx          Section composition
  globals.css       Tailwind v4 theme tokens (light + dark), component classes,
                    post body styles (.prose-post)
  robots.ts         /robots.txt
  sitemap.ts        /sitemap.xml
  feed.xml/route.ts /feed.xml (RSS)
  blogs/
    layout.tsx      Loads the monospace font, for blog pages only
    page.tsx        The /blogs/ index
    <slug>/page.tsx One folder per post
components/         One component per section, plus Nav / Section / ProfileLinks / Writing
  blog/             BlogPost frame + CodeBlock / Callout / Figure for posts
data/
  resume.ts         Profile, experience, publications, skills and nav content
  blogs.ts          Every post's title, dates, tags and description; related-post lookup
lib/
  dates.ts          Post date formatting
  seo.ts            Canonical URL + RSS link shared by every page
public/blogs/       One folder of SVG diagrams per post
scripts/
  postbuild.mjs     Moves the export to docs/
docs/               Build output (git-ignored); the deploy workflow uploads it
```

## Deployment

Pushing to `main` publishes the site. [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)
type-checks, builds, and deploys the export to GitHub Pages, usually within two
minutes; watch it under the repo's **Actions** tab. Pull requests run the same
build as a check but never deploy. No local Node install is needed to publish.

Repo settings this relies on:

- **Settings → Pages → Source: GitHub Actions.**
- **Settings → Pages → Custom domain: `uddipacharjee.com`**, with *Enforce HTTPS* on.
  Pages ignores a `CNAME` file for Actions deployments, so the domain lives here.

### DNS (Cloudflare)

| Type | Name | Content | Proxy |
|---|---|---|---|
| A | `@` | `185.199.108.153` | DNS only |
| A | `@` | `185.199.109.153` | DNS only |
| A | `@` | `185.199.110.153` | DNS only |
| A | `@` | `185.199.111.153` | DNS only |
| CNAME | `www` | `uddipacharjee.github.io` | DNS only |

Keep the records **DNS only** (grey cloud) so GitHub can issue and renew the HTTPS
certificate. If you later turn the Cloudflare proxy on, set Cloudflare's SSL/TLS
mode to **Full (strict)**, or visitors get a redirect loop.

### How the build lands in `docs/`

`next build` with `output: "export"` always writes to `out/`. The `postbuild` script
(run automatically by npm after `build`) replaces `docs/` with that export, and the
workflow uploads `docs/`.

- **`distDir` stays at its default `.next`.** It is also where `next dev` writes, so
  pointing it at `docs/` would mix dev-server artifacts into the build output.
- **`public/.nojekyll`** is kept from the branch-deploy days. It is harmless with
  Actions deployments, and it keeps `_next/` intact if the site is ever served
  from a branch again.
- On Windows, close any terminal or Explorer window that is inside `docs/` before
  building, or the postbuild step fails with `EBUSY`.
