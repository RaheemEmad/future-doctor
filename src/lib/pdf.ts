import jsPDF from "jspdf";
import type { AssessmentResult, OnboardingData } from "./types";
import { GEO_INTENT_LABEL, MEANING_LABEL, CAREER_ARCHETYPE_LABEL } from "./types";
import type { Persona } from "./persona";

const BRAND = { r: 73, g: 60, b: 168 }; // matches oklch(0.48 0.16 274) approx
const INK = { r: 22, g: 26, b: 36 };
const MUTED = { r: 110, g: 116, b: 132 };
const SOFT = { r: 244, g: 242, b: 252 };

function setColor(doc: jsPDF, c: { r: number; g: number; b: number }, kind: "text" | "fill" | "draw" = "text") {
  if (kind === "text") doc.setTextColor(c.r, c.g, c.b);
  else if (kind === "fill") doc.setFillColor(c.r, c.g, c.b);
  else doc.setDrawColor(c.r, c.g, c.b);
}

type Ctx = { doc: jsPDF; y: number; pageW: number; pageH: number; margin: number };

function ensureSpace(ctx: Ctx, needed: number) {
  if (ctx.y + needed > ctx.pageH - ctx.margin) {
    ctx.doc.addPage();
    ctx.y = ctx.margin;
    drawHeader(ctx);
  }
}

