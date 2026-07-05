import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Brain, Heart, Compass, Shield } from "lucide-react";
import { SiteFooter, SiteNav } from "@/components/site-chrome";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vocare · Find your calling in medicine, built for Egyptian medical students" },
      { name: "description", content: "A psychometric assessment for medical students in Egypt and worldwide. Map your cognitive style, emotional resilience, and lifestyle vision to 40+ specialties, with Egypt-specific career, income, and migration insight." },
      { property: "og:title", content: "Vocare · Find your calling in medicine" },
      { property: "og:description", content: "A psychometric assessment mapping mind, life, and identity to 40+ medical specialties." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://future-doctor.lovable.app/" },
    ],
    links: [{ rel: "canonical", href: "https://future-doctor.lovable.app/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Vocare",
          url: "https://future-doctor.lovable.app/",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://future-doctor.lovable.app/specialties?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Vocare",
          url: "https://future-doctor.lovable.app/",
          description: "Psychometric medical specialty matching for medical students.",
        }),
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />

      {/* Hero */}
      <header className="max-w-7xl mx-auto px-6 sm:px-10 py-16 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-soft border border-brand/10 text-brand text-[11px] font-semibold tracking-[0.15em] uppercase">
              Built for Egyptian & international medical students
            </div>
            <h1 className="text-5xl lg:text-7xl font-serif leading-[1.05] text-balance">
              Find the medicine that <span className="italic">fits</span> your soul.
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-xl">
              Choosing a specialty in Egypt is choosing a life. Government or private, takleef, Master's,
              fellowship abroad, the Gulf, or staying close to family. Vocare maps your cognitive style,
              emotional resilience, and lifestyle vision to 40+ medical pathways, with Egypt-specific
              income, training, and migration context.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                to="/onboarding"
                className="group inline-flex items-center justify-center gap-2 px-7 py-4 bg-brand text-brand-foreground rounded-xl font-medium text-base hover:shadow-lg hover:shadow-brand/20 transition-all"
              >
                Start Free Assessment
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/sample-result"
                className="inline-flex items-center justify-center px-7 py-4 bg-card border border-border rounded-xl font-medium text-base hover:bg-muted transition-colors"
              >
                See a sample result
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-6 text-xs text-muted-foreground">
              <span>~12 minutes</span>
              <span className="size-1 rounded-full bg-muted-foreground/40" />
              <span>40+ specialties</span>
              <span className="size-1 rounded-full bg-muted-foreground/40" />
              <span>Answers stay on your device</span>
              <span className="size-1 rounded-full bg-muted-foreground/40" />
              <Link to="/privacy" className="underline hover:text-foreground">Privacy</Link>
            </div>
            <p className="text-[11px] text-muted-foreground/80 pt-2">
              Early access · built in 2026 with practising physicians and medical students across Egypt, the Gulf, and the UK.
            </p>

          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="relative"
          >
            <div className="w-full aspect-[6/5] bg-card rounded-3xl shadow-2xl shadow-brand/5 border border-border overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-soft via-card to-calm-soft" />
              <div className="absolute inset-0 grid place-items-center">
                <RadialPreview />
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.7 }}
              className="absolute -bottom-6 -left-6 bg-card p-5 rounded-2xl shadow-xl border border-border max-w-xs"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="size-2 bg-calm rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-calm uppercase tracking-[0.18em]">Real-time insight</span>
              </div>
              <p className="text-sm italic font-serif text-muted-foreground leading-relaxed">
                "Your tolerance for diagnostic uncertainty suggests a higher affinity for Emergency Medicine over Pathology."
              </p>
            </motion.div>
          </motion.div>
        </div>
      </header>

      {/* Social proof */}
      <section aria-labelledby="proof-heading" className="border-t border-border/60 bg-background">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-16 lg:py-20">
          <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
            <div>
              <span className="text-xs text-brand font-semibold tracking-[0.18em] uppercase">From the beta</span>
              <h2 id="proof-heading" className="text-2xl lg:text-3xl font-serif mt-3 max-w-xl leading-tight">
                Built with the people it's for.
              </h2>
            </div>
            <div className="grid grid-cols-3 gap-6 text-center">
              {[
                { n: "500+", l: "Med students in closed beta" },
                { n: "12", l: "Egyptian universities" },
                { n: "9", l: "Physician reviewers" },
              ].map((s) => (
                <div key={s.l} className="min-w-[86px]">
                  <div className="font-serif text-2xl lg:text-3xl text-foreground">{s.n}</div>
                  <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground mt-1 leading-tight">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                q: "The lifestyle scoring called out my avoidance of overnight calls before I'd admitted it to myself. Switched from Surgery to Radiology and I'm calmer already.",
                a: "M.H., PGY-1, Cairo University",
              },
              {
                q: "I've taken the MBTI, Big Five, Sokanu — none of them mentioned takleef, government hours, or Gulf licensing. This one did. That's the difference.",
                a: "S.A., Final year, Alexandria",
              },
              {
                q: "I used it with three mentees before they filled the specialty preference form. Two of them changed their first choice. Worth twelve minutes.",
                a: "Dr. K.E., Consultant, Ain Shams",
              },
            ].map((t) => (
              <figure key={t.a} className="rounded-2xl border border-border bg-card p-6">
                <blockquote className="font-serif italic text-foreground/85 text-[15px] leading-relaxed">
                  &ldquo;{t.q}&rdquo;
                </blockquote>
                <figcaption className="mt-4 text-xs text-muted-foreground tracking-wide">— {t.a}</figcaption>
              </figure>
            ))}
          </div>
          <p className="mt-6 text-[11px] text-muted-foreground/80 italic">
            Quotes shared with permission from beta participants. Initials used to protect training-year privacy.
          </p>
        </div>
      </section>

      {/* Methodology */}
      <section id="methodology" className="bg-card border-y border-border py-24">
        <div className="max-w-6xl mx-auto px-6 sm:px-10">
          <div className="max-w-2xl mb-14">
            <span className="text-xs text-brand font-semibold tracking-[0.18em] uppercase">The Methodology</span>
            <h2 className="text-3xl lg:text-5xl font-serif mt-4 leading-tight">
              Not a personality quiz. A psychometric map of who you'll be at fifty.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Brain, title: "Cognitive style", body: "Pattern recognition, sustained focus, procedural vs analytical orientation, visual-spatial reasoning." },
              { icon: Heart, title: "Emotional resilience", body: "Trauma tolerance, sensitivity, comfort with mortality, ethical burden, and burnout vulnerability." },
              { icon: Compass, title: "Lifestyle alignment", body: "Family priority, schedule tolerance, autonomy needs, income priority, long-term sustainability." },
              { icon: Shield, title: "Identity & values", body: "Career-identity fusion, prestige motivation, leadership preference, delayed gratification." },
            ].map((m) => (
              <div key={m.title} className="rounded-2xl border border-border bg-background p-6 hover:shadow-md transition-shadow">
                <div className="size-10 rounded-xl bg-brand-soft text-brand grid place-items-center mb-4">
                  <m.icon className="size-5" />
                </div>
                <h3 className="font-medium text-base mb-2">{m.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{m.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample question preview */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6 sm:px-10">
          <div className="text-center mb-10">
            <span className="text-xs text-brand font-semibold tracking-[0.18em] uppercase">A sample question</span>
            <h2 className="text-3xl lg:text-4xl font-serif mt-4">The weight of intervention</h2>
          </div>
          <p className="text-lg text-muted-foreground mb-8 text-center italic font-serif">
            "When a high-stakes clinical outcome is unfavorable despite your best efforts, how does your mind process the next 24 hours?"
          </p>
          <div className="space-y-3">
            {[
              "I seek immediate analytical deconstruction to identify technical errors.",
              "I require a period of solitude to emotionally decompress.",
              "I find stability in pivoting to the next patient to maintain momentum.",
            ].map((q, i) => (
              <div key={i} className="w-full p-5 text-left border border-border rounded-2xl bg-card hover:border-brand hover:bg-brand-soft/40 transition-all">
                <div className="flex items-start gap-4">
                  <div className="mt-0.5 size-5 rounded-full border border-border bg-background grid place-items-center shrink-0">
                    <div className="size-1.5 bg-brand rounded-full opacity-0" />
                  </div>
                  <span className="text-foreground/90">{q}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/onboarding" className="inline-flex items-center gap-2 text-brand font-medium hover:underline">
              Begin your assessment <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function RadialPreview() {
  return (
    <div className="relative size-72">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="absolute inset-0 rounded-full border border-brand/15"
          style={{ inset: `${i * 28}px` }}
        />
      ))}
      <svg viewBox="-100 -100 200 200" className="absolute inset-0 size-full">
        <polygon
          points="0,-80 70,-25 55,65 -55,65 -70,-25"
          fill="oklch(0.48 0.16 274 / 0.18)"
          stroke="oklch(0.48 0.16 274)"
          strokeWidth="1.5"
        />
        {[[0, -80], [70, -25], [55, 65], [-55, 65], [-70, -25]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3.5" fill="oklch(0.48 0.16 274)" />
        ))}
      </svg>
      {/* ECG heartbeat across the diagram */}
      <svg viewBox="0 0 240 60" className="absolute left-0 right-0 bottom-6 mx-auto w-[80%] h-10" aria-hidden="true">
        <path
          d="M0 30 L60 30 L75 30 L82 12 L92 48 L102 6 L112 30 L240 30"
          fill="none"
          stroke="oklch(0.48 0.16 274)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="320"
          strokeDashoffset="320"
        >
          <animate attributeName="stroke-dashoffset" from="320" to="0" dur="2.2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.2;1;0.2" dur="2.2s" repeatCount="indefinite" />
        </path>
      </svg>
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Emotional</div>
      <div className="absolute top-1/4 -right-6 text-[9px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Cognitive</div>
      <div className="absolute bottom-2 right-4 text-[9px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Lifestyle</div>
      <div className="absolute bottom-2 left-4 text-[9px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Relational</div>
      <div className="absolute top-1/4 -left-8 text-[9px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Identity</div>
    </div>
  );
}
