import type { CapacitorConfig } from "@capacitor/cli";

// NOTE: Capacitor wraps the deployed web app — it does not bundle it.
// Update `server.url` to your live Vercel URL (or a stable Lovable URL)
// before running `cap sync`. Using `server.url` keeps every TanStack
// server function, Supabase call, and API route working unchanged.
const PRODUCTION_URL = "https://neurotraceproj.vercel.app";

const config: CapacitorConfig = {
  appId: "app.neurotrace.caregiver",
  appName: "NeuroTrace",
  webDir: "capacitor-shell",
  server: {
    url: PRODUCTION_URL,
    androidScheme: "https",
    cleartext: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#ffffff",
      showSpinner: false,
    },
  },
};

export default config;
