# Capacitor (iOS + Android) Setup

This project ships the web app to Vercel **and** wraps it as a native iOS /
Android app via Capacitor. The native shell loads the live Vercel URL
directly (`server.url` in `capacitor.config.ts`), so every TanStack server
function, Supabase call, and `/api/*` route works unchanged inside the app.

## Prerequisites (local Mac only)

- Xcode 15+ (for iOS) and CocoaPods: `sudo gem install cocoapods`
- Android Studio (for Android) with an SDK installed
- Node 20+ and `bun` or `npm`

## One-time setup

1. **Set your production URL** in `capacitor.config.ts`. Replace
   `https://CHANGE-ME.vercel.app` with your real Vercel domain (or stable
   Lovable URL like `https://project--<id>.lovable.app`). The native app
   loads from this URL, so it must be HTTPS and publicly reachable.

2. **Add the icon and splash assets** (optional but recommended):
   - `assets/icon.png` — 1024×1024 PNG
   - `assets/splash.png` — 2732×2732 PNG
   Then generate per-platform sizes with:
   ```bash
   npx @capacitor/assets generate
   ```

3. **Add the native platforms** (run on your Mac, not in Lovable):
   ```bash
   npx cap add ios
   npx cap add android
   ```
   These create `ios/` and `android/` folders, both git-ignored.

## Day-to-day

- **iOS build → open in Xcode:**
  ```bash
  npm run build:ios
  ```
- **Android build → open in Android Studio:**
  ```bash
  npm run build:android
  ```

Both scripts run `vite build` (to keep config valid) then `cap sync` and
open the native IDE. The web bundle in `capacitor-shell/` is only a
fallback splash; the app loads the remote Vercel URL at runtime.

## Updating the web app

Because the native shell points at `server.url`, **frontend changes you
push to Vercel are live in the installed app immediately**, no rebuild or
App Store submission required. You only need to rebuild the native app
when you change Capacitor config, plugins, icons, or splash.

## Notes

- Capacitor initialisation lives in `src/lib/native.ts` and is invoked
  from `src/routes/__root.tsx`. It is a no-op on the web — guarded by
  `Capacitor.isNativePlatform()`.
- Nothing about Supabase, RLS, auth, server functions, or the Vercel
  deployment was modified. This setup is purely additive.
