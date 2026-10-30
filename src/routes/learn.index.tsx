import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import { ChapterSidebar } from "@/components/learning/chapter-sidebar";
import { LearnCompanion } from "@/components/learning/learn-companion";
import { ChapterCompletion, LessonViewer } from "@/components/learning/lesson-viewer";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { allLessons, chapterOf, findLesson, nextLesson, prevLesson } from "@/lib/curriculum";
import { useLearningProgress } from "@/lib/learning-progress";
import logo from "@/assets/neuratrace-logo.png";

type Search = { lesson?: string; done?: boolean };

export const Route = createFileRoute("/learn/")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    lesson: typeof s.lesson === "string" || typeof s.lesson === "number" ? String(s.lesson) : undefined,
    done: s.done === true || s.done === "true" ? true : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Learn about Alzheimer's | NeuraTrace" },
      { name: "description", content: "Interactive, chapter-based lessons on how Alzheimer's affects the brain, memory, and neurons, in plain language." },
      { property: "og:title", content: "Learn about Alzheimer's | NeuraTrace" },
      { property: "og:description", content: "One chapter at a time: an interactive guide to Alzheimer's for families." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LearningLayout,
});

function LearningLayout() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/learn/" });
  const { progress, ready, setCurrent, markComplete, setReflection } = useLearningProgress();
  const [menuOpen, setMenuOpen] = useState(false);

  // Resume where the learner left off when no lesson is in the URL.
  const lesson = findLesson(search.lesson) ?? findLesson(progress.current) ?? allLessons[0];

  useEffect(() => {
    if (ready && lesson.id !== progress.current) setCurrent(lesson.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, lesson.id]);

  const go = (id: string) => {
    setMenuOpen(false);
    navigate({ search: { lesson: id } });
    window.scrollTo({ top: 0 });
  };

  const sidebar = <ChapterSidebar currentId={lesson.id} completed={progress.completed} onSelect={go} />;
  const next = nextLesson(lesson.id);
  const prev = prevLesson(lesson.id);

  return (
    <div className="theme-public min-h-screen">
      <div className="lg:grid lg:grid-cols-[320px_1fr]">
        <aside className="sticky top-0 hidden h-screen border-r border-border bg-secondary lg:block">{sidebar}</aside>

        <div className="min-w-0">
          {/* Top bar */}
          <div className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur-md sm:px-8">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-secondary px-4 text-sm font-semibold text-primary lg:hidden"
              >
                <BookOpen className="h-4 w-4" aria-hidden /> Chapters
              </button>
              <Link to="/" className="hidden items-center gap-2 sm:flex lg:hidden" aria-label="NeuraTrace home">
                <img src={logo} alt="" width={28} height={28} className="h-7 w-7" />
              </Link>
            </div>
            <Link to="/auth/login" className="inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold text-primary hover:bg-accent">
              Resident Login
            </Link>
          </div>

          {search.done ? (
            <ChapterCompletion chapterTitle={chapterOf(lesson.id).title} onRevisit={() => go(allLessons[0].id)} />
          ) : (
            <LessonViewer
              key={lesson.id}
              lesson={lesson}
              isLastLesson={!next || chapterOf(next.id).n !== chapterOf(lesson.id).n}
              hasPrevLesson={!!prev}
              reflection={progress.reflection}
              onReflection={setReflection}
              onPrevLesson={() => prev && go(prev.id)}
              onComplete={() => {
                markComplete(lesson.id);
                if (next && chapterOf(next.id).n === chapterOf(lesson.id).n) go(next.id);
                else navigate({ search: { lesson: lesson.id, done: true } });
              }}
            />
          )}
        </div>
      </div>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="theme-public w-[88vw] max-w-sm bg-secondary p-0">
          <SheetTitle className="sr-only">Chapters</SheetTitle>
          {sidebar}
        </SheetContent>
      </Sheet>
    </div>
  );
}
