import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteFooter, SiteNav } from "@/components/site-chrome";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { track } from "@/lib/analytics";
import { Mail, LogOut, Check, Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Vocare" },
      { name: "description", content: "Sign in with a magic link to sync your saved runs and onboarding profile across devices." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      // already signed in — give a moment then redirect to /saved
      const t = setTimeout(() => navigate({ to: "/saved" }), 800);
      return () => clearTimeout(t);
    }
  }, [loading, user, navigate]);

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: `${window.location.origin}/saved` },
      });
      if (error) throw error;
      setSent(true);
      track("auth_magic_link_sent");
    } catch (err: any) {
      setError(err?.message ?? "Could not send the link. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    track("auth_sign_out");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="max-w-md mx-auto px-6 pt-14 pb-20">
        <span className="text-[11px] font-semibold tracking-[0.22em] uppercase text-brand">Account</span>
        <h1 className="text-3xl lg:text-4xl font-serif mt-3 leading-tight">
          {user ? "You are signed in." : "Sync across devices."}
        </h1>

        {user ? (
          <div className="mt-6 rounded-2xl border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">Signed in as</p>
            <p className="font-medium mt-1 break-all">{user.email}</p>
            <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
              Your saved runs and onboarding answers sync to this account. Sign in from any browser to pick up where you left off.
            </p>
            <div className="mt-5 flex gap-2 flex-wrap">
              <Link to="/saved" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand text-brand-foreground text-sm font-medium">
                Go to Saved
              </Link>
              <button onClick={signOut} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border text-sm font-medium hover:bg-muted">
                <LogOut className="size-4" /> Sign out
              </button>
            </div>
          </div>
        ) : sent ? (
          <div className="mt-6 rounded-2xl border border-border bg-card p-6">
            <Check className="size-5 text-brand" />
            <h2 className="font-serif text-xl mt-2">Check your email.</h2>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              We sent a magic link to <strong className="text-foreground">{email}</strong>. Tap it on any device to sign in. No password to remember.
            </p>
            <button onClick={() => { setSent(false); setEmail(""); }} className="mt-4 text-xs underline text-muted-foreground hover:text-foreground">
              Use a different email
            </button>
          </div>
        ) : (
          <form onSubmit={sendMagicLink} className="mt-6 space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Enter your email. We email you a one-tap sign-in link. No password, no marketing. You can stay anonymous forever if you prefer — accounts are optional and only used to sync your saved runs and onboarding profile.
            </p>
            <div>
              <label htmlFor="email" className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Email</label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30 transition"
              />
            </div>
            {error && <p className="text-sm text-warning">{error}</p>}
            <button
              type="submit"
              disabled={busy || !email}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-brand text-brand-foreground font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />}
              {busy ? "Sending..." : "Send magic link"}
            </button>
            <p className="text-xs text-muted-foreground leading-relaxed pt-2">
              By signing in you agree to the <Link to="/privacy" className="underline hover:text-foreground">privacy notes</Link>. We store your email and your saved runs. Nothing else.
            </p>
          </form>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
