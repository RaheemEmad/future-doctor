import type {
  AssessmentResult,
  CareerArchetype,
  Choice,
  EnrichedSpecialty,
  GeographicIntent,
  MeaningSource,
  OnboardingData,
  RegretFlag,
  RegretSignal,
  ScoreContribution,
  ScorePenalty,
  Specialty,
  SpecialtyMatch,
  Trait,
  TraitScores,
} from "./types";
import { CAREER_ARCHETYPE_LABEL, GEO_INTENT_LABEL, MEANING_LABEL } from "./types";
import { ENRICHED_SPECIALTIES } from "./enrichment";
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

const ALL_MEANING: MeaningSource[] = [
  "saving_lives", "relationships", "technical_mastery", "scientific_curiosity",
  "leadership", "innovation", "teaching",
];

function clamp01(x: number) { return Math.max(0, Math.min(1, x)); }

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
    result[trait] = counts[trait] ? clamp01(sums[trait] / counts[trait]) : 0.5;
  }
  return result;
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
  blend("identity_career", 1 - (onboarding.workLifeBalance / 5) * 0.5, 0.25);
  blend("stamina", onboarding.willingnessToSacrifice / 5, 0.35);
  blend("identity_career", onboarding.willingnessToSacrifice / 5, 0.3);
  return t;
}

function cosineLike(user: TraitScores, ideal: TraitScores): number {
  let weightSum = 0;
  let agree = 0;
  for (const [trait, target] of Object.entries(ideal)) {
    const u = user[trait as Trait] ?? 0.5;
    const tgt = target as number;
    const weight = 0.4 + Math.abs(tgt - 0.5) * 1.5;
    const sim = 1 - Math.abs(u - tgt);
    agree += sim * weight;
    weightSum += weight;
  }
  return weightSum === 0 ? 0.5 : agree / weightSum;
}

function bandFit(userScore: number, specialtyScore1to5: number): number {
  const target = (specialtyScore1to5 - 1) / 4;
  return 1 - Math.abs(userScore - target);
}

function meaningWeights(top: MeaningSource[]): Record<MeaningSource, number> {
  const w: Record<MeaningSource, number> = {
    saving_lives: 0, relationships: 0, technical_mastery: 0,
    scientific_curiosity: 0, leadership: 0, innovation: 0, teaching: 0,
  };
  if (top.length === 0) {
    for (const m of ALL_MEANING) w[m] = 1 / ALL_MEANING.length;
    return w;
  }
  const decay = [1.0, 0.7, 0.45];
  let total = 0;
  top.slice(0, 3).forEach((m, i) => { w[m] = decay[i] ?? 0.3; total += w[m]; });
  for (const m of ALL_MEANING) w[m] = w[m] / (total || 1);
  return w;
}

function meaningFit(spProfile: Record<MeaningSource, number>, weights: Record<MeaningSource, number>): number {
  let s = 0;
  for (const m of ALL_MEANING) s += spProfile[m] * weights[m];
  return clamp01(s);
}

function opportunityFit(sp: EnrichedSpecialty, intent: GeographicIntent | ""): { score: number; weight: number } {
  const norm = (x: number) => (x - 1) / 9;
  const ai = 1 - norm(sp.aiDisruptionRisk); // resilience to AI
  switch (intent) {
    case "egypt_private":
      return { score: 0.7 * norm(sp.egyptPrivatePotential) + 0.2 * ai + 0.1 * norm(sp.remoteWorkPotential), weight: 0.16 };
    case "egypt_gov":
      return { score: 0.55 * norm(sp.fellowshipPipeline) + 0.3 * norm(sp.egyptPrivatePotential) + 0.15 * ai, weight: 0.12 };
    case "gulf":
      return { score: 0.75 * norm(sp.gccDemand) + 0.25 * ai, weight: 0.18 };
    case "uk":
      return { score: 0.75 * norm(sp.ukMigrationFriendliness) + 0.25 * ai, weight: 0.15 };
    case "us":
      return { score: 0.6 * (1 - norm(sp.usMatchDifficulty)) + 0.4 * norm(sp.fellowshipPipeline), weight: 0.15 };
    case "canada_aus":
      return { score: 0.5 * norm(sp.ukMigrationFriendliness) + 0.3 * norm(sp.gccDemand) + 0.2 * ai, weight: 0.12 };
    default:
      return { score: 0.5, weight: 0.06 };
  }
}

