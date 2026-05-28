export type Trait =
  | "emotional_resilience"
  | "empathy"
  | "introversion"
  | "perfectionism"
  | "uncertainty_tolerance"
  | "recognition_need"
  | "patience"
  | "risk_tolerance"
  | "sensitivity"
  | "routine_preference"
  | "leadership"
  | "competitiveness"
  | "identity_career"
  | "delayed_gratification"
  | "procedural"
  | "analytical"
  | "visual_spatial"
  | "communication"
  | "autonomy"
  | "prestige_motivation"
  | "burnout_vulnerability"
  | "stamina"
  | "death_comfort"
  | "family_priority"
  | "lifestyle_balance"
  | "income_priority"
  | "ambition"
  | "chronic_vs_acute" // 0 = chronic, 1 = acute
  | "specialized_vs_broad" // 0 = broad, 1 = specialized
  | "ethical_burden_tolerance"
  | "focus_style" // 0 = sustained, 1 = rapid-switching
  | "social_battery"; // 0 = low (quiet), 1 = high (social)

export type TraitScores = Partial<Record<Trait, number>>; // values 0..1

export type OnboardingData = {
  ageRange: string;
  gender: string;
  stage: string;
  country: string;
  relationship: string;
  wantsChildren: string;
  workLifeBalance: number; // 1..5
  lifestyleVision: string;
  willingnessToSacrifice: number; // 1..5
  financialPriority: number; // 1..5
  ambition: number; // 1..5
  relocationOpenness: number; // 1..5
  workEnvironment: string;
};

export type Choice = {
  label: string;
  // weighted impact: each trait gets a delta in -1..1 range
  traits: TraitScores;
};

export type Question = {
  id: string;
  category: string;
  prompt: string;
  helper?: string;
  choices: Choice[];
};

export type Specialty = {
  id: string;
  name: string;
  blurb: string;
  trainingYears: string;
  incomeBand: 1 | 2 | 3 | 4 | 5;
  competitiveness: 1 | 2 | 3 | 4 | 5;
  lifestyle: 1 | 2 | 3 | 4 | 5; // higher = better lifestyle
  burnoutRisk: 1 | 2 | 3 | 4 | 5;
  emotionalBurden: 1 | 2 | 3 | 4 | 5;
  procedural: 1 | 2 | 3 | 4 | 5;
  patientInteraction: 1 | 2 | 3 | 4 | 5;
  callBurden: 1 | 2 | 3 | 4 | 5;
  emergencyFrequency: 1 | 2 | 3 | 4 | 5;
  physicalDemand: 1 | 2 | 3 | 4 | 5;
  familyFriendly: 1 | 2 | 3 | 4 | 5;
  autonomy: 1 | 2 | 3 | 4 | 5;
  prestige: 1 | 2 | 3 | 4 | 5;
  ideal: TraitScores;
  thrives: string[];
  struggles: string[];
  downsides: string[];
  dayInLife: string;
  tags: string[];
};

export type SpecialtyMatch = {
  specialty: Specialty;
  compatibility: number; // 0..100
  lifestyleFit: number;
  emotionalFit: number;
  cognitiveFit: number;
  burnoutWarning: number; // 0..100, higher = more risk
  reasonsFor: string[];
  reasonsAgainst: string[];
};

export type AssessmentResult = {
  traits: TraitScores;
  onboarding: OnboardingData;
  matches: SpecialtyMatch[];
  avoid: SpecialtyMatch[];
  confidence: number;
};
