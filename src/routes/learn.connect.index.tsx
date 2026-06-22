import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { situations, allSituationTags } from "@/lib/situations";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { ArrowRight, MessageCircleHeart, Search, Star, X } from "lucide-react";

export const Route = createFileRoute("/learn/connect/")({
  head: () => ({
    meta: [
      { title: "Connect, NeuroTrace" },
      {
        name: "description",
        content:
          "Gentle, practical guides for the most common dementia caregiving moments.",
      },
    ],
  }),
  component: ConnectIndex,
});

function ConnectIndex() {
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [favorites, setFavorites] = useLocalStorage<string[]>(
    "nt.connect.favorites",
    [],
  );

  const toggleFav = (slug: string) =>
    setFavorites((cur) =>
      cur.includes(slug) ? cur.filter((s) => s !== slug) : [...cur, slug],
    );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return situations
      .filter((s) => (activeTag ? s.tags.includes(activeTag) : true))
      .filter((s) =>
        q
          ? s.title.toLowerCase().includes(q) ||
            s.blurb.toLowerCase().includes(q) ||
            s.tags.some((t) => t.includes(q))
          : true,
      )
      .sort(
        (a, b) =>
          Number(favorites.includes(b.slug)) -
          Number(favorites.includes(a.slug)),
      );
  }, [query, activeTag, favorites]);

  return (
    <AppShell>
      <header className="pt-2">
        <p className="text-sm font-medium text-primary">Connect</p>
        <h1 className="mt-2 text-3xl sm:text-4xl">In the moment, what helps.</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Pick a situation. Each guide explains what's happening, what to say,
          what to avoid, and small things that often make a difference. Star the
          ones you want to return to.
        </p>
      </header>

      <div className="mt-6 flex items-center gap-2 rounded-2xl border border-border/70 bg-card px-4 py-2.5 shadow-soft">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          placeholder="Search situations…"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="rounded-full p-1 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTag(null)}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            activeTag === null
              ? "bg-primary text-primary-foreground"
              : "bg-card text-muted-foreground hover:text-foreground border border-border/70"
          }`}
        >
          All
        </button>
        {allSituationTags.map((tag) => {
          const active = tag === activeTag;
          return (
            <button
              key={tag}
              onClick={() => setActiveTag(active ? null : tag)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:text-foreground border border-border/70"
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        {filtered.length} {filtered.length === 1 ? "guide" : "guides"}
        {favorites.length > 0 && ` · ${favorites.length} saved`}
      </p>

      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {filtered.map((s) => {
          const isFav = favorites.includes(s.slug);
          return (
            <li key={s.slug} className="relative">
              <Link
                to="/learn/connect/$situation"
                params={{ situation: s.slug }}
                className="group flex h-full items-start gap-3 rounded-3xl border border-border/70 bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-sky-soft">
                  <MessageCircleHeart className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1 pr-7">
                  <h2 className="text-lg leading-snug">{s.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{s.blurb}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    {s.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-surface px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-sm font-medium text-primary">
                    Open
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
              <button
                aria-label={isFav ? "Unsave" : "Save"}
                onClick={(e) => {
                  e.preventDefault();
                  toggleFav(s.slug);
                }}
                className={`absolute right-3 top-3 rounded-full p-2 transition-colors ${
                  isFav
                    ? "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300"
                    : "bg-surface text-muted-foreground hover:text-foreground"
                }`}
              >
                <Star
                  className="h-4 w-4"
                  fill={isFav ? "currentColor" : "none"}
                />
              </button>
            </li>
          );
        })}
      </ul>

      {filtered.length === 0 && (
        <p className="mt-8 rounded-2xl border border-dashed border-border bg-surface p-8 text-center text-sm text-muted-foreground">
          No guides match that search. Try a different word or clear the filter.
        </p>
      )}
    </AppShell>
  );
}
