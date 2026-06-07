// Category-keyed animated medical micro-glyphs.
// Pure inline SVG with SMIL/CSS animations — no extra deps.

type Props = { category: string; className?: string };

const stroke = "oklch(0.48 0.16 274)";
const soft = "oklch(0.48 0.16 274 / 0.18)";

function Frame({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative size-14 rounded-2xl bg-brand-soft/60 border border-brand/15 grid place-items-center overflow-hidden ${className ?? ""}`}>
      {children}
    </div>
  );
}

function ECG() {
  return (
    <svg viewBox="0 0 56 32" className="w-10 h-7" aria-hidden>
      <path d="M2 16 H16 L20 7 L26 25 L31 4 L36 16 H54" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="120" strokeDashoffset="120">
        <animate attributeName="stroke-dashoffset" from="120" to="-120" dur="2.4s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}

function Brainwave() {
  return (
    <svg viewBox="0 0 56 32" className="w-10 h-7" aria-hidden>
      <path d="M2 16 Q8 4 14 16 T26 16 T38 16 T54 16" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round">
        <animate attributeName="d" dur="3s" repeatCount="indefinite"
          values="M2 16 Q8 4 14 16 T26 16 T38 16 T54 16;
                  M2 16 Q8 28 14 16 T26 16 T38 16 T54 16;
                  M2 16 Q8 4 14 16 T26 16 T38 16 T54 16" />
      </path>
    </svg>
  );
}

function Pulse() {
  return (
    <svg viewBox="0 0 56 56" className="w-10 h-10" aria-hidden>
      <circle cx="28" cy="28" r="6" fill={stroke} />
      <circle cx="28" cy="28" r="6" fill="none" stroke={stroke} strokeWidth="1.5" opacity="0.6">
        <animate attributeName="r" from="6" to="24" dur="1.8s" repeatCount="indefinite" />
        <animate attributeName="opacity" from="0.6" to="0" dur="1.8s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

function Droplet() {
  return (
    <svg viewBox="0 0 32 40" className="w-7 h-9" aria-hidden>
      <path d="M16 4 C8 18 4 24 4 30 a12 12 0 0 0 24 0 c0-6-4-12-12-26z" fill={soft} stroke={stroke} strokeWidth="1.5">
        <animateTransform attributeName="transform" type="translate" values="0 -2; 0 2; 0 -2" dur="2.2s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}

function Hourglass() {
  return (
    <svg viewBox="0 0 32 40" className="w-7 h-9" aria-hidden>
      <path d="M6 4 H26 L18 20 L26 36 H6 L14 20 Z" fill="none" stroke={stroke} strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="16" cy="14" r="1.5" fill={stroke}>
        <animate attributeName="cy" values="14;26;14" dur="2.6s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="1;0.2;1" dur="2.6s" repeatCount="indefinite" />
      </circle>
      <animateTransform attributeName="transform" type="rotate" values="0 16 20; 0 16 20; 180 16 20; 180 16 20; 0 16 20" keyTimes="0;0.45;0.5;0.95;1" dur="5.2s" repeatCount="indefinite" />
    </svg>
  );
}

function Scalpel() {
  return (
    <svg viewBox="0 0 56 32" className="w-10 h-7" aria-hidden>
      <path d="M4 18 L36 12 L48 16 L36 20 Z" fill={soft} stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" />
      <line x1="36" y1="16" x2="52" y2="16" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
      <animateTransform attributeName="transform" type="translate" values="-2 0; 2 0; -2 0" dur="1.8s" repeatCount="indefinite" />
    </svg>
  );
}

function Stethoscope() {
  return (
    <svg viewBox="0 0 40 40" className="w-9 h-9" aria-hidden>
      <path d="M10 6 V18 a8 8 0 0 0 16 0 V6" fill="none" stroke={stroke} strokeWidth="1.8" />
      <path d="M18 26 V30 a6 6 0 0 0 12 0 V22" fill="none" stroke={stroke} strokeWidth="1.8" />
      <circle cx="30" cy="22" r="3" fill={soft} stroke={stroke} strokeWidth="1.5">
        <animate attributeName="r" values="3;4;3" dur="1.6s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

function Scales() {
  return (
    <svg viewBox="0 0 56 40" className="w-10 h-8" aria-hidden>
      <line x1="28" y1="6" x2="28" y2="34" stroke={stroke} strokeWidth="1.6" />
      <g>
        <line x1="8" y1="14" x2="48" y2="14" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
        <path d="M4 14 L12 24 H4 Z M4 14 L-4 24 H4 Z" fill={soft} stroke={stroke} strokeWidth="1.2" transform="translate(8 0)" />
        <path d="M4 14 L12 24 H4 Z M4 14 L-4 24 H4 Z" fill={soft} stroke={stroke} strokeWidth="1.2" transform="translate(40 0)" />
        <animateTransform attributeName="transform" type="rotate" values="-6 28 14; 6 28 14; -6 28 14" dur="3s" repeatCount="indefinite" />
      </g>
    </svg>
  );
}

function Moon() {
  return (
    <svg viewBox="0 0 40 40" className="w-9 h-9" aria-hidden>
      <path d="M28 8 a14 14 0 1 0 4 22 A12 12 0 0 1 28 8z" fill={soft} stroke={stroke} strokeWidth="1.5">
        <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}

function Compass() {
  return (
    <svg viewBox="0 0 40 40" className="w-9 h-9" aria-hidden>
      <circle cx="20" cy="20" r="14" fill="none" stroke={stroke} strokeWidth="1.5" />
      <polygon points="20,8 24,20 20,32 16,20" fill={soft} stroke={stroke} strokeWidth="1.2">
        <animateTransform attributeName="transform" type="rotate" from="0 20 20" to="360 20 20" dur="6s" repeatCount="indefinite" />
      </polygon>
    </svg>
  );
}

function People() {
  return (
    <svg viewBox="0 0 56 32" className="w-10 h-7" aria-hidden>
      <circle cx="14" cy="12" r="5" fill={soft} stroke={stroke} strokeWidth="1.4" />
      <path d="M4 28 a10 10 0 0 1 20 0" fill="none" stroke={stroke} strokeWidth="1.4" />
      <circle cx="40" cy="12" r="5" fill={soft} stroke={stroke} strokeWidth="1.4" />
      <path d="M30 28 a10 10 0 0 1 20 0" fill="none" stroke={stroke} strokeWidth="1.4" />
      <animateTransform attributeName="transform" type="translate" values="0 0; 0 -1.5; 0 0" dur="2.4s" repeatCount="indefinite" />
    </svg>
  );
}

function DNA() {
  return (
    <svg viewBox="0 0 40 40" className="w-9 h-9" aria-hidden>
      <path d="M10 4 C30 14 10 26 30 36" fill="none" stroke={stroke} strokeWidth="1.6" />
      <path d="M30 4 C10 14 30 26 10 36" fill="none" stroke={stroke} strokeWidth="1.6" />
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1="10" x2="30" y1={8 + i * 8} y2={8 + i * 8} stroke={stroke} strokeWidth="1" opacity="0.5">
          <animate attributeName="opacity" values="0.2;0.9;0.2" dur="2s" begin={`${i * 0.3}s`} repeatCount="indefinite" />
        </line>
      ))}
    </svg>
  );
}

function Crosshair() {
  return (
    <svg viewBox="0 0 40 40" className="w-9 h-9" aria-hidden>
      <circle cx="20" cy="20" r="14" fill="none" stroke={stroke} strokeWidth="1.4" />
      <circle cx="20" cy="20" r="6" fill="none" stroke={stroke} strokeWidth="1.4" />
      <circle cx="20" cy="20" r="1.5" fill={stroke}>
        <animate attributeName="r" values="1.5;3;1.5" dur="1.4s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

function Building() {
  return (
    <svg viewBox="0 0 40 40" className="w-9 h-9" aria-hidden>
      <rect x="6" y="14" width="12" height="22" fill={soft} stroke={stroke} strokeWidth="1.3" />
      <rect x="22" y="6" width="12" height="30" fill="none" stroke={stroke} strokeWidth="1.3" />
      {[10, 18, 26].map((y, i) => (
        <rect key={i} x="25" y={y} width="6" height="3" fill={soft}>
          <animate attributeName="opacity" values="0.3;1;0.3" dur="2.4s" begin={`${i * 0.4}s`} repeatCount="indefinite" />
        </rect>
      ))}
    </svg>
  );
}

function Document() {
  return (
    <svg viewBox="0 0 40 40" className="w-9 h-9" aria-hidden>
      <path d="M10 4 H26 L32 10 V36 H10 Z" fill={soft} stroke={stroke} strokeWidth="1.4" />
      {[14, 18, 22, 26].map((y, i) => (
        <line key={i} x1="14" y1={y} x2="28" y2={y} stroke={stroke} strokeWidth="1" opacity="0.6" strokeDasharray="20" strokeDashoffset="20">
          <animate attributeName="stroke-dashoffset" from="20" to="0" dur="0.8s" begin={`${i * 0.3}s`} fill="freeze" />
        </line>
      ))}
    </svg>
  );
}

function Chip() {
  return (
    <svg viewBox="0 0 40 40" className="w-9 h-9" aria-hidden>
      <rect x="10" y="10" width="20" height="20" rx="2" fill={soft} stroke={stroke} strokeWidth="1.4" />
      <rect x="15" y="15" width="10" height="10" fill="none" stroke={stroke} strokeWidth="1" />
      {[6, 14, 22, 30].map((x, i) => (
        <g key={i}>
          <line x1={x} y1="6" x2={x} y2="10" stroke={stroke} strokeWidth="1.2" />
          <line x1={x} y1="30" x2={x} y2="34" stroke={stroke} strokeWidth="1.2" />
        </g>
      ))}
      <circle cx="20" cy="20" r="2" fill={stroke}>
        <animate attributeName="opacity" values="0.3;1;0.3" dur="1.6s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

function Globe() {
  return (
    <svg viewBox="0 0 40 40" className="w-9 h-9" aria-hidden>
      <circle cx="20" cy="20" r="14" fill={soft} stroke={stroke} strokeWidth="1.4" />
      <ellipse cx="20" cy="20" rx="14" ry="6" fill="none" stroke={stroke} strokeWidth="1.1" />
      <line x1="20" y1="6" x2="20" y2="34" stroke={stroke} strokeWidth="1.1" />
      <circle cx="14" cy="16" r="1.5" fill={stroke}>
        <animate attributeName="cx" values="14;26;14" dur="6s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

function Sparkle() {
  return (
    <svg viewBox="0 0 40 40" className="w-9 h-9" aria-hidden>
      <path d="M20 6 L23 17 L34 20 L23 23 L20 34 L17 23 L6 20 L17 17 Z" fill={soft} stroke={stroke} strokeWidth="1.2">
        <animateTransform attributeName="transform" type="rotate" from="0 20 20" to="360 20 20" dur="12s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}

const MAP: Record<string, () => React.ReactElement> = {
  "Emotional Resilience": ECG,
  "Trauma & Stress Tolerance": Pulse,
  "Cognitive Style": Brainwave,
  "Chaos vs Predictability": Compass,
  "Procedural vs Analytical": Scalpel,
  "Communication Style": People,
  "Comfort With Death & Suffering": Moon,
  "Identity & Ego": Sparkle,
  "Need For Recognition": Sparkle,
  "Why This Path": Compass,
  "Lifestyle Priorities": Scales,
  "Relationship & Family Goals": People,
  "Sleep & Schedule Tolerance": Moon,
  "Risk & Ambition": Crosshair,
  "Delayed Gratification": Hourglass,
  "Financial Priorities": Scales,
  "Tolerance For Uncertainty": Brainwave,
  "Perfectionism": Crosshair,
  "Work Environment Preference": Building,
  "Leadership & Team": People,
  "Chronic vs Acute": ECG,
  "Specialized vs Broad": DNA,
  "Burnout Vulnerability": Droplet,
  "Long-Term Stamina": Hourglass,
  "Source Of Meaning": Sparkle,
  "On-Call Reality": Moon,
  "Litigation & Liability": Document,
  "Patient Volume vs Depth": People,
  "Hierarchy & Power Dynamics": Building,
  "Pediatric Exposure": Pulse,
  "Solo vs Group Practice": Building,
  "Administrative Burden": Document,
  "Technology & AI Adoption": Chip,
  "Geographic & Career Mobility": Globe,
  "Existential Stamina": Hourglass,
};

export function QuestionGlyph({ category, className }: Props) {
  const Cmp = MAP[category] ?? Stethoscope;
  return (
    <Frame className={className}>
      <Cmp />
    </Frame>
  );
}
