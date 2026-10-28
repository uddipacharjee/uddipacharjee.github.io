/**
 * Runs automatically after `next build` (npm lifecycle: build -> postbuild).
 *
 * `output: "export"` writes the static site to out/, and that path is not
 * configurable on its own. Move it to docs/, which the deploy workflow
 * uploads to GitHub Pages.
 *
 * The .nojekyll marker is not written here — it lives in public/ and the build
 * copies it across like any other static file.
 */
import { renameSync, rmSync } from "node:fs";

/** Where `next build` puts the static export. */
const EXPORT_DIR = "out";
/** What the deploy workflow uploads to GitHub Pages. */
const PAGES_DIR = "docs";

rmSync(PAGES_DIR, { recursive: true, force: true });
renameSync(EXPORT_DIR, PAGES_DIR);

console.log(`postbuild: ${EXPORT_DIR}/ -> ${PAGES_DIR}/`);
