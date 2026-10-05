export const PAYMENT = {
  priceEgp: 350,
  instapayNumber: "+201018385093",
  notePrefix: "Vocare",
} as const;

export function paymentNote(first: string, last: string) {
  const name = `${first} ${last}`.trim();
  return `${PAYMENT.notePrefix} - ${name || "First & Last name"}`;
}

const CLAIM_KEY = "vocare_payment_claim_v1";

export type StoredClaim = { id: string; status: "pending" | "approved" | "rejected" };

export function loadClaim(): StoredClaim | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CLAIM_KEY);
    return raw ? (JSON.parse(raw) as StoredClaim) : null;
  } catch {
    return null;
  }
}

export function storeClaim(c: StoredClaim) {
  try { window.localStorage.setItem(CLAIM_KEY, JSON.stringify(c)); } catch { /* noop */ }
}

export function clearClaim() {
  try { window.localStorage.removeItem(CLAIM_KEY); } catch { /* noop */ }
}
