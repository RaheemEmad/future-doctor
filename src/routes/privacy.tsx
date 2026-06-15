import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter, SiteNav } from "@/components/site-chrome";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy — Vocare" },
      { name: "description", content: "What Vocare stores, where it lives, and what leaves your device. Plain language, no dark patterns." },
      { property: "og:title", content: "Privacy — Vocare" },
      { property: "og:description", content: "What Vocare stores, where it lives, and what leaves your device." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="max-w-3xl mx-auto px-6 sm:px-10 pt-10 lg:pt-14 pb-16">
        <span className="text-[11px] font-semibold tracking-[0.22em] uppercase text-brand">Privacy</span>
        <h1 className="text-4xl lg:text-5xl font-serif mt-4 leading-tight text-balance">
          What we store, and where it lives.
        </h1>
        <p className="mt-4 text-muted-foreground">
          Honest version, no legalese. Last updated June 2026.
        </p>

        <Section title="Your answers stay on your device">
          <p>
            The onboarding answers and the 16-step assessment are written to your browser's
            <code className="mx-1 px-1.5 py-0.5 rounded bg-muted text-foreground/90 text-[12px]">localStorage</code>
            and nowhere else. We do not have a database row with your name, your email, or your
            responses. If you clear your browser data, switch devices, or use a private window,
            those answers are gone.
          </p>
          <p>
            That has a real trade-off, which we want you to see clearly: <strong>saved runs are
            not recoverable</strong> if you lose this browser. To keep results portable, use the
            <em> share link</em> on any saved run (the entire run is encoded into the URL itself)
            or the <em>export</em> button on the Saved page (downloads a JSON file you can re-import).
          </p>
        </Section>

        <Section title="What does leave your device">
          <p>
            Two things, and only when you choose them:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Personalized AI summary.</strong> If you tap "Generate AI summary" on the
              results page, your top match name, intent region, and a small set of trait scores
              are sent to our server function, which forwards them to a hosted LLM (Google Gemini
              via the Lovable AI Gateway) to produce a paragraph. We do not retain that request.
              Your raw answers are never sent.
            </li>
            <li>
              <strong>Share links.</strong> When you copy a share link, your onboarding answers
              and your 16 question selections are compressed into the URL fragment. Anyone with
              the link can re-derive the same result. Treat share links like a personal document.
            </li>
          </ul>
        </Section>

        <Section title="No analytics, no tracking pixels, no ads">
          <p>
            As of today there is no analytics SDK, no Google Analytics, no Facebook pixel, no
            session-replay tool, and no third-party cookies. The site does not know you visited.
            If we add privacy-friendly aggregate analytics later (Plausible or similar, cookieless,
            no personal identifiers), we will list it here before turning it on.
          </p>
        </Section>

        <Section title="Hosting">
          <p>
            The site is hosted on Lovable's edge infrastructure (Cloudflare Workers). Standard
            server access logs (IP, user agent, request path) exist at the infrastructure level
            and are retained briefly for abuse prevention. We do not read or analyze them.
          </p>
        </Section>

        <Section title="PDF export">
          <p>
            The PDF download is generated entirely in your browser using your already-local
            session data. Nothing is uploaded to produce it.
          </p>
        </Section>

        <Section title="If you want everything gone">
          <p>
            Open your browser settings and clear site data for this domain. That removes every
            saved run, every answer, and every cached AI summary. There is no server copy for us
            to delete.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Questions, corrections, or a "you should also disclose X" note are welcome. Open an
            issue or reach out via the contact on the methodology page.
          </p>
          <p className="text-xs text-muted-foreground pt-2">
            See also: <Link to="/sources" className="underline hover:text-foreground">Credibility &amp; sources</Link> · <Link to="/methodology" className="underline hover:text-foreground">Methodology</Link>
          </p>
        </Section>
      </main>
      <SiteFooter />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-serif text-2xl mb-3">{title}</h2>
      <div className="space-y-3 text-foreground/85 leading-relaxed text-[15px]">{children}</div>
    </section>
  );
}
