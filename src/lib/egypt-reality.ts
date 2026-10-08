import type { Specialty } from "./types";

/**
 * Egypt-specific practical reality for each specialty.
 * Values are indicative estimates for orientation, not official figures.
 */
export type CapexTier = 1 | 2 | 3;

export type EgyptReality = {
  mohp?: MohpCutoff;
  shortage: boolean;
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

/**
 * Real MOHP data: minimum cumulative score (المجموع التراكمي) accepted per
 * hospital, basic residency round May 2025 (حركة نيابات مايو 2025, الحركة الأساسية).
 * Source: MOHP Taklif portal, mhealth.cu.edu.eg/Niabat/Result_Of_Niabat_May_2025/7ad_Adna_Asasy.htm
 * median = typical hospital cutoff, min/max = easiest and hardest hospital.
 */
export type MohpCutoff = { ar: string; sites: number; min: number; median: number; max: number };
export const MOHP_SOURCE = {
  label: "MOHP residency round May 2025, minimum scores (basic round)",
  url: "http://mhealth.cu.edu.eg/Niabat/Result_Of_Niabat_May_2025/7ad_Adna_Asasy.htm",
};
const C = (ar: string, sites: number, min: number, median: number, max: number): MohpCutoff => ({ ar, sites, min, median, max });
export const MOHP_CUTOFFS: Record<string, MohpCutoff> = {
  dermatology: C("جلدية", 86, 3739, 4036, 4370),
  cardiology: C("قلب وأوعية دموية", 24, 2870, 3965, 4221),
  hemonc: C("أمراض دم", 1, 3773, 3773, 3773),
  anesthesiology: C("تخدير", 2, 3414, 3725, 4037),
  rad_onc: C("علاج أورام", 2, 3384, 3722, 4060),
  diagnostic_radiology: C("أشعة", 12, 3284, 3681, 4215),
  ir: C("أشعة", 12, 3284, 3681, 4215),
  nephrology: C("كلى صناعي", 27, 2903, 3657, 4282),
  pulmonology: C("صدر", 2, 3278, 3651, 4023),
  orthopedics: C("عظام", 29, 2896, 3645, 4216),
  psychiatry: C("نفسية وعصبية", 14, 2989, 3616, 3970),
  ophthalmology: C("رمد", 37, 2903, 3614, 4075),
  critical_care: C("عناية مركزة", 18, 2969, 3608, 4192),
  emergency_medicine: C("استقبال وطوارئ", 10, 2789, 3602, 3923),
  gastroenterology: C("جهاز هضمي وكبد", 29, 2996, 3555, 4476),
  pathology: C("باثولوجي أنسجة", 4, 3416, 3541, 3584),
  obgyn: C("نساء وتوليد", 56, 2768, 3517, 4013),
  pediatrics: C("أطفال", 31, 2975, 3508, 4257),
  rheumatology: C("روماتيزم وتأهيل", 9, 3086, 3487, 3750),
  pmr: C("روماتيزم وتأهيل", 9, 3086, 3487, 3750),
  urology: C("مسالك", 10, 2783, 3449, 4014),
  ent: C("أنف وأذن", 23, 2986, 3437, 3829),
  plastics: C("تجميل وحروق", 24, 3076, 3389, 4043),
  neurosurgery: C("جراحة مخ وأعصاب", 2, 3038, 3349, 3659),
  internal_medicine: C("باطنة", 7, 3088, 3284, 3660),
  general_surgery: C("جراحة عامة", 13, 3053, 3284, 3679),
  vascular_surgery: C("جراحة أوعية دموية", 3, 2915, 3142, 3647),
};

/** MOHP officially lists these as shortage ("ملحة") specialties with easier entry rules (2025 round). */
const SHORTAGE = new Set([
  "emergency_medicine", "anesthesiology", "critical_care", "pathology", "cardiac_surgery",
  "vascular_surgery", "pulmonology", "infectious_disease", "internal_medicine", "neurosurgery",
]);

export function egyptReality(s: Specialty): EgyptReality {
  const tier = TIER[s.id] ?? 1;
  const c = s.competitiveness;
  const mohp = MOHP_CUTOFFS[s.id];
  const shortage = SHORTAGE.has(s.id);
  const universityEntry =
    c >= 5 ? "University posts usually go to the top of the class (excellent with honours)" :
    c >= 4 ? "University posts usually need a very high rank" :
    c >= 3 ? "University posts reachable with a good to very good rank" : "University posts widely available";
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
    mohp,
    shortage,
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
