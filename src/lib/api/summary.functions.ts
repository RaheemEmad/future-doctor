import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "../ai-gateway.server";

const InputSchema = z.object({
  topSpecialty: z.string().min(1).max(80),
  compatibility: z.number().min(0).max(100),
  geographicIntent: z.string().max(60).optional(),
  archetypes: z.array(z.string().max(40)).max(6).optional(),
  meaningTop: z.array(z.string().max(40)).max(5).optional(),
  tensions: z.array(z.string().max(240)).max(4).optional(),
  regretRisk: z.number().min(0).max(100).optional(),
  traitHighlights: z.array(z.string().max(60)).max(8).optional(),
  reasonsFor: z.array(z.string().max(240)).max(3).optional(),
});

export const generateSummary = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-2.5-flash");

    const prompt = [
      `You are a thoughtful physician-mentor writing a short, second-person "life letter" to a medical student in Egypt who just completed an in-depth specialty compatibility assessment.`,
      ``,
      `Their top match: ${data.topSpecialty} (${data.compatibility}% compatibility).`,
      data.geographicIntent ? `Geographic intent: ${data.geographicIntent}.` : "",
      data.archetypes?.length ? `Career archetypes they identified with: ${data.archetypes.join(", ")}.` : "",
      data.meaningTop?.length ? `Where they draw meaning: ${data.meaningTop.join(", ")}.` : "",
      data.traitHighlights?.length ? `Standout traits: ${data.traitHighlights.join(", ")}.` : "",
      data.reasonsFor?.length ? `Top alignment signals: ${data.reasonsFor.join(" | ")}.` : "",
      data.tensions?.length ? `Tensions detected in their profile: ${data.tensions.join(" | ")}.` : "",
      typeof data.regretRisk === "number" ? `Regret risk score: ${data.regretRisk}%.` : "",
      ``,
      `Write EXACTLY 2 paragraphs, 60–90 words each. No headings, no lists, no markdown.`,
      `Paragraph 1: name who they are as a future physician — the cognitive and emotional shape of their mind. Be specific, not generic.`,
      `Paragraph 2: describe the realistic day-to-day life ${data.topSpecialty} will give them in their chosen geography — the trade-offs, what will feel hard at year 5, what will feel right at year 15. End with one honest sentence about the single thing they should stress-test before committing.`,
      `Tone: warm, direct, intellectually honest. Never sycophantic. Never use the word "journey".`,
    ].filter(Boolean).join("\n");

    const result = await generateText({
      model,
      prompt,
      maxOutputTokens: 380,
    });

    return { text: result.text };
  });
