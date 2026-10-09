import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Lock } from "lucide-react";
import { SiteFooter, SiteNav } from "@/components/site-chrome";
import { SPECIALTIES } from "@/lib/specialties";
import { MOHP_CUTOFFS, MOHP_SOURCE } from "@/lib/egypt-reality";
import { PAYMENT, paymentNote } from "@/lib/payment";

const URL = "https://future-doctor.lovable.app/pricing";
const TITLE = "Pricing · Vocare Career Blueprint 350 EGP";
const DESC = "What the 350 EGP Vocare Career Blueprint includes: Ministry residency cutoffs, clinic setup costs, migration routes and a 30 year career outlook.";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: URL },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
  component: PricingPage,
});

const FREE = ["Your top specialty match and score", "Your personality and trait profile", "The main tension or regret risk in your answers"];
const PAID = [
  "Why every percentage is what it is, linked to your answers",
  "Ministry residency cutoffs for your matches (May 2025 round)",
  "University residency vs Egyptian Fellowship access",
  "Private clinic setup cost and equipment for your match",
  "UK, Gulf and US exam and licensing route",
  "Burnout risk and fallback subspecialties",
  "30 year lifestyle, fulfilment and income outlook",
  "Full runner up reasoning, adjustable priorities and a PDF to keep",
];

const CLINIC = [
  { tier: "Tier 1", range: "Under 150,000 EGP", what: "Consult room: exam bed, ECG or basic tools, reception", eg: "Psychiatry, internal medicine, pediatrics, family medicine" },
  { tier: "Tier 2", range: "250,000 to 600,000 EGP", what: "One key device plus room setup", eg: "Cardiology (echo), OBGYN (4D ultrasound), ENT (endoscopy), urology" },
  { tier: "Tier 3", range: "1.5M to 5M+ EGP", what: "Heavy equipment or a procedure suite", eg: "Dermatology (lasers), ophthalmology (OCT, slit lamp), radiology, plastics" },
];

const name = (id: string) => SPECIALTIES.find((s) => s.id === id)?.name ?? id;
const ROWS = Object.entries(MOHP_CUTOFFS)
  .filter(([id]) => id !== "ir" && id !== "pmr")
  .sort((a, b) => b[1].median - a[1].median);

function PricingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="max-w-5xl mx-auto px-5 sm:px-8 py-14 space-y-16">
        <header className="max-w-2xl">
          <p className="hud-tag text-monitor">Pricing · one time</p>
          <h1 className="font-serif text-4xl sm:text-5xl tracking-tight mt-3">The Career Blueprint, {PAYMENT.priceEgp} EGP</h1>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            The assessment and your top match are free. For {PAYMENT.priceEgp} EGP you unlock the full report: the Egyptian reality of your specialty, from Ministry cutoffs to what a clinic costs, plus a PDF you keep.
          </p>
        </header>

        <section className="grid md:grid-cols-2 gap-5">
          <div className="rounded-xl border border-border p-6">
            <p className="hud-tag text-muted-foreground">Free</p>
            <p className="font-serif text-3xl mt-2">0 EGP</p>
            <ul className="mt-5 space-y-3 text-sm">
              {FREE.map((f) => <li key={f} className="flex gap-2"><Check className="size-4 text-vitals shrink-0 mt-0.5" />{f}</li>)}
            </ul>
          </div>
          <div className="rounded-xl border border-monitor/40 bg-monitor/5 p-6 hud-corners">
            <p className="hud-tag text-monitor">Career Blueprint</p>
            <p className="font-serif text-3xl mt-2">{PAYMENT.priceEgp} EGP</p>
            <ul className="mt-5 space-y-3 text-sm">
              {PAID.map((f) => <li key={f} className="flex gap-2"><Lock className="size-4 text-monitor shrink-0 mt-0.5" />{f}</li>)}
            </ul>
          </div>
        </section>

        <section>
          <p className="hud-tag text-monitor">Included · Ministry cutoffs</p>
          <h2 className="font-serif text-3xl mt-2">Residency cutoff scores</h2>
          <p className="mt-3 text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Minimum cumulative score (المجموع التراكمي) accepted per hospital in the Ministry of Health basic residency round, May 2025. Typical is the median hospital. Your Blueprint shows this for your own matches.
          </p>
          <div className="mt-6 overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm tabular">
              <thead className="bg-muted/50 text-left font-mono text-xs uppercase tracking-wider text-muted-foreground">
                <tr><th className="p-3">Specialty</th><th className="p-3">Hospitals</th><th className="p-3">Easiest</th><th className="p-3">Typical</th><th className="p-3">Hardest</th></tr>
              </thead>
              <tbody>
                {ROWS.map(([id, c]) => (
                  <tr key={id} className="border-t border-border">
                    <td className="p-3">{name(id)} <span className="text-muted-foreground" dir="rtl">{c.ar}</span></td>
                    <td className="p-3">{c.sites}</td>
                    <td className="p-3">{c.min.toLocaleString()}</td>
                    <td className="p-3 font-semibold text-monitor">{c.median.toLocaleString()}</td>
                    <td className="p-3">{c.max.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Source: <a href={MOHP_SOURCE.url} target="_blank" rel="noreferrer" className="underline">{MOHP_SOURCE.label}</a>
          </p>
        </section>

        <section>
          <p className="hud-tag text-monitor">Included · clinic costs</p>
          <h2 className="font-serif text-3xl mt-2">What a private clinic costs to open</h2>
          <div className="mt-6 grid md:grid-cols-3 gap-4">
            {CLINIC.map((c) => (
              <div key={c.tier} className="rounded-xl border border-border p-5">
                <p className="hud-tag text-muted-foreground">{c.tier}</p>
                <p className="font-serif text-2xl mt-1">{c.range}</p>
                <p className="mt-3 text-sm">{c.what}</p>
                <p className="mt-2 text-xs text-muted-foreground">{c.eg}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">These are estimates for orientation, not official figures. Real costs vary by city and by new or used equipment.</p>
        </section>

        <section className="rounded-xl border border-border p-6 sm:p-8">
          <p className="hud-tag text-monitor">How to pay</p>
          <ol className="mt-4 space-y-3 text-sm list-decimal pl-5">
            <li>Finish the free assessment.</li>
            <li>Send <b>{PAYMENT.priceEgp} EGP</b> via InstaPay to <b className="font-mono">{PAYMENT.instapayNumber}</b>.</li>
            <li>Write the note <b className="font-mono">{paymentNote("First name", "Last name")}</b>.</li>
            <li>Tap "I've paid" on your results. Your report unlocks on that device once the payment is confirmed.</li>
          </ol>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/onboarding" className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-5 py-3 text-sm font-medium">
              Start free assessment <ArrowRight className="size-4" />
            </Link>
            <Link to="/sample-result" className="inline-flex items-center rounded-lg border border-border px-5 py-3 text-sm font-medium hover:bg-muted">
              See a full sample report
            </Link>
          </div>
        </section>

        <p className="text-xs text-muted-foreground max-w-2xl">Vocare gives an initial opinion to support your thinking, not a guarantee of any residency place or career outcome.</p>
      </main>
      <SiteFooter />
    </div>
  );
}
