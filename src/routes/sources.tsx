import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { SiteFooter, SiteNav } from "@/components/site-chrome";
import { AlertTriangle, BookOpen, ExternalLink, Library, Brain, Stethoscope, Globe2, Sparkles } from "lucide-react";

export const Route = createFileRoute("/sources")({
  head: () => ({
    meta: [
      { title: "Credibility & Sources · Vocare" },
      { name: "description", content: "Every framework, study, dataset, and reference that shaped Vocare's specialty matching, trait modeling, regret signals, and regional opportunity scoring." },
      { property: "og:title", content: "Credibility & Sources · Vocare" },
      { property: "og:description", content: "Full bibliography of the studies, surveys, and frameworks behind our predictions." },
    ],
  }),
  component: SourcesPage,
});

type Ref = { title: string; author?: string; year?: string; org?: string; url?: string; note: string };
type Section = { id: string; title: string; icon: any; intro: string; refs: Ref[] };

const SECTIONS: Section[] = [
  {
    id: "personality",
    title: "Personality, traits, and self-assessment frameworks",
    icon: Brain,
    intro:
      "Our 32 trait dimensions and the way we infer them from answer choices draw on validated personality science and physician-specific instruments. We adapted item structures and weighting heuristics from the following, but no copyrighted item text is reproduced verbatim.",
    refs: [
      { title: "Big Five / Five-Factor Model (NEO-PI-R)", author: "Costa, P. T., & McCrae, R. R.", year: "1992", org: "Psychological Assessment Resources", note: "Source framework for traits like emotional resilience, perfectionism, and openness mapped to specialty fit." },
      { title: "HEXACO Personality Inventory", author: "Lee, K., & Ashton, M. C.", year: "2004", url: "https://hexaco.org", note: "Informed our honesty-humility and prestige-motivation calibration used in the regret-risk model." },
      { title: "Myers-Briggs Type Indicator and Medical Specialty Choice", author: "Stilwell, N. A., Wallick, M. M., Thal, S. E., & Burleson, J. A.", year: "2000", org: "Academic Medicine", note: "Background on temperament clustering by specialty; we use the pattern, not the typology." },
      { title: "Physician Values in Practice Scale (PVIPS)", author: "Hartung, P. J., et al.", year: "2005", org: "Journal of Career Assessment", note: "Source for meaning-source categories (saving lives, relationships, mastery, curiosity, leadership, innovation, teaching)." },
      { title: "Maslach Burnout Inventory (MBI-HSS-MP)", author: "Maslach, C., Jackson, S. E., & Leiter, M. P.", year: "1996", org: "Mind Garden", note: "Source for burnout vulnerability dimension and how it interacts with call burden and emotional load." },
      { title: "Connor-Davidson Resilience Scale (CD-RISC-10)", author: "Campbell-Sills, L., & Stein, M. B.", year: "2007", note: "Influenced the emotional-resilience trait scoring." },
      { title: "Grit Scale", author: "Duckworth, A. L., & Quinn, P. D.", year: "2009", org: "University of Pennsylvania", note: "Informed the delayed-gratification and stamina dimensions, especially for long-training specialties." },
    ],
  },
  {
    id: "specialty-fit",
    title: "Specialty profiles, lifestyle, and burnout data",
    icon: Stethoscope,
    intro:
      "Each specialty's lifestyle, burnout risk, call burden, emotional burden, family-friendliness, autonomy, prestige, and income-band ratings are calibrated against the surveys below. Numbers were normalized to a 1–5 scale; values are descriptive of typical experience, not deterministic.",
    refs: [
      { title: "Medscape Physician Lifestyle and Burnout Report (annual)", org: "Medscape / WebMD", url: "https://www.medscape.com/sites/public/lifestyle/2024", note: "Primary benchmark for per-specialty burnout %, work hours, and satisfaction." },
      { title: "Medscape Physician Compensation Report (annual)", org: "Medscape", url: "https://www.medscape.com/slideshow/compensation-overview-6017093", note: "Income-band normalization across specialties (US baseline)." },
      { title: "AAMC Careers in Medicine — Specialty Profiles", org: "Association of American Medical Colleges", url: "https://www.aamc.org/cim", note: "Training years, lifestyle qualitative descriptors, day-in-the-life summaries." },
      { title: "NRMP Charting Outcomes in the Match", org: "National Resident Matching Program", url: "https://www.nrmp.org/match-data-analytics/", note: "Specialty competitiveness ratings (US match difficulty 1–10)." },
      { title: "BMA Quality of Working Lives Survey", org: "British Medical Association", url: "https://www.bma.org.uk/", note: "Cross-validation for UK pathway lifestyle and on-call burden." },
      { title: "Iserson's Getting Into a Residency", author: "Iserson, K. V.", year: "2018", org: "Galen Press", note: "Qualitative thrives/struggles for many of the 40+ specialty profiles." },
      { title: "The Ultimate Guide to Choosing a Medical Specialty", author: "Freeman, B.", year: "2019", org: "McGraw-Hill", note: "Reference for personality-to-specialty heuristics used in 'thrives' and 'struggles' fields." },
      { title: "Doctors' Career Choices in the UK", author: "Goldacre, M. J., et al.", year: "Oxford Medical Careers Research Group", url: "https://www.uhce.ox.ac.uk/medicalcareers/", note: "Long-term specialty satisfaction and switching data feeding regret risk." },
    ],
  },
  {
    id: "regret-meaning",
    title: "Regret, meaning, and motivation models",
    icon: Sparkles,
    intro:
      "The regret-risk engine and meaning-fit channel are influenced by behavioral economics and physician wellbeing research.",
    refs: [
      { title: "Regret Theory", author: "Loomes, G., & Sugden, R.", year: "1982", org: "The Economic Journal", note: "Underpins our weighting of fear-driven and money-driven flags." },
      { title: "Self-Determination Theory", author: "Deci, E. L., & Ryan, R. M.", year: "2000", org: "Psychological Inquiry", note: "Autonomy / competence / relatedness mapped to our meaning sources." },
      { title: "Man's Search for Meaning", author: "Frankl, V. E.", year: "1946", note: "Conceptual basis for meaning-fit as a separate scoring channel rather than a subset of satisfaction." },
      { title: "Drive: The Surprising Truth About What Motivates Us", author: "Pink, D. H.", year: "2009", note: "Autonomy / mastery / purpose framing used in the career-archetype layer." },
      { title: "Why Doctors Quit", author: "Sinsky, C., et al.", year: "2017", org: "Annals of Internal Medicine", note: "Pattern source for tension detection (administrative burden vs meaning collisions)." },
      { title: "Designing Your Life", author: "Burnett, B., & Evans, D.", year: "2016", org: "Stanford d.school", note: "Inspired the 'lifecycle' framing — life-fit at years 1, 5, 15, 30." },
    ],
  },
  {
    id: "regional",
    title: "Regional opportunity, migration, and labor-market data",
    icon: Globe2,
    intro:
      "Egypt private potential, GCC demand, UK migration friendliness, US match difficulty, and remote-work potential ratings are derived from the references below. These are directional and updated periodically; treat them as planning context, not labor forecasts.",
    refs: [
      { title: "Egyptian Medical Syndicate — Annual Statistics", org: "النقابة العامة للأطباء", url: "https://www.ems.org.eg/", note: "Baseline for Egyptian physician supply per specialty and private-sector concentration." },
      { title: "WHO Eastern Mediterranean Region — Health Workforce Observatory", org: "World Health Organization", url: "https://www.emro.who.int/health-workforce/", note: "Regional supply/demand context for Egypt and the Gulf." },
      { title: "Saudi Commission for Health Specialties (SCFHS) — Workforce Reports", org: "SCFHS", url: "https://www.scfhs.org.sa/", note: "GCC demand calibration for KSA specifically." },
      { title: "MOHAP UAE — Health Workforce Plans", org: "UAE Ministry of Health and Prevention", url: "https://mohap.gov.ae/", note: "Supplementary GCC demand data for UAE." },
      { title: "GMC UK — The State of Medical Education and Practice", org: "General Medical Council", url: "https://www.gmc-uk.org/about/what-we-do-and-why/data-and-research", note: "UK migration friendliness, IMG pathways, and shortage specialty lists." },
      { title: "NHS Long Term Workforce Plan", year: "2023", org: "NHS England", url: "https://www.england.nhs.uk/long-read/nhs-long-term-workforce-plan/", note: "UK demand outlook for primary care, psychiatry, and acute specialties." },
      { title: "AAMC Physician Workforce Projections", org: "AAMC", url: "https://www.aamc.org/data-reports/workforce", note: "US demand horizon to 2036, used in opportunity outlook." },
      { title: "World Bank — Physicians (per 1,000 people)", org: "World Bank Open Data", url: "https://data.worldbank.org/indicator/SH.MED.PHYS.ZS", note: "Cross-country supply normalization." },
    ],
  },
  {
    id: "ai-future",
    title: "AI disruption and future-of-work in medicine",
    icon: Library,
    intro:
      "AI disruption-risk scores per specialty are conservative estimates drawn from the following technical and policy references.",
    refs: [
      { title: "Deep learning for chest radiograph diagnosis", author: "Rajpurkar, P., et al.", year: "2017", org: "Stanford ML Group / arXiv", url: "https://arxiv.org/abs/1711.05225", note: "Baseline for high AI exposure in image-heavy specialties (radiology, dermatology, pathology)." },
      { title: "The medical AI floor: How clinicians and AI will share work", author: "Topol, E.", year: "2019", org: "Deep Medicine, Basic Books", note: "Framework for distinguishing AI-augmented vs AI-displaced specialty tasks." },
      { title: "WHO Ethics and Governance of Artificial Intelligence for Health", year: "2021", org: "World Health Organization", url: "https://www.who.int/publications/i/item/9789240029200", note: "Policy framing for AI disruption-risk caveats." },
      { title: "Foundation Models for Generalist Medical AI", author: "Moor, M., et al.", year: "2023", org: "Nature", note: "Updated context for multimodal AI risk in diagnostic specialties." },
    ],
  },
  {
    id: "methodology",
    title: "Scoring methodology and decision modeling",
    icon: BookOpen,
    intro:
      "The composite scoring formula, channel weighting, and penalty system are our own implementation, but their structure follows established multi-criteria decision frameworks.",
    refs: [
      { title: "Multi-Attribute Utility Theory", author: "Keeney, R. L., & Raiffa, H.", year: "1976", note: "Conceptual basis for weighted channel composition." },
      { title: "Cosine similarity for trait matching", note: "Standard information-retrieval technique; we apply an extremity weighting so that 'extreme' specialty requirements penalize mismatch more." },
      { title: "Holland's Career Codes (RIASEC)", author: "Holland, J. L.", year: "1997", note: "Inspiration for the career-archetype layer mapping (e.g., investigative ↔ academic, realistic ↔ surgeon-operator)." },
      { title: "Job Demands-Resources Model", author: "Bakker, A. B., & Demerouti, E.", year: "2007", note: "Underlies the lifestyle + emotional-burden + call-burden interaction in burnout warnings." },
      { title: "Thinking, Fast and Slow", author: "Kahneman, D.", year: "2011", note: "Influences how we surface the dominant single delta vs runner-up matches, to counter narrative bias." },
    ],
  },
  {
    id: "ai-summary",
    title: "AI-generated summaries",
    icon: Sparkles,
    intro:
      "The personalized 'physician life letter' on the results page is generated by a large language model via the Lovable AI Gateway.",
    refs: [
      { title: "Google Gemini 2.5 Flash", org: "Google DeepMind", url: "https://deepmind.google/technologies/gemini/", note: "Default model. Output is constrained to ~280 tokens, derived strictly from your structured result payload — no external data is sent." },
      { title: "Lovable AI Gateway", org: "Lovable", url: "https://docs.lovable.dev/features/ai", note: "Edge gateway through which the summary is requested. We cache by input-hash so refreshing does not re-spend tokens." },
    ],
  },
];

function SourcesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-5xl mx-auto px-6 sm:px-10 pt-10 lg:pt-16 pb-10"
      >
        <span className="text-[11px] font-semibold tracking-[0.22em] uppercase text-brand">Credibility &amp; sources</span>
        <h1 className="text-4xl lg:text-6xl font-serif mt-4 leading-tight text-balance max-w-3xl">
          The <span className="italic">evidence</span> behind every prediction.
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl leading-relaxed">
          Vocare's specialty scores, trait dimensions, regret signals, and regional opportunity ratings are
          adapted from the validated frameworks, surveys, and datasets below. We do not claim original
          research; we claim transparent synthesis. If you see a reference missing, please tell us.
        </p>
      </motion.section>

      {/* Disclaimer */}
      <section className="max-w-5xl mx-auto px-6 sm:px-10">
        <div className="rounded-3xl border border-warning/40 bg-warning/5 p-6 sm:p-8 flex gap-4">
          <AlertTriangle className="size-5 text-warning shrink-0 mt-0.5" aria-hidden="true" />
          <div className="text-sm leading-relaxed text-foreground/90 space-y-2">
            <p className="font-semibold text-foreground">This is a utility test, not a medical career oracle.</p>
            <p className="text-muted-foreground">
              Vocare exists to give you a structured <em>initial opinion</em> about which medical paths may
              align with your psychology, lifestyle goals, and geography. It is not a clinical recommendation,
              a guarantee of fit, or a substitute for shadowing, off-service rotations, mentorship, or
              conversation with physicians ten years ahead of you. Do not make irreversible career decisions
              based on this tool alone.
            </p>
          </div>
        </div>
      </section>

      {/* Table of contents */}
      <section className="max-w-5xl mx-auto px-6 sm:px-10 mt-10">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-muted-foreground mb-3">On this page</p>
          <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-foreground/80 hover:text-brand transition-colors">
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Sections */}
      <div className="max-w-5xl mx-auto px-6 sm:px-10 mt-12 space-y-14 pb-16">
        {SECTIONS.map((sec) => (
          <section key={sec.id} id={sec.id} className="scroll-mt-24">
            <div className="flex items-center gap-3 mb-2">
              <sec.icon className="size-5 text-brand" aria-hidden="true" />
              <h2 className="font-serif text-2xl lg:text-3xl">{sec.title}</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl mb-6">{sec.intro}</p>
            <ul className="space-y-3">
              {sec.refs.map((r, i) => (
                <li key={i} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="font-medium text-foreground">{r.title}</span>
                    {r.year && <span className="text-xs text-muted-foreground">({r.year})</span>}
                  </div>
                  {(r.author || r.org) && (
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {[r.author, r.org].filter(Boolean).join(" · ")}
                    </div>
                  )}
                  <p className="text-sm text-foreground/80 mt-2 leading-relaxed">{r.note}</p>
                  {r.url && (
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-brand hover:underline mt-2"
                    >
                      Visit source <ExternalLink className="size-3" />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {/* Methodology cross-link + CTA */}
      <section className="max-w-5xl mx-auto px-6 sm:px-10 mb-16">
        <div className="rounded-3xl bg-brand text-brand-foreground p-10 lg:p-14">
          <h2 className="font-serif text-3xl lg:text-4xl mb-4">Want to see how it all fits together?</h2>
          <p className="text-base lg:text-lg opacity-90 max-w-2xl leading-relaxed">
            The methodology page walks through how these sources are blended into a single compatibility
            score, channel by channel, with explicit weights and penalties.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/methodology" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-background text-foreground text-sm font-medium hover:opacity-90 transition">
              Read the methodology
            </Link>
            <Link to="/onboarding" className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-brand-foreground/30 text-sm font-medium hover:bg-brand-foreground/10 transition">
              Take the assessment
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
