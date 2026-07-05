import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Info, UserCircle2 } from "lucide-react";
import { SiteNav } from "@/components/site-chrome";
import { QuestionGlyph } from "@/components/question-glyph";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { aggregateTraits, score } from "@/lib/scoring";
import { computeResult } from "@/lib/scoring.functions";
import { loadSession, saveSession } from "@/lib/session";
import { derivePersona, getActiveQuestions } from "@/lib/persona";
import {
  attachAbandonBeacon,
  trackAssessmentComplete,
  trackAssessmentStart,
  trackQuestionAnswered,
} from "@/lib/analytics";


export const Route = createFileRoute("/assessment")({
  head: () => ({
    meta: [
      { title: "Assessment — Vocare" },
      { name: "description", content: "A reflective psychometric assessment that maps your inner world to medical specialties." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AssessmentPage,
});

function AssessmentPage() {
  const navigate = useNavigate();
  const [session, setSession] = useState(() => loadSession());
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const startedAt = useRef<number>(Date.now());
  const stepStartAt = useRef<number>(Date.now());
  const stateRef = useRef({ lastIndex: 0, total: 0, completed: false });
  const computeResultFn = useServerFn(computeResult);

  useEffect(() => {
    if (!session.onboarding) {
      navigate({ to: "/onboarding" });
    }
  }, [session.onboarding, navigate]);

  const persona = useMemo(() => (session.onboarding ? derivePersona(session.onboarding) : null), [session.onboarding]);
  const questions = useMemo(() => (session.onboarding ? getActiveQuestions(session.onboarding) : []), [session.onboarding]);
  const total = questions.length;
  const q = questions[Math.min(step, Math.max(0, total - 1))];
  const selected = q ? session.answers[q.id] : undefined;

  // Fire assessment_start once on mount when we know the total.
  const startedRef = useRef(false);
  useEffect(() => {
    if (startedRef.current || total === 0) return;
    startedRef.current = true;
    trackAssessmentStart(total);
    startedAt.current = Date.now();
    stepStartAt.current = Date.now();
  }, [total]);

  // Abandon beacon.
  useEffect(() => {
    stateRef.current.total = total;
    return attachAbandonBeacon(() => stateRef.current);
  }, [total]);
  useEffect(() => { stateRef.current.lastIndex = step; }, [step]);

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

  async function goNext() {
    if (selected === undefined || submitting) return;
    // Track time-on-step for the just-answered question.
    trackQuestionAnswered(step, q.id, Date.now() - stepStartAt.current);
    stepStartAt.current = Date.now();

    if (step < total - 1) {
      setStep(step + 1);
      return;
    }
    // finalize
    setSubmitting(true);
    const choices = questions.map((qq) => qq.choices[session.answers[qq.id] ?? 0]);
    const answers: Record<string, number> = {};
    for (const qq of questions) answers[qq.id] = session.answers[qq.id] ?? 0;

    let result;
    let verification: import("@/lib/session").SessionState["verification"];
    try {
      const server = await computeResultFn({ data: { onboarding: session.onboarding!, answers } });
      result = server.result;
      verification = { signature: server.signature, computedAt: server.computedAt, source: "server" };
    } catch (err) {
      // Offline / server error — fall back to local scoring.
      console.warn("[scoring] server compute failed, falling back to local", err);
      const traits = aggregateTraits(choices);
      result = score(traits, session.onboarding!, choices);
      verification = { signature: "", computedAt: Date.now(), source: "local" };
    }

    const finalSession = { ...session, result, verification };
    saveSession(finalSession);
    stateRef.current.completed = true;
    trackAssessmentComplete(
      Date.now() - startedAt.current,
      result.matches[0]?.specialty.id ?? "unknown",
      verification.source === "server",
    );
    setSubmitting(false);
    navigate({ to: "/results" });
  }

  function goBack() {
    if (step === 0) navigate({ to: "/onboarding" });
    else setStep(step - 1);
  }


  if (!session.onboarding || !q || !persona) return null;

  const answeredCount = questions.reduce((n, qq) => n + (session.answers[qq.id] !== undefined ? 1 : 0), 0);
  const progress = ((step + (selected !== undefined ? 1 : 0)) / total) * 100;
  const secondsPerQ = 40;
  const remaining = Math.max(0, total - step - (selected !== undefined ? 1 : 0));
  const minutesLeft = Math.max(1, Math.round((remaining * secondsPerQ) / 60));
  const midpoint = Math.floor(total / 2);
  const atCheckpoint = step === midpoint && selected === undefined && answeredCount >= midpoint;


  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteNav />
      <main className="flex-1 flex flex-col items-center px-6 py-10 lg:py-16">
        <div className="w-full max-w-2xl">
          {/* Persona chip */}
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-brand/20 bg-brand-soft/30 px-4 py-3">
            <UserCircle2 className="size-4 text-brand mt-0.5 shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.18em] text-brand font-semibold">Your track</div>
              <div className="text-sm font-medium text-foreground/90 mt-0.5">{persona.label}</div>
              <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{persona.accentNote}</div>
            </div>
          </div>

          {atCheckpoint && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 rounded-2xl border border-calm/30 bg-calm-soft/50 px-4 py-3.5"
              role="status"
            >
              <div className="text-[10px] uppercase tracking-[0.18em] text-calm font-semibold">Halfway there</div>
              <p className="text-sm text-foreground/85 mt-1 leading-relaxed">
                You've answered {answeredCount} of {total}. Your top three specialties are already forming — the next block sharpens lifestyle and identity weights. Roughly {minutesLeft} min left.
              </p>
            </motion.div>
          )}


          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-brand">
                {q.category}
              </span>
              <span className="text-xs text-muted-foreground mt-1">
                Question {step + 1} of {total} · ~{minutesLeft} min left
              </span>
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
            {questions.map((qq, i) => {
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
              <div className="flex items-start gap-4 mb-4">
                <QuestionGlyph category={q.category} />
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl lg:text-3xl font-serif leading-snug text-balance">
                    {q.prompt}
                  </h2>
                </div>
                <TooltipProvider delayDuration={150}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        aria-label="Why this question matters"
                        className="mt-1 size-8 rounded-full border border-border bg-card grid place-items-center text-muted-foreground hover:text-brand hover:border-brand/40 transition-colors shrink-0"
                      >
                        <Info className="size-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-xs text-xs leading-relaxed">
                      <div className="font-semibold text-[10px] uppercase tracking-[0.15em] text-brand mb-1">Why we ask</div>
                      {q.helper ?? reflectivePrompts[step % reflectivePrompts.length]}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-muted-foreground italic font-serif mb-8 pl-[4.5rem]">
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
              disabled={selected === undefined || submitting}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand text-brand-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {submitting ? "Scoring…" : step === total - 1 ? "See my results" : "Next"} <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
