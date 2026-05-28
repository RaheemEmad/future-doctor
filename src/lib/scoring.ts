import type { AssessmentResult, Choice, OnboardingData, Specialty, SpecialtyMatch, Trait, TraitScores } from "./types";
import { SPECIALTIES } from "./specialties";
import { QUESTIONS } from "./questions";

const ALL_TRAITS: Trait[] = [
  "emotional_resilience", "empathy", "introversion", "perfectionism", "uncertainty_tolerance",
  "recognition_need", "patience", "risk_tolerance", "sensitivity", "routine_preference",
  "leadership", "competitiveness", "identity_career", "delayed_gratification", "procedural",
  "analytical", "visual_spatial", "communication", "autonomy", "prestige_motivation",
  "burnout_vulnerability", "stamina", "death_comfort", "family_priority", "lifestyle_balance",
  "income_priority", "ambition", "chronic_vs_acute", "specialized_vs_broad",
  "ethical_burden_tolerance", "focus_style", "social_battery",
];

export function aggregateTraits(answers: Choice[]): TraitScores {
  const sums: Record<string, number> = {};
  const counts: Record<string, number> = {};
  for (const choice of answers) {
    for (const [trait, value] of Object.entries(choice.traits)) {
      sums[trait] = (sums[trait] ?? 0) + (value as number);
      counts[trait] = (counts[trait] ?? 0) + 1;
    }
  }
  const result: TraitScores = {};
  for (const trait of ALL_TRAITS) {
    if (counts[trait]) {
      result[trait] = clamp01(sums[trait] / counts[trait]);
    } else {
      result[trait] = 0.5;
    }
  }
  return result;
}

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

export function applyOnboarding(traits: TraitScores, onboarding: OnboardingData): TraitScores {
  const t = { ...traits };
  const blend = (trait: Trait, value: number, weight = 0.5) => {
    const prev = t[trait] ?? 0.5;
    t[trait] = clamp01(prev * (1 - weight) + value * weight);
  };
  blend("lifestyle_balance", onboarding.workLifeBalance / 5, 0.6);
  blend("family_priority", onboarding.wantsChildren === "yes" ? 0.9 : onboarding.wantsChildren === "maybe" ? 0.55 : 0.2, 0.5);
  blend("income_priority", onboarding.financialPriority / 5, 0.55);
  blend("ambition", onboarding.ambition / 5, 0.55);
  blend("identity_career", 1 - onboarding.workLifeBalance / 5 * 0.5, 0.25);
  // willingness to sacrifice raises stamina + identity_career, lowers family_priority slightly
  blend("stamina", onboarding.willingnessToSacrifice / 5, 0.35);
  blend("identity_career", onboarding.willingnessToSacrifice / 5, 0.3);
  return t;
}

function cosineLike(user: TraitScores, ideal: TraitScores): number {
  // Weighted distance: only use traits the specialty cares about
  let weightSum = 0;
  let agree = 0;
  for (const [trait, target] of Object.entries(ideal)) {
    const u = user[trait as Trait] ?? 0.5;
    const tgt = target as number;
    // weight = how strongly the specialty cares (distance from 0.5)
    const weight = 0.4 + Math.abs(tgt - 0.5) * 1.5; // 0.4..1.15
    const diff = Math.abs(u - tgt);
    const sim = 1 - diff; // 0..1
    agree += sim * weight;
    weightSum += weight;
  }
  return weightSum === 0 ? 0.5 : agree / weightSum;
}

function bandFit(userScore: number, specialtyScore1to5: number): number {
  const target = (specialtyScore1to5 - 1) / 4; // 0..1
  return 1 - Math.abs(userScore - target);
}

function buildReasons(user: TraitScores, sp: Specialty): { fors: string[]; against: string[] } {
  const fors: string[] = [];
  const against: string[] = [];
  for (const [trait, target] of Object.entries(sp.ideal)) {
    const u = user[trait as Trait] ?? 0.5;
    const t = target as number;
    const diff = u - t;
    if (Math.abs(diff) < 0.15 && Math.abs(t - 0.5) > 0.2) {
      fors.push(`${humanTrait(trait as Trait)} aligns well with this field.`);
    } else if (Math.abs(diff) > 0.35) {
      against.push(`Your ${humanTrait(trait as Trait).toLowerCase()} may clash with this field's demands.`);
    }
  }
  return { fors: fors.slice(0, 4), against: against.slice(0, 3) };
}

