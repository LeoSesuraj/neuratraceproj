import { Link } from "@tanstack/react-router";

export function LegalFooter({ className = "" }: { className?: string }) {
  return (
    <footer
      className={`border-t border-border/60 px-5 py-6 text-center text-xs text-muted-foreground ${className}`}
    >
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-x-4 gap-y-2">
        <span>© {new Date().getFullYear()} NeuroTrace</span>
        <Link to="/legal/terms" className="hover:text-foreground hover:underline">
          Terms of Service
        </Link>
        <Link to="/legal/privacy" className="hover:text-foreground hover:underline">
          Privacy Policy
        </Link>
      </div>
    </footer>
  );
}
