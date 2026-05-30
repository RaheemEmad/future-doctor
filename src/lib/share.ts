import type { OnboardingData } from "./types";

export type SharePayload = {
  o: OnboardingData;
  a: Record<string, number>; // questionId -> chosen index
  v: 2;
};

function toB64Url(s: string): string {
  if (typeof window === "undefined") {
    return Buffer.from(s, "utf-8").toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  const b = btoa(unescape(encodeURIComponent(s)));
  return b.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64Url(s: string): string {
  const padded = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
  if (typeof window === "undefined") {
    return Buffer.from(padded, "base64").toString("utf-8");
  }
  return decodeURIComponent(escape(atob(padded)));
}

export function encodeShare(payload: SharePayload): string {
  return toB64Url(JSON.stringify(payload));
}

export function decodeShare(token: string): SharePayload | null {
  try {
    const parsed = JSON.parse(fromB64Url(token)) as SharePayload;
    if (!parsed || !parsed.o || !parsed.a) return null;
    return parsed;
  } catch {
    return null;
  }
}
