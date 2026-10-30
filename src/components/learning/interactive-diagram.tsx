import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Everyday forgetfulness vs. concerning change                        */
/* ------------------------------------------------------------------ */

const examples = [
  { text: "Forgetting a name, then remembering it later", typical: true, why: "Slower recall that comes back later is common with age." },
  { text: "Getting lost on a route driven for years", typical: false, why: "Getting lost somewhere very familiar can be a sign worth discussing with a doctor." },
  { text: "Misplacing glasses, then retracing steps to find them", typical: true, why: "Retracing steps to find something shows memory still working." },
  { text: "Asking the same question again and again in one conversation", typical: false, why: "Repeating questions without remembering the answer can signal trouble forming new memories." },
  { text: "Having trouble following a familiar recipe or paying bills", typical: false, why: "Difficulty with familiar multi-step tasks is a common early sign." },
];

export function ForgetfulnessSort() {
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  return (
    <div className="grid gap-3">
      {examples.map((e, i) => {
        const a = answers[i];
        const answered = a !== undefined;
        const right = answered && a === e.typical;
        return (
          <div key={e.text} className="rounded-3xl border border-border bg-card p-4 sm:p-5">
            <p className="text-base font-medium text-foreground">{e.text}</p>
            <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label={`Sort: ${e.text}`}>
              {[
                { v: true, label: "Typical with age" },
                { v: false, label: "Worth checking" },
              ].map((o) => (
                <button
                  key={o.label}
                  type="button"
                  aria-pressed={a === o.v}
                  onClick={() => setAnswers((s) => ({ ...s, [i]: o.v }))}
                  className={`min-h-11 rounded-full px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    a === o.v ? "bg-primary text-primary-foreground" : "bg-muted text-primary hover:bg-accent"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
            {answered && (
              <p className="mt-3 text-base text-muted-foreground" aria-live="polite">
                <span className="font-semibold text-foreground">
                  {right ? "Yes. " : e.typical ? "This one is usually typical. " : "This one is worth checking. "}
                </span>
                {e.why}
              </p>
            )}
          </div>
        );
      })}
      <p className="text-sm text-muted-foreground">
        These are general examples, not a diagnosis. If you're worried, talk with a doctor.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Memory formation sequence                                           */
/* ------------------------------------------------------------------ */

const memorySteps = [
  { title: "Notice", text: "Your senses take in the moment: your grandchild's voice, their smile, the smell of cookies. Different brain areas process each detail." },
  { title: "Focus", text: "Paying attention holds the moment in mind for a short time. Without attention, most details slip away within seconds." },
  { title: "Store", text: "The hippocampus links the details together, like tying a bundle. Over days, and especially during sleep, the memory is strengthened." },
  { title: "Recall", text: "Later, a cue such as a photo or a song reactivates the same network, and the moment comes back to mind." },
];

export function MemorySequence() {
  const [i, setI] = useState(0);
  return (
    <div className="rounded-[2rem] bg-gradient-to-br from-lavender to-blush p-5 sm:p-7">
      <ol className="grid grid-cols-4 gap-2" aria-label="Memory steps">
        {memorySteps.map((s, n) => (
          <li key={s.title}>
            <button
              type="button"
              onClick={() => setI(n)}
              aria-current={n === i ? "step" : undefined}
              className={`flex w-full flex-col items-center gap-2 rounded-2xl px-1 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                n === i ? "bg-card text-primary shadow-sm" : n < i ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm ${
                  n <= i ? "bg-primary text-primary-foreground" : "bg-card/70 text-muted-foreground"
                }`}
              >
                {n + 1}
              </span>
              {s.title}
            </button>
          </li>
        ))}
      </ol>
      <div className="mt-5 rounded-3xl bg-card p-5" aria-live="polite">
        <MemoryVisual step={i} />
        <p className="mt-4 text-lg font-semibold text-foreground">{memorySteps[i].title}</p>
        <p className="mt-1 text-base text-muted-foreground">{memorySteps[i].text}</p>
      </div>
      <div className="mt-4 flex justify-between">
        <button type="button" disabled={i === 0} onClick={() => setI(i - 1)} className="inline-flex min-h-11 items-center gap-1 rounded-full px-4 text-sm font-semibold text-primary disabled:opacity-40">
          <ChevronLeft className="h-4 w-4" aria-hidden /> Previous
        </button>
        <button type="button" disabled={i === memorySteps.length - 1} onClick={() => setI(i + 1)} className="inline-flex min-h-11 items-center gap-1 rounded-full bg-card px-4 text-sm font-semibold text-primary disabled:opacity-40">
          Next step <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}

function MemoryVisual({ step }: { step: number }) {
  // Dots = details; lines = links made by the hippocampus.
  const dots = [
    [60, 50], [140, 30], [220, 55], [100, 110], [190, 115],
  ];
  const linked = step >= 2;
  const lit = step === 3 ? 1 : step === 1 ? 0.9 : step === 0 ? 0.55 : 0.85;
  return (
    <svg viewBox="0 0 280 150" className="mx-auto h-32 w-full max-w-sm" aria-hidden>
      {linked &&
        dots.flatMap((a, i) =>
          dots.slice(i + 1).map((b, j) => (
            <line key={`${i}-${j}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#6a4cc2" strokeOpacity={step === 3 ? 0.7 : 0.35} strokeWidth="2" />
          )),
        )}
      {dots.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={step === 1 && i > 2 ? 7 : 11}
          fill={i % 2 ? "#ef7c9a" : "#6a4cc2"}
          fillOpacity={step === 1 && i > 2 ? 0.25 : lit}
          className="transition-all duration-500"
        />
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Neuron anatomy                                                      */
/* ------------------------------------------------------------------ */

const neuronParts = [
  { id: "dendrites", name: "Dendrites", text: "Branch-like arms that receive messages from other neurons." },
  { id: "body", name: "Cell body", text: "The control center. It contains the nucleus and keeps the cell alive and working." },
  { id: "axon", name: "Axon", text: "A long cable that carries the electrical signal away from the cell body." },
  { id: "terminals", name: "Axon terminals", text: "The tips of the axon. They release chemical messengers toward the next neuron." },
  { id: "synapse", name: "Synapse", text: "The tiny gap between two neurons. Messengers cross it to pass the signal along. Memories depend on these connections." },
];

export function NeuronDiagram() {
  const [id, setId] = useState("synapse");
  const part = neuronParts.find((p) => p.id === id)!;
  const c = (p: string) => (p === id ? "#ef7c9a" : "#b9a6e6");
  return (
    <div className="rounded-[2rem] bg-gradient-to-br from-lavender to-blush p-5 sm:p-7">
      <svg viewBox="0 0 640 200" role="img" aria-label={`Neuron diagram, ${part.name} highlighted`} className="w-full">
        <g onClick={() => setId("dendrites")} className="cursor-pointer" stroke={c("dendrites")} strokeWidth="7" strokeLinecap="round" fill="none">
          <path d="M95,100 L40,55 M95,100 L30,100 M95,100 L45,150 M55,64 L35,35 M40,100 L20,80 M52,140 L28,165" />
        </g>
        <circle cx="110" cy="100" r="34" fill={c("body")} onClick={() => setId("body")} className="cursor-pointer" />
        <circle cx="110" cy="100" r="11" fill="#4b2f8f" pointerEvents="none" />
        <path d="M144,100 L430,100" stroke={c("axon")} strokeWidth="12" strokeLinecap="round" onClick={() => setId("axon")} className="cursor-pointer" />
        <g onClick={() => setId("terminals")} className="cursor-pointer" stroke={c("terminals")} strokeWidth="7" strokeLinecap="round" fill="none">
          <path d="M430,100 L470,70 M430,100 L475,100 M430,100 L470,130" />
          <circle cx="474" cy="68" r="7" fill={c("terminals")} />
          <circle cx="480" cy="100" r="7" fill={c("terminals")} />
          <circle cx="474" cy="132" r="7" fill={c("terminals")} />
        </g>
        <g onClick={() => setId("synapse")} className="cursor-pointer">
          <rect x="486" y="55" width="30" height="90" rx="12" fill={id === "synapse" ? "rgba(239,124,154,0.25)" : "transparent"} />
          {[70, 88, 104, 120].map((y, i) => (
            <circle key={y} cx={496 + (i % 2) * 10} cy={y} r="3.5" fill="#4b2f8f" />
          ))}
        </g>
        {/* Next neuron's dendrite */}
        <path d="M522,100 L620,100 M540,100 L575,60 M540,100 L575,140" stroke="#cdbff0" strokeWidth="7" strokeLinecap="round" fill="none" />
      </svg>
      <div role="tablist" aria-label="Neuron parts" className="mt-3 flex flex-wrap justify-center gap-2">
        {neuronParts.map((p) => (
          <button
            key={p.id}
            role="tab"
            type="button"
            aria-selected={p.id === id}
            onClick={() => setId(p.id)}
            className={`min-h-11 rounded-full px-4 text-sm font-semibold transition-colors ${
              p.id === id ? "bg-primary text-primary-foreground" : "bg-card/80 text-primary hover:bg-card"
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>
      <div className="mt-4 rounded-3xl bg-card p-5" aria-live="polite">
        <p className="text-lg font-semibold text-foreground">{part.name}</p>
        <p className="mt-1 text-base text-muted-foreground">{part.text}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Brain changes: healthy vs. affected                                 */
/* ------------------------------------------------------------------ */

const changes = [
  {
    id: "amyloid",
    name: "Amyloid plaques",
    text: "Amyloid-beta is a protein fragment that, in Alzheimer's, clumps together between neurons into plaques. These clumps can interfere with communication at synapses.",
  },
  {
    id: "tau",
    name: "Tau tangles",
    text: "Tau normally helps keep a neuron's internal transport tracks steady. In Alzheimer's it twists into tangles inside neurons, so nutrients and signals can't move properly.",
  },
  {
    id: "synapse",
    name: "Lost connections",
    text: "Synapses stop working and are lost. Fewer connections mean messages travel less reliably, which affects memory and thinking.",
  },
  {
    id: "loss",
    name: "Neuron loss",
    text: "Over years, damaged neurons die and affected brain tissue shrinks, beginning in memory areas such as the hippocampus.",
  },
];

export function BrainChanges() {
  const [id, setId] = useState("amyloid");
  const [affected, setAffected] = useState(true);
  const item = changes.find((c) => c.id === id)!;
  return (
    <div className="rounded-[2rem] bg-gradient-to-br from-lavender to-blush p-5 sm:p-7">
      <div role="tablist" aria-label="Brain changes" className="flex flex-wrap gap-2">
        {changes.map((c) => (
          <button
            key={c.id}
            role="tab"
            type="button"
            aria-selected={c.id === id}
            onClick={() => setId(c.id)}
            className={`min-h-11 rounded-full px-4 text-sm font-semibold transition-colors ${
              c.id === id ? "bg-primary text-primary-foreground" : "bg-card/80 text-primary hover:bg-card"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>
      <div className="mt-4 rounded-3xl bg-card p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-muted-foreground">{affected ? "With Alzheimer's" : "Healthy"}</p>
          <div className="inline-flex rounded-full bg-muted p-1" role="group" aria-label="Compare">
            {[
              { v: false, l: "Healthy" },
              { v: true, l: "Alzheimer's" },
            ].map((o) => (
              <button
                key={o.l}
                type="button"
                aria-pressed={affected === o.v}
                onClick={() => setAffected(o.v)}
                className={`min-h-9 rounded-full px-3 text-sm font-semibold ${affected === o.v ? "bg-card text-primary shadow-sm" : "text-muted-foreground"}`}
              >
                {o.l}
              </button>
            ))}
          </div>
        </div>
        <ChangeVisual id={id} affected={affected} />
        <p className="mt-3 text-lg font-semibold text-foreground">{item.name}</p>
        <p className="mt-1 text-base text-muted-foreground" aria-live="polite">{item.text}</p>
        <p className="mt-3 text-sm text-muted-foreground">Simplified diagram, not to scale.</p>
      </div>
    </div>
  );
}

function ChangeVisual({ id, affected }: { id: string; affected: boolean }) {
  const neurons = [
    [60, 70], [170, 50], [280, 80], [110, 150], [230, 150],
  ];
  const lost = affected && (id === "loss" ? [2, 3] : []);
  const links: [number, number][] = [[0, 1], [1, 2], [0, 3], [3, 4], [1, 4], [2, 4]];
  const brokenLinks = affected && (id === "synapse" || id === "loss") ? [1, 2, 5] : [];
  return (
    <svg viewBox="0 0 340 200" className="mx-auto mt-3 h-44 w-full max-w-md" aria-hidden>
      {links.map(([a, b], i) => {
        const gone = (brokenLinks as number[]).includes(i) || (lost as number[]).includes(a) || (lost as number[]).includes(b);
        return (
          <line
            key={i}
            x1={neurons[a][0]} y1={neurons[a][1]} x2={neurons[b][0]} y2={neurons[b][1]}
            stroke="#6a4cc2" strokeWidth="3" strokeOpacity={gone ? 0.12 : 0.55}
            strokeDasharray={gone ? "4 6" : undefined}
            className="transition-all duration-500"
          />
        );
      })}
      {neurons.map(([x, y], i) => {
        const isLost = (lost as number[]).includes(i);
        return (
          <g key={i} className="transition-all duration-500" opacity={isLost ? 0.15 : 1}>
            <circle cx={x} cy={y} r="18" fill="#cdbff0" />
            <circle cx={x} cy={y} r="6" fill="#4b2f8f" />
            {affected && id === "tau" && !isLost && (
              <path d={`M${x - 10},${y - 4} q5,-8 10,0 t10,0 M${x - 10},${y + 5} q5,-8 10,0 t10,0`} stroke="#ef7c9a" strokeWidth="2.5" fill="none" />
            )}
          </g>
        );
      })}
      {affected && id === "amyloid" &&
        [[115, 60], [225, 110], [170, 160], [70, 115]].map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="13" fill="#ef7c9a" fillOpacity="0.55" />
            <circle cx={x + 6} cy={y - 5} r="7" fill="#ef7c9a" fillOpacity="0.7" />
          </g>
        ))}
    </svg>
  );
}
