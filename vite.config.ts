import { defineConfig } from "vite";

/**
 * GitHub Pages 项目站地址为 https://<用户>.github.io/<仓库名>/
 * CI 会注入 GITHUB_PAGES_BASE=仓库名；本地模拟：GITHUB_PAGES_BASE=你的仓库名 npm run build
 */
const pagesBase = process.env.GITHUB_PAGES_BASE?.replace(/^\/|\/$/g, "");
const base = pagesBase ? `/${pagesBase}/` : "/";

export default defineConfig({
  root: ".",
  publicDir: "public",
  base,
  build: {
    rollupOptions: {
      output: {
        assetFileNames: "assets/[name]-[hash][extname]",
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
      },
    },
  },
  plugins: [
    {
      name: "inject-pages-base",
      transformIndexHtml(html) {
        const href = base.endsWith("/") ? base : `${base}/`;
        if (html.includes("<base ")) return html;
        return html.replace("<head>", `<head>\n    <base href="${href}" />`);
      },
    },
  ],
});
