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
  | "chronic_vs_acute"
  | "specialized_vs_broad"
  | "ethical_burden_tolerance"
  | "focus_style"
  | "social_battery";

export type TraitScores = Partial<Record<Trait, number>>;

export type RegretFlag =
  | "prestige_driven"
  | "family_pressure"
  | "fear_driven"
  | "money_driven"
  | "peer_comparison";

export type CareerArchetype =
  | "master_clinician"
  | "academic"
  | "surgeon_operator"
  | "researcher"
  | "healthcare_executive"
  | "medical_educator"
  | "startup_founder"
  | "public_health"
  | "telemedicine"
  | "lifestyle_physician"
  | "global_health";

export const CAREER_ARCHETYPE_LABEL: Record<CareerArchetype, string> = {
  master_clinician: "Master clinician",
  academic: "Academic physician",
  surgeon_operator: "Surgeon-operator",
  researcher: "Researcher",
  healthcare_executive: "Healthcare executive",
  medical_educator: "Medical educator",
  startup_founder: "Startup founder",
  public_health: "Public health leader",
  telemedicine: "Telemedicine physician",
  lifestyle_physician: "Lifestyle physician",
  global_health: "Global health physician",
};

export type GeographicIntent =
  | "egypt_gov"
  | "egypt_private"
  | "gulf"
  | "uk"
  | "us"
  | "canada_aus"
  | "undecided";

export const GEO_INTENT_LABEL: Record<GeographicIntent, string> = {
  egypt_gov: "Stay in Egypt — government sector",
  egypt_private: "Stay in Egypt — private practice focus",
  gulf: "Gulf (KSA / UAE / Qatar / Kuwait)",
  uk: "United Kingdom",
  us: "United States",
  canada_aus: "Canada / Australia",
  undecided: "Undecided",
};

export type MeaningSource =
  | "saving_lives"
  | "relationships"
  | "technical_mastery"
  | "scientific_curiosity"
  | "leadership"
  | "innovation"
  | "teaching";

export const MEANING_LABEL: Record<MeaningSource, string> = {
  saving_lives: "Saving lives",
  relationships: "Deep relationships",
  technical_mastery: "Technical mastery",
  scientific_curiosity: "Scientific curiosity",
  leadership: "Leadership",
  innovation: "Innovation",
  teaching: "Teaching",
};

export type OnboardingData = {
  ageRange: string;
  gender: string;
  stage: string;
  country: string;
  relationship: string;
  wantsChildren: string;
  workLifeBalance: number;
  lifestyleVision: string;
  willingnessToSacrifice: number;
  financialPriority: number;
  ambition: number;
  relocationOpenness: number;
  workEnvironment: string;
  careerArchetypes: CareerArchetype[];
  geographicIntent: GeographicIntent | "";
  meaningTop: MeaningSource[]; // user picks up to 3
};

export type Choice = {
  label: string;
  traits: TraitScores;
  regretFlags?: RegretFlag[];
};

export type Question = {
  id: string;
  category: string;
  prompt: string;
  helper?: string;
  choices: Choice[];
};

export type CareerPath = {
  archetypes: CareerArchetype[];
  label: string;
  note?: string;
};

export type LifecyclePoint = {
  year: number;
  lifestyle: number;
  fulfillment: number;
  financial: number;
};

export type Specialty = {
  id: string;
  name: string;
  blurb: string;
  trainingYears: string;
  incomeBand: 1 | 2 | 3 | 4 | 5;
  competitiveness: 1 | 2 | 3 | 4 | 5;
  lifestyle: 1 | 2 | 3 | 4 | 5;
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

export type EnrichedSpecialty = Specialty & {
  egyptPrivatePotential: number; // 1..10
  gccDemand: number;
  ukMigrationFriendliness: number;
  usMatchDifficulty: number; // 1=easy, 10=hard
  remoteWorkPotential: number;
  aiDisruptionRisk: number;
  fellowshipPipeline: number;
  meaningProfile: Record<MeaningSource, number>; // 0..1
  careerPaths: CareerPath[];
  lifecycle: LifecyclePoint[]; // year 1, 5, 15, 30
};

export type SpecialtyMatch = {
  specialty: EnrichedSpecialty;
  compatibility: number;
  lifestyleFit: number;
  emotionalFit: number;
  cognitiveFit: number;
  meaningFit: number;
  opportunityFit: number;
  archetypeFit: number;
  burnoutWarning: number;
  reasonsFor: string[];
  reasonsAgainst: string[];
  highlightedPaths: CareerPath[];
};

export type RegretSignal = {
  flag: RegretFlag;
  weight: number;
  note: string;
};

export type AssessmentResult = {
  traits: TraitScores;
  onboarding: OnboardingData;
  matches: SpecialtyMatch[];
  avoid: SpecialtyMatch[];
  confidence: number;
  regretRisk: { score: number; signals: RegretSignal[]; verdict: string };
  tensions: string[];
  meaningBreakdown: { source: MeaningSource; weight: number }[];
};
