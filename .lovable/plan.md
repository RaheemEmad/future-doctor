# Vocare — Deferred Scope Plan

Three items scoped out for a follow-up round. Written now so we don't lose the thread.

## 1. Server-side scoring & anti-manipulation

**Why**: `src/lib/scoring.ts` runs entirely in the browser today. A determined user
can open devtools, edit `localStorage`, and forge any "top match". For a product
that wants credibility with counselors/institutions, results must be reproducible
from the server.

**Path**:

1. Move `aggregateTraits` + `score` into `src/lib/scoring.server.ts` (pure, no
   browser deps). Keep the current file as a thin re-export for the shared
   `Choice`/`Trait` types only.
2. New server fn `src/lib/scoring.functions.ts`:
   ```ts
   export const computeResult = createServerFn({ method: "POST" })
     .inputValidator(z.object({ onboarding: OnboardingSchema, answers: AnswersSchema }).parse)
     .handler(async ({ data }) => {
       const traits = aggregateTraits(materializeChoices(data.answers));
       return score(traits, data.onboarding, materializeChoices(data.answers));
     });
   ```
   Zod-validate every field. Reject unknown question IDs / choice indices.
3. `assessment.tsx` submits answers → calls `computeResult` → writes the
   server-returned `result` into session. Client-side `score()` becomes a
   preview-only fallback for offline (marked as such in UI).
4. For signed-in users, store the canonical result server-side in a new
   `assessment_results` table keyed by (user_id, run_id) with RLS. Share links
   for signed-in users resolve to the row; anonymous share links stay
   URL-encoded as today (documented trade-off: forgeable, but no PII).
5. Add a lightweight signed token (`HMAC(SUPABASE_JWT_SECRET, run_id + top_id + score)`)
   to results the client renders, so `/results?s=...` from an authenticated user
   can be verified as untampered.

**Risk**: Adds a network dep on the results page. Mitigate with optimistic
render from local `score()` + a "verified ✓" pill once the server round-trip
completes.

## 2. Step-level analytics + funnel drop-off

**Why**: We have no idea where users abandon. Onboarding step 3? Question 9?
Right before Save? Without this, every UX change is a guess.

**Path**:

1. Pick a cookieless provider — leaning **Plausible Cloud** for
   `future-doctor.lovable.app` (no self-host burden, EU-hosted, no PII). Fallback:
   **Umami self-hosted** if we later want full data ownership.
2. Wire the `<script>` in `src/routes/__root.tsx` head(), gated by a
   `VITE_ANALYTICS_ENABLED` env flag so preview builds stay silent.
3. Flesh out `src/lib/analytics.ts` — the `track()` helper is already stubbed.
   Replace the `console.debug` with `window.plausible?.(event, { props })`.
4. Emit these events (canonical names, snake_case):
   - `onboarding_start`, `onboarding_step_complete` (props: `step`, `field`)
   - `assessment_start`, `assessment_question_answered` (props: `index`, `question_id`, `time_on_step_ms`)
   - `assessment_abandoned` (via `visibilitychange` + `sendBeacon`, props: `last_index`)
   - `assessment_complete` (props: `duration_ms`, `top_match_id`)
   - `result_viewed`, `result_saved`, `result_shared`, `result_exported`, `result_ai_summary_generated`
   - `auth_magic_link_requested`, `auth_signed_in`
   - `specialty_filter_changed`, `sample_result_viewed`
5. Add a **funnel goal** in Plausible: `/onboarding → /assessment → /results → result_saved`.
6. Update `/privacy` to disclose Plausible, cookieless nature, and the event list.
   Add an opt-out link (`window.localStorage.setItem('plausible_ignore','true')`).

**Trade-off vs "stub now"**: Turning this on means the "no analytics" line on
`/privacy` goes away. Worth it for the funnel visibility; needs a copy update
the same turn.

## 3. Migration path beyond Lovable

**Why**: If we outgrow Lovable Cloud (custom edge logic, background jobs,
non-TanStack stack), we need to know what's portable and what's locked in.

**What's already portable** (no vendor coupling):
- All React components, routes, styles, `scoring.ts`, `questions.ts`,
  `specialties.ts`, `persona.ts`, `share.ts`, `pdf.ts`. Pure TS.
- Supabase schema + RLS policies (already versioned in `supabase/migrations/`).
  Any Postgres host runs them.
- Auth (magic link) — standard Supabase Auth, self-hostable via Supabase OSS.

**What's Lovable-specific**:
- `src/integrations/supabase/client.server.ts`, `auth-middleware.ts`,
  `auth-attacher.ts` — auto-generated. Replaceable with hand-written equivalents
  in ~50 lines.
- `.lovable.dev/v1` AI Gateway (used in `ai-gateway.server.ts`). Migrate to
  direct provider (Google Gemini API, OpenAI, Anthropic) — same OpenAI-compat
  SDK, swap `baseURL` + auth header.
- `.lovable.cloud` proxy for Supabase URL. Migrate by pointing
  `SUPABASE_URL` to the direct `*.supabase.co` origin.
- TanStack Start on Cloudflare Workers — portable to Vercel/Netlify/self-host
  with a build config change. `createServerFn` stays; `src/routes/api/public/*`
  server routes stay.

**Concrete exit checklist** (est. 1-2 dev days):
1. `pg_dump` Supabase → import into self-hosted Postgres or Neon.
2. Copy service role key + JWT secret env vars to new host.
3. Regenerate `src/integrations/supabase/types.ts` via `supabase gen types`.
4. Rewrite `client.server.ts` (10 lines) + `auth-middleware.ts` (~30 lines) by
   hand. Delete the `attachSupabaseAuth` generated attacher; replace with a
   local `functionMiddleware` that reads `supabase.auth.getSession()`.
5. Point `VITE_SUPABASE_URL` / `SUPABASE_URL` to the direct origin.
6. Swap `createLovableAiGatewayProvider` in `ai-gateway.server.ts` for
   `createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY })`.
7. `bun run build` → deploy to Cloudflare Workers (or Vercel, changing the
   `nitro` preset in `vite.config.ts`).

**Hard blockers**: none identified. The stack is intentionally boring
(TanStack + Supabase + OpenAI-compat) so nothing is a one-way door.
