import tailwindcss from "@tailwindcss/vite";
import { getLoadContext } from "./load-context";
import { reactRouterDevTools } from "react-router-devtools";
import { reactRouter } from "@react-router/dev/vite";
import { cloudflareDevProxy } from "@react-router/dev/vite/cloudflare";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ isSsrBuild }) => ({
  build: {
    rollupOptions: isSsrBuild
      ? {
          input: "./workers/app.ts",
        }
      : undefined,
  },
  optimizeDeps: {
    include: [
      "react",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "react-dom",
      "react-dom/server",
      "react-router",
      "snakecase-keys",
      "cookie",
      "beautify",
      "react-diff-viewer-continued",
      "classnames",
      "@bkrem/react-transition-group",
    ],
  },
  plugins: [
    cloudflareDevProxy({
      getLoadContext,
    }),
    reactRouterDevTools(),
    reactRouter(),
    tailwindcss(),
    tsconfigPaths(),
  ],
}));