function archetypeFit(sp: EnrichedSpecialty, picks: CareerArchetype[]): { score: number; matched: typeof sp.careerPaths } {
  if (!picks.length) return { score: 0.5, matched: sp.careerPaths.slice(0, 3) };
  const set = new Set(picks);
  let matched = 0;
  const highlighted = sp.careerPaths.filter((p) => p.archetypes.some((a) => set.has(a)));
  matched = highlighted.length;
  const cap = Math.min(picks.length, sp.careerPaths.length);
  const score = clamp01(matched / Math.max(1, cap));
  return { score, matched: highlighted.length ? highlighted : sp.careerPaths.slice(0, 2) };
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
    emotional_resilience: "Emotional resilience", empathy: "Empathy", introversion: "Introversion",
    perfectionism: "Perfectionism", uncertainty_tolerance: "Tolerance for uncertainty",
    recognition_need: "Need for recognition", patience: "Patience", risk_tolerance: "Risk tolerance",
    sensitivity: "Emotional sensitivity", routine_preference: "Preference for routine",
    leadership: "Leadership drive", competitiveness: "Competitiveness",
    identity_career: "Career-identity fusion", delayed_gratification: "Delayed gratification",
    procedural: "Procedural orientation", analytical: "Analytical thinking",
    visual_spatial: "Visual-spatial strength", communication: "Communication style",
    autonomy: "Need for autonomy", prestige_motivation: "Prestige motivation",
    burnout_vulnerability: "Burnout vulnerability", stamina: "Physical & schedule stamina",
    death_comfort: "Comfort with death & suffering", family_priority: "Family priority",
    lifestyle_balance: "Lifestyle balance need", income_priority: "Income priority",
    ambition: "Ambition level", chronic_vs_acute: "Acute-care orientation",
    specialized_vs_broad: "Specialization preference",
    ethical_burden_tolerance: "Ethical burden tolerance",
    focus_style: "Focus style (sustained vs switching)", social_battery: "Social battery",
  };
  return map[t];
}

function regretRisk(answers: Choice[], traits: TraitScores, top: SpecialtyMatch | undefined): {
  score: number; signals: RegretSignal[]; verdict: string;
} {
  const counts: Record<RegretFlag, number> = {
    prestige_driven: 0, family_pressure: 0, fear_driven: 0, money_driven: 0, peer_comparison: 0,
  };
  for (const c of answers) {
    for (const f of c.regretFlags ?? []) counts[f]++;
  }
  // Trait-level boosts
  if ((traits.prestige_motivation ?? 0.5) > 0.8) counts.prestige_driven += 1;
  if ((traits.income_priority ?? 0.5) > 0.85 && (traits.identity_career ?? 0.5) < 0.4) counts.money_driven += 1;
  if ((traits.recognition_need ?? 0.5) > 0.85) counts.peer_comparison += 1;

  // Meaning misalignment with top match (if top picked for prestige/money but profile screams relationships, etc.)
  let meaningGap = 0;
  if (top) {
    const tm = top.specialty.meaningProfile;
    if ((traits.empathy ?? 0.5) > 0.75 && tm.relationships < 0.5) meaningGap += 1;
    if ((traits.analytical ?? 0.5) > 0.8 && tm.scientific_curiosity < 0.5) meaningGap += 0.5;
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0) + meaningGap;
  const score = clamp01(total / 8) * 100;

  const signals: RegretSignal[] = [];
  const notes: Record<RegretFlag, string> = {
    prestige_driven: "Several answers leaned on status and prestige.",
    family_pressure: "Some choices read as parent/family-driven, not self-driven.",
    fear_driven: "A pattern of choosing what feels 'safe' over what feels true.",
    money_driven: "Income weight is high relative to identity attachment to medicine.",
    peer_comparison: "Strong sensitivity to how peers perceive your choice.",
  };
  for (const f of Object.keys(counts) as RegretFlag[]) {
    if (counts[f] > 0) signals.push({ flag: f, weight: counts[f], note: notes[f] });
  }
  signals.sort((a, b) => b.weight - a.weight);

  let verdict = "Your answers suggest a self-driven, identity-aligned choice.";
  if (score > 60) verdict = "Elevated risk of choosing a specialty that impresses others more than it fulfills you.";
  else if (score > 35) verdict = "Some external pressures are influencing your reasoning — worth examining honestly.";

  return { score: Math.round(score), signals: signals.slice(0, 3), verdict };
}

