import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PublicNav } from "@/components/public-nav";
import { LegalFooter } from "@/components/legal-footer";
import homeBrain from "../assets/home-brain.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NeuraTrace | Understanding Alzheimer's, one chapter at a time" },
      {
        name: "description",
        content:
          "Explore how Alzheimer's affects the brain, understand the changes your loved one may experience, and learn ways to connect through simple, interactive lessons.",
      },
      { property: "og:title", content: "NeuraTrace | Understanding Alzheimer's, one chapter at a time" },
      { property: "og:description", content: "Simple, interactive lessons about Alzheimer's for families." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <div className="theme-public flex min-h-screen flex-col bg-gradient-to-br from-background via-secondary to-blush">
      <PublicNav />
      <main className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:py-16">
        <div>
          <h1 className="text-[2.6rem] font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
            Understanding Alzheimer's, one chapter at a time.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Explore how Alzheimer's affects the brain, understand the changes your loved one may experience, and learn
            ways to connect through simple, interactive lessons.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              to="/learn"
              className="inline-flex min-h-13 items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground shadow-[0_12px_30px_-10px_rgba(75,47,143,0.55)] transition-colors hover:bg-primary-hover"
            >
              Start Learning <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              to="/auth/login"
              className="inline-flex min-h-13 items-center rounded-full border border-border bg-card px-7 py-3.5 text-base font-semibold text-primary transition-colors hover:bg-accent"
            >
              Resident Login
            </Link>
          </div>
        </div>
        <div className="relative">
          <img
            src={homeBrain}
            alt="Soft illustration of the human brain seen from the side"
            width={1280}
            height={1024}
            className="w-full rounded-[2.5rem] shadow-[0_30px_60px_-30px_rgba(75,47,143,0.45)]"
          />
          <div className="absolute -bottom-5 left-5 right-5 rounded-3xl bg-card/95 p-4 shadow-lg backdrop-blur sm:left-auto sm:right-6 sm:w-72">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary/80">Chapter 01</p>
            <p className="mt-1 text-base font-semibold text-foreground">Understanding Alzheimer's</p>
            <p className="mt-0.5 text-sm text-muted-foreground">6 short, interactive lessons</p>
          </div>
        </div>
      </main>
      <LegalFooter className="border-border/40" />
    </div>
  );
}
