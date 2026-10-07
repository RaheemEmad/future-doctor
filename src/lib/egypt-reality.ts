import type { Specialty } from "./types";

/**
 * Egypt-specific practical reality for each specialty.
 * Values are indicative estimates for orientation, not official figures.
 */
export type CapexTier = 1 | 2 | 3;

export type EgyptReality = {
  universityEntry: string; // expected graduation rank for a university residency
  fellowshipAccess: string; // Egyptian Fellowship (Zemala) access
  capexTier: CapexTier;
  capexRange: string;
  capexItems: string;
  saturation: string;
  patientFlow: "Direct walk ins" | "Mixed" | "Referral dependent";
  migration: string;
};

const CAPEX: Record<CapexTier, string> = {
  1: "Under 150,000 EGP",
  2: "250,000 to 600,000 EGP",
  3: "1.5M to 5M+ EGP",
};

// Tier 3 = heavy equipment, Tier 2 = one key device, Tier 1 = consult room.
const TIER: Record<string, CapexTier> = {
  dermatology: 3, ophthalmology: 3, diagnostic_radiology: 3, ir: 3, rad_onc: 3, plastics: 3,
  cardiology: 2, obgyn: 2, ent: 2, orthopedics: 2, general_surgery: 2, vascular_surgery: 2,
  pmr: 2, gastroenterology: 2, urology: 2, neurology: 2,
};

const ITEMS: Record<string, string> = {
  dermatology: "Laser and RF workstations, dermatoscope, procedure room",
  ophthalmology: "Slit lamp, OCT, refractometer, later phaco access",
  diagnostic_radiology: "Imaging centre partnership or corporate backing",
  ir: "Hospital cath lab access, not a solo clinic",
  rad_onc: "Linac centres only, hospital employed",
  plastics: "Procedure suite, aesthetic devices",
  cardiology: "Echo machine, ECG, stress testing",
  obgyn: "4D ultrasound, CTG, exam room",
  ent: "Endoscopy tower, audiometry",
  orthopedics: "X ray access, splinting room",
  urology: "Ultrasound, uroflowmetry, cystoscope",
  gastroenterology: "Endoscopy unit access",
};

const MIGRATION: Record<string, string> = {
  surgical: "MRCS then UK training, or Egyptian Fellowship + 2 to 3 yrs for Gulf (SCFHS, DHA)",
  medical: "MRCP is the strongest bridge to UK and Gulf; USMLE for the US",
  diagnostic: "FRCR for UK and Gulf radiology; strong remote reporting demand",
  default: "Master or Fellowship + experience opens Gulf licensing; PLAB or UKMLA for UK",
};

export function egyptReality(s: Specialty): EgyptReality {
  const tier = TIER[s.id] ?? 1;
  const c = s.competitiveness;
  const universityEntry =
    c >= 5 ? "Top of class, excellent with honours" :
    c >= 4 ? "Very high rank, usually excellent" :
    c >= 3 ? "Good to very good rank" : "Moderate, widely available";
  const fellowshipAccess =
    c >= 4 ? "Limited seats, often waitlisted" : c >= 3 ? "Usually first or second round" : "Open in most rounds";
  const saturation =
    s.lifestyle >= 4 && s.incomeBand >= 4
      ? "Saturated in Cairo and Alexandria, real gaps in Delta and Upper Egypt"
      : s.callBurden >= 4
        ? "Undersupplied nationwide, especially in governorates"
        : "Balanced in cities, growing demand in governorates";
  const patientFlow: EgyptReality["patientFlow"] =
    ["anesthesiology", "pathology", "ir", "rad_onc", "diagnostic_radiology"].includes(s.id)
      ? "Referral dependent"
      : s.patientInteraction >= 4 ? "Direct walk ins" : "Mixed";
  const tags = s.tags ?? [];
  const migration = tags.includes("surgical")
    ? MIGRATION.surgical
    : s.id.includes("radiology") || s.id === "pathology"
      ? MIGRATION.diagnostic
      : s.procedural <= 2 ? MIGRATION.medical : MIGRATION.default;
  return {
    universityEntry,
    fellowshipAccess,
    capexTier: tier,
    capexRange: CAPEX[tier],
    capexItems: ITEMS[s.id] ?? (tier === 1 ? "Exam bed, ECG or basic tools, reception" : "One core diagnostic device plus room setup"),
    saturation,
    patientFlow,
    migration,
  };
}
