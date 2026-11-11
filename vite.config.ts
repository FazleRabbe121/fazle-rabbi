// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// Never set ssr.external or resolve.external: the Worker has no runtime module resolution, so
// the build fails. Never add compression (compressPublicAssets, vite-plugin-compression):
// hosting already compresses at the edge.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// VITE_BASE_PATH: "/" on Lovable, "/<repo>/" on GitHub Pages project sites.
const rawBase = process.env["VITE_BASE_PATH"] || "/";
const base = rawBase.endsWith("/") ? rawBase : `${rawBase}/`;
// STATIC_SPA=true builds a static single-page app shell (used for GitHub Pages).
const staticSpa = process.env["STATIC_SPA"] === "true";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    server: { entry: "server" },
    ...(staticSpa ? { spa: { enabled: true } } : {}),
  },
  vite: { base },
});
