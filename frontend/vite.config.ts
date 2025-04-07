import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { VitePWA } from "vite-plugin-pwa";
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
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      workbox: {
        // 서비스 워커 즉시 활성화 설정
        clientsClaim: true,
        skipWaiting: true,

        // API 요청은 서비스 워커가 가로채지 않도록 설정
        navigateFallbackDenylist: [/\/api\/.*/, /\/oauth2\/.*/],

        runtimeCaching: [
          {
            // 모든 API 요청에 대해 NetworkOnly 전략 적용
            urlPattern: ({ url }: { url: URL }) =>
              url.pathname.startsWith("/api/"),
            handler: "NetworkOnly",
            // backgroundSync 속성 제거
          },
          // OAuth2 인증 엔드포인트 추가
          {
            urlPattern: ({ url }: { url: URL }) =>
              url.pathname.startsWith("/oauth2/"),
            handler: "NetworkOnly",
            // 여기도 backgroundSync 속성 사용하지 않음
          },
          // 구체적인 인증 엔드포인트 추가
          {
            urlPattern: ({ url }: { url: URL }) => {
              // 로그인 및 인증 관련 특정 경로들
              return (
                url.pathname.includes("/api/v1/user/") ||
                url.pathname.includes("/api/v1/reissue") ||
                url.pathname.includes("/oauth2/authorization/")
              );
            },
            handler: "NetworkOnly",
          },
          // 다른 리소스에 대한 캐싱 전략은 유지
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "images",
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30일
              },
            },
          },
          // JS 및 CSS 파일에 대한 캐싱
          {
            urlPattern: /\.(?:js|css)$/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "static-resources",
            },
          },
        ],
      } as any,
      manifest: {
        name: "PicScore",
        short_name: "PicScore",
        start_url: "/",
        display: "standalone",
        description: "PicScore",
        background_color: "#ffffff",
        theme_color: "#8bc34a",
        icons: [
          {
            src: "/PicScore.png", // public 폴더 내 아이콘 위치
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/PicScore.png", // public 폴더 내 아이콘 위치
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
});
