import type {
  CareerArchetype,
  CareerPath,
  EnrichedSpecialty,
  LifecyclePoint,
  MeaningSource,
  Specialty,
} from "./types";
import { SPECIALTIES } from "./specialties";

type Overrides = Partial<
  Pick<
    EnrichedSpecialty,
    | "egyptPrivatePotential"
    | "gccDemand"
    | "ukMigrationFriendliness"
    | "usMatchDifficulty"
    | "remoteWorkPotential"
    | "aiDisruptionRisk"
    | "fellowshipPipeline"
    | "careerPaths"
  >
> & {
  meaningProfile?: Partial<Record<MeaningSource, number>>;
  lifecycleCurve?: LifecycleCurve;
};

type LifecycleCurve =
  | "rising"
  | "peak_late"
  | "declining"
  | "steady"
  | "punishing_then_great"
  | "great_then_punishing";

const OVERRIDES: Record<string, Overrides> = {
  dermatology: {
    egyptPrivatePotential: 10, gccDemand: 9, ukMigrationFriendliness: 6,
    usMatchDifficulty: 10, remoteWorkPotential: 5, aiDisruptionRisk: 5,
    fellowshipPipeline: 7,
    meaningProfile: { technical_mastery: 0.8, relationships: 0.5, innovation: 0.55 },
    careerPaths: [
      { archetypes: ["lifestyle_physician", "startup_founder"], label: "Private aesthetic clinic", note: "Strong cash demand in Egypt & GCC." },
      { archetypes: ["academic", "medical_educator"], label: "University faculty" },
      { archetypes: ["telemedicine", "startup_founder"], label: "Teledermatology platform" },
      { archetypes: ["master_clinician"], label: "GCC consultant track" },
    ],
    lifecycleCurve: "rising",
  },
  psychiatry: {
    egyptPrivatePotential: 9, gccDemand: 8, ukMigrationFriendliness: 9,
    usMatchDifficulty: 4, remoteWorkPotential: 9, aiDisruptionRisk: 2,
    fellowshipPipeline: 6,
    meaningProfile: { relationships: 0.95, scientific_curiosity: 0.55, teaching: 0.55 },
    careerPaths: [
      { archetypes: ["master_clinician", "lifestyle_physician"], label: "Private practice" },
      { archetypes: ["academic", "medical_educator"], label: "University faculty / child psychiatry" },
      { archetypes: ["telemedicine"], label: "Telepsychiatry across MENA" },
      { archetypes: ["public_health", "global_health"], label: "Addiction & community mental health" },
      { archetypes: ["master_clinician"], label: "UK / GCC consultant pathway" },
    ],
    lifecycleCurve: "rising",
  },
  neurosurgery: {
    egyptPrivatePotential: 6, gccDemand: 7, ukMigrationFriendliness: 4,
    usMatchDifficulty: 10, remoteWorkPotential: 1, aiDisruptionRisk: 2,
    fellowshipPipeline: 8,
    meaningProfile: { technical_mastery: 1.0, saving_lives: 0.95, innovation: 0.65 },
    careerPaths: [
      { archetypes: ["surgeon_operator", "master_clinician"], label: "Hospital consultant" },
      { archetypes: ["academic", "researcher"], label: "University faculty + research" },
      { archetypes: ["surgeon_operator"], label: "GCC private neurosurgical center" },
    ],
    lifecycleCurve: "punishing_then_great",
  },
  emergency_medicine: {
    egyptPrivatePotential: 4, gccDemand: 10, ukMigrationFriendliness: 9,
    usMatchDifficulty: 6, remoteWorkPotential: 2, aiDisruptionRisk: 3,
    fellowshipPipeline: 6,
    meaningProfile: { saving_lives: 0.95, technical_mastery: 0.7 },
    careerPaths: [
      { archetypes: ["master_clinician"], label: "GCC ER consultant", note: "Strongest mobility specialty." },
      { archetypes: ["master_clinician"], label: "UK / Australia / Canada pathways" },
      { archetypes: ["public_health"], label: "Disaster & flight medicine" },
      { archetypes: ["surgeon_operator"], label: "Critical care fellowship" },
    ],
    lifecycleCurve: "great_then_punishing",
  },
  internal_medicine: {
    egyptPrivatePotential: 6, gccDemand: 8, ukMigrationFriendliness: 9,
    usMatchDifficulty: 5, remoteWorkPotential: 4, aiDisruptionRisk: 4,
    fellowshipPipeline: 10,
    meaningProfile: { scientific_curiosity: 0.85, relationships: 0.6, teaching: 0.6 },
    careerPaths: [
      { archetypes: ["master_clinician"], label: "Subspecialty (Cards / GI / Endo)" },
      { archetypes: ["academic", "medical_educator"], label: "Academic hospitalist" },
      { archetypes: ["healthcare_executive"], label: "Hospital leadership track" },
      { archetypes: ["startup_founder"], label: "Digital chronic-disease platform" },
    ],
    lifecycleCurve: "steady",
  },
  family_medicine: {
    egyptPrivatePotential: 7, gccDemand: 9, ukMigrationFriendliness: 10,
    usMatchDifficulty: 3, remoteWorkPotential: 6, aiDisruptionRisk: 5,
    fellowshipPipeline: 5,
    meaningProfile: { relationships: 0.95, teaching: 0.6 },
    careerPaths: [
      { archetypes: ["master_clinician", "lifestyle_physician"], label: "Concierge / private clinic" },
      { archetypes: ["public_health", "global_health"], label: "Community & rural medicine" },
      { archetypes: ["telemedicine"], label: "Telemedicine primary care" },
    ],
    lifecycleCurve: "steady",
  },
  pathology: {
    egyptPrivatePotential: 4, gccDemand: 6, ukMigrationFriendliness: 7,
    usMatchDifficulty: 3, remoteWorkPotential: 8, aiDisruptionRisk: 8,
    fellowshipPipeline: 7,
    meaningProfile: { scientific_curiosity: 0.95, technical_mastery: 0.7 },
    careerPaths: [
      { archetypes: ["academic", "researcher"], label: "Academic pathology + research" },
      { archetypes: ["master_clinician"], label: "Private lab partner" },
      { archetypes: ["telemedicine"], label: "Digital / remote sign-out" },
    ],
    lifecycleCurve: "rising",
  },
  diagnostic_radiology: {
    egyptPrivatePotential: 7, gccDemand: 9, ukMigrationFriendliness: 8,
    usMatchDifficulty: 8, remoteWorkPotential: 10, aiDisruptionRisk: 9,
    fellowshipPipeline: 9,
    meaningProfile: { scientific_curiosity: 0.8, technical_mastery: 0.8 },
    careerPaths: [
      { archetypes: ["telemedicine", "lifestyle_physician"], label: "Teleradiology (global)" },
      { archetypes: ["master_clinician"], label: "Subspecialty (neuro / breast / MSK)" },
      { archetypes: ["startup_founder", "researcher"], label: "AI imaging startup" },
    ],
    lifecycleCurve: "declining",
  },
  cardiology: {
    egyptPrivatePotential: 10, gccDemand: 10, ukMigrationFriendliness: 7,
    usMatchDifficulty: 9, remoteWorkPotential: 3, aiDisruptionRisk: 4,
    fellowshipPipeline: 10,
    meaningProfile: { saving_lives: 0.85, technical_mastery: 0.85, scientific_curiosity: 0.7 },
    careerPaths: [
      { archetypes: ["master_clinician", "surgeon_operator"], label: "Interventional / EP" },
      { archetypes: ["academic", "researcher"], label: "University faculty" },
      { archetypes: ["master_clinician"], label: "Private cardiology practice" },
    ],
    lifecycleCurve: "rising",
  },
  obgyn: {
    egyptPrivatePotential: 10, gccDemand: 8, ukMigrationFriendliness: 6,
    usMatchDifficulty: 6, remoteWorkPotential: 1, aiDisruptionRisk: 2,
    fellowshipPipeline: 8,
    meaningProfile: { relationships: 0.8, technical_mastery: 0.75, saving_lives: 0.75 },
    careerPaths: [
      { archetypes: ["master_clinician"], label: "Private OBGYN practice" },
      { archetypes: ["surgeon_operator"], label: "MIS / gyn-onc fellowship" },
      { archetypes: ["public_health", "global_health"], label: "Maternal health programs" },
    ],
    lifecycleCurve: "great_then_punishing",
  },
  general_surgery: {
    egyptPrivatePotential: 6, gccDemand: 8, ukMigrationFriendliness: 6,
    usMatchDifficulty: 7, remoteWorkPotential: 1, aiDisruptionRisk: 2,
    fellowshipPipeline: 9,
    meaningProfile: { technical_mastery: 0.9, saving_lives: 0.8 },
    careerPaths: [
      { archetypes: ["surgeon_operator"], label: "Subspecialty (HPB / colorectal / breast)" },
      { archetypes: ["academic"], label: "Academic surgery" },
      { archetypes: ["master_clinician"], label: "GCC consultant track" },
    ],
    lifecycleCurve: "punishing_then_great",
  },
  orthopedics: {
    egyptPrivatePotential: 9, gccDemand: 10, ukMigrationFriendliness: 6,
    usMatchDifficulty: 9, remoteWorkPotential: 1, aiDisruptionRisk: 2,
    fellowshipPipeline: 9,
    meaningProfile: { technical_mastery: 0.9, saving_lives: 0.55 },
    careerPaths: [
      { archetypes: ["surgeon_operator"], label: "Joints / spine / sports subspecialty" },
      { archetypes: ["master_clinician"], label: "Private ortho group" },
    ],
    lifecycleCurve: "great_then_punishing",
  },
  ophthalmology: {
    egyptPrivatePotential: 10, gccDemand: 9, ukMigrationFriendliness: 6,
    usMatchDifficulty: 10, remoteWorkPotential: 2, aiDisruptionRisk: 6,
    fellowshipPipeline: 7,
    meaningProfile: { technical_mastery: 0.9, saving_lives: 0.5 },
    careerPaths: [
      { archetypes: ["master_clinician"], label: "Private eye center (very high earning)" },
      { archetypes: ["surgeon_operator"], label: "Retina / cornea / oculoplastics" },
    ],
    lifecycleCurve: "rising",
  },
  pediatrics: {
    egyptPrivatePotential: 7, gccDemand: 7, ukMigrationFriendliness: 9,
    usMatchDifficulty: 4, remoteWorkPotential: 5, aiDisruptionRisk: 3,
    fellowshipPipeline: 8,
    meaningProfile: { relationships: 0.9, teaching: 0.6 },
    careerPaths: [
      { archetypes: ["master_clinician", "lifestyle_physician"], label: "Private pediatric clinic" },
      { archetypes: ["academic"], label: "Subspecialty (cards / GI / heme)" },
      { archetypes: ["public_health", "global_health"], label: "Child public health" },
    ],
    lifecycleCurve: "steady",
  },
  anesthesiology: {
    egyptPrivatePotential: 6, gccDemand: 10, ukMigrationFriendliness: 8,
    usMatchDifficulty: 6, remoteWorkPotential: 1, aiDisruptionRisk: 3,
    fellowshipPipeline: 7,
    meaningProfile: { technical_mastery: 0.8, scientific_curiosity: 0.6 },
    careerPaths: [
      { archetypes: ["master_clinician"], label: "GCC consultant track — strong mobility" },
      { archetypes: ["surgeon_operator"], label: "Pain / cardiac / peds fellowship" },
    ],
    lifecycleCurve: "steady",
  },
  hemonc: {
    egyptPrivatePotential: 7, gccDemand: 8, ukMigrationFriendliness: 7,
    usMatchDifficulty: 6, remoteWorkPotential: 3, aiDisruptionRisk: 4,
    fellowshipPipeline: 9,
    meaningProfile: { relationships: 0.85, scientific_curiosity: 0.75, saving_lives: 0.7 },
    careerPaths: [
      { archetypes: ["academic", "researcher"], label: "Academic onc + clinical trials" },
      { archetypes: ["master_clinician"], label: "Private oncology practice" },
    ],
    lifecycleCurve: "rising",
  },
  gastroenterology: {
    egyptPrivatePotential: 9, gccDemand: 9, ukMigrationFriendliness: 7,
    usMatchDifficulty: 9, remoteWorkPotential: 2, aiDisruptionRisk: 4,
    fellowshipPipeline: 10,
    meaningProfile: { technical_mastery: 0.85, scientific_curiosity: 0.65 },
    careerPaths: [
      { archetypes: ["master_clinician"], label: "Private endo center" },
      { archetypes: ["surgeon_operator"], label: "Advanced endoscopy (ERCP / EUS)" },
    ],
    lifecycleCurve: "rising",
  },
  endocrinology: {
    egyptPrivatePotential: 6, gccDemand: 7, ukMigrationFriendliness: 8,
    usMatchDifficulty: 4, remoteWorkPotential: 7, aiDisruptionRisk: 5,
    fellowshipPipeline: 8,
    meaningProfile: { scientific_curiosity: 0.8, relationships: 0.65 },
    careerPaths: [
      { archetypes: ["master_clinician", "lifestyle_physician"], label: "Diabetes / obesity clinic" },
      { archetypes: ["startup_founder"], label: "Digital health (obesity / GLP-1)" },
      { archetypes: ["telemedicine"], label: "Telemedicine endocrinology" },
    ],
    lifecycleCurve: "rising",
  },
  neurology: {
    egyptPrivatePotential: 7, gccDemand: 8, ukMigrationFriendliness: 8,
    usMatchDifficulty: 6, remoteWorkPotential: 4, aiDisruptionRisk: 4,
    fellowshipPipeline: 9,
    meaningProfile: { scientific_curiosity: 0.9, technical_mastery: 0.5 },
    careerPaths: [
      { archetypes: ["master_clinician"], label: "Stroke / epilepsy / MS subspecialty" },
      { archetypes: ["academic", "researcher"], label: "Neuroscience research" },
    ],
    lifecycleCurve: "steady",
  },
  critical_care: {
    egyptPrivatePotential: 5, gccDemand: 9, ukMigrationFriendliness: 7,
    usMatchDifficulty: 6, remoteWorkPotential: 2, aiDisruptionRisk: 3,
    fellowshipPipeline: 7,
    meaningProfile: { saving_lives: 0.95, technical_mastery: 0.8 },
    lifecycleCurve: "great_then_punishing",
  },
};

