import { Link } from "@tanstack/react-router";

export function VocareLogo({ className = "size-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="20" cy="20" r="19" className="fill-brand" />
      {/* ECG / heartbeat line forming a V */}
      <path
        d="M6 21 L13 21 L16 14 L20 27 L24 11 L27 21 L34 21"
        stroke="currentColor"
        className="text-background"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function SiteNav() {
  return (
    <nav className="flex items-center justify-between px-6 sm:px-10 py-6 max-w-7xl mx-auto">
      <Link to="/" className="flex items-center gap-2.5 group">
        <VocareLogo className="size-9 transition-transform group-hover:scale-105" />
        <div className="flex flex-col leading-none">
          <span className="font-serif text-xl tracking-tight">Vocare</span>
          <span className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground mt-0.5">Your calling in medicine</span>
        </div>
      </Link>
      <div className="hidden md:flex items-center gap-7 text-sm text-muted-foreground font-medium">
        <Link to="/methodology" className="hover:text-foreground transition-colors">Methodology</Link>
        <Link to="/specialties" className="hover:text-foreground transition-colors">Specialties</Link>
        <Link to="/saved" className="hover:text-foreground transition-colors">Saved</Link>
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
      <div className="mt-6 flex items-center justify-center gap-5 text-xs text-muted-foreground/80">
        <Link to="/methodology" className="hover:text-foreground">Methodology</Link>
        <Link to="/specialties" className="hover:text-foreground">Specialties</Link>
        <Link to="/saved" className="hover:text-foreground">Saved runs</Link>
      </div>
      <div className="mt-4 text-xs text-muted-foreground/70 uppercase tracking-[0.2em]">
        © {new Date().getFullYear()} Vocare · Built for medical students in Egypt & worldwide
      </div>
    </footer>
  );
}
