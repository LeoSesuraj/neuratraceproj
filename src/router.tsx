import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { assertRequiredEnv, initSentry } from "./lib/sentry";

// Run synchronously at module load — before createRouter() is called and
// before the app renders — so errors during initial render and route loaders
// are captured. Both functions are no-ops on the server (SSR) and when the
// DSN is not configured.
if (typeof window !== "undefined") {
  try {
    assertRequiredEnv();
  } catch (e) {
    console.warn("[env] assertRequiredEnv warning:", e);
  }
  initSentry();
  // eslint-disable-next-line no-console
  console.log("Sentry init attempted, DSN:", import.meta.env.VITE_SENTRY_DSN);
}

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
