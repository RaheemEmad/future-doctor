# Vocare — Find Your Calling in Medicine

> A premium psychometric assessment platform that maps cognitive style, emotional resilience, and lifestyle vision to 40+ medical specialties, with Egypt-specific context and training pathways.

## Overview

**Vocare** is a sophisticated web application built for medical students in Egypt and internationally who face one of life's most consequential decisions: choosing a medical specialty. Unlike generic personality assessments, Vocare integrates physician-reviewed psychometric science with the realities of medical training—government vs. private pathways, takleef obligations, fellowship opportunities, Gulf licensing, and family proximity considerations.

The platform was built in collaboration with practising physicians and medical students across Egypt, the Gulf, and the UK, and launched in early access in 2026.

### Key Features

- **12-minute adaptive assessment** that dynamically adjusts complexity based on onboarding traits
- **Real-time insight generation** explaining cognitive-specialty alignment (e.g., "Your tolerance for diagnostic uncertainty suggests affinity for Emergency Medicine over Pathology")
- **40+ medical specialties** with Egypt-specific income, training duration, and migration context
- **Psychometric scoring** across four dimensions:
  - Cognitive style (pattern recognition, procedural vs. analytical, visual-spatial reasoning)
  - Emotional resilience (trauma tolerance, ethical burden, burnout vulnerability)
  - Lifestyle alignment (family priority, schedule tolerance, autonomy, income priority)
  - Identity & values (prestige motivation, leadership preference, delayed gratification)
- **Client-side data processing** — all answers stay on your device (no mandatory cloud storage)
- **Persistent session management** with optional cloud sync via Supabase
- **Shareable results** with PDF export capability
- **Sample results** to explore without taking the full assessment

## Stack

- **Language:** TypeScript (98.2%)
- **Framework:** TanStack Start with React 19
- **Styling:** Tailwind CSS 4 with custom design system
- **UI Components:** Radix UI + shadcn/ui (complete component library)
- **Router:** TanStack React Router (file-based routing)
- **Backend:** Nitro (SSR-capable, Cloudflare-ready)
- **Database:** Supabase (PostgreSQL + Auth)
- **AI Integration:** Vercel AI SDK (OpenAI-compatible models)
- **Forms:** React Hook Form + Zod validation
- **Animations:** Framer Motion
- **Charts:** Recharts (radar/comparison visualizations)
- **PDF Export:** jsPDF
- **Package Manager:** Bun

## How It's Organized

```
src/
  routes/               File-based routing (TanStack Start conventions)
    __root.tsx         App shell & error boundaries
    index.tsx          Landing page with methodology overview
    onboarding.tsx     Initial persona discovery (6 questions)
    assessment.tsx     Main adaptive questionnaire (40-60 questions)
    results.tsx        Detailed specialty matching & insights
    compare.tsx        Side-by-side specialty comparison
    specialties.tsx    Searchable directory of all 40+ specialties
    sources.tsx        Bibliography of psychometric research
    saved.tsx          User's saved assessments
    privacy.tsx        GDPR/privacy policy
    auth.tsx           Authentication & login
    
  lib/
    types.ts           Core TypeScript interfaces (SpecialtyMatch, SessionState)
    questions.ts       ~100 questions organized by category
    specialties.ts     40+ specialty profiles with trait mappings
    persona.ts         Onboarding track determination logic
    scoring.ts         Psychometric aggregation & specialty matching
    scoring.functions.ts Server-side scoring (optional verification)
    enrichment.ts      AI-powered insight generation via LLM
    session.ts         LocalStorage session serialization
    analytics.ts       Event tracking (assessment start/complete, question timing)
    cloud-sync.ts      Supabase integration for optional persistence
    pdf.ts             PDF generation for results export
    auth.ts            Supabase Auth helpers
    
  components/
    site-chrome.tsx    Navigation & footer (SiteNav, SiteFooter)
    question-glyph.tsx Category icons for each question type
    reading-aids.tsx   Accessibility features (ReadingProgress, BackToTop)
    ui/                Radix UI + shadcn/ui component wrappers
    
  integrations/        Third-party service connectors
  hooks/              Custom React hooks
  
  styles.css          Tailwind config & custom CSS variables
  router.tsx          Router initialization
  server.ts           SSR error handler wrapping
  start.ts           Application entry point
```

### Runtime Flow

