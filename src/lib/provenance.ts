/**
 * Provenance contract: every figure in the Egypt matrix, clinic capital and
 * licensing playbook declares where it came from and how much to trust it.
 */
export type ProvenanceClass = "official" | "doctor_reported" | "market_estimate" | "unverified";

export interface ProvenanceMeta {
  class: ProvenanceClass;
  sourceName: string;
  sourceRef?: string;
  collectedAt: string; // YYYY-MM-DD
  verifiedAt?: string;
  verifiedBy?: string;
  sampleSize?: number; // required when class === "doctor_reported"
  methodologyNote?: string;
}

export interface ProvenancedValue<T> {
  value: T;
  provenance: ProvenanceMeta;
}

export const PROVENANCE_LABEL: Record<ProvenanceClass, string> = {
  official: "Official",
  doctor_reported: "Doctor reported",
  market_estimate: "Market estimate",
  unverified: "Unverified",
};

export function provenanceTag(p: ProvenanceMeta): string {
  const base = `${PROVENANCE_LABEL[p.class]}: ${p.sourceName}`;
  return p.class === "doctor_reported" && p.sampleSize ? `${base} (n=${p.sampleSize})` : base;
}

export function isValidProvenance(p: ProvenanceMeta): boolean {
  if (!p.sourceName || !/^\d{4}-\d{2}-\d{2}$/.test(p.collectedAt)) return false;
  if (p.class === "doctor_reported" && !(p.sampleSize && p.sampleSize >= 1)) return false;
  return true;
}

export const SOURCES = {
  mohpCutoffs: {
    class: "official",
    sourceName: "MOHP Taklif portal, May 2025 basic round",
    sourceRef: "http://mhealth.cu.edu.eg/Niabat/Result_Of_Niabat_May_2025/7ad_Adna_Asasy.htm",
    collectedAt: "2025-05-31",
    verifiedBy: "MOHP published results",
    methodologyNote: "Median, min and max of per hospital minimum cumulative scores.",
  },
  mohpShortage: {
    class: "official",
    sourceName: "MOHP shortage specialty rules, May 2025",
    collectedAt: "2025-05-31",
  },
  postgradTrack: {
    class: "market_estimate",
    sourceName: "Vocare synthesis of university and Egyptian Fellowship practice",
    collectedAt: "2025-06-01",
  },
  clinicCapital: {
    class: "market_estimate",
    sourceName: "Vocare estimate, Cairo and Giza fit out and equipment quotes",
    collectedAt: "2025-03-31",
    methodologyNote: "Three tiers: consult room, single key device, heavy infrastructure.",
  },
  market: {
    class: "market_estimate",
    sourceName: "Vocare model from lifestyle, income and call burden",
    collectedAt: "2025-06-01",
  },
  privateRamp: {
    class: "market_estimate",
    sourceName: "Vocare career timeline model",
    collectedAt: "2025-06-01",
  },
  migration: {
    class: "market_estimate",
    sourceName: "Vocare synthesis of GMC, SCFHS, DHA and ECFMG pathways",
    collectedAt: "2025-06-01",
  },
  universityEntry: {
    class: "unverified",
    sourceName: "Vocare heuristic from specialty competitiveness",
    collectedAt: "2025-06-01",
  },
  licensing: {
    class: "official",
    sourceName: "GMC, Royal Colleges, SCFHS, DHA and ECFMG published requirements",
    collectedAt: "2024-12-31",
  },
} as const satisfies Record<string, ProvenanceMeta>;
