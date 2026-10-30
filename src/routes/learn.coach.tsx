import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/learn/coach")({
  // Retired: all education now lives inside the chapter-based learning journey.
  beforeLoad: () => {
    throw redirect({ to: "/learn" });
  },
  head: () => ({
    meta: [
      { title: "AI Coach, NeuraTrace" },
      {
        name: "description",
        content:
          "A warm, practical AI coach for the hardest dementia caregiving moments.",
      },
    ],
  }),
  component: () => <Outlet />,
});
