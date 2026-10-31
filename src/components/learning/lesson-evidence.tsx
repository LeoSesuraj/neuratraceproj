import { useState } from "react";
import { BookOpen, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import type { Lesson, Step } from "@/lib/curriculum";
import { curriculumSources } from "@/lib/curriculum-sources";

export function LessonEvidence({ lesson, step }: { lesson: Lesson; step: Step }) {
  const [active, setActive] = useState<string | null>(null);
  const panel = step.panels?.find((item) => item.title === active);
  const sources = (lesson.sourceIds ?? []).flatMap((id) => {
    const source = curriculumSources[id];
    return source ? [source] : [];
  });
  return (
    <div className="mt-7 border-t border-border pt-5">
      <div className="flex flex-wrap gap-2">
        {step.panels?.map((item) => (
          <Button key={item.title} variant="outline" onClick={() => setActive(item.title)} className="h-auto min-h-12 whitespace-normal rounded-2xl text-left text-base text-primary">
            <BookOpen aria-hidden />{item.title}
          </Button>
        ))}
        <Button variant="ghost" onClick={() => setActive("Sources & Medical Review")} className="h-auto min-h-12 whitespace-normal text-left text-base text-primary">
          <BookOpen aria-hidden />Sources &amp; Medical Review
        </Button>
      </div>
      <Sheet open={active !== null} onOpenChange={(open) => { if (!open) setActive(null); }}>
        <SheetContent className="theme-public w-[92vw] overflow-y-auto sm:max-w-lg">
          <SheetTitle className="pr-7 text-2xl">{active}</SheetTitle>
          <SheetDescription className="mt-2 text-base">{lesson.title}</SheetDescription>
          {panel ? (
            <div className="mt-6 space-y-4 text-base leading-relaxed text-foreground">{panel.body.map((text) => <p key={text}>{text}</p>)}</div>
          ) : (
            <div className="mt-6 space-y-6">
              <div className="border-l-2 border-primary pl-4 text-base leading-relaxed">
                <p className="font-semibold">Educational content. Clinical review pending.</p>
                <p className="mt-2 text-muted-foreground">These lessons are based on the sources below, but have not been independently reviewed by a clinician. They do not provide a diagnosis, treatment recommendation, or professional qualification. Discuss individual concerns with a qualified healthcare professional.</p>
              </div>
              <ul className="divide-y divide-border">
                {sources.map((source) => <li key={source.url} className="py-4">
                  <a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-2 text-base font-semibold text-primary underline-offset-4 hover:underline">{source.title}<ExternalLink className="mt-1 h-4 w-4 shrink-0" aria-hidden /></a>
                  <p className="mt-1 text-base text-muted-foreground">{source.publisher}</p>
                </li>)}
              </ul>
              <p className="text-base text-muted-foreground">Sources checked October 31, 2026. Guidance and medicine approvals can change.</p>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}