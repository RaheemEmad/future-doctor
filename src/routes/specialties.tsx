import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { SiteFooter, SiteNav } from "@/components/site-chrome";
import { ENRICHED_SPECIALTIES } from "@/lib/enrichment";
import { Search, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/specialties")({
  head: () => ({
    meta: [
      { title: "Specialties · Vocare" },
      { name: "description", content: "Browse 40+ medical specialties with lifestyle, burnout, income, opportunity, and AI exposure data." },
      { property: "og:title", content: "Specialties · Vocare" },
      { property: "og:description", content: "40+ specialties scored on lifestyle, burnout, opportunity, and AI exposure." },
    ],
  }),
  component: SpecialtiesPage,
});

const FACETS = [
  { id: "all", label: "All" },
  { id: "high_lifestyle", label: "High lifestyle", test: (s: any) => s.lifestyle >= 4 },
  { id: "low_burnout", label: "Low burnout", test: (s: any) => s.burnoutRisk <= 2 },
  { id: "procedural", label: "Procedural", test: (s: any) => s.procedural >= 4 },
  { id: "family_friendly", label: "Family-friendly", test: (s: any) => s.familyFriendly >= 4 },
  { id: "egypt_private", label: "Strong Egypt private", test: (s: any) => s.egyptPrivatePotential >= 7 },
  { id: "gcc", label: "Gulf demand", test: (s: any) => s.gccDemand >= 7 },
  { id: "uk", label: "UK pathway", test: (s: any) => s.ukMigrationFriendliness >= 7 },
  { id: "ai_safe", label: "AI-resilient", test: (s: any) => s.aiDisruptionRisk <= 4 },
];

function SpecialtiesPage() {
  const [q, setQ] = useState("");
  const [facet, setFacet] = useState("all");

  const list = useMemo(() => {
    const f = FACETS.find((x) => x.id === facet);
    const query = q.trim().toLowerCase();
    return ENRICHED_SPECIALTIES.filter((s) => {
      if (f?.test && !f.test(s)) return false;
      if (!query) return true;
      return (
        s.name.toLowerCase().includes(query) ||
        s.blurb.toLowerCase().includes(query) ||
        s.tags.some((t) => t.toLowerCase().includes(query))
      );
    });
  }, [q, facet]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto px-6 sm:px-10 pt-10 lg:pt-14 pb-8"
      >
        <span className="text-[11px] font-semibold tracking-[0.22em] uppercase text-brand">Specialty library</span>
        <h1 className="text-4xl lg:text-5xl font-serif mt-4 leading-tight max-w-3xl text-balance">
          All {ENRICHED_SPECIALTIES.length} specialties, with the data we use to score them.
        </h1>
        <p className="mt-4 text-muted-foreground max-w-2xl">
          Browse, filter, or search. Numbers are 1 to 5 unless noted; opportunity bars are 1 to 10.
        </p>
      </motion.section>

      <section className="max-w-6xl mx-auto px-6 sm:px-10 sticky top-[64px] z-20 bg-background/85 backdrop-blur-sm border-b border-border py-4 -mx-px">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, tag, or description"
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {FACETS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFacet(f.id)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  facet === f.id ? "bg-brand text-brand-foreground border-brand" : "bg-card border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 sm:px-10 mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3 pb-12">
        {list.map((s) => (
          <div key={s.id} className="rounded-2xl border border-border bg-card p-6 flex flex-col">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-serif text-xl leading-tight">{s.name}</h3>
              <span className="shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground">{s.trainingYears}</span>
            </div>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed line-clamp-3">{s.blurb}</p>

            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px] mt-auto">
              <Metric label="Lifestyle" v={s.lifestyle} />
              <Metric label="Burnout" v={s.burnoutRisk} warn />
              <Metric label="Income" v={s.incomeBand} />
              <Metric label="Family" v={s.familyFriendly} />
              <Metric label="Call burden" v={s.callBurden} warn />
              <Metric label="Procedural" v={s.procedural} />
            </div>

            <div className="mt-4 pt-4 border-t border-border/60 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
              <Bar label="Egypt private" v={s.egyptPrivatePotential} />
              <Bar label="GCC demand" v={s.gccDemand} />
              <Bar label="UK pathway" v={s.ukMigrationFriendliness} />
              <Bar label="AI risk" v={s.aiDisruptionRisk} warn />
            </div>

            <div className="flex flex-wrap gap-1 mt-4">
              {s.tags.slice(0, 4).map((t) => (
                <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{t}</span>
              ))}
            </div>
          </div>
        ))}
        {list.length === 0 && (
          <div className="col-span-full text-center py-16 text-muted-foreground text-sm">
            No specialties match those filters.
          </div>
        )}
      </section>

      <section className="max-w-6xl mx-auto px-6 sm:px-10 mb-16">
        <div className="rounded-3xl bg-brand text-brand-foreground p-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <h2 className="font-serif text-2xl mb-1">Don't just browse, get matched.</h2>
            <p className="opacity-80 text-sm">The assessment scores all of these against your psychology in ~6 minutes.</p>
          </div>
          <Link to="/onboarding" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-background text-foreground text-sm font-medium hover:opacity-90 transition shrink-0">
            Begin Assessment <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function Metric({ label, v, warn }: { label: string; v: number; warn?: boolean }) {
  const blocks = Array.from({ length: 5 }, (_, i) => i < v);
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="flex gap-0.5">
        {blocks.map((on, i) => (
          <span key={i} className={`size-1.5 rounded-full ${on ? (warn ? "bg-warning" : "bg-brand") : "bg-muted"}`} />
        ))}
      </span>
    </div>
  );
}

function Bar({ label, v, warn }: { label: string; v: number; warn?: boolean }) {
  return (
    <div>
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="truncate">{label}</span>
        <span className="tabular-nums">{v}</span>
      </div>
      <div className="h-1 mt-0.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full ${warn ? "bg-warning" : "bg-brand"}`} style={{ width: `${v * 10}%` }} />
      </div>
    </div>
  );
}
