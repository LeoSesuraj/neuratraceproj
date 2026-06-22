import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/learn/support")({
  head: () => ({
    meta: [
      { title: "Support, NeuroTrace" },
      {
        name: "description",
        content:
          "Resources, tips, and reminders for caregivers, because you matter too.",
      },
    ],
  }),
  component: () => <Outlet />,
});