function humanTrait(t: Trait): string {
  const map: Record<Trait, string> = {
    emotional_resilience: "Emotional resilience",
    empathy: "Empathy",
    introversion: "Introversion",
    perfectionism: "Perfectionism",
    uncertainty_tolerance: "Tolerance for uncertainty",
    recognition_need: "Need for recognition",
    patience: "Patience",
    risk_tolerance: "Risk tolerance",
    sensitivity: "Emotional sensitivity",
    routine_preference: "Preference for routine",
    leadership: "Leadership drive",
    competitiveness: "Competitiveness",
    identity_career: "Career-identity fusion",
    delayed_gratification: "Delayed gratification",
    procedural: "Procedural orientation",
    analytical: "Analytical thinking",
    visual_spatial: "Visual-spatial strength",
    communication: "Communication style",
    autonomy: "Need for autonomy",
    prestige_motivation: "Prestige motivation",
    burnout_vulnerability: "Burnout vulnerability",
    stamina: "Physical & schedule stamina",
    death_comfort: "Comfort with death & suffering",
    family_priority: "Family priority",
    lifestyle_balance: "Lifestyle balance need",
    income_priority: "Income priority",
    ambition: "Ambition level",
    chronic_vs_acute: "Acute-care orientation",
    specialized_vs_broad: "Specialization preference",
    ethical_burden_tolerance: "Ethical burden tolerance",
    focus_style: "Focus style (sustained vs switching)",
    social_battery: "Social battery",
  };
  return map[t];
}

export function score(traits: TraitScores, onboarding: OnboardingData): AssessmentResult {
  const adjusted = applyOnboarding(traits, onboarding);
  const matches: SpecialtyMatch[] = SPECIALTIES.map((sp) => {
    const traitFit = cosineLike(adjusted, sp.ideal);

    const lifestyleFit = bandFit(adjusted.lifestyle_balance ?? 0.5, sp.lifestyle);
    const familyFit = bandFit(adjusted.family_priority ?? 0.5, sp.familyFriendly);
    const incomeFit = bandFit(adjusted.income_priority ?? 0.5, sp.incomeBand);
    const procFit = bandFit(adjusted.procedural ?? 0.5, sp.procedural);
    const stamFit = bandFit(adjusted.stamina ?? 0.5, sp.callBurden);

    const cognitiveFit =
      0.5 * traitFit +
      0.25 * bandFit(adjusted.analytical ?? 0.5, sp.procedural >= 4 ? 3 : 4) +
      0.25 * procFit;

    const emotionalFit =
      0.55 * (1 - Math.abs((adjusted.emotional_resilience ?? 0.5) - (sp.emotionalBurden - 1) / 4)) +
      0.25 * (1 - Math.abs((adjusted.death_comfort ?? 0.5) - (sp.emotionalBurden - 1) / 4)) +
      0.2 * (1 - Math.abs((adjusted.ethical_burden_tolerance ?? 0.5) - (sp.emotionalBurden - 1) / 4));

    const lifestyleScore = 0.5 * lifestyleFit + 0.25 * familyFit + 0.25 * stamFit;

    // burnout warning: high specialty burnout + low resilience + high vulnerability
    const burnoutWarning =
      0.5 * ((sp.burnoutRisk - 1) / 4) * 100 +
      0.3 * (1 - (adjusted.emotional_resilience ?? 0.5)) * 100 +
      0.2 * (adjusted.burnout_vulnerability ?? 0.5) * 100;

    const compatibility =
      100 *
      (0.45 * traitFit +
        0.2 * lifestyleScore +
        0.15 * emotionalFit +
        0.1 * incomeFit +
        0.1 * cognitiveFit);

    // Penalize severe lifestyle mismatch
    let final = compatibility;
    if ((adjusted.lifestyle_balance ?? 0.5) > 0.8 && sp.lifestyle <= 2) final -= 12;
    if ((adjusted.family_priority ?? 0.5) > 0.8 && sp.familyFriendly <= 2) final -= 10;
    if ((adjusted.stamina ?? 0.5) < 0.3 && sp.callBurden >= 4) final -= 8;
    if ((adjusted.death_comfort ?? 0.5) < 0.3 && sp.emotionalBurden >= 4) final -= 8;
    final = Math.max(15, Math.min(99, final));

    const { fors, against } = buildReasons(adjusted, sp);

    return {
      specialty: sp,
      compatibility: Math.round(final),
      lifestyleFit: Math.round(lifestyleScore * 100),
      emotionalFit: Math.round(emotionalFit * 100),
      cognitiveFit: Math.round(cognitiveFit * 100),
      burnoutWarning: Math.round(Math.min(95, Math.max(5, burnoutWarning))),
      reasonsFor: fors,
      reasonsAgainst: against,
    };
  }).sort((a, b) => b.compatibility - a.compatibility);

  const avoid = [...matches].sort((a, b) => a.compatibility - b.compatibility).slice(0, 3);

  // confidence: spread of top 5 + answer completeness
  const top5 = matches.slice(0, 5);
  const spread = top5[0].compatibility - top5[4].compatibility;
  const confidence = Math.round(Math.min(95, 55 + spread * 1.2));

  return {
    traits: adjusted,
    onboarding,
    matches: top5,
    avoid,
    confidence,
  };
}

export function getQuestions() {
  return QUESTIONS;
}
