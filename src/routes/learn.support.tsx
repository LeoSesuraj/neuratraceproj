import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/learn/support")({
  // Retired: all education now lives inside the chapter-based learning journey.
  beforeLoad: () => {
    throw redirect({ to: "/learn" });
  },
  head: () => ({
    meta: [
      { title: "Support, NeuraTrace" },
      {
        name: "description",
        content:
          "Resources, tips, and reminders for caregivers, because you matter too.",
      },
    ],
  }),
  component: () => <Outlet />,
});
