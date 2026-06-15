import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

export function VocareLogo({ className = "size-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="20" cy="20" r="19" className="fill-brand" />
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

const NAV_LINKS = [
  { to: "/methodology", label: "Methodology" },
  { to: "/specialties", label: "Specialties" },
  { to: "/sources", label: "Sources" },
  { to: "/saved", label: "Saved" },
] as const;

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  // Lock body scroll while mobile menu open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  return (
    <>
      <div
        className={`sticky top-0 z-40 transition-[background-color,backdrop-filter,box-shadow,border-color] duration-200 ${
          scrolled
            ? "bg-background/80 backdrop-blur-md border-b border-border/70 shadow-[0_1px_0_0_color-mix(in_oklab,var(--color-border)_60%,transparent)]"
            : "bg-background/0 border-b border-transparent"
        }`}
      >
        <nav
          aria-label="Primary"
          className="flex items-center justify-between px-5 sm:px-8 lg:px-10 py-4 max-w-7xl mx-auto"
        >
          <Link
            to="/"
            className="flex items-center gap-2.5 group rounded-lg -m-1 p-1"
            aria-label="Vocare — home"
          >
            <VocareLogo className="size-9 transition-transform group-hover:scale-105" />
            <div className="flex flex-col leading-none">
              <span className="font-serif text-xl tracking-tight">Vocare</span>
              <span className="hidden sm:block text-[9px] uppercase tracking-[0.22em] text-muted-foreground mt-0.5">
                Your calling in medicine
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1 text-sm font-medium">
            {NAV_LINKS.map((l) => {
              const active = pathname === l.to || pathname.startsWith(l.to + "/");
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`relative px-3 py-2 rounded-md transition-colors ${
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  {l.label}
                  {active && (
                    <span className="absolute left-3 right-3 -bottom-0.5 h-0.5 rounded-full bg-brand" />
                  )}
                </Link>
              );
            })}
            <Link
              to="/onboarding"
              className="ml-3 px-5 py-2.5 bg-brand text-brand-foreground rounded-full hover:opacity-90 hover:shadow-md hover:shadow-brand/20 active:scale-[0.98] transition-all"
            >
              Begin Assessment
            </Link>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <Link
              to="/onboarding"
              className="px-4 py-2 text-sm bg-brand text-brand-foreground rounded-full active:scale-[0.98] transition-transform"
            >
              Begin
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-nav"
              className="size-11 grid place-items-center rounded-full border border-border bg-card text-foreground hover:bg-muted transition-colors"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile drawer */}
      <div
        id="mobile-nav"
        className={`md:hidden fixed inset-x-0 top-[64px] z-30 origin-top transition-all duration-200 ${
          open ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
      >
        <div className="mx-3 rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
          <ul className="flex flex-col py-2">
            {NAV_LINKS.map((l) => {
              const active = pathname === l.to || pathname.startsWith(l.to + "/");
              return (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className={`flex items-center justify-between px-5 py-3 text-base font-medium transition-colors ${
                      active
                        ? "text-brand bg-brand-soft/60"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    {l.label}
                    {active && <span className="size-1.5 rounded-full bg-brand" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-card border-t border-border py-12 text-center mt-12">
      <p className="text-sm text-muted-foreground font-serif italic max-w-xl mx-auto px-6">
        "Your career is not just what you do; it is the environment in which your life happens."
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground/80 px-4">
        <Link to="/methodology" className="hover:text-foreground transition-colors">Methodology</Link>
        <Link to="/specialties" className="hover:text-foreground transition-colors">Specialties</Link>
        <Link to="/sample-result" className="hover:text-foreground transition-colors">Sample result</Link>
        <Link to="/sources" className="hover:text-foreground transition-colors">Credibility &amp; sources</Link>
        <Link to="/saved" className="hover:text-foreground transition-colors">Saved runs</Link>
        <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
      </div>

      <p className="mt-5 text-[11px] text-muted-foreground/80 max-w-2xl mx-auto px-6 leading-relaxed">
        Vocare is a utility test that offers an initial opinion on your medical career direction. It is not
        clinical advice and should not be the sole basis for irreversible career decisions. See our <Link to="/sources" className="underline hover:text-foreground">sources</Link> for the studies and frameworks behind every prediction.
      </p>
      <div className="mt-4 text-[11px] text-muted-foreground/70 uppercase tracking-[0.2em] px-4">
        © {new Date().getFullYear()} Vocare · Built for medical students in Egypt & worldwide
      </div>
    </footer>
  );
}
