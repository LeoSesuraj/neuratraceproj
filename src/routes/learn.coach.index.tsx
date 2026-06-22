import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { AIComingSoon } from "@/components/ai-coming-soon";

export const Route = createFileRoute("/learn/coach/")({
  component: CoachComingSoon,
});

function CoachComingSoon() {
  return (
    <AppShell>
      <AIComingSoon />
    </AppShell>
  );
}
