/**
 * Runs automatically after `next build` (npm lifecycle: build -> postbuild).
 *
 * `output: "export"` writes the static site to out/, and that path is not
 * configurable on its own. GitHub Pages serves this repo from main -> /docs,
 * so move the export there.
 *
 * The .nojekyll marker is not written here — it lives in public/ and the build
 * copies it across like any other static file.
 */
import { renameSync, rmSync } from "node:fs";

/** Where `next build` puts the static export. */
const EXPORT_DIR = "out";
/** What GitHub Pages serves from the main branch. */
const PAGES_DIR = "docs";

rmSync(PAGES_DIR, { recursive: true, force: true });
renameSync(EXPORT_DIR, PAGES_DIR);

console.log(`postbuild: ${EXPORT_DIR}/ -> ${PAGES_DIR}/`);
