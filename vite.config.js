import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  base: './',
  server: {
    port: 5173,
    open: true
  },
  build: {
    outDir: 'dist',
    // Sourcemaps are meaningless once everything is inlined into one file
    // by vite-plugin-singlefile, so they stay disabled here.
    sourcemap: false
  },
  // Inlines all JS/CSS (and any small binary assets) directly into
  // dist/index.html, producing the single self-contained file AppLovin's
  // playable-ad environment requires. The plugin's "recommended build
  // config" (applied automatically) sets assetsInlineLimit, disables
  // CSS code-splitting, and forces base:'./' — all consistent with the
  // settings already above, so no conflicts to resolve.
  plugins: [viteSingleFile()]
});
