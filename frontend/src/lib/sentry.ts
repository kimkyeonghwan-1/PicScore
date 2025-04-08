import * as Sentry from "@sentry/react";

export const initSentry = () => {
  Sentry.init({
    dsn: "https://ddad7224c5340a0e840748574bf999fc@o4509077080834048.ingest.us.sentry.io/4509077096169472",
    integrations: [
      Sentry.browserTracingIntegration({
        instrumentNavigation: true,
      }),
      Sentry.browserProfilingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    tracesSampleRate: 1.0, //성능 트래킹을 위한 샘플링 비율
    profilesSampleRate: 1.0, // 브라우저 프로파일링 데이터의 샘플링 비율
    replaysSessionSampleRate: 0.1, // 일반 세션의 녹화 비율
    replaysOnErrorSampleRate: 1.0, // 에러 발생시 녹화 비율
    tracePropagationTargets: [
      // 트랜잭션 추적을 적용할 url 패턴
      "localhost/api",
      "j12b104.p.ssafy.io/api",
      "picscore.net/api",
    ],
    environment: import.meta.env.MODE, // 현재 환경 구분 (대시보드에서 필터링용)
    release: "1.0.0", // 현재 배포 버전
    // debug: import.meta.env.DEV, // 개발중 Sentry 작동 방식

    beforeSend(event) {
      //에러 이벤트를 서버로 전송하기 직전에 호출되는 콜백함수 (전송되는 데이터 추가,수정 및 필터링 가능)
      return event;
    },
  });

  Sentry.setTag("app_version", "1.0.0");
};
