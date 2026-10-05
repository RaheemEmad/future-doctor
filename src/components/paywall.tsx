import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Check, Clock, Copy, Lock, Smartphone, XCircle } from "lucide-react";
import { PAYMENT, clearClaim, loadClaim, paymentNote, storeClaim, type StoredClaim } from "@/lib/payment";
import { getPaymentClaimStatus, submitPaymentClaim } from "@/lib/payments.functions";

export function usePaymentUnlock() {
  const [claim, setClaim] = useState<StoredClaim | null>(null);
  const checkStatus = useServerFn(getPaymentClaimStatus);

  const refresh = useCallback(async (c: StoredClaim | null) => {
    if (!c) return;
    try {
      const { status } = await checkStatus({ data: { id: c.id } });
      if (!status) { clearClaim(); setClaim(null); return; }
      const next = { ...c, status };
      storeClaim(next);
      setClaim(next);
    } catch { /* offline: keep cached */ }
  }, [checkStatus]);

  useEffect(() => {
    const c = loadClaim();
    setClaim(c);
    void refresh(c);
  }, [refresh]);

  useEffect(() => {
    if (claim?.status !== "pending") return;
    const t = window.setInterval(() => void refresh(claim), 20000);
    return () => window.clearInterval(t);
  }, [claim, refresh]);

  return { claim, setClaim, refresh, unlocked: claim?.status === "approved" };
}

const LOCKED = [
  { t: "Why your percentage", d: "Every point traced back to your own answers." },
  { t: "Tensions and regret risk", d: "Where your values pull against each other." },
  { t: "Meaning fit", d: "Whether this field feeds what actually motivates you." },
  { t: "Career paths", d: "Realistic trajectories for your top match." },
  { t: "Egypt, Gulf, UK, US outlook", d: "Private practice, demand, migration, AI risk." },
  { t: "30 year lifecycle", d: "How the field feels at year 1, 5, 15 and 30." },
  { t: "Runners up and fields to avoid", d: "With reasoning for each." },
  { t: "Long term predictions + PDF report", d: "Burnout, satisfaction and a downloadable dossier." },
];

export function Paywall({
  unlocked,
  claim,
  onClaim,
  topMatch,
  children,
}: {
  unlocked: boolean;
  claim: StoredClaim | null;
  onClaim: (c: StoredClaim) => void;
  topMatch?: string;
  children: ReactNode;
}) {
  if (unlocked) return <>{children}</>;
  return (
    <section className="max-w-6xl mx-auto px-6 sm:px-10 mt-12">
      <div className="rounded-3xl border border-border bg-card overflow-hidden relative">
        <div className="absolute inset-0 bg-grid-clinical opacity-50 pointer-events-none" />
        <div className="relative grid lg:grid-cols-[1.1fr_1fr]">
          <div className="p-7 sm:p-10 border-b lg:border-b-0 lg:border-r border-border">
            <span className="inline-flex items-center gap-2 hud-tag text-monitor">
              <Lock className="size-3.5" /> Full dossier locked
            </span>
            <h2 className="font-serif text-3xl lg:text-4xl mt-3 leading-tight">
              You've seen your top match. The <span className="italic">why</span> is where decisions get made.
            </h2>
            <p className="text-muted-foreground mt-3 leading-relaxed">
              Unlock the complete analysis{topMatch ? ` behind ${topMatch}` : ""} for a one time {PAYMENT.priceEgp} EGP.
            </p>
            <ul className="mt-6 grid sm:grid-cols-2 gap-3">
              {LOCKED.map((l) => (
                <li key={l.t} className="flex gap-3 rounded-xl border border-border bg-background/70 p-3">
                  <Lock className="size-4 mt-0.5 text-muted-foreground shrink-0" />
                  <div>
                    <div className="text-sm font-medium">{l.t}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{l.d}</div>
                  </div>
                </li>
              ))}
            </ul>
            <ExampleCase />
          </div>
          <div className="p-7 sm:p-10">
            <PayPanel claim={claim} onClaim={onClaim} topMatch={topMatch} />
          </div>
        </div>
      </div>
    </section>
  );
}

function ExampleCase() {
  return (
    <div className="mt-8 rounded-2xl border border-monitor/25 bg-monitor/5 p-5">
      <div className="hud-tag text-monitor">Example case · what a full dossier told one student</div>
      <p className="mt-3 text-sm leading-relaxed text-foreground/85">
        <strong className="font-medium">Nour, final year, Ain Shams.</strong> Planned on General Surgery because of family
        expectation. Her free result showed <em>Urology 86%</em>. The full dossier explained why: high procedural drive
        (+26 pts) but a strong family priority that general surgery's call burden would erode. It flagged a
        <em> family pressure</em> regret signal, showed Urology's Egypt private practice score of 9/10 and Gulf demand of
        9/10, and its lifecycle curve showed the hard years end around year 5. She shadowed a urology team for two weeks
        and listed it first on her takleef form.
      </p>
      <Link to="/sample-result" className="mt-3 inline-block text-sm text-brand underline">See the full sample result</Link>
    </div>
  );
}

