import { createServerFn } from "@tanstack/react-start";
import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";

import { QUESTIONS } from "./questions";
import { aggregateTraits, score } from "./scoring";
import type { AssessmentResult, Choice, OnboardingData } from "./types";

// Zod for onboarding — permissive on strings, strict on enums we depend on.
const OnboardingSchema = z.object({
  workLifeBalance: z.number().min(1).max(5),
  wantsChildren: z.enum(["yes", "no", "maybe"]),
  financialPriority: z.number().min(1).max(5),
  ambition: z.number().min(1).max(5),
  willingnessToSacrifice: z.number().min(1).max(5),
  geographicIntent: z.string().max(40).optional().default(""),
  lifestyleVision: z.string().max(40).optional().default(""),
  careerArchetypes: z.array(z.string().max(40)).max(6).optional().default([]),
  meaningTop: z.array(z.string().max(40)).max(5).optional().default([]),
}).passthrough();

const AnswersSchema = z.record(z.string().max(40), z.number().int().min(0).max(20));

const InputSchema = z.object({
  onboarding: OnboardingSchema,
  answers: AnswersSchema,
});

function sign(payload: string): string {
  const secret = process.env.SCORING_SECRET;
  if (!secret) throw new Error("Missing SCORING_SECRET");
  return createHmac("sha256", secret).update(payload).digest("hex");
}

function fingerprint(result: AssessmentResult): string {
  const top = result.matches[0];
  return [
    "v1",
    top?.specialty.id ?? "",
    top?.compatibility ?? 0,
    result.confidence,
    result.regretRisk.score,
    result.matches.map((m) => `${m.specialty.id}:${m.compatibility}`).join(","),
  ].join("|");
}

export type VerifiedResult = {
  result: AssessmentResult;
  signature: string;
  computedAt: number;
};

export const computeResult = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<VerifiedResult> => {
    const questionById = new Map(QUESTIONS.map((q) => [q.id, q] as const));
    const choices: Choice[] = [];
    for (const [qid, idx] of Object.entries(data.answers)) {
      const q = questionById.get(qid);
      if (!q) continue; // ignore unknown question ids (persona filtering may drop them)
      if (idx < 0 || idx >= q.choices.length) {
        throw new Error(`Invalid choice index for question ${qid}`);
      }
      choices.push(q.choices[idx]);
    }
    if (choices.length < 6) {
      throw new Error("Not enough valid answers to score.");
    }

    const traits = aggregateTraits(choices);
    const result = score(traits, data.onboarding as OnboardingData, choices);
    const computedAt = Date.now();
    const signature = sign(`${fingerprint(result)}|${computedAt}`);
    return { result, signature, computedAt };
  });

const VerifyInputSchema = z.object({
  fingerprint: z.string().min(4).max(4096),
  computedAt: z.number().int().positive(),
  signature: z.string().length(64),
});

export const verifyResult = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => VerifyInputSchema.parse(input))
  .handler(async ({ data }) => {
    const expected = sign(`${data.fingerprint}|${data.computedAt}`);
    const a = Buffer.from(expected, "hex");
    const b = Buffer.from(data.signature, "hex");
    const ok = a.length === b.length && timingSafeEqual(a, b);
    return { verified: ok };
  });
