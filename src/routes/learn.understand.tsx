import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/learn/understand")({
  head: () => ({
    meta: [
      { title: "Understand, NeuroTrace" },
      {
        name: "description",
        content:
          "Plain-language explanations of memory loss, behavior changes, and what to expect with dementia.",
      },
    ],
  }),
  component: () => <Outlet />,
});
