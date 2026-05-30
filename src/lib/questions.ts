import type { Question } from "./types";

// Each choice contributes deltas to traits (0..1 mapping after normalization).
// Values are treated as "raw observations". The scoring engine averages them per trait.

export const QUESTIONS: Question[] = [
  // Emotional Resilience
  {
    id: "er_1",
    category: "Emotional Resilience",
    prompt: "After a high-stakes outcome that did not go well, what does the next 24 hours look like inside you?",
    helper: "Choose what is most honest, not most admirable.",
    choices: [
      { label: "I deconstruct it analytically to prevent recurrence.", traits: { analytical: 0.9, emotional_resilience: 0.8, perfectionism: 0.7 } },
      { label: "I need solitude to emotionally decompress.", traits: { introversion: 0.8, sensitivity: 0.8, emotional_resilience: 0.5 } },
      { label: "I pivot to the next task to maintain momentum.", traits: { emotional_resilience: 0.9, focus_style: 0.8, stamina: 0.8 } },
      { label: "I ruminate, sometimes for days.", traits: { sensitivity: 0.9, burnout_vulnerability: 0.85, emotional_resilience: 0.2 } },
      { label: "I talk it through with someone I trust.", traits: { communication: 0.7, empathy: 0.7, emotional_resilience: 0.6 } },
    ],
  },
  {
    id: "er_2",
    category: "Trauma & Stress Tolerance",
    prompt: "Witnessing prolonged suffering at work most likely makes you…",
    choices: [
      { label: "Steady and useful; I lock in.", traits: { emotional_resilience: 0.95, death_comfort: 0.9, ethical_burden_tolerance: 0.9 } },
      { label: "Functional, but it builds up under the surface.", traits: { sensitivity: 0.7, burnout_vulnerability: 0.7, emotional_resilience: 0.5 } },
      { label: "I cope better through structured action than reflection.", traits: { procedural: 0.7, focus_style: 0.7, emotional_resilience: 0.7 } },
      { label: "Eventually depleted; I need recovery rituals.", traits: { burnout_vulnerability: 0.85, sensitivity: 0.7, emotional_resilience: 0.4 } },
    ],
  },

  // Cognitive Style
  {
    id: "cs_1",
    category: "Cognitive Style",
    prompt: "Which mental texture feels most like home?",
    choices: [
      { label: "Slow, layered reasoning over a single complex case.", traits: { analytical: 0.9, patience: 0.9, focus_style: 0.2, specialized_vs_broad: 0.7 } },
      { label: "Rapid pattern recognition across many short encounters.", traits: { focus_style: 0.95, visual_spatial: 0.6, specialized_vs_broad: 0.2 } },
      { label: "Hands-on procedural problem solving.", traits: { procedural: 0.95, visual_spatial: 0.8, stamina: 0.7 } },
      { label: "Conversational, narrative reasoning with people.", traits: { communication: 0.9, empathy: 0.85, patience: 0.8 } },
      { label: "Image-driven, visual diagnostic flow.", traits: { visual_spatial: 0.95, analytical: 0.8, introversion: 0.7 } },
    ],
  },
  {
    id: "cs_2",
    category: "Chaos vs Predictability",
    prompt: "A perfect Tuesday at work would feel…",
    choices: [
      { label: "Highly predictable, repetition I can master.", traits: { routine_preference: 0.95, lifestyle_balance: 0.7, focus_style: 0.2 } },
      { label: "Mostly structured with a couple of curveballs.", traits: { routine_preference: 0.55, focus_style: 0.5 } },
      { label: "Unpredictable but bounded by a shift.", traits: { risk_tolerance: 0.8, focus_style: 0.85, chronic_vs_acute: 0.9 } },
      { label: "Fully chaotic — I thrive in unknowns.", traits: { risk_tolerance: 0.95, chronic_vs_acute: 0.95, routine_preference: 0.1, focus_style: 0.95 } },
    ],
  },

  // Procedural vs Analytical
  {
    id: "pa_1",
    category: "Procedural vs Analytical",
    prompt: "Which felt more satisfying in training so far?",
    choices: [
      { label: "Nailing a procedure with my hands.", traits: { procedural: 0.95, visual_spatial: 0.8 } },
      { label: "Cracking a difficult diagnosis with reasoning.", traits: { analytical: 0.95, patience: 0.7 } },
      { label: "Building a patient's trust over months.", traits: { empathy: 0.9, communication: 0.85, patience: 0.8 } },
      { label: "Leading a team through an acute event.", traits: { leadership: 0.9, focus_style: 0.8, emotional_resilience: 0.8 } },
    ],
  },

  // Communication & Social
  {
    id: "cm_1",
    category: "Communication Style",
    prompt: "After a full clinical day with people, you feel…",
    choices: [
      { label: "Energized — people are my fuel.", traits: { social_battery: 0.95, empathy: 0.8, communication: 0.85, introversion: 0.1 } },
      { label: "Satisfied but drained, need quiet to recover.", traits: { social_battery: 0.5, introversion: 0.7, sensitivity: 0.6 } },
      { label: "Depleted — I'd rather work with images or data.", traits: { introversion: 0.95, social_battery: 0.1, analytical: 0.7, visual_spatial: 0.7 } },
    ],
  },
  {
    id: "cm_2",
    category: "Comfort With Death & Suffering",
    prompt: "How comfortable are you sitting with a dying patient and their family?",
    choices: [
      { label: "Very — it feels like sacred work.", traits: { death_comfort: 0.95, empathy: 0.9, ethical_burden_tolerance: 0.95 } },
      { label: "Manageable, but I'd rather not make it my daily life.", traits: { death_comfort: 0.55, empathy: 0.7 } },
      { label: "Difficult — I'd prefer to avoid frequent exposure.", traits: { death_comfort: 0.2, sensitivity: 0.8 } },
    ],
  },

  // Identity & Ego
  {
    id: "id_1",
    category: "Identity & Ego",
    prompt: "How attached is your sense of self to your medical career?",
    choices: [
      { label: "Medicine IS who I am.", traits: { identity_career: 0.95, ambition: 0.9, prestige_motivation: 0.7 } },
      { label: "Important, but one part of me.", traits: { identity_career: 0.6, lifestyle_balance: 0.7 } },
      { label: "It's a meaningful job; my identity lives elsewhere.", traits: { identity_career: 0.2, lifestyle_balance: 0.95, family_priority: 0.85 } },
    ],
  },
  {
    id: "id_2",
    category: "Need For Recognition",
    prompt: "Recognition and prestige in your specialty matters to you…",
    choices: [
      { label: "A lot — being respected fuels me.", traits: { prestige_motivation: 0.95, ambition: 0.85, recognition_need: 0.95 }, regretFlags: ["prestige_driven", "peer_comparison"] },
      { label: "Somewhat.", traits: { prestige_motivation: 0.55, recognition_need: 0.5 } },
      { label: "Barely — I'd take quiet impact over status.", traits: { prestige_motivation: 0.1, recognition_need: 0.15 } },
    ],
  },
  {
    id: "id_3",
    category: "Why This Path",
    prompt: "When you imagine your future specialty, whose voice is loudest in your head?",
    helper: "Notice who you are choosing for.",
    choices: [
      { label: "Mine — I've thought about this on my own terms.", traits: { identity_career: 0.7, autonomy: 0.8 } },
      { label: "My parents' / family's expectations.", traits: { family_priority: 0.6 }, regretFlags: ["family_pressure"] },
      { label: "My peers and what looks impressive to them.", traits: { recognition_need: 0.7 }, regretFlags: ["peer_comparison", "prestige_driven"] },
      { label: "What feels safe — exam score, match odds, financial security.", traits: { income_priority: 0.7 }, regretFlags: ["fear_driven", "money_driven"] },
    ],
  },

  // Lifestyle Priorities
  {
    id: "ls_1",
    category: "Lifestyle Priorities",
    prompt: "How important is a predictable, balanced lifestyle to you?",
    choices: [
      { label: "Non-negotiable. I will not compromise it.", traits: { lifestyle_balance: 1.0, family_priority: 0.9, burnout_vulnerability: 0.6, identity_career: 0.2 } },
      { label: "Very important, with some flexibility.", traits: { lifestyle_balance: 0.75, family_priority: 0.7 } },
      { label: "Important, but I'd trade for meaningful work.", traits: { lifestyle_balance: 0.45, ambition: 0.7 } },
      { label: "Lifestyle is secondary to mastery and impact.", traits: { lifestyle_balance: 0.1, identity_career: 0.9, ambition: 0.95, stamina: 0.85 } },
    ],
  },
  {
    id: "ls_2",
    category: "Relationship & Family Goals",
    prompt: "What role do partnership and family play in your future life?",
    choices: [
      { label: "Central — I'm building my career around them.", traits: { family_priority: 1.0, lifestyle_balance: 0.85, identity_career: 0.3 } },
      { label: "Important, but I'll integrate them with career.", traits: { family_priority: 0.7, lifestyle_balance: 0.6 } },
      { label: "Open to them, not building life around them.", traits: { family_priority: 0.4, ambition: 0.7 } },
      { label: "Not a current priority.", traits: { family_priority: 0.1, identity_career: 0.85, ambition: 0.85 } },
    ],
  },
  {
    id: "ls_3",
    category: "Sleep & Schedule Tolerance",
    prompt: "Your tolerance for sustained sleep disruption and overnight call is…",
    choices: [
      { label: "High — I recover quickly and don't mind.", traits: { stamina: 0.95, emotional_resilience: 0.85 } },
      { label: "Moderate — I can do it in bursts.", traits: { stamina: 0.6 } },
      { label: "Low — it wrecks me physically and mentally.", traits: { stamina: 0.2, burnout_vulnerability: 0.85, lifestyle_balance: 0.9 } },
    ],
  },

  // Risk & Ambition
  {
    id: "ra_1",
    category: "Risk & Ambition",
    prompt: "Which feels most like you when stakes are highest?",
    choices: [
      { label: "I get sharper and more decisive under pressure.", traits: { risk_tolerance: 0.95, focus_style: 0.9, emotional_resilience: 0.9, leadership: 0.8 } },
      { label: "I slow down and become methodical.", traits: { perfectionism: 0.85, analytical: 0.85, patience: 0.7 } },
      { label: "I lean on team consensus.", traits: { communication: 0.8, leadership: 0.5, empathy: 0.7 } },
      { label: "I feel it — I can still perform but it costs me.", traits: { sensitivity: 0.8, burnout_vulnerability: 0.7, emotional_resilience: 0.5 } },
    ],
  },
  {
    id: "ra_2",
    category: "Delayed Gratification",
    prompt: "Spending 7–10 years in training before reaching your final career feels…",
    choices: [
      { label: "Worth it — I think long-term.", traits: { delayed_gratification: 0.95, ambition: 0.9, identity_career: 0.85 } },
      { label: "Acceptable if the destination is exceptional.", traits: { delayed_gratification: 0.7, ambition: 0.7 } },
      { label: "Difficult — I want to start living sooner.", traits: { delayed_gratification: 0.2, lifestyle_balance: 0.85, family_priority: 0.7 } },
    ],
  },
  {
    id: "ra_3",
    category: "Financial Priorities",
    prompt: "How central is high income to your career choice?",
    choices: [
      { label: "Very — I want financial freedom and security.", traits: { income_priority: 0.95, ambition: 0.8 }, regretFlags: ["money_driven"] },
      { label: "Important but not the deciding factor.", traits: { income_priority: 0.6 } },
      { label: "I'd take meaning over money.", traits: { income_priority: 0.2, empathy: 0.7 } },
    ],
  },

  // Uncertainty & Perfectionism
  {
    id: "un_1",
    category: "Tolerance For Uncertainty",
    prompt: "A patient case may not have a definitive answer for weeks. Your inner experience is…",
    choices: [
      { label: "I find the gray area intellectually invigorating.", traits: { uncertainty_tolerance: 0.95, analytical: 0.85, patience: 0.85 } },
      { label: "I can hold it, but I want to keep working the problem.", traits: { uncertainty_tolerance: 0.7, analytical: 0.8 } },
      { label: "Uncertainty drains me — I crave closure.", traits: { uncertainty_tolerance: 0.15, perfectionism: 0.8, procedural: 0.7 } },
      { label: "I shift focus to what I can act on right now.", traits: { procedural: 0.8, focus_style: 0.85, uncertainty_tolerance: 0.5 } },
    ],
  },
  {
    id: "un_2",
    category: "Perfectionism",
    prompt: "When you make a small clinical error, you typically…",
    choices: [
      { label: "Replay it for days.", traits: { perfectionism: 0.95, sensitivity: 0.85, burnout_vulnerability: 0.7 } },
      { label: "Log the lesson and move on within hours.", traits: { emotional_resilience: 0.9, focus_style: 0.7, perfectionism: 0.5 } },
      { label: "Discuss it openly to learn from peers.", traits: { communication: 0.85, empathy: 0.7, leadership: 0.5 } },
    ],
  },

  // Work environment
  {
    id: "we_1",
    category: "Work Environment Preference",
    prompt: "Where do you feel most yourself working?",
    choices: [
      { label: "A bright clinic with steady patient flow.", traits: { lifestyle_balance: 0.8, communication: 0.8, chronic_vs_acute: 0.2 } },
      { label: "An operating room.", traits: { procedural: 0.95, visual_spatial: 0.85, stamina: 0.8 } },
      { label: "An ICU or emergency department.", traits: { chronic_vs_acute: 0.95, risk_tolerance: 0.85, focus_style: 0.9, stamina: 0.85 } },
      { label: "A quiet reading room or lab.", traits: { introversion: 0.95, analytical: 0.85, visual_spatial: 0.7, social_battery: 0.2 } },
      { label: "A therapy room or long-conversation space.", traits: { empathy: 0.95, communication: 0.9, patience: 0.9 } },
    ],
  },
  {
    id: "we_2",
    category: "Leadership & Team",
    prompt: "Your preferred role in a team is…",
    choices: [
      { label: "The decisive lead — I make the call.", traits: { leadership: 0.95, autonomy: 0.85, competitiveness: 0.7 } },
      { label: "The thoughtful collaborator.", traits: { communication: 0.85, empathy: 0.7, patience: 0.7 } },
      { label: "The independent specialist.", traits: { autonomy: 0.95, introversion: 0.7, analytical: 0.7 } },
      { label: "The supportive teammate.", traits: { empathy: 0.85, sensitivity: 0.6 } },
    ],
  },

  // Chronic vs Acute
  {
    id: "ca_1",
    category: "Chronic vs Acute",
    prompt: "Which feels more meaningful to you?",
    choices: [
      { label: "Walking with one patient across years of their life.", traits: { chronic_vs_acute: 0.05, empathy: 0.9, patience: 0.9, communication: 0.85 } },
      { label: "Resolving an acute problem in a single visit or shift.", traits: { chronic_vs_acute: 0.95, focus_style: 0.85, procedural: 0.7 } },
    ],
  },
  {
    id: "ca_2",
    category: "Specialized vs Broad",
    prompt: "Would you rather be…",
    choices: [
      { label: "A deep expert in a narrow domain.", traits: { specialized_vs_broad: 0.95, perfectionism: 0.7, analytical: 0.8 } },
      { label: "A broad generalist who sees everything.", traits: { specialized_vs_broad: 0.05, empathy: 0.7, communication: 0.8 } },
      { label: "Something in between.", traits: { specialized_vs_broad: 0.5 } },
    ],
  },

  // Burnout & long-term
  {
    id: "bn_1",
    category: "Burnout Vulnerability",
    prompt: "Looking back at hard semesters, you'd say…",
    choices: [
      { label: "I bounce back fast and stay clear-headed.", traits: { burnout_vulnerability: 0.1, emotional_resilience: 0.95, stamina: 0.9 } },
      { label: "I push through, but I notice the cost later.", traits: { burnout_vulnerability: 0.6, stamina: 0.7 } },
      { label: "Sustained pressure quietly erodes me.", traits: { burnout_vulnerability: 0.95, sensitivity: 0.85, lifestyle_balance: 0.85 } },
    ],
  },
  {
    id: "bn_2",
    category: "Long-Term Stamina",
    prompt: "Imagine your work life at 50. What protects your wellbeing?",
    choices: [
      { label: "Predictable hours and family time.", traits: { lifestyle_balance: 0.95, family_priority: 0.9 } },
      { label: "Continued mastery and meaningful complexity.", traits: { identity_career: 0.85, ambition: 0.7, analytical: 0.7 } },
      { label: "Variety and flexibility in how I work.", traits: { autonomy: 0.85, lifestyle_balance: 0.7 } },
      { label: "A team I love working with.", traits: { communication: 0.8, empathy: 0.7 } },
    ],
  },

  // Meaning Source — the "why"
  {
    id: "ms_1",
    category: "Source Of Meaning",
    prompt: "When you imagine a deeply satisfying day at work in 15 years, what made it satisfying?",
    helper: "Trust the first answer your gut offers.",
    choices: [
      { label: "I helped pull someone back from the edge.", traits: { death_comfort: 0.7, emotional_resilience: 0.7 } },
      { label: "A patient I've known for years trusted me with something hard.", traits: { empathy: 0.8, patience: 0.8 } },
      { label: "I executed a difficult procedure beautifully.", traits: { procedural: 0.85, perfectionism: 0.8 } },
      { label: "I cracked a diagnosis no one else saw.", traits: { analytical: 0.9, uncertainty_tolerance: 0.7 } },
      { label: "I led a team through something hard.", traits: { leadership: 0.85, communication: 0.7 } },
      { label: "I built or shipped something new.", traits: { ambition: 0.7, autonomy: 0.8 } },
      { label: "I taught someone who'll go on to help thousands.", traits: { communication: 0.8, patience: 0.7 } },
    ],
  },
  {
    id: "ms_2",
    category: "Source Of Meaning",
    prompt: "Which of these feelings do you most want medicine to give you?",
    choices: [
      { label: "Awe at the human body and biology.", traits: { analytical: 0.7 } },
      { label: "The closeness of being trusted by another person.", traits: { empathy: 0.8 } },
      { label: "The quiet pride of craft done well.", traits: { perfectionism: 0.8, procedural: 0.7 } },
      { label: "The thrill of acting decisively when it matters.", traits: { risk_tolerance: 0.8, emotional_resilience: 0.7 } },
      { label: "The reach of leading change beyond one room.", traits: { leadership: 0.8, ambition: 0.8 } },
    ],
  },

  // ===== Deeper clinical-life realities (added from physician feedback) =====
  {
    id: "cl_1",
    category: "On-Call Reality",
    prompt: "It's 3:47am and your phone rings about a deteriorating patient. Most honestly, you feel…",
    helper: "Imagine this happening 6 nights a month for 30 years.",
    choices: [
      { label: "Sharp and useful within 60 seconds.", traits: { stamina: 0.95, emotional_resilience: 0.9, focus_style: 0.85 } },
      { label: "Functional but rattled; I'll process it tomorrow.", traits: { stamina: 0.6, sensitivity: 0.6, burnout_vulnerability: 0.55 } },
      { label: "Resentful — this is exactly why I want low-call fields.", traits: { stamina: 0.2, lifestyle_balance: 0.95, family_priority: 0.8 } },
      { label: "Energized — I prefer the night-shift brain.", traits: { chronic_vs_acute: 0.95, risk_tolerance: 0.85, autonomy: 0.7 } },
    ],
  },
  {
    id: "cl_2",
    category: "Litigation & Liability",
    prompt: "A patient files a complaint or lawsuit against you despite competent care. Your inner response…",
    choices: [
      { label: "Devastating — I'd replay it for years.", traits: { perfectionism: 0.9, sensitivity: 0.9, burnout_vulnerability: 0.85, ethical_burden_tolerance: 0.3 } },
      { label: "Stressful but I'd compartmentalize and learn.", traits: { emotional_resilience: 0.85, ethical_burden_tolerance: 0.75 } },
      { label: "Part of the job — I'd protect myself with documentation and move on.", traits: { emotional_resilience: 0.9, ethical_burden_tolerance: 0.9, procedural: 0.7 } },
    ],
  },
  {
    id: "cl_3",
    category: "Patient Volume vs Depth",
    prompt: "Which clinic feels more like home?",
    choices: [
      { label: "60 patients/day, 8 minutes each, brisk and efficient.", traits: { stamina: 0.85, focus_style: 0.9, chronic_vs_acute: 0.7, procedural: 0.6, empathy: 0.4 } },
      { label: "20 patients/day, 20 minutes each, room for the full story.", traits: { empathy: 0.85, patience: 0.85, communication: 0.85, chronic_vs_acute: 0.3 } },
      { label: "6 patients/day, hour-long visits, deep relational work.", traits: { empathy: 0.95, patience: 0.95, lifestyle_balance: 0.7, social_battery: 0.8 } },
    ],
  },
  {
    id: "cl_4",
    category: "Hierarchy & Power Dynamics",
    prompt: "Medicine has steep hierarchies. Your honest position is…",
    choices: [
      { label: "I'll play the long game — pay dues, then earn authority.", traits: { delayed_gratification: 0.9, ambition: 0.85, identity_career: 0.85 } },
      { label: "I tolerate it because it's temporary, but it grates.", traits: { autonomy: 0.85, leadership: 0.7 } },
      { label: "I'd rather avoid pyramid politics — flatter fields appeal to me.", traits: { autonomy: 0.95, lifestyle_balance: 0.7, ambition: 0.4 } },
      { label: "I navigate it well; I'm comfortable managing up.", traits: { communication: 0.9, leadership: 0.7, empathy: 0.7 } },
    ],
  },
  {
    id: "cl_5",
    category: "Pediatric Exposure",
    prompt: "How do you experience working with critically ill children?",
    helper: "Not what you should feel — what you actually feel.",
    choices: [
      { label: "It's where I feel most called.", traits: { empathy: 0.95, ethical_burden_tolerance: 0.9, death_comfort: 0.75 } },
      { label: "I can do it but it costs me more than adult work.", traits: { sensitivity: 0.85, burnout_vulnerability: 0.8, empathy: 0.85 } },
      { label: "I'd avoid it — I know my limits.", traits: { sensitivity: 0.9, death_comfort: 0.2, family_priority: 0.8 } },
    ],
  },
  {
    id: "cl_6",
    category: "Solo vs Group Practice",
    prompt: "Ten years in, where do you picture yourself working?",
    choices: [
      { label: "Solo or small private practice — my rules, my patients.", traits: { autonomy: 0.95, ambition: 0.8, leadership: 0.7, income_priority: 0.75 } },
      { label: "Mid-size group — shared call, shared risk, real income.", traits: { autonomy: 0.6, lifestyle_balance: 0.7, income_priority: 0.7 } },
      { label: "Academic medical center — research, teaching, prestige.", traits: { identity_career: 0.85, analytical: 0.8, prestige_motivation: 0.7 }, regretFlags: ["prestige_driven"] },
      { label: "Salaried hospital employee — predictable, low admin.", traits: { lifestyle_balance: 0.85, autonomy: 0.3, routine_preference: 0.8 } },
    ],
  },
  {
    id: "cl_7",
    category: "Administrative Burden",
    prompt: "Modern medicine = real clinical care + 2–3 hours of charting and paperwork daily. How do you feel about that ratio?",
    choices: [
      { label: "Fine — documentation IS care. I can systematize it.", traits: { procedural: 0.85, perfectionism: 0.75, routine_preference: 0.8 } },
      { label: "Tolerable but it's the part that burns me out.", traits: { burnout_vulnerability: 0.8, lifestyle_balance: 0.8, autonomy: 0.7 } },
      { label: "It's a deal-breaker — I'll choose fields that minimize it.", traits: { lifestyle_balance: 0.9, autonomy: 0.95, burnout_vulnerability: 0.85 } },
    ],
  },
  {
    id: "cl_8",
    category: "Technology & AI Adoption",
    prompt: "AI is reshaping diagnostics, imaging, and documentation. Your stance…",
    choices: [
      { label: "I want to be on the bleeding edge — even building tools.", traits: { ambition: 0.85, autonomy: 0.85, analytical: 0.9 } },
      { label: "I'll use what's proven, skeptically.", traits: { analytical: 0.8, perfectionism: 0.75 } },
      { label: "I'd rather pick fields where the human relationship is the product.", traits: { empathy: 0.9, communication: 0.85, chronic_vs_acute: 0.3 } },
      { label: "It worries me — I want a future-proof specialty.", traits: { uncertainty_tolerance: 0.3, income_priority: 0.7 }, regretFlags: ["fear_driven"] },
    ],
  },
  {
    id: "cl_9",
    category: "Geographic & Career Mobility",
    prompt: "If your top match required you to leave your home country for 5–10 years (training abroad, fellowship, migration), you'd…",
    choices: [
      { label: "Go without hesitation — the career comes first.", traits: { identity_career: 0.9, ambition: 0.9, family_priority: 0.3 } },
      { label: "Go, but with a clear plan to return.", traits: { ambition: 0.75, family_priority: 0.65 } },
      { label: "Reluctantly consider it — depends heavily on partner and family.", traits: { family_priority: 0.85, lifestyle_balance: 0.7 } },
      { label: "No — I'd choose a different specialty before uprooting my life.", traits: { family_priority: 0.95, lifestyle_balance: 0.9, identity_career: 0.3 } },
    ],
  },
  {
    id: "cl_10",
    category: "Existential Stamina",
    prompt: "Twenty years from now, what scares you more?",
    choices: [
      { label: "Looking back at a brilliant career that cost me my relationships.", traits: { family_priority: 0.95, lifestyle_balance: 0.9, identity_career: 0.3 } },
      { label: "Looking back at a comfortable life I find quietly unremarkable.", traits: { ambition: 0.95, identity_career: 0.9, prestige_motivation: 0.7 }, regretFlags: ["prestige_driven"] },
      { label: "Looking back and realizing I chose what others wanted for me.", traits: { autonomy: 0.95, identity_career: 0.7 }, regretFlags: ["family_pressure", "peer_comparison"] },
      { label: "Looking back at burnout that hollowed me out by 45.", traits: { burnout_vulnerability: 0.9, lifestyle_balance: 0.85, emotional_resilience: 0.4 } },
    ],
  },
];