function detectTensions(traits: TraitScores, ob: OnboardingData, top: EnrichedSpecialty | undefined): string[] {
  const out: string[] = [];
  if ((traits.lifestyle_balance ?? 0.5) > 0.75 && (traits.identity_career ?? 0.5) > 0.8) {
    out.push("You want strong work–life balance and a career that defines you. Pick the side you can defend at 3am.");
  }
  if ((traits.family_priority ?? 0.5) > 0.75 && (traits.ambition ?? 0.5) > 0.85 && (traits.lifestyle_balance ?? 0.5) < 0.4) {
    out.push("Your family priority is high but lifestyle tolerance is low — that's a collision course in surgical paths.");
  }
  if ((traits.death_comfort ?? 0.5) < 0.35 && ob.lifestyleVision === "hospital_intensity") {
    out.push("You said you want hospital intensity, but you carry low tolerance for sustained mortality exposure.");
  }
  if (top && top.lifestyle <= 2 && (traits.lifestyle_balance ?? 0.5) > 0.75) {
    out.push(`Your top match (${top.name}) has a punishing lifestyle while you rank balance as non-negotiable.`);
  }
  if ((traits.prestige_motivation ?? 0.5) > 0.85 && (traits.identity_career ?? 0.5) < 0.4) {
    out.push("Prestige matters to you, but medicine isn't core to your identity — risk of seeking validation that won't satisfy.");
  }
  return out.slice(0, 4);
}

function meaningBreakdown(top: MeaningSource[]): { source: MeaningSource; weight: number }[] {
  const w = meaningWeights(top);
  return ALL_MEANING.map((s) => ({ source: s, weight: Math.round(w[s] * 100) }))
    .sort((a, b) => b.weight - a.weight)
    .filter((x) => x.weight > 0);
}

