// Privacy-friendly analytics. Cookieless. No PII.
// Off by default — set VITE_ANALYTICS_ENABLED=true and load a Plausible-compatible
// script from src/routes/__root.tsx to start reporting. Until then, `track()`
// buffers events in memory and mirrors them to the console in dev.

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, unknown>; callback?: () => void }) => void;
    __vocare_analytics_buffer?: Array<{ event: string; props?: Record<string, unknown>; ts: number }>;
  }
}

const ENABLED = typeof window !== "undefined" && import.meta.env.VITE_ANALYTICS_ENABLED === "true";
const OPT_OUT_KEY = "plausible_ignore";

function optedOut() {
  if (typeof window === "undefined") return true;
  try { return window.localStorage.getItem(OPT_OUT_KEY) === "true"; } catch { return false; }
}

export function track(event: string, props?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  if (optedOut()) return;

  const buf = (window.__vocare_analytics_buffer ??= []);
  buf.push({ event, props, ts: Date.now() });
  if (buf.length > 200) buf.splice(0, buf.length - 200);

  if (ENABLED && typeof window.plausible === "function") {
    try { window.plausible(event, props ? { props } : undefined); } catch { /* noop */ }
  } else if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.debug("[analytics]", event, props ?? {});
  }
}

// Onboarding funnel
export const trackOnboardingStart = () => track("onboarding_start");
export const trackOnboardingStepComplete = (step: number, field: string) =>
  track("onboarding_step_complete", { step, field });
export const trackOnboardingComplete = (geo?: string) =>
  track("onboarding_complete", geo ? { geo } : undefined);

// Assessment funnel
export const trackAssessmentStart = (total: number) => track("assessment_start", { total });
export const trackQuestionAnswered = (index: number, questionId: string, timeOnStepMs: number) =>
  track("assessment_question_answered", { index, question_id: questionId, time_on_step_ms: timeOnStepMs });
export const trackAssessmentAbandoned = (lastIndex: number, total: number) =>
  track("assessment_abandoned", { last_index: lastIndex, total });
export const trackAssessmentComplete = (durationMs: number, topId: string, verified: boolean) =>
  track("assessment_complete", { duration_ms: durationMs, top_match_id: topId, verified });

// Results funnel
export const trackResultViewed = (topId: string, shared: boolean) =>
  track("result_viewed", { top_match_id: topId, shared });
export const trackResultSaved = () => track("result_saved");
export const trackResultShared = () => track("result_shared");
export const trackResultExported = (kind: "pdf" | "link") => track("result_exported", { kind });
export const trackAiSummary = () => track("result_ai_summary_generated");

// Discovery
export const trackSpecialtyFilter = (facet: string, query: string) =>
  track("specialty_filter_changed", { facet, has_query: query.length > 0 });
export const trackSampleResultViewed = () => track("sample_result_viewed");
export const trackAuthMagicRequested = () => track("auth_magic_link_requested");
export const trackAuthSignedIn = () => track("auth_signed_in");

// Abandon detection helper — call once on the assessment page.
export function attachAbandonBeacon(getState: () => { lastIndex: number; total: number; completed: boolean }) {
  if (typeof window === "undefined") return () => {};
  const onHide = () => {
    if (document.visibilityState !== "hidden") return;
    const s = getState();
    if (s.completed) return;
    if (s.lastIndex <= 0) return;
    trackAssessmentAbandoned(s.lastIndex, s.total);
  };
  document.addEventListener("visibilitychange", onHide);
  window.addEventListener("pagehide", onHide);
  return () => {
    document.removeEventListener("visibilitychange", onHide);
    window.removeEventListener("pagehide", onHide);
  };
}
