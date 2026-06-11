import LZString from "lz-string";
import type { OnboardingData } from "./types";

export type SharePayload = {
  o: OnboardingData;
  a: Record<string, number>; // questionId -> chosen index
  v: 2;
};

export function encodeShare(payload: SharePayload): string {
  return LZString.compressToEncodedURIComponent(JSON.stringify(payload));
}

export function decodeShare(token: string): SharePayload | null {
  try {
    // New compressed format
    const json = LZString.decompressFromEncodedURIComponent(token);
    if (json) {
      const parsed = JSON.parse(json) as SharePayload;
      if (parsed && parsed.o && parsed.a) return parsed;
    }
  } catch {
    /* fall through to legacy */
  }

  // Legacy base64url format (older share links)
  try {
    const padded = token.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((token.length + 3) % 4);
    const raw =
      typeof window === "undefined"
        ? Buffer.from(padded, "base64").toString("utf-8")
        : decodeURIComponent(escape(atob(padded)));
    const parsed = JSON.parse(raw) as SharePayload;
    if (!parsed || !parsed.o || !parsed.a) return null;
    return parsed;
  } catch {
    return null;
  }
}
