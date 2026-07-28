import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { getSupportResource, supportResources } from "@/lib/support";
import { ArrowLeft, LifeBuoy, Lightbulb } from "lucide-react";

export const Route = createFileRoute("/learn/support/$resource")({
  loader: ({ params }) => {
    const r = getSupportResource(params.resource);
    if (!r) throw notFound();
    return r;
  },
  head: ({ loaderData }) =>
    loaderData
      ? {
          meta: [
            { title: `${loaderData.title}, NeuraTrace` },
            { name: "description", content: loaderData.blurb },
          ],
        }
      : {},
  notFoundComponent: () => (
    <AppShell>
      <p className="py-16 text-center text-muted-foreground">
        Resource not found.{" "}
        <Link to="/learn/support" className="text-primary underline">
          Go back
        </Link>
      </p>
    </AppShell>
  ),
  errorComponent: () => (
    <AppShell>
      <p className="py-16 text-center text-muted-foreground">
        Something went wrong loading this resource.
      </p>
    </AppShell>
  ),
  component: ResourcePage,
});

function ResourcePage() {
  const r = Route.useLoaderData() as ReturnType<typeof getSupportResource> & {};
  const others = supportResources.filter((o) => o.slug !== r.slug).slice(0, 3);

  return (
    <AppShell>
      <Link
        to="/learn/support"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        All resources
      </Link>

      <header className="mt-4">
        <h1 className="text-3xl sm:text-4xl">{r.title}</h1>
        <p className="mt-2 max-w-xl text-muted-foreground">{r.blurb}</p>
      </header>

      <section className="mt-8 rounded-3xl border border-border/70 bg-card p-6 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-warm/70">
            <LifeBuoy className="h-5 w-5 text-foreground" />
          </div>
          <h2 className="text-xl">What to know</h2>
        </div>
        <p className="mt-4 text-[15px] leading-relaxed text-foreground/90">
          {r.body}
        </p>
      </section>

      <section className="mt-4 rounded-3xl border border-border/70 bg-card p-6 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-sky-soft">
            <Lightbulb className="h-5 w-5 text-foreground" />
          </div>
          <h2 className="text-xl">Try this</h2>
        </div>
        <ul className="mt-4 space-y-2.5 text-[15px] leading-relaxed text-foreground/90">
          {r.tips.map((t) => (
            <li key={t} className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          More for you
        </h3>
        <ul className="mt-3 grid gap-2">
          {others.map((o) => (
            <li key={o.slug}>
              <Link
                to="/learn/support/$resource"
                params={{ resource: o.slug }}
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
