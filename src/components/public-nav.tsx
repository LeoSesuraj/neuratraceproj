import { Link } from "@tanstack/react-router";
import logo from "../assets/neuratrace-logo.png";

/** Public header: only two destinations, Learn and Resident Login. */
export function PublicNav() {
  return (
    <header className="sticky top-0 z-40">
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-5 sm:px-8" style={{ height: 72 }}>
        <Link to="/" aria-label="NeuraTrace home" className="flex shrink-0 items-center gap-2.5">
          <img src={logo} alt="NeuraTrace logo" width={40} height={40} className="h-10 w-10" />
          <span className="text-lg font-bold tracking-tight text-foreground">NeuraTrace</span>
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-1">
          <Link to="/learn" className="inline-flex min-h-11 items-center rounded-full px-4 text-[15px] font-semibold text-foreground hover:bg-card/70">
            Learn
          </Link>
          <Link to="/auth/login" className="inline-flex min-h-11 items-center rounded-full bg-card px-4 text-[15px] font-semibold text-primary shadow-sm hover:bg-accent">
            Resident Login
          </Link>
        </nav>
      </div>
    </header>
  );
}
