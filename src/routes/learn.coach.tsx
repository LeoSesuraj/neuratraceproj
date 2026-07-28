import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/learn/coach")({
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
