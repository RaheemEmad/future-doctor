import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { SiteNav } from "@/components/site-chrome";
import { loadSession, saveSession } from "@/lib/session";
import type { OnboardingData } from "@/lib/types";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Onboarding — Aequitas" },
      { name: "description", content: "Tell us about your life so we can map your cognitive and emotional fit to medical specialties." },
    ],
  }),
  component: OnboardingPage,
});

const DEFAULTS: OnboardingData = {
  ageRange: "",
  gender: "",
  stage: "",
  country: "",
  relationship: "",
  wantsChildren: "",
  workLifeBalance: 3,
  lifestyleVision: "",
  willingnessToSacrifice: 3,
  financialPriority: 3,
  ambition: 3,
  relocationOpenness: 3,
  workEnvironment: "",
};

type Step = {
  id: keyof OnboardingData;
  title: string;
  subtitle?: string;
  kind: "choice" | "scale";
  options?: { value: string; label: string }[];
  minLabel?: string;
  maxLabel?: string;
};

const STEPS: Step[] = [
  { id: "ageRange", title: "What's your age range?", kind: "choice", options: ["Under 22", "22–25", "26–29", "30–34", "35+"].map((v) => ({ value: v, label: v })) },
  { id: "gender", title: "How do you identify?", kind: "choice", options: ["Woman", "Man", "Non-binary", "Prefer not to say"].map((v) => ({ value: v, label: v })) },
  { id: "stage", title: "Where are you in your training?", kind: "choice", options: ["Pre-med", "Medical student M1–M2", "Medical student M3–M4", "Intern / PGY-1", "Resident PGY-2+", "Reconsidering specialty"].map((v) => ({ value: v, label: v })) },
  { id: "country", title: "Which country are you training in?", kind: "choice", options: ["United States", "Canada", "United Kingdom", "EU", "Middle East", "Asia", "Other"].map((v) => ({ value: v, label: v })) },
  { id: "relationship", title: "Your relationship situation today?", kind: "choice", options: ["Single", "Dating", "Long-term partner", "Married", "Prefer not to say"].map((v) => ({ value: v, label: v })) },
  { id: "wantsChildren", title: "Do you want children in your future?", kind: "choice", options: [{ value: "yes", label: "Yes" }, { value: "maybe", label: "Maybe / open" }, { value: "no", label: "No" }] },
  { id: "workLifeBalance", title: "How important is work–life balance to you?", subtitle: "Not what you should feel — what you actually feel.", kind: "scale", minLabel: "Career first", maxLabel: "Life first" },
  { id: "lifestyleVision", title: "Which future life feels closest to home?", kind: "choice", options: [
    { value: "predictable_outpatient", label: "Predictable clinic, home for dinner most nights" },
    { value: "hospital_intensity", label: "Intense hospital work, long days, deep meaning" },
    { value: "procedural_craft", label: "A procedural craft I master over decades" },
    { value: "academic_thinker", label: "An academic / thinker shaping the field" },
    { value: "flexible_autonomous", label: "Flexible, autonomous, low-friction practice" },
  ] },
  { id: "willingnessToSacrifice", title: "How much personal life are you willing to sacrifice for your career?", kind: "scale", minLabel: "Very little", maxLabel: "Anything it takes" },
  { id: "financialPriority", title: "How central is high income to your decision?", kind: "scale", minLabel: "Not central", maxLabel: "Very central" },
  { id: "ambition", title: "How would you describe your career ambition?", kind: "scale", minLabel: "Quiet and steady", maxLabel: "Top of the field" },
  { id: "relocationOpenness", title: "How open are you to relocating for training and work?", kind: "scale", minLabel: "Very rooted", maxLabel: "Anywhere" },
  { id: "workEnvironment", title: "Where do you feel most yourself working?", kind: "choice", options: [
    { value: "clinic", label: "Bright clinic with steady flow" },
    { value: "or", label: "Operating room" },
    { value: "icu_ed", label: "ICU or emergency department" },
    { value: "reading_room", label: "Quiet reading room or lab" },
    { value: "conversation", label: "Conversation room for long talks" },
  ] },
];

function OnboardingPage() {
  const navigate = useNavigate();
  const session = loadSession();
  const [data, setData] = useState<OnboardingData>(session.onboarding ?? DEFAULTS);
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const totalSteps = STEPS.length;
  const value = data[current.id];

  function setField<K extends keyof OnboardingData>(key: K, val: OnboardingData[K]) {
    setData((prev) => ({ ...prev, [key]: val }));
  }

  function next() {
    if (step < totalSteps - 1) {
      setStep(step + 1);
      return;
    }
    saveSession({ ...session, onboarding: data });
    navigate({ to: "/assessment" });
  }

  function back() {
    if (step === 0) navigate({ to: "/" });
    else setStep(step - 1);
  }

  const canProceed =
    current.kind === "choice"
      ? typeof value === "string" && value !== ""
      : typeof value === "number";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteNav />
      <main className="flex-1 flex flex-col items-center px-6 py-10 lg:py-16">
        <div className="w-full max-w-2xl">
          {/* Progress */}
          <div className="flex items-center justify-between mb-12">
            <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-brand">
              About you · {step + 1} / {totalSteps}
            </span>
            <div className="w-40 h-1 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-brand"
                initial={false}
                animate={{ width: `${((step + 1) / totalSteps) * 100}%` }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>

          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-3xl lg:text-4xl font-serif leading-tight mb-3 text-balance">{current.title}</h1>
            {current.subtitle && (
              <p className="text-muted-foreground italic font-serif mb-8">{current.subtitle}</p>
            )}
            {current.kind === "choice" ? (
              <div className="grid gap-3 mt-6">
                {current.options!.map((opt) => {
                  const selected = value === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setField(current.id, opt.value as never)}
                      className={`text-left p-5 rounded-2xl border transition-all flex items-center gap-4 ${
                        selected
                          ? "border-brand bg-brand-soft/60"
                          : "border-border bg-card hover:border-brand/50 hover:bg-brand-soft/30"
                      }`}
                    >
                      <div
                        className={`size-5 rounded-full border grid place-items-center shrink-0 transition-colors ${
                          selected ? "border-brand" : "border-border"
                        }`}
                      >
                        {selected && <div className="size-2 rounded-full bg-brand" />}
                      </div>
                      <span className="font-medium">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="mt-8 space-y-6">
                <div className="grid grid-cols-5 gap-3">
                  {[1, 2, 3, 4, 5].map((n) => {
                    const selected = value === n;
                    return (
                      <button
                        key={n}
                        onClick={() => setField(current.id, n as never)}
                        className={`aspect-square rounded-2xl border text-lg font-medium transition-all ${
                          selected
                            ? "border-brand bg-brand text-brand-foreground"
                            : "border-border bg-card hover:border-brand/50"
                        }`}
                      >
                        {n}
                      </button>
                    );
                  })}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground font-medium">
                  <span>{current.minLabel}</span>
                  <span>{current.maxLabel}</span>
                </div>
              </div>
            )}
          </motion.div>

          <div className="mt-12 flex items-center justify-between">
            <button
              onClick={back}
              className="inline-flex items-center gap-2 px-5 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-4" /> Back
            </button>
            <button
              onClick={next}
              disabled={!canProceed}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand text-brand-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {step === totalSteps - 1 ? "Begin assessment" : "Continue"}
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
