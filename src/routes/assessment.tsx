import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { SiteNav } from "@/components/site-chrome";
import { QUESTIONS } from "@/lib/questions";
import { aggregateTraits, score } from "@/lib/scoring";
import { loadSession, saveSession } from "@/lib/session";

export const Route = createFileRoute("/assessment")({
  head: () => ({
    meta: [
      { title: "Assessment — Aequitas" },
      { name: "description", content: "A reflective psychometric assessment that maps your inner world to medical specialties." },
    ],
  }),
  component: AssessmentPage,
});

function AssessmentPage() {
  const navigate = useNavigate();
  const [session, setSession] = useState(() => loadSession());
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!session.onboarding) {
      navigate({ to: "/onboarding" });
    }
  }, [session.onboarding, navigate]);

  const total = QUESTIONS.length;
  const q = QUESTIONS[step];
  const selected = session.answers[q.id];

  const reflectivePrompts = useMemo(
    () => [
      "Take a breath. There are no wrong paths here.",
      "Choose what is most honest, not most admirable.",
      "Notice what your body says before your mind answers.",
      "This is about who you are — not who you should be.",
    ],
    [],
  );

  function pick(idx: number) {
    const next = { ...session, answers: { ...session.answers, [q.id]: idx } };
    setSession(next);
    saveSession(next);
  }

  function goNext() {
    if (selected === undefined) return;
    if (step < total - 1) {
      setStep(step + 1);
      return;
    }
    // finalize
    const choices = QUESTIONS.map((qq) => qq.choices[session.answers[qq.id] ?? 0]);
    const traits = aggregateTraits(choices);
    const result = score(traits, session.onboarding!, choices);
    const finalSession = { ...session, result };
    saveSession(finalSession);
    navigate({ to: "/results" });
  }

  function goBack() {
    if (step === 0) navigate({ to: "/onboarding" });
    else setStep(step - 1);
  }

  if (!session.onboarding) return null;

  const progress = ((step + (selected !== undefined ? 1 : 0)) / total) * 100;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteNav />
      <main className="flex-1 flex flex-col items-center px-6 py-10 lg:py-16">
        <div className="w-full max-w-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-brand">
                {q.category}
              </span>
              <span className="text-xs text-muted-foreground mt-1">Question {step + 1} of {total}</span>
            </div>
            <div className="w-40 h-1 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-brand"
                initial={false}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>

          {/* Clickable rewind strip — jump to any answered question */}
          <div className="flex flex-wrap gap-1.5 mb-10" role="navigation" aria-label="Question navigation">
            {QUESTIONS.map((qq, i) => {
              const answered = session.answers[qq.id] !== undefined;
              const isCurrent = i === step;
              const reachable = answered || i <= step;
              return (
                <button
                  key={qq.id}
                  type="button"
                  onClick={() => reachable && setStep(i)}
                  disabled={!reachable}
                  aria-label={`Question ${i + 1}${answered ? " — answered" : ""}`}
                  title={`${i + 1}. ${qq.category}`}
                  className={`h-2 rounded-full transition-all ${
                    isCurrent
                      ? "w-6 bg-brand"
                      : answered
                      ? "w-2 bg-brand/60 hover:bg-brand"
                      : reachable
                      ? "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"
                      : "w-2 bg-muted cursor-not-allowed"
                  }`}
                />
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <h2 className="text-2xl lg:text-3xl font-serif leading-snug mb-3 text-balance">
                {q.prompt}
              </h2>
              <p className="text-muted-foreground italic font-serif mb-8">
                {q.helper ?? reflectivePrompts[step % reflectivePrompts.length]}
              </p>

              <div className="grid gap-3">
                {q.choices.map((c, i) => {
                  const isSelected = selected === i;
                  return (
                    <button
                      key={i}
                      onClick={() => pick(i)}
                      className={`text-left p-5 rounded-2xl border transition-all flex items-start gap-4 group ${
                        isSelected
                          ? "border-brand bg-brand-soft/60"
                          : "border-border bg-card hover:border-brand/50 hover:bg-brand-soft/30"
                      }`}
                    >
                      <div className={`mt-0.5 size-5 rounded-full border grid place-items-center shrink-0 transition-colors ${
                        isSelected ? "border-brand" : "border-border"
                      }`}>
                        {isSelected && <div className="size-2 rounded-full bg-brand" />}
                      </div>
                      <span className="text-foreground/90 leading-relaxed">{c.label}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-12 flex items-center justify-between">
            <button
              onClick={goBack}
              className="inline-flex items-center gap-2 px-5 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-4" /> Back
            </button>
            <button
              onClick={goNext}
              disabled={selected === undefined}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand text-brand-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {step === total - 1 ? "See my results" : "Next"} <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
