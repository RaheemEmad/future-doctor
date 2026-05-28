import type { AssessmentResult, Choice, OnboardingData } from "./types";

const STORAGE_KEY = "aequitas:session:v1";

export type SessionState = {
  onboarding?: OnboardingData;
  answers: Record<string, number>; // questionId -> choice index
  result?: AssessmentResult;
};

function safeStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function loadSession(): SessionState {
  const s = safeStorage();
  if (!s) return { answers: {} };
  try {
    const raw = s.getItem(STORAGE_KEY);
    if (!raw) return { answers: {} };
    return JSON.parse(raw) as SessionState;
  } catch {
    return { answers: {} };
  }
}

export function saveSession(state: SessionState) {
  const s = safeStorage();
  if (!s) return;
  try {
    s.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* noop */
  }
}

export function resetSession() {
  const s = safeStorage();
  if (!s) return;
  s.removeItem(STORAGE_KEY);
}

export type AnsweredChoice = Choice & { questionId: string };
