/**
 * Nim the Wisp: the NeuraTrace learning companion.
 *
 * A small, hand-drawn SVG character (no image files, no dependencies).
 * She floats, blinks on her own, glows at the tip, and changes expression
 * depending on what the learner is doing. Everything is local.
 */

export type CompanionMood = "idle" | "listening" | "thinking" | "happy";

type Props = {
  mood?: CompanionMood;
  className?: string;
};

export function NimWisp({ mood = "idle", className = "" }: Props) {
  const happy = mood === "happy";

  return (
    <svg
      viewBox="0 0 64 84"
      className={`nim-wisp h-full w-full ${className}`}
      role="img"
      aria-label="Nim, the learning companion"
    >
      <defs>
        <radialGradient id="nim-body" cx="38%" cy="30%" r="78%">
          <stop offset="0%" stopColor="#fbf8ff" />
          <stop offset="55%" stopColor="#ece2fb" />
          <stop offset="100%" stopColor="#d9c9f4" />
        </radialGradient>
        <radialGradient id="nim-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#c9aefc" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#c9aefc" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="nim-tip" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff4d6" />
          <stop offset="100%" stopColor="#e9d6ff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* soft halo behind her */}
      <ellipse className="nim-halo" cx="32" cy="42" rx="30" ry="32" fill="url(#nim-halo)" />

      {/* trailing wisp tail */}
      <path
        className="nim-sway"
        d="M27 66 C27 75 33 81 41 81 C35 79 32 75 33 71 C34 68 30 65 27 66 Z"
        fill="#dfd0f7"
        opacity="0.9"
      />

      {/* body: teardrop with a curled, glowing tip */}
      <path
        d="M32 70 C17 70 9 60 9 47 C9 33 18 24 24 16 C27 12 28 8 26 5 C34 7 39 13 39 20 C48 26 55 35 55 47 C55 60 47 70 32 70 Z"
        fill="url(#nim-body)"
        stroke="#5b3aa0"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />

      {/* the glow at the tip of the curl */}
      <path
        className="nim-glow"
        d="M27 7 C32 8.5 35.5 12 36.5 16 C33 13.5 29.5 12 27 7 Z"
        fill="url(#nim-tip)"
      />

      {/* cheek blush */}
      <ellipse cx="19" cy="51" rx="4.2" ry="2.6" fill="#f4a6c0" opacity="0.75" />
      <ellipse cx="45" cy="51" rx="4.2" ry="2.6" fill="#f4a6c0" opacity="0.75" />

      {/* eyes */}
      {happy ? (
        <>
          <path
            d="M21.5 45 q3.5 -4 7 0"
            fill="none"
            stroke="#3d2570"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M35.5 45 q3.5 -4 7 0"
            fill="none"
            stroke="#3d2570"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <g className="nim-blink">
            <circle cx="25" cy="44" r="3.3" fill="#3d2570" />
            <circle cx="23.9" cy="42.8" r="1.15" fill="#ffffff" />
          </g>
          <g className="nim-blink nim-blink-late">
            <circle cx="39" cy="44" r="3.3" fill="#3d2570" />
            <circle cx="37.9" cy="42.8" r="1.15" fill="#ffffff" />
          </g>
        </>
      )}

      {/* mouth per mood */}
      {mood === "idle" && (
        <path
          d="M29 51 q3 2.6 6 0"
          fill="none"
          stroke="#3d2570"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      )}
      {mood === "listening" && <circle cx="32" cy="52" r="1.9" fill="#3d2570" />}
      {mood === "thinking" && (
        <path
          d="M30 52 q2.5 1.2 4.5 -0.4"
          fill="none"
          stroke="#3d2570"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      )}
      {happy && (
        <path
          d="M28 50 q4 4.5 8 0"
          fill="none"
          stroke="#3d2570"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      )}

      {/* drifting motes */}
      <circle className="nim-mote" cx="12" cy="26" r="1.6" fill="#c9aefc" />
      <circle className="nim-mote nim-mote-b" cx="53" cy="22" r="1.2" fill="#e8b6d0" />
      <circle className="nim-mote nim-mote-c" cx="48" cy="62" r="1.35" fill="#b9a3ef" />
    </svg>
  );
}
