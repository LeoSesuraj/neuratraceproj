import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { getUnderstandTopic, understandTopics } from "@/lib/understand";
import { ArrowLeft, BookOpen, Compass, Eye } from "lucide-react";

export const Route = createFileRoute("/learn/understand/$topic")({
  loader: ({ params }) => {
    const t = getUnderstandTopic(params.topic);
    if (!t) throw notFound();
    return t;
  },
  head: ({ loaderData }) =>
    loaderData
      ? {
          meta: [
            { title: `${loaderData.title} — NeuroTrace` },
            { name: "description", content: loaderData.blurb },
          ],
        }
      : {},
  notFoundComponent: () => (
    <AppShell>
      <p className="py-16 text-center text-muted-foreground">
        Topic not found.{" "}
        <Link to="/learn/understand" className="text-primary underline">
          Go back
        </Link>
      </p>
    </AppShell>
  ),
  errorComponent: () => (
    <AppShell>
      <p className="py-16 text-center text-muted-foreground">
        Something went wrong loading this topic.
      </p>
    </AppShell>
  ),
  component: UnderstandTopicPage,
});

function UnderstandTopicPage() {
  const t = Route.useLoaderData() as ReturnType<typeof getUnderstandTopic> & {};
  const others = understandTopics.filter((o) => o.slug !== t.slug).slice(0, 3);

  return (
    <AppShell>
      <Link
        to="/learn/understand"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        All topics
      </Link>

      <header className="mt-4">
        <h1 className="text-3xl sm:text-4xl">{t.title}</h1>
        <p className="mt-2 max-w-xl text-muted-foreground">{t.blurb}</p>
      </header>

      <div className="mt-8 grid gap-4">
        <section className="rounded-3xl border border-border/70 bg-card p-6 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-sky-soft">
              <BookOpen className="h-5 w-5 text-foreground" />
            </div>
            <h2 className="text-xl">Why it happens</h2>
          </div>
          <p className="mt-4 text-[15px] leading-relaxed text-foreground/90">
            {t.why}
          </p>
        </section>

        <section className="rounded-3xl border border-border/70 bg-card p-6 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-sage/40">
              <Eye className="h-5 w-5 text-foreground" />
            </div>
            <h2 className="text-xl">How common it is</h2>
          </div>
          <p className="mt-4 text-[15px] leading-relaxed text-foreground/90">
            {t.howCommon}
          </p>
        </section>

        <section className="rounded-3xl border border-border/70 bg-card p-6 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-warm/70">
              <Compass className="h-5 w-5 text-foreground" />
            </div>
            <h2 className="text-xl">What to expect</h2>
          </div>
          <ul className="mt-4 space-y-2.5 text-[15px] leading-relaxed text-foreground/90">
            {t.expect.map((line) => (
              <li key={line} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mt-10">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Keep reading
        </h3>
        <ul className="mt-3 grid gap-2">
          {others.map((o) => (
            <li key={o.slug}>
              <Link
                to="/learn/understand/$topic"
                params={{ topic: o.slug }}
                className="flex items-center justify-between rounded-2xl border border-border/60 bg-card px-4 py-3 text-sm transition-colors hover:bg-surface"
              >
                <span>{o.title}</span>
                <span className="text-muted-foreground">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </AppShell>
  );
}