export function score(traits: TraitScores, onboarding: OnboardingData, answers: Choice[] = []): AssessmentResult {
  const adjusted = applyOnboarding(traits, onboarding);
  const mWeights = meaningWeights(onboarding.meaningTop ?? []);

  const matches: SpecialtyMatch[] = ENRICHED_SPECIALTIES.map((sp) => {
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

    const mFit = meaningFit(sp.meaningProfile, mWeights);
    const opp = opportunityFit(sp, onboarding.geographicIntent || "undecided");
    const arche = archetypeFit(sp, onboarding.careerArchetypes ?? []);

    const burnoutWarning =
      0.5 * ((sp.burnoutRisk - 1) / 4) * 100 +
      0.3 * (1 - (adjusted.emotional_resilience ?? 0.5)) * 100 +
      0.2 * (adjusted.burnout_vulnerability ?? 0.5) * 100;

    // Weighted composite (same weights as before).
    const channels: Array<{ key: ScoreContribution["channel"]; label: string; weight: number; fit: number }> = [
      { key: "trait", label: "Trait similarity", weight: 0.32, fit: traitFit },
      { key: "lifestyle", label: "Lifestyle, family and stamina", weight: 0.15, fit: lifestyleScore },
      { key: "emotional", label: "Emotional and ethical fit", weight: 0.12, fit: emotionalFit },
      { key: "meaning", label: "Meaning source alignment", weight: 0.12, fit: mFit },
      { key: "cognitive", label: "Cognitive style fit", weight: 0.08, fit: cognitiveFit },
      { key: "archetype", label: "Career archetype overlap", weight: 0.08, fit: arche.score },
      { key: "opportunity", label: "Regional opportunity", weight: opp.weight, fit: opp.score },
      { key: "income", label: "Income band fit", weight: 0.07, fit: incomeFit },
    ];
    const denom = channels.reduce((s, c) => s + c.weight, 0);
    const baseScore = (100 * channels.reduce((s, c) => s + c.weight * c.fit, 0)) / denom;

    // Penalties (same conditions as before).
    const penalties: ScorePenalty[] = [];
    if ((adjusted.lifestyle_balance ?? 0.5) > 0.8 && sp.lifestyle <= 2) {
      penalties.push({ label: "Lifestyle collision", points: 12, reason: `You ranked work-life balance very high, but ${sp.name} sits at lifestyle ${sp.lifestyle}/5.` });
    }
    if ((adjusted.family_priority ?? 0.5) > 0.8 && sp.familyFriendly <= 2) {
      penalties.push({ label: "Family-time collision", points: 10, reason: `You marked family priority as central, while ${sp.name} scores ${sp.familyFriendly}/5 for family-friendliness.` });
    }
    if ((adjusted.stamina ?? 0.5) < 0.3 && sp.callBurden >= 4) {
      penalties.push({ label: "Stamina vs call burden", points: 8, reason: `Your willingness to sacrifice was low, but ${sp.name} carries a ${sp.callBurden}/5 call burden.` });
    }
    if ((adjusted.death_comfort ?? 0.5) < 0.3 && sp.emotionalBurden >= 4) {
      penalties.push({ label: "Mortality exposure", points: 8, reason: `You showed low comfort with mortality, yet ${sp.name} carries an emotional burden of ${sp.emotionalBurden}/5.` });
    }
    const penaltyPoints = penalties.reduce((s, p) => s + p.points, 0);

    let final = baseScore - penaltyPoints;
    final = Math.max(15, Math.min(99, final));

    // Build human-readable breakdown using actual contribution to the final %.
    const safeFinal = Math.max(1, final);
    const breakdown: ScoreContribution[] = channels
      .map((c) => {
        const rawContribution = (100 * c.weight * c.fit) / denom;
        const scaled = rawContribution * (safeFinal / Math.max(1, baseScore));
        const fitPct = Math.round(c.fit * 100);
        const weightPct = Math.round((c.weight / denom) * 100);
        return {
          channel: c.key,
          label: c.label,
          weight: weightPct,
          fit: fitPct,
          contribution: Math.round(scaled * 10) / 10,
          explanation: explainChannel(c.key, adjusted, sp, onboarding, mWeights, arche.matched),
        } satisfies ScoreContribution;
      })
      .sort((a, b) => b.contribution - a.contribution);

    const { fors, against } = buildReasons(adjusted, sp);

    return {
      specialty: sp,
      compatibility: Math.round(final),
      lifestyleFit: Math.round(lifestyleScore * 100),
      emotionalFit: Math.round(emotionalFit * 100),
      cognitiveFit: Math.round(cognitiveFit * 100),
      meaningFit: Math.round(mFit * 100),
      opportunityFit: Math.round(opp.score * 100),
      archetypeFit: Math.round(arche.score * 100),
      burnoutWarning: Math.round(Math.min(95, Math.max(5, burnoutWarning))),
      reasonsFor: fors,
      reasonsAgainst: against,
      highlightedPaths: arche.matched.slice(0, 4),
      breakdown,
      penalties,
      baseScore: Math.round(baseScore),
    };
  }).sort((a, b) => b.compatibility - a.compatibility);


  const avoid = [...matches].sort((a, b) => a.compatibility - b.compatibility).slice(0, 3);
  const top5 = matches.slice(0, 5);
  const spread = top5[0].compatibility - top5[4].compatibility;
  const confidence = Math.round(Math.min(95, 55 + spread * 1.2));

  const regret = regretRisk(answers, adjusted, top5[0]);
  const tensions = detectTensions(adjusted, onboarding, top5[0]?.specialty);
  const mBreakdown = meaningBreakdown(onboarding.meaningTop ?? []);

  return {
    traits: adjusted,
    onboarding,
    matches: top5,
    avoid,
    confidence,
    regretRisk: regret,
    tensions,
    meaningBreakdown: mBreakdown,
  };
}

export function getQuestions() { return QUESTIONS; }
