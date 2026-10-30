import { Link } from "@tanstack/react-router";
import logo from "../assets/neuratrace-logo.png";

const learnLinks = [
  { label: "Learning home", to: "/learn" as const },
  { label: "Explore the science", to: "/learn/understand" as const },
  { label: "Practice situations", to: "/learn/connect" as const },
  { label: "The journey", to: "/learn/journey" as const },
  { label: "Caregiver support", to: "/learn/support" as const },
  { label: "AI Coach", to: "/learn/coach" as const },
];

const portalLinks = [
  { label: "Sign in", to: "/auth/login" as const },
  { label: "Join with a key", to: "/auth/join" as const },
];

const companyLinks = [
  { label: "Terms of Service", to: "/legal/terms" as const },
  { label: "Privacy Policy", to: "/legal/privacy" as const },
];

export function PublicFooter() {
  return (
    <footer className="border-t border-border/60 bg-secondary/40">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <img src={logo} alt="NeuraTrace logo" width={36} height={36} className="h-9 w-9" />
              <span className="text-lg font-bold tracking-tight">NeuraTrace</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              An interactive learning platform helping families understand
              Alzheimer's and dementia, and stay connected to the people they love.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              <a href="mailto:neuratraceadmin@gmail.com" className="text-primary hover:underline">
                neuratraceadmin@gmail.com
              </a>
            </p>
          </div>

          <nav aria-label="Learn">
            <h3 className="text-sm font-semibold tracking-wide text-foreground">Learn</h3>
            <ul className="mt-4 space-y-2.5">
              {learnLinks.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Care Portal">
            <h3 className="text-sm font-semibold tracking-wide text-foreground">Care Portal</h3>
            <ul className="mt-4 space-y-2.5">
              {portalLinks.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Company">
            <h3 className="text-sm font-semibold tracking-wide text-foreground">About</h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <a href="/#about" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  About
                </a>
              </li>
              {companyLinks.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 border-t border-border/60 pt-6">
          <p className="text-xs leading-relaxed text-muted-foreground">
            NeuraTrace is an educational platform. It is not a diagnostic tool,
            medical advice, or a substitute for professional care. Learning
            scenarios are fictional educational simulations.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            © {new Date().getFullYear()} NeuraTrace. Part of the NeuraBridge family.
          </p>
        </div>
      </div>
    </footer>
  );
}