function drawHeader(ctx: Ctx) {
  const { doc, pageW, margin } = ctx;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  setColor(doc, BRAND);
  doc.text("VOCARE", margin, margin - 8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  setColor(doc, MUTED);
  doc.text("Specialty compatibility report", pageW - margin, margin - 8, { align: "right" });
  setColor(doc, { r: 230, g: 232, b: 240 }, "draw");
  doc.setLineWidth(0.4);
  doc.line(margin, margin - 4, pageW - margin, margin - 4);
  ctx.y = margin + 6;
}

function paragraph(ctx: Ctx, text: string, opts: { size?: number; bold?: boolean; color?: { r: number; g: number; b: number }; lead?: number } = {}) {
  const { doc, pageW, margin } = ctx;
  const size = opts.size ?? 10;
  doc.setFont("helvetica", opts.bold ? "bold" : "normal");
  doc.setFontSize(size);
  setColor(doc, opts.color ?? INK);
  const lines = doc.splitTextToSize(text, pageW - margin * 2);
  const lead = opts.lead ?? size * 0.5;
  for (const line of lines) {
    ensureSpace(ctx, size * 0.4 + lead);
    doc.text(line, margin, ctx.y);
    ctx.y += size * 0.4 + lead;
  }
}

function heading(ctx: Ctx, text: string, size = 14) {
  ensureSpace(ctx, size + 6);
  ctx.y += 4;
  paragraph(ctx, text, { size, bold: true, color: INK, lead: 2 });
  ctx.y += 2;
}

function microLabel(ctx: Ctx, text: string) {
  ensureSpace(ctx, 8);
  ctx.doc.setFont("helvetica", "bold");
  ctx.doc.setFontSize(7);
  setColor(ctx.doc, BRAND);
  ctx.doc.text(text.toUpperCase(), ctx.margin, ctx.y, { charSpace: 0.8 });
  ctx.y += 6;
}

function pill(ctx: Ctx, text: string) {
  const { doc, margin } = ctx;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  const w = doc.getTextWidth(text) + 10;
  ensureSpace(ctx, 9);
  setColor(doc, SOFT, "fill");
  doc.roundedRect(margin, ctx.y - 5, w, 7, 3, 3, "F");
  setColor(doc, BRAND);
  doc.text(text, margin + 5, ctx.y);
  ctx.y += 9;
}

export function generateResultsPdf(opts: {
  onboarding: OnboardingData;
  result: AssessmentResult;
  persona: Persona;
  summary: string;
}): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  const ctx: Ctx = { doc, y: margin, pageW, pageH, margin };

  drawHeader(ctx);

  // Title block
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  setColor(doc, BRAND);
  doc.text("YOUR VERDICT", margin, ctx.y, { charSpace: 1.2 });
  ctx.y += 16;

  doc.setFont("times", "italic");
  doc.setFontSize(24);
  setColor(doc, INK);
  doc.text("Your path of highest alignment", margin, ctx.y);
  ctx.y += 22;

  // Persona pill
  pill(ctx, opts.persona.short);
  ctx.y += 4;

  // Top match card
  const top = opts.result.matches[0];
  ensureSpace(ctx, 80);
  setColor(doc, BRAND, "fill");
  doc.roundedRect(margin, ctx.y, pageW - margin * 2, 72, 8, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text("TOP MATCH", margin + 14, ctx.y + 18, { charSpace: 1.2 });
  doc.setFont("times", "normal");
  doc.setFontSize(22);
  doc.text(top.specialty.name, margin + 14, ctx.y + 42);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(top.specialty.blurb.slice(0, 110), margin + 14, ctx.y + 58, { maxWidth: pageW - margin * 2 - 110 });
  doc.setFont("times", "bold");
  doc.setFontSize(28);
  doc.text(`${top.compatibility}%`, pageW - margin - 14, ctx.y + 44, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("compatibility", pageW - margin - 14, ctx.y + 58, { align: "right" });
  ctx.y += 84;

  // AI summary
  heading(ctx, "Who you are as a future physician");
  for (const para of opts.summary.split(/\n\s*\n/)) {
    paragraph(ctx, para.trim(), { size: 10, color: INK, lead: 4 });
    ctx.y += 4;
  }

  // Six-axis stats
  heading(ctx, "Six-axis alignment");
  const stats: [string, number][] = [
    ["Cognitive fit", top.cognitiveFit],
    ["Emotional fit", top.emotionalFit],
    ["Lifestyle fit", top.lifestyleFit],
    ["Meaning fit", top.meaningFit],
    ["Opportunity fit", top.opportunityFit],
    ["Burnout resilience", 100 - top.burnoutWarning],
  ];
  for (const [label, val] of stats) {
    ensureSpace(ctx, 18);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    setColor(doc, INK);
    doc.text(label, margin, ctx.y);
    doc.text(`${val}%`, pageW - margin, ctx.y, { align: "right" });
    // bar
    const barY = ctx.y + 3;
    const barW = pageW - margin * 2;
    setColor(doc, { r: 232, g: 233, b: 240 }, "fill");
    doc.roundedRect(margin, barY, barW, 3, 1.5, 1.5, "F");
    setColor(doc, BRAND, "fill");
    doc.roundedRect(margin, barY, (barW * val) / 100, 3, 1.5, 1.5, "F");
    ctx.y += 14;
  }

  // Why it fits
  if (top.reasonsFor.length > 0) {
    heading(ctx, "Why this specialty fits you");
    for (const r of top.reasonsFor.slice(0, 5)) {
      paragraph(ctx, `— ${r}`, { size: 10, color: INK, lead: 4 });
    }
  }

  // Tensions
  if (opts.result.tensions.length > 0) {
    heading(ctx, "Tensions in your profile");
    for (const t of opts.result.tensions) {
      paragraph(ctx, `— ${t}`, { size: 10, color: INK, lead: 4 });
    }
  }

  // Regret risk
  heading(ctx, `Regret risk · ${opts.result.regretRisk.score}%`);
  paragraph(ctx, opts.result.regretRisk.verdict, { size: 10, color: INK, lead: 4 });
  if (opts.result.regretRisk.signals.length > 0) {
    ctx.y += 2;
    for (const s of opts.result.regretRisk.signals) {
      paragraph(ctx, `— ${s.note}`, { size: 9, color: MUTED, lead: 3 });
    }
  }

  // Runner-up matches
  heading(ctx, "Other strong matches");
  for (const m of opts.result.matches.slice(1, 5)) {
    ensureSpace(ctx, 14);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    setColor(doc, INK);
    doc.text(m.specialty.name, margin, ctx.y);
    doc.setFont("helvetica", "normal");
    doc.text(`${m.compatibility}%`, pageW - margin, ctx.y, { align: "right" });
    ctx.y += 6;
    paragraph(ctx, m.reasonsFor[0] ?? m.specialty.blurb, { size: 9, color: MUTED, lead: 3 });
    ctx.y += 2;
  }

  // Specialties to think twice about
  if (opts.result.avoid.length > 0) {
    heading(ctx, "Specialties to think twice about");
    for (const m of opts.result.avoid.slice(0, 3)) {
      ensureSpace(ctx, 14);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      setColor(doc, INK);
      doc.text(m.specialty.name, margin, ctx.y);
      ctx.y += 6;
      paragraph(ctx, m.reasonsAgainst[0] ?? "Lower alignment on cognitive or emotional dimensions.", {
        size: 9, color: MUTED, lead: 3,
      });
      ctx.y += 2;
    }
  }

  // Your inputs (appendix)
  doc.addPage();
  ctx.y = margin;
  drawHeader(ctx);
  microLabel(ctx, "Appendix · your inputs");
  heading(ctx, "Persona snapshot");
  paragraph(ctx, opts.persona.label, { size: 10, color: INK, lead: 4 });
  ctx.y += 4;

  const o = opts.onboarding;
  const rows: [string, string][] = [
    ["Stage", o.stage || "—"],
    ["Country", o.country || "—"],
    ["Geographic intent", o.geographicIntent ? GEO_INTENT_LABEL[o.geographicIntent] : "—"],
    ["Career archetypes", (o.careerArchetypes ?? []).map((a) => CAREER_ARCHETYPE_LABEL[a]).join(", ") || "—"],
    ["Sources of meaning", (o.meaningTop ?? []).map((m) => MEANING_LABEL[m]).join(", ") || "—"],
    ["Work–life balance", `${o.workLifeBalance}/5`],
    ["Willingness to sacrifice", `${o.willingnessToSacrifice}/5`],
    ["Financial priority", `${o.financialPriority}/5`],
    ["Ambition", `${o.ambition}/5`],
    ["Relocation openness", `${o.relocationOpenness}/5`],
  ];
  for (const [k, v] of rows) {
    ensureSpace(ctx, 14);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    setColor(doc, MUTED);
    doc.text(k, margin, ctx.y);
    doc.setFont("helvetica", "normal");
    setColor(doc, INK);
    const lines = doc.splitTextToSize(v, pageW - margin * 2 - 140);
    doc.text(lines, margin + 140, ctx.y);
    ctx.y += Math.max(12, lines.length * 11);
  }

  // Footer on every page
  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    setColor(doc, MUTED);
    doc.text(
      `Generated ${new Date().toLocaleDateString()} · vocare · Personal reference, not medical career advice.`,
      margin,
      pageH - 18,
    );
    doc.text(`${p} / ${total}`, pageW - margin, pageH - 18, { align: "right" });
  }

  return doc;
}