const ALL_MEANING: MeaningSource[] = [
  "saving_lives", "relationships", "technical_mastery", "scientific_curiosity",
  "leadership", "innovation", "teaching",
];

function deriveMeaning(sp: Specialty): Record<MeaningSource, number> {
  const base: Record<MeaningSource, number> = {
    saving_lives: 0.35,
    relationships: 0.35,
    technical_mastery: 0.35,
    scientific_curiosity: 0.4,
    leadership: 0.3,
    innovation: 0.35,
    teaching: 0.35,
  };
  if (sp.emotionalBurden >= 4) base.saving_lives = 0.75;
  if (sp.patientInteraction >= 4) base.relationships = Math.max(base.relationships, 0.75);
  if (sp.procedural >= 4) base.technical_mastery = 0.85;
  if (sp.tags.includes("cognitive")) base.scientific_curiosity = 0.8;
  if (sp.tags.includes("critical-care") || sp.tags.includes("acute")) base.leadership = 0.6;
  if (sp.tags.includes("longitudinal")) base.relationships = Math.max(base.relationships, 0.7);
  if (sp.patientInteraction >= 4) base.teaching = 0.5;
  return base;
}

function defaultPaths(sp: Specialty): CareerPath[] {
  const paths: CareerPath[] = [];
  if (sp.tags.includes("surgical") || sp.procedural >= 4) {
    paths.push({ archetypes: ["surgeon_operator", "master_clinician"], label: "Operative subspecialty / consultant" });
  }
  if (sp.tags.includes("cognitive") || sp.tags.includes("longitudinal")) {
    paths.push({ archetypes: ["academic", "medical_educator"], label: "Academic faculty" });
  }
  if (sp.lifestyle >= 4) {
    paths.push({ archetypes: ["lifestyle_physician", "master_clinician"], label: "Private practice (lifestyle-friendly)" });
  }
  if (sp.patientInteraction <= 2) {
    paths.push({ archetypes: ["telemedicine", "researcher"], label: "Remote / research-oriented track" });
  }
  paths.push({ archetypes: ["master_clinician"], label: "GCC / UK consultant pathway" });
  return paths.slice(0, 5);
}

