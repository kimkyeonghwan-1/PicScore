async function initMocks() {
  if (import.meta.env.DEV) {
    const { worker } = await import("./browser");
    worker.start({
      onUnhandledRequest: "bypass", // 또는 'warn'
    });
    console.log("MSW 모킹 서버가 시작되었습니다.");
  }
}

initMocks();
export default initMocks;