function PayPanel({ claim, onClaim, topMatch }: { claim: StoredClaim | null; onClaim: (c: StoredClaim) => void; topMatch?: string }) {
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const submit = useServerFn(submitPaymentClaim);
  const note = paymentNote(first, last);

  function copy(v: string, k: string) {
    void navigator.clipboard?.writeText(v);
    setCopied(k);
    window.setTimeout(() => setCopied(null), 1500);
  }

  if (claim?.status === "pending") {
    return (
      <div className="h-full flex flex-col justify-center text-center items-center">
        <div className="size-12 rounded-full bg-warning/15 text-warning grid place-items-center"><Clock className="size-6" /></div>
        <h3 className="font-serif text-2xl mt-4">Payment notice sent</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm">
          We're checking your InstaPay transfer. Your full results unlock on this device as soon as it's confirmed.
          Keep this page open or come back later.
        </p>
        <span className="mt-4 hud-tag text-monitor inline-flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-vitals animate-vitals" /> Checking automatically
        </span>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!first.trim() || !last.trim() || phone.trim().length < 6) {
      setErr("Please fill in your first name, last name and the phone you paid from.");
      return;
    }
    setBusy(true);
    try {
      const r = await submit({ data: { firstName: first, lastName: last, phone, note, topMatch } });
      const c = { id: r.id, status: r.status } as StoredClaim;
      storeClaim(c);
      onClaim(c);
    } catch {
      setErr("Couldn't send the notice. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {claim?.status === "rejected" && (
        <div className="flex gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm">
          <XCircle className="size-4 text-destructive mt-0.5 shrink-0" />
          We couldn't find your last transfer. Please check the details and send the notice again.
        </div>
      )}
      <div>
        <div className="hud-tag text-muted-foreground">Step 1 · Pay with InstaPay</div>
        <div className="mt-3 rounded-2xl border border-border bg-background p-4 space-y-3">
          <Row label="Amount" value={`${PAYMENT.priceEgp} EGP`} />
          <Row label="Send to" value={PAYMENT.instapayNumber} onCopy={() => copy(PAYMENT.instapayNumber, "num")} copied={copied === "num"} />
          <Row label="Description" value={note} onCopy={() => copy(note, "note")} copied={copied === "note"} />
        </div>
        <p className="text-xs text-muted-foreground mt-2 flex gap-1.5">
          <Smartphone className="size-3.5 mt-0.5 shrink-0" />
          Write the description exactly as shown so we can match your transfer.
        </p>
      </div>
      <div>
        <div className="hud-tag text-muted-foreground">Step 2 · Tell us you paid</div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Field label="First name" value={first} onChange={setFirst} autoComplete="given-name" />
          <Field label="Last name" value={last} onChange={setLast} autoComplete="family-name" />
        </div>
        <div className="mt-3">
          <Field label="Phone you paid from" value={phone} onChange={setPhone} autoComplete="tel" type="tel" placeholder="01xxxxxxxxx" />
        </div>
      </div>
      {err && <p className="text-sm text-destructive">{err}</p>}
      <button
        type="submit"
        disabled={busy}
        className="w-full min-h-12 rounded-full bg-brand text-brand-foreground font-medium hover:opacity-90 disabled:opacity-60 transition-opacity"
      >
        {busy ? "Sending…" : "I've paid, notify Vocare"}
      </button>
    </form>
  );
}

function Row({ label, value, onCopy, copied }: { label: string; value: string; onCopy?: () => void; copied?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="flex items-center gap-2 min-w-0">
        <span className="font-mono text-sm truncate">{value}</span>
        {onCopy && (
          <button type="button" onClick={onCopy} aria-label={`Copy ${label}`} className="size-8 grid place-items-center rounded-md hover:bg-muted shrink-0">
            {copied ? <Check className="size-4 text-vitals" /> : <Copy className="size-4 text-muted-foreground" />}
          </button>
        )}
      </span>
    </div>
  );
}

function Field({ label, value, onChange, ...rest }: { label: string; value: string; onChange: (v: string) => void } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value">) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground">{label}</span>
      <input
        {...rest}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full min-h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </label>
  );
}

export function PriceNotice() {
  return (
    <div className="rounded-2xl border border-monitor/25 bg-monitor/5 p-4 sm:p-5 mb-8">
      <div className="hud-tag text-monitor">Before you start</div>
      <p className="text-sm mt-2 leading-relaxed text-foreground/85">
        The assessment and your top match are free. Viewing <strong className="font-medium">all your analytics</strong> costs a one time{" "}
        <strong className="font-medium">{PAYMENT.priceEgp} EGP</strong>, paid by InstaPay to{" "}
        <span className="font-mono">{PAYMENT.instapayNumber}</span> with the description{" "}
        <span className="font-mono">{PAYMENT.notePrefix} - First name Last name</span>. After paying, tap the "I've paid" button on your results.
      </p>
    </div>
  );
}
