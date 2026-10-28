# uddipacharjee.github.io

Personal portfolio of **Uddip Acharjee Shuvo** — Java backend engineer.

Live at <https://uddipacharjee.github.io/>.

Built on the same setup as [tulshidas39.github.io](https://github.com/TulshiDas39/tulshidas39.github.io),
restyled as a light, minimal, typography-led page.

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router, static export, Turbopack) |
| UI | React 19, Tailwind CSS 4 |
| Type | Instrument Sans (one family; the hero name uses its condensed width) |
| Hosting | GitHub Pages, served from `main` → `/docs` |

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
| `npm run build` | Static export → `docs/` (see below) |
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

The first draft was assembled from the public GitHub profile: name, location and
photo from the profile itself, skills from the build files of the Java repositories
on it, and the "lately exploring" line from recent forks. The summary and focus-area
copy is a draft written from that evidence — rewrite it in your own words.

Optional fields that are empty today and appear on the page as soon as they are set:

| Field | Shows up as |
|---|---|
| `profile.email` | Email link in the hero and footer |
| `socials.linkedin` | LinkedIn link in the hero and footer |
| `profile.resumeFile` | "Résumé (PDF)" link — drop the PDF in `public/assets/` first |

### Profile photo

The hero shows `public/assets/profile.jpg`, currently the GitHub avatar. Replace
that file with any square photo (at least 192 × 192), or set `photo: null` to
hide it.

### Skills

Skills are grouped by where they sit in a service — API, application, batch &
integration, persistence, runtime — in `skillLayers`, and the page tints each
layer a little deeper than the one above it. Tooling that is not part of a layer
(build, test, containers) goes in `tooling`.

## Search engines

The site is currently **kept out of search results**, the same as the site it was
built from: `app/robots.ts` disallows crawling and the `robots` block in
`app/layout.tsx` emits `noindex, nofollow`. To make it findable, delete
`app/robots.ts` and the `robots` block, then rebuild.

## Structure

```
app/
  layout.tsx        Font, metadata, schema.org Person JSON-LD
  page.tsx          Section composition
  globals.css       Tailwind v4 theme tokens (light + dark) + component classes
components/         One component per section, plus Nav / Section / ProfileLinks
data/resume.ts      All content
scripts/
  postbuild.mjs     Moves the export to docs/
docs/               The built site — committed, served by GitHub Pages
```

## Deployment

The site is served by GitHub Pages straight from the repo:
**Settings → Pages → Deploy from a branch → `main` / `/docs`.**

That means **`docs/` is build output that is deliberately committed.** To publish:

```bash
npm run build          # writes docs/
git add -A
git commit -m "build: publish site"
git push
```

GitHub serves the new commit within a minute or so.

### How the build lands in `docs/`

`next build` with `output: "export"` always writes to `out/`. The `postbuild` script
(run automatically by npm after `build`) replaces `docs/` with that export.

- **`distDir` stays at its default `.next`.** It is also where `next dev` writes, so
  pointing it at `docs/` would fill the committed folder with dev-server artifacts.
- **`public/.nojekyll` is load-bearing.** Branch-served Pages content is run through
  Jekyll, which skips directories starting with an underscore — without it the
  entire `_next/` folder is dropped and the site renders unstyled.
- On Windows, close any terminal or Explorer window that is inside `docs/` before
  building, or the postbuild step fails with `EBUSY`.

### CI

[`.github/workflows/build.yml`](.github/workflows/build.yml) type-checks and builds on
every push and PR, and warns if `docs/` was not rebuilt alongside the source. It does
**not** deploy.
