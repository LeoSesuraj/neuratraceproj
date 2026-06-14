import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const VITE_SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const VITE_SUPABASE_PUBLISHABLE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
const VITE_SUPABASE_PROJECT_ID = process.env.VITE_SUPABASE_PROJECT_ID || process.env.SUPABASE_PROJECT_ID;

const define: Record<string, string> = {};
if (VITE_SUPABASE_URL) {
  define["import.meta.env.VITE_SUPABASE_URL"] = JSON.stringify(VITE_SUPABASE_URL);
}
if (VITE_SUPABASE_PUBLISHABLE_KEY) {
  define["import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY"] = JSON.stringify(VITE_SUPABASE_PUBLISHABLE_KEY);
}
if (VITE_SUPABASE_PROJECT_ID) {
  define["import.meta.env.VITE_SUPABASE_PROJECT_ID"] = JSON.stringify(VITE_SUPABASE_PROJECT_ID);
}

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  nitro: {
    preset: "vercel",
  },
  define,
});
