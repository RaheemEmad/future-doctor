import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { SiteFooter, SiteNav } from "@/components/site-chrome";
import { ArrowRight, Brain, Compass, Globe2, Heart, ShieldAlert, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/methodology")({
  head: () => ({
    meta: [
      { title: "Methodology — Vocare" },
      { name: "description", content: "How Vocare scores medical specialty compatibility: traits, meaning, opportunity, regret risk, and lifecycle modeling." },
      { property: "og:title", content: "Methodology — Vocare" },
      { property: "og:description", content: "How we model physician life-fit, not just specialty prestige." },
    ],
  }),
  component: MethodologyPage,
});

const PILLARS = [
  { icon: Brain, title: "Cognitive & emotional fit", body: "32 trait dimensions are inferred from your answers — from uncertainty tolerance to death comfort to focus style — then matched against each specialty's curated trait profile using a weighted cosine similarity that gives more weight to extreme demands (e.g. a specialty that *requires* high stamina is penalized harder for mismatch)." },
  { icon: Heart, title: "Meaning source", body: "You rank up to 3 sources of meaning (saving lives, relationships, technical mastery, scientific curiosity, leadership, innovation, teaching). Each specialty carries a meaning profile vector, weighted at ~12% of the composite. This is what predicts whether you'll still love the work at 50." },
  { icon: ShieldAlert, title: "Regret risk", body: "Specific answer choices are tagged with regret flags — prestige-driven, family-pressure, fear-driven, money-driven, peer-comparison. We aggregate the flags, add trait-level boosts (e.g. high prestige motivation + low identity attachment), and surface the dominant signals in plain language." },
  { icon: Compass, title: "Career archetype", body: "Master clinician, academic, surgeon-operator, researcher, healthcare executive, educator, startup founder, public-health leader, telemedicine, lifestyle, global-health. Each specialty maps to a set of realistic trajectories; your chosen archetypes both reweight scoring and filter the 'Possible Paths' shown for your top matches." },
  { icon: Globe2, title: "Geographic opportunity", body: "Specialties are scored on Egypt private potential, GCC demand, UK migration friendliness, US match difficulty, remote work potential, AI disruption risk, and fellowship pipeline. Your stated geographic intent reweights the composite (e.g. Gulf intent = GCC demand dominates the opportunity channel)." },
  { icon: TrendingUp, title: "Lifecycle modeling", body: "Specialties feel different at year 1 vs year 30. Each carries a 4-point lifecycle curve (year 1, 5, 15, 30) across lifestyle, fulfillment, and financial axes — so you can see which paths are punishing-then-great vs great-then-grinding." },
];

function MethodologyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-5xl mx-auto px-6 sm:px-10 pt-10 lg:pt-16 pb-12"
      >
        <span className="text-[11px] font-semibold tracking-[0.22em] uppercase text-brand">How it works</span>
        <h1 className="text-4xl lg:text-6xl font-serif mt-4 leading-tight text-balance max-w-3xl">
          Methodology — a <span className="italic">life-fit</span> model, not a popularity quiz.
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl leading-relaxed">
          Most medical specialty quizzes optimize for prestige or exam fit. We optimize for the question that actually
          matters at year fifteen: <em>what kind of medical life can this person sustainably thrive in without losing themselves?</em>
        </p>
      </motion.section>

      <section className="max-w-5xl mx-auto px-6 sm:px-10 grid md:grid-cols-2 gap-5">
        {PILLARS.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: i * 0.05, duration: 0.5 }}
            className="rounded-3xl border border-border bg-card p-7"
          >
            <p.icon className="size-5 text-brand mb-3" />
            <h3 className="font-serif text-xl mb-2">{p.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{p.body}</p>
          </motion.div>
        ))}
      </section>

      <section className="max-w-5xl mx-auto px-6 sm:px-10 mt-16">
        <div className="rounded-3xl bg-brand text-brand-foreground p-10 lg:p-14">
          <h2 className="font-serif text-3xl lg:text-4xl mb-4">The composite, in one sentence.</h2>
          <p className="text-base lg:text-lg opacity-90 max-w-3xl leading-relaxed">
            Compatibility = weighted blend of trait similarity (32%), lifestyle/family/stamina fit (15%), emotional
            burden alignment (12%), meaning fit (12%), cognitive style fit (8%), career archetype overlap (8%),
            geographic opportunity (6–18% depending on intent), and income band fit (7%). Hard contradictions
            (low stamina vs high call burden, etc.) apply explicit penalties on top.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/onboarding" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-background text-foreground text-sm font-medium hover:opacity-90 transition">
              Take the assessment <ArrowRight className="size-4" />
            </Link>
            <Link to="/specialties" className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-brand-foreground/30 text-sm font-medium hover:bg-brand-foreground/10 transition">
              Browse specialties
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 sm:px-10 mt-16">
        <h2 className="font-serif text-2xl mb-6">What this model is not</h2>
        <ul className="space-y-3 text-sm text-muted-foreground leading-relaxed max-w-3xl">
          <li>— It is not a medical career oracle. It is a structured second opinion against your own gut.</li>
          <li>— It is not a substitute for shadowing, off-service rotations, or talking to physicians 10 years ahead of you.</li>
          <li>— It is not stable to gaming. If you optimize answers for an outcome, the regret-risk model will quietly flag the inconsistency.</li>
          <li>— It is not anonymous benchmarking. Nothing leaves your device unless you explicitly share a result link.</li>
        </ul>
      </section>

      <SiteFooter />
    </div>
  );
}
