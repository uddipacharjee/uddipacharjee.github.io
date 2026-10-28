import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static HTML export. `next build` writes it to out/; the postbuild step
  // (scripts/postbuild.mjs) moves that to docs/, which the deploy workflow
  // uploads to GitHub Pages.
  //
  // distDir is deliberately left at its default (.next): it is also where
  // `next dev` writes, so pointing it at docs/ would fill the
  // build output with dev-server artifacts.
  output: "export",
  trailingSlash: true,
  reactStrictMode: true,
  images: {
    // GitHub Pages has no image optimisation server.
    unoptimized: true,
  },
};

export default nextConfig;
