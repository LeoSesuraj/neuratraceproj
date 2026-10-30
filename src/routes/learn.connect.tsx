import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/learn/connect")({
  // Retired: all education now lives inside the chapter-based learning journey.
  beforeLoad: () => {
    throw redirect({ to: "/learn" });
  },
  component: () => <Outlet />,
});