function lifecyclePoints(curve: LifecycleCurve, sp: Specialty): LifecyclePoint[] {
  // base values from existing metadata, then shape by curve
  const baseLifestyle = sp.lifestyle * 20;
  const baseFinancial = sp.incomeBand * 20;
  const baseFulfill = 70 - sp.burnoutRisk * 6;

  const curves: Record<LifecycleCurve, (year: number) => { l: number; fu: number; fi: number }> = {
    rising: (y) => ({ l: lerp(baseLifestyle - 15, baseLifestyle + 10, y), fu: lerp(baseFulfill - 10, baseFulfill + 15, y), fi: lerp(baseFinancial - 25, baseFinancial + 5, y) }),
    peak_late: (y) => ({ l: lerp(baseLifestyle - 20, baseLifestyle + 15, y), fu: lerp(baseFulfill - 15, baseFulfill + 20, y), fi: lerp(baseFinancial - 30, baseFinancial + 10, y) }),
    declining: (y) => ({ l: lerp(baseLifestyle, baseLifestyle - 10, y), fu: lerp(baseFulfill + 5, baseFulfill - 20, y), fi: lerp(baseFinancial - 10, baseFinancial - 15, y) }),
    steady: (y) => ({ l: lerp(baseLifestyle - 10, baseLifestyle + 5, y), fu: lerp(baseFulfill - 5, baseFulfill + 5, y), fi: lerp(baseFinancial - 15, baseFinancial + 5, y) }),
    punishing_then_great: (y) => ({ l: lerp(baseLifestyle - 30, baseLifestyle + 15, y), fu: lerp(baseFulfill - 25, baseFulfill + 25, y), fi: lerp(baseFinancial - 35, baseFinancial + 15, y) }),
    great_then_punishing: (y) => ({ l: lerp(baseLifestyle + 5, baseLifestyle - 20, y), fu: lerp(baseFulfill + 10, baseFulfill - 20, y), fi: lerp(baseFinancial - 20, baseFinancial + 5, y) }),
  };

  const f = curves[curve];
  return [1, 5, 15, 30].map((year) => {
    const t = (year - 1) / 29;
    const v = f(t);
    return {
      year,
      lifestyle: clamp(0, 100, Math.round(v.l)),
      fulfillment: clamp(0, 100, Math.round(v.fu)),
      financial: clamp(0, 100, Math.round(v.fi)),
    };
  });
}

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function clamp(min: number, max: number, x: number) { return Math.max(min, Math.min(max, x)); }

