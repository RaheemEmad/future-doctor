import { describe, expect, it } from "vitest";
import { isValidProvenance, SOURCES } from "./provenance";

describe("provenance", () => {
  it("every registered source is valid", () => {
    for (const p of Object.values(SOURCES)) expect(isValidProvenance(p)).toBe(true);
  });
  it("MOHP cutoffs are official", () => {
    expect(SOURCES.mohpCutoffs.class).toBe("official");
  });
  it("clinic capital is a market estimate", () => {
    expect(SOURCES.clinicCapital.class).toBe("market_estimate");
  });
  it("doctor reported data needs a sample size", () => {
    expect(isValidProvenance({ class: "doctor_reported", sourceName: "x", collectedAt: "2025-01-01" })).toBe(false);
    expect(isValidProvenance({ class: "doctor_reported", sourceName: "x", collectedAt: "2025-01-01", sampleSize: 3 })).toBe(true);
  });
});
