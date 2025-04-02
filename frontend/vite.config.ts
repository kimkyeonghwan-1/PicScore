import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { sentryVitePlugin } from "@sentry/vite-plugin";

// https://vite.dev/config/
export default defineConfig({
  build: {
    sourcemap: true, // 소스맵 생성 활성화
  },
  plugins: [
    react(),
    tailwindcss(),
    // Sentry 플러그인은 다른 모든 플러그인 뒤에 위치
    sentryVitePlugin({
      authToken: process.env.SENTRY_AUTH_TOKEN,
      org: "comp-6d",
      project: "javascript-react",
      telemetry: false, // 선택적: Sentry 텔레메트리 비활성화
    }),
  ],
});
