// Native (Capacitor) bootstrap — safe to import in the browser and during SSR.
// All native bridge calls are guarded so the web build is unaffected.

export async function initNativeShell() {
  if (typeof window === "undefined") return;

  try {
    const { Capacitor } = await import("@capacitor/core");
    if (!Capacitor.isNativePlatform()) return;

    const [{ SplashScreen }, { StatusBar, Style }] = await Promise.all([
      import("@capacitor/splash-screen"),
      import("@capacitor/status-bar"),
    ]);

    await StatusBar.setStyle({ style: Style.Light }).catch(() => {});
    await SplashScreen.hide().catch(() => {});
  } catch {
    // Capacitor isn't installed in this environment — ignore.
  }
}