function deriveLifecycleCurve(sp: Specialty): LifecycleCurve {
  if (sp.burnoutRisk >= 5 && sp.lifestyle <= 2) return "great_then_punishing";
  if (sp.competitiveness >= 4 && sp.lifestyle >= 4) return "rising";
  if (sp.tags.includes("surgical") && sp.burnoutRisk >= 4) return "punishing_then_great";
  if (sp.lifestyle >= 4 && sp.burnoutRisk <= 2) return "steady";
  return "steady";
}

function enrich(sp: Specialty): EnrichedSpecialty {
  const o = OVERRIDES[sp.id] ?? {};
  const meaningBase = deriveMeaning(sp);
  const meaning: Record<MeaningSource, number> = { ...meaningBase };
  if (o.meaningProfile) {
    for (const m of ALL_MEANING) {
      if (o.meaningProfile[m] !== undefined) meaning[m] = o.meaningProfile[m]!;
    }
  }
  const curve = o.lifecycleCurve ?? deriveLifecycleCurve(sp);

  return {
    ...sp,
    egyptPrivatePotential: o.egyptPrivatePotential ?? Math.round(clamp(1, 10, 1 + sp.incomeBand * 1.3 + (sp.patientInteraction >= 4 ? 1 : 0) + (sp.lifestyle >= 4 ? 1 : 0))),
    gccDemand: o.gccDemand ?? Math.round(clamp(1, 10, 3 + sp.lifestyle + (sp.procedural >= 4 ? 1.5 : 0))),
    ukMigrationFriendliness: o.ukMigrationFriendliness ?? Math.round(clamp(1, 10, 5 + (sp.tags.includes("cognitive") ? 2 : 0) - (sp.competitiveness >= 5 ? 2 : 0))),
    usMatchDifficulty: o.usMatchDifficulty ?? Math.round(clamp(1, 10, 2 + sp.competitiveness * 1.5)),
    remoteWorkPotential: o.remoteWorkPotential ?? (sp.patientInteraction <= 2 ? 8 : sp.lifestyle >= 4 ? 4 : 2),
    aiDisruptionRisk: o.aiDisruptionRisk ?? (sp.procedural <= 2 && sp.patientInteraction <= 2 ? 7 : sp.procedural <= 2 ? 4 : 2),
    fellowshipPipeline: o.fellowshipPipeline ?? Math.round(clamp(1, 10, 4 + sp.competitiveness)),
    meaningProfile: meaning,
    careerPaths: o.careerPaths ?? defaultPaths(sp),
    lifecycle: lifecyclePoints(curve, sp),
  };
}

export const ENRICHED_SPECIALTIES: EnrichedSpecialty[] = SPECIALTIES.map(enrich);

export const LIFECYCLE_CAPTION: Record<LifecycleCurve, string> = {
  rising: "Tough early, gets better with mastery.",
  peak_late: "Long climb to a powerful late-career peak.",
  declining: "Strong now, market headwinds long-term.",
  steady: "Even keel across your career.",
  punishing_then_great: "Brutal training, exceptional rewards later.",
  great_then_punishing: "Exciting early, attrition risk after 40.",
};

export function captionFor(sp: EnrichedSpecialty): string {
  return LIFECYCLE_CAPTION[deriveLifecycleCurve(sp)];
}
