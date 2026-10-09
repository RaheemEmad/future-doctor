import type { Specialty } from "@/lib/types";

export type LicenseStep = { exam: string; note: string };
export type LicenseTrack = { region: string; body: string; url: string; steps: LicenseStep[] };

/** UK college exam per specialty. Falls back to PLAB for unmapped fields. */
const UK_EXAM: Record<string, LicenseStep[]> = {
  surgical: [
    { exam: "MRCS Part A", note: "Written basic surgical sciences, can be sat in Egypt or abroad" },
    { exam: "MRCS Part B (OSCE)", note: "Clinical exam, grants GMC registration with a licence" },
  ],
  medical: [
    { exam: "MRCP Part 1", note: "Written, held in Cairo several times a year" },
    { exam: "MRCP Part 2 Written", note: "Clinical knowledge written paper" },
    { exam: "MRCP PACES", note: "Clinical exam; full MRCP gives a GMC licence route" },
  ],
  radiology: [{ exam: "FRCR Part 1 then 2A, 2B", note: "Royal College of Radiologists exams" }],
  anesthesiology: [{ exam: "Primary then Final FRCA", note: "Royal College of Anaesthetists" }],
  obgyn: [{ exam: "MRCOG Part 1, 2, 3", note: "Royal College of Obstetricians and Gynaecologists" }],
  pediatrics: [{ exam: "MRCPCH theory and clinical", note: "Royal College of Paediatrics and Child Health" }],
  psychiatry: [{ exam: "MRCPsych Papers A, B and CASC", note: "Royal College of Psychiatrists" }],
  emergency_medicine: [{ exam: "MRCEM Primary, SBA, OSCE", note: "Royal College of Emergency Medicine" }],
  ophthalmology: [{ exam: "FRCOphth Part 1 and 2", note: "Royal College of Ophthalmologists" }],
  pathology: [{ exam: "FRCPath Part 1 and 2", note: "Royal College of Pathologists" }],
  default: [
    { exam: "PLAB 1", note: "Written, sat in Cairo or the UK" },
    { exam: "PLAB 2", note: "OSCE in Manchester, leads to GMC registration" },
  ],
};

function ukSteps(s: Specialty): LicenseStep[] {
  if (UK_EXAM[s.id]) return UK_EXAM[s.id];
  if (s.id.includes("radiology") || s.id === "ir") return UK_EXAM.radiology;
  const tags = s.tags ?? [];
  if (tags.includes("surgical")) return UK_EXAM.surgical;
  if (s.procedural <= 3) return UK_EXAM.medical;
  return UK_EXAM.default;
}

export function licensingTracks(s: Specialty): LicenseTrack[] {
  return [
    {
      region: "Egypt",
      body: "Egyptian Fellowship or university Master and MD",
      url: "https://www.egyptianfellowship.org/",
      steps: [
        { exam: "Residency through the Ministry round", note: "After takleef, using your cumulative score" },
        { exam: "Fellowship Part 1", note: "Basic sciences, usually in year 1 to 2" },
        { exam: "Fellowship Part 2", note: "Written plus clinical, at the end of training" },
      ],
    },
    {
      region: "UK",
      body: "General Medical Council (GMC)",
      url: "https://www.gmc-uk.org/registration-and-licensing",
      steps: [
        { exam: "IELTS 7.5 or OET grade B", note: "English requirement for registration" },
        ...ukSteps(s),
        { exam: "GMC registration and NHS job or training post", note: "Often start in a trust grade post" },
      ],
    },
    {
      region: "Gulf",
      body: "Saudi SCFHS, UAE DHA, DOH or MOHAP, Qatar DHP",
      url: "https://scfhs.org.sa/en",
      steps: [
        { exam: "Postgraduate degree", note: "Master, Egyptian Fellowship or a UK membership sets your grade" },
        { exam: "Dataflow verification", note: "Primary source check of your degree and experience" },
        { exam: "Licensing exam (Prometric) or exemption", note: "Specialist and consultant grades depend on years after the degree" },
      ],
    },
    {
      region: "US",
      body: "ECFMG and the NRMP Match",
      url: "https://www.ecfmg.org/certification/",
      steps: [
        { exam: "USMLE Step 1", note: "Pass or fail" },
        { exam: "USMLE Step 2 CK", note: "Scored, the main filter for interviews" },
        { exam: "OET Medicine", note: "Completes ECFMG certification" },
        { exam: "US clinical experience then ERAS and the Match", note: `Residency in ${s.name}, starting from year 1` },
      ],
    },
  ];
}
