import type { OnboardingData, Question } from "./types";
import { QUESTIONS } from "./questions";

export type PersonaRegion = "egypt" | "gcc" | "uk" | "us" | "other";
export type PersonaStage = "premed" | "student" | "intern" | "resident" | "reconsidering";
export type PersonaGoal =
  | "lifestyle_first"
  | "academic"
  | "surgeon_track"
  | "global_migration"
  | "entrepreneur"
  | "service"
  | "undeclared";

export type Persona = {
  label: string; // human-readable composite, e.g. "Egyptian medical student · Lifestyle-first"
  short: string; // short chip text, e.g. "EG · Student · Lifestyle-first"
  region: PersonaRegion;
  stage: PersonaStage;
  goal: PersonaGoal;
  accentNote: string; // one-sentence framing shown above the assessment
};

const REGION_LABEL: Record<PersonaRegion, string> = {
  egypt: "Egypt-based",
  gcc: "Gulf-based",
  uk: "UK-based",
  us: "US-based",
  other: "International",
};
const REGION_SHORT: Record<PersonaRegion, string> = {
  egypt: "EG", gcc: "GCC", uk: "UK", us: "US", other: "Intl",
};

const STAGE_LABEL: Record<PersonaStage, string> = {
  premed: "pre-med",
  student: "medical student",
  intern: "intern / PGY-1",
  resident: "resident",
  reconsidering: "reconsidering specialty",
};
const STAGE_SHORT: Record<PersonaStage, string> = {
  premed: "Pre-med", student: "Student", intern: "Intern", resident: "Resident", reconsidering: "Pivoting",
};

const GOAL_LABEL: Record<PersonaGoal, string> = {
  lifestyle_first: "Lifestyle-first",
  academic: "Academic",
  surgeon_track: "Surgeon-track",
  global_migration: "Global migration",
  entrepreneur: "Entrepreneur",
  service: "Service-driven",
  undeclared: "Open-track",
};

function regionFromOnboarding(o: OnboardingData): PersonaRegion {
  const g = o.geographicIntent;
  if (g === "egypt_gov" || g === "egypt_private") return "egypt";
  if (g === "gulf") return "gcc";
  if (g === "uk") return "uk";
  if (g === "us") return "us";
  const c = (o.country ?? "").toLowerCase();
  if (c.includes("egypt")) return "egypt";
  if (c.includes("united kingdom")) return "uk";
  if (c.includes("united states")) return "us";
  if (c.includes("middle east") || c.includes("gulf")) return "gcc";
  return "other";
}

function stageFromOnboarding(o: OnboardingData): PersonaStage {
  const s = (o.stage ?? "").toLowerCase();
  if (s.startsWith("pre")) return "premed";
  if (s.startsWith("medical student")) return "student";
  if (s.startsWith("intern")) return "intern";
  if (s.startsWith("resident")) return "resident";
  if (s.startsWith("reconsidering")) return "reconsidering";
  return "student";
}

function goalFromOnboarding(o: OnboardingData): PersonaGoal {
  const a = o.careerArchetypes ?? [];
  // priority order — strongest signal first
  if (a.includes("surgeon_operator")) return "surgeon_track";
  if (a.includes("academic") || a.includes("researcher")) return "academic";
  if (a.includes("startup_founder")) return "entrepreneur";
  if (a.includes("public_health") || a.includes("global_health")) return "service";
  if (a.includes("lifestyle_physician")) return "lifestyle_first";
  // fall back to lifestyle signals from onboarding sliders
  if (o.workLifeBalance >= 4 && o.willingnessToSacrifice <= 2) return "lifestyle_first";
  if (o.relocationOpenness >= 4) return "global_migration";
  return "undeclared";
}

const ACCENT_BY_REGION: Record<PersonaRegion, string> = {
  egypt: "We've tuned this assessment for the realities of Egyptian medical training — Master's + Doctorate timelines, private-clinic economics, and the migration question.",
  gcc: "Calibrated for Gulf-system realities — contract structures, fellowship pipelines, and family lifestyle.",
  uk: "Calibrated for UK training pathways — MRCP/MRCS, deanery structures, NHS workload.",
  us: "Calibrated for US match dynamics — Step scores, residency competitiveness, sub-specialty pipelines.",
  other: "Calibrated to surface the realities of training, lifestyle, and meaning across health systems.",
};

export function derivePersona(o: OnboardingData): Persona {
  const region = regionFromOnboarding(o);
  const stage = stageFromOnboarding(o);
  const goal = goalFromOnboarding(o);
  const label = `${REGION_LABEL[region]} ${STAGE_LABEL[stage]} · ${GOAL_LABEL[goal]}`;
  const short = `${REGION_SHORT[region]} · ${STAGE_SHORT[stage]} · ${GOAL_LABEL[goal]}`;
  return { region, stage, goal, label, short, accentNote: ACCENT_BY_REGION[region] };
}

// Question IDs that don't apply to certain personas.
const SKIP_RULES: { id: string; skip: (p: Persona, o: OnboardingData) => boolean }[] = [
  // Litigation is hard to answer with no clinical exposure.
  { id: "cl_2", skip: (p) => p.stage === "premed" },
  // Administrative-burden ratio requires real clinical reference.
  { id: "cl_7", skip: (p) => p.stage === "premed" },
  // Pediatric exposure question — keep universal.
  // Geographic mobility — skip if user is firmly staying put and not open to relocation.
  {
    id: "cl_9",
    skip: (p, o) =>
      (p.region === "egypt" && (o.geographicIntent === "egypt_gov" || o.geographicIntent === "egypt_private")) &&
      o.relocationOpenness <= 2,
  },
];

export function getActiveQuestions(o: OnboardingData): Question[] {
  const persona = derivePersona(o);
  const skipIds = new Set(
    SKIP_RULES.filter((r) => r.skip(persona, o)).map((r) => r.id),
  );
  let qs = QUESTIONS.filter((q) => !skipIds.has(q.id));
  // Tailor helper copy: strip Egypt-specific framing for non-Egypt personas where it would feel off.
  if (persona.region !== "egypt") {
    qs = qs.map((q) => {
      if (!q.helper) return q;
      const helper = q.helper
        .replace(/In Egypt[^.]*\.\s?/g, "")
        .replace(/In the Egyptian context,\s?/g, "")
        .replace(/Egyptian /g, "")
        .replace(/For Egyptian doctors,\s?/g, "")
        .trim();
      return helper === q.helper ? q : { ...q, helper: helper || q.helper };
    });
  }
  return qs;
}
