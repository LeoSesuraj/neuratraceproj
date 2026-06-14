import { Outlet, createFileRoute, Link } from "@tanstack/react-router";
import logo from "@/assets/neurotrace-logo.png";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/auth")({
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt="" className="h-8 w-8" />
            <span className="font-display text-lg tracking-tight">NeuroTrace</span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-md px-5 py-10">
        <Outlet />
      </main>
    </div>
  );
}
