// Analytics stub. No network calls today. Cookieless by design.
// To enable Plausible later:
//   1. Add `<script defer data-domain="future-doctor.lovable.app" src="https://plausible.io/js/script.js" />`
//      to src/routes/__root.tsx head().
//   2. Uncomment the window.plausible call below.
//   3. Disclose it on /privacy.

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, unknown> }) => void;
  }
}

export function track(event: string, props?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  // window.plausible?.(event, props ? { props } : undefined);
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.debug("[analytics]", event, props ?? {});
  }
}