1. **Landing** (`index.tsx`) — Hero, methodology cards, sample question, testimonials
2. **Onboarding** (`onboarding.tsx`) — 6 quick questions to derive a "track" (e.g., "clinical procedural", "research-oriented")
3. **Assessment** (`assessment.tsx`) — 40–60 adaptive questions matched to track; tracks time-per-question and supports backtracking
4. **Scoring** — Aggregates answers into trait vectors; optionally verifies with server (Nitro + OpenAI-compatible); falls back to local if offline
5. **Results** (`results.tsx`) — Ranked specialty matches with radar charts, insight narratives, confidence scores, and delta comparisons
6. **Enrichment** — AI-powered explanations of why specialties rank high/low for this user
7. **Share** — Export as PDF, save session to cloud, or share a public link

Session state persists in localStorage; users can optionally sync to Supabase for cross-device access.

## How to Run It

### Prerequisites

- **Node.js 18+** or **Bun** (recommended)
- Environment variables (see `.env` example)

### Development

```bash
# Install dependencies with Bun
bun install

# Start dev server (Vite + TanStack Start)
bun run dev

# Open http://localhost:5173
```

### Build & Preview

```bash
# Build for production
bun run build

# Preview production build
bun run preview
```

### Linting & Formatting

```bash
# Lint with ESLint
bun run lint

# Format with Prettier
bun run format
```

### Environment Variables

Copy `.env` and configure:

```env
# Supabase (required for cloud sync, auth, and AI enrichment)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key

# Server-side Supabase (for secure API calls)
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=... # server-only

# AI Gateway (optional; for LLM-powered insights)
VITE_AI_GATEWAY_URL=https://api.your-gateway.com
```

## Architecture Highlights

### Psychometric Engine

- **`scoring.ts`** — Trait aggregation using a weighted schema:
  - Maps 4 onboarding answers → 5 "tracks" (personas)
  - Aggregates 40+ question responses into trait vectors
  - Normalizes vectors against 40+ specialty trait profiles
  - Ranks specialties by cosine similarity
  - Computes confidence intervals (top vs. runner-up)

### Adaptive Assessment

- **`persona.ts`** — Determines which question subset to show based on track
- **`assessment.tsx`** — Question navigation with mid-point checkpoint ("You're halfway there")
- Tracks time-per-question for analytics
- Supports jumping to any answered question via rewind strip

### Offline-First

- All session state in localStorage
- Questions, specialties, and trait mappings bundled at build time
- Scoring works entirely client-side (no required server call)
- Server call to `computeResult` is optional; gracefully falls back to local

### AI Enrichment

- **`enrichment.ts`** — Calls OpenAI-compatible LLM to generate narrative explanations
- Examples:
  - "Your tolerance for diagnostic uncertainty suggests a higher affinity for Emergency Medicine over Pathology."
  - "You prioritize autonomy and family time; General Practice aligns well; Surgery ranks lower due to overnight call burden."

### Analytics

- **`analytics.ts`** — Tracks:
  - Assessment start (with total question count)
  - Question answered (index, question ID, time spent)
  - Assessment complete (total time, top specialty, local vs. server scoring)
  - Abandon beacon (via navigator.sendBeacon if user closes tab mid-assessment)

## Development Status

**Early Access (2026)**

- ✅ Core psychometric engine (trait aggregation, specialty matching)
- ✅ Adaptive assessment framework
- ✅ Landing, onboarding, results, and specialty pages
- ✅ PDF export & result sharing
- ✅ Supabase auth & cloud sync
- ✅ Analytics & error tracking
- ✅ Mobile-responsive design (Tailwind)
- ✅ 500+ beta testers across 12 Egyptian universities
- 🔄 Multi-language support (future)
- 🔄 Mobile app (future)
- 🔄 Integration with medical school matching algorithms (future)

## Try Asking

- **"How does the adaptive assessment adjust question difficulty?"**  
  See `persona.ts:getActiveQuestions()` and `assessment.tsx` for conditional question selection.

- **"Where is the specialty data sourced and how is it curated?"**  
  Explore `src/lib/specialties.ts` for the full 40+ specialty profiles, including trait vectors, income ranges, and Egypt-specific training context.

- **"How are psychometric scores validated?"**  
  See `src/lib/scoring.ts` for the trait-aggregation algorithm, and `src/routes/results.tsx` for confidence interval calculation.

---

**Built with care for medical students deciding their future.**  
*Privacy-first. Physician-reviewed. Egypt-aware.*
