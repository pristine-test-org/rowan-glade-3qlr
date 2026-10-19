import { defineConfig } from "vite";

// One page per route: / (the landing page), /login, /admin and /manager.
// vercel.json's cleanUrls serves /admin from admin.html.
export default defineConfig({
  build: {
    rollupOptions: {
      input: ["index.html", "login.html", "admin.html", "manager.html"],
    },
  },
});
