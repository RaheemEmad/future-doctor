import { Link } from "@tanstack/react-router";

export function SiteNav() {
  return (
    <nav className="flex items-center justify-between px-6 sm:px-10 py-6 max-w-7xl mx-auto">
      <Link to="/" className="flex items-center gap-2.5 group">
        <div className="size-8 rounded-full bg-brand flex items-center justify-center transition-transform group-hover:scale-105">
          <div className="size-2.5 bg-background rounded-full" />
        </div>
        <span className="font-serif text-xl tracking-tight">Aequitas</span>
      </Link>
      <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground font-medium">
        <Link to="/" className="hover:text-foreground transition-colors">Methodology</Link>
        <Link to="/" className="hover:text-foreground transition-colors">Specialties</Link>
        <Link
          to="/onboarding"
          className="px-5 py-2.5 bg-brand text-brand-foreground rounded-full hover:opacity-90 transition-opacity"
        >
          Begin Assessment
        </Link>
      </div>
      <Link
        to="/onboarding"
        className="md:hidden px-4 py-2 text-sm bg-brand text-brand-foreground rounded-full"
      >
        Begin
      </Link>
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-card border-t border-border py-12 text-center mt-12">
      <p className="text-sm text-muted-foreground font-serif italic max-w-xl mx-auto px-6">
        "Your career is not just what you do; it is the environment in which your life happens."
      </p>
      <div className="mt-6 text-xs text-muted-foreground/70 uppercase tracking-[0.2em]">
        © {new Date().getFullYear()} Aequitas Medical Assessment
      </div>
    </footer>
  );
}
