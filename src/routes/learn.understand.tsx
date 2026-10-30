import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/learn/understand")({
  // Retired: all education now lives inside the chapter-based learning journey.
  beforeLoad: () => {
    throw redirect({ to: "/learn" });
  },
  head: () => ({
    meta: [
      { title: "Understand, NeuraTrace" },
      {
        name: "description",
        content:
          "Plain-language explanations of memory loss, behavior changes, and what to expect with dementia.",
      },
    ],
  }),
  component: () => <Outlet />,
});
