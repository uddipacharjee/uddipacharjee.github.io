import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static HTML export. `next build` writes it to out/; the postbuild step
  // (scripts/postbuild.mjs) moves that to docs/, which GitHub Pages serves
  // from the main branch.
  //
  // distDir is deliberately left at its default (.next): it is also where
  // `next dev` writes, so pointing it at docs/ would fill the committed
  // folder with dev-server artifacts.
  output: "export",
  trailingSlash: true,
  reactStrictMode: true,
  images: {
    // GitHub Pages has no image optimisation server.
    unoptimized: true,
  },
};

export default nextConfig;
