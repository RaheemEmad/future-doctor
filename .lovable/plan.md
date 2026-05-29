
# From Specialty Quiz → Physician Life-Planning System

This plan addresses the feedback in four waves. Each wave is shippable on its own, but they compound. Nothing in the existing assessment is thrown away — we extend the trait model, specialty metadata, onboarding, scoring, and results page.

---

## Wave 1 — Deeper Psychological Layer

**Goal:** capture *why* someone wants medicine, not just *how* they handle it.

1. **Meaning-Source module** (new assessment category, 4–5 questions)
   - New traits: `meaning_saving_lives`, `meaning_relationships`, `meaning_technical_mastery`, `meaning_scientific_curiosity`, `meaning_leadership`, `meaning_innovation`, `meaning_teaching`.
   - Forced-rank question ("If you could only keep two, which?") to avoid everyone scoring high on everything.
   - Each specialty gets a `meaningProfile` vector; scoring adds a `meaningFit` channel (weight ~0.12) into the composite.

2. **Regret Prediction Engine**
   - Tag certain answer choices with `regretFlags`: `prestige_driven`, `family_pressure`, `fear_driven`, `money_driven`, `peer_comparison`.
   - At scoring time, compute `regretRisk = f(flag count, contradiction count, meaning-vs-top-match gap)`.
   - Results page shows a dedicated **Regret Risk** card with a plain-language sentence ("Your answers suggest elevated risk of choosing a specialty that impresses others more than it fulfills you") and the top 2 contributing signals.

3. **Contradiction Detection surfacing**
   - Logic already partially exists in scoring penalties; promote it to a visible **"Tensions in your profile"** panel ("You admire Trauma Surgery, but your lifestyle answers push the opposite direction").

---

## Wave 2 — Career Trajectory Layer

**Goal:** answer "what kind of *physician life* do you want?" — separate from specialty.

1. **New onboarding step: Career Archetype**
   - Single/multi-select from: Master clinician, Academic physician, Surgeon-operator, Researcher, Healthcare executive, Medical educator, Startup founder, Public health leader, Telemedicine physician, Lifestyle physician, Global health physician.
   - Stored on `OnboardingData.careerArchetypes: string[]`.

2. **Specialty → Path map**
   - Each specialty gets `careerPaths: { archetype, label, note }[]`.
     Examples: Psychiatry → [Government Consultant, University Faculty, Private Practice, Addiction, Child, Telepsychiatry, GCC Consultant, UK Consultant].
   - Scoring boosts specialties whose paths intersect the user's chosen archetypes.

3. **Results: "Possible Paths" section** per top match, filtered/highlighted by the user's archetype choice.

---

## Wave 3 — Egypt-Specific Regional Engine

**Goal:** make recommendations actually usable for an Egyptian intern.

1. **New onboarding question: Geographic Intent**
   - Stay in Egypt (gov sector) / Stay in Egypt (private focus) / Gulf / UK / US / Canada/AUS / Undecided.
   - Stored as `OnboardingData.geographicIntent`.

2. **New specialty metadata fields** (1–10 each):
   - `egyptPrivatePotential`, `gccDemand`, `ukMigrationFriendliness`, `usMatchDifficulty` (inverted), `remoteWorkPotential`, `aiDisruptionRisk`, `egyptTakleefAvailability`, `fellowshipPipeline`.
   - Seed values from a small curated table (Derm high private, Pathology low Egypt-private, Psychiatry high opportunity, Radiology high AI-exposure, etc.).

3. **Regional weighting in scoring**
   - Composite gains an `opportunityFit` channel that re-weights based on `geographicIntent`. E.g. Gulf intent → weight `gccDemand` heavily; Stay-private → weight `egyptPrivatePotential`.
   - Results show an **Opportunity Outlook** strip per specialty (4 small bars: Private / Gulf / UK / AI-risk).

---

## Wave 4 — Time-Aware Results

**Goal:** show that specialties feel different at year 1 vs year 30.

1. **Specialty Fit Timeline**
   - Each specialty gets `lifecycle: { year1, year5, year15, year30 }` scores on three axes: lifestyle, fulfillment, financial.
   - Results page: small line chart per top match (Recharts `LineChart`) with the user's likely curve overlay.
   - Caption auto-generated: "Looks great in residency, hardens at 45" vs "Tough early, peaks late".

2. **Future-Market badge** derived from `aiDisruptionRisk` + `remoteWorkPotential`.

---

## Results Page — New Layout

```text
[ Hero: top match + confidence ]
[ Top 5 matches (existing radar) ]
[ NEW: Tensions in your profile ]
[ NEW: Regret Risk card ]
[ NEW: Meaning Source breakdown ]
[ Per-match expanded card ]
   - Thrive / Struggle (existing)
   - NEW: Possible Career Paths (filtered by archetype)
   - NEW: Opportunity Outlook (regional bars)
   - NEW: Lifecycle chart (year 1→30)
[ Avoid list (existing) ]
```

---

## Technical Details

**Files touched / added:**
- `src/lib/types.ts` — extend `Trait` union, `OnboardingData`, `Specialty` (`careerPaths`, regional fields, `lifecycle`, `meaningProfile`), `Choice` (`regretFlags`), `AssessmentResult` (`regretRisk`, `tensions`, `meaningBreakdown`).
- `src/lib/questions.ts` — add Meaning-Source category (~5 Qs) and tag existing choices with `regretFlags`.
- `src/lib/specialties.ts` — backfill new metadata for all 40+ specialties (seed values, curated for Egypt context).
- `src/lib/scoring.ts` — add `meaningFit`, `opportunityFit`, `careerPathBoost`, `regretRisk`, `tensions[]`; rebalance composite weights so existing channels still dominate.
- `src/routes/onboarding.tsx` — 2 new steps (Career Archetype, Geographic Intent).
- `src/routes/results.tsx` — new sections (Regret, Tensions, Meaning, Paths, Opportunity, Lifecycle).
- `src/components/results/` — new small components: `RegretCard`, `TensionsPanel`, `MeaningBreakdown`, `CareerPaths`, `OpportunityOutlook`, `LifecycleChart`.
- Bump `STORAGE_KEY` to `aequitas:session:v2` so stale sessions don't break the new shape.

**Backwards compatibility:** session migration drops old `v1` and restarts onboarding rather than attempting field-by-field migration — simpler and safer given the schema growth.

**Out of scope (explicitly):** OpenAI-generated narrative summaries, Supabase persistence, auth, sharing — keep this round purely client-side and deterministic so the new logic is auditable.

---

## Suggested Build Order

1. Wave 1 (Meaning + Regret + Tensions) — biggest psychological lift, smallest surface change.
2. Wave 2 (Career Archetype + Paths) — adds the missing "what kind of physician" layer.
3. Wave 3 (Egypt regional engine) — requires the most data curation; do once structure is stable.
4. Wave 4 (Lifecycle timeline) — polish layer, needs curated `lifecycle` data per specialty.

Approve all four, or tell me to ship Wave 1 first and revisit.
