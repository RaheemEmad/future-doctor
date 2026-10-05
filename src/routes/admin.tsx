import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SiteFooter, SiteNav } from "@/components/site-chrome";
import { useAuth } from "@/lib/auth";
import { amIAdmin, listPaymentClaims, reviewPaymentClaim } from "@/lib/payments.functions";
import { PAYMENT } from "@/lib/payment";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Payments admin · Vocare" },
      { name: "description", content: "Review InstaPay payment notices." },
      { property: "og:title", content: "Payments admin · Vocare" },
      { property: "og:description", content: "Private admin page." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { user, loading } = useAuth() as ReturnType<typeof useAuth> & { loading?: boolean };
  const checkAdmin = useServerFn(amIAdmin);
  const list = useServerFn(listPaymentClaims);
  const review = useServerFn(reviewPaymentClaim);
  const qc = useQueryClient();

  const adminQ = useQuery({ queryKey: ["am-admin", user?.id], queryFn: () => checkAdmin(), enabled: !!user });
  const claimsQ = useQuery({
    queryKey: ["payment-claims"],
    queryFn: () => list(),
    enabled: !!adminQ.data?.admin,
    refetchInterval: 30000,
  });

  async function setStatus(id: string, status: "approved" | "rejected" | "pending") {
    await review({ data: { id, status } });
    await qc.invalidateQueries({ queryKey: ["payment-claims"] });
  }

  let body: React.ReactNode;
  if (loading) body = <p className="text-muted-foreground">Loading…</p>;
  else if (!user) body = (
    <p className="text-muted-foreground">Please <Link to="/auth" className="underline text-brand">sign in</Link> to view payment notices.</p>
  );
  else if (adminQ.isLoading) body = <p className="text-muted-foreground">Checking access…</p>;
  else if (!adminQ.data?.admin) body = <p className="text-muted-foreground">This page is only for the Vocare owner.</p>;
  else if (claimsQ.isLoading) body = <p className="text-muted-foreground">Loading notices…</p>;
  else {
    const rows = claimsQ.data ?? [];
    const pending = rows.filter((r) => r.status === "pending").length;
    body = (
      <>
        <p className="text-sm text-muted-foreground mb-6">
          {pending} waiting · Check your InstaPay for {PAYMENT.priceEgp} EGP with the matching description, then approve.
        </p>
        {rows.length === 0 && <p className="text-muted-foreground">No payment notices yet.</p>}
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.id} className="rounded-2xl border border-border bg-card p-5 flex flex-wrap items-center gap-4 justify-between">
              <div className="min-w-0">
                <div className="font-medium">{r.first_name} {r.last_name}</div>
                <div className="text-sm text-muted-foreground font-mono">{r.phone}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Note: <span className="font-mono">{r.note}</span>
                  {r.top_match && <> · Top match {r.top_match}</>}
                  {" · "}{new Date(r.created_at).toLocaleString()}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`hud-tag px-2 py-1 rounded-md ${r.status === "approved" ? "bg-vitals/15 text-vitals" : r.status === "rejected" ? "bg-destructive/10 text-destructive" : "bg-warning/15 text-warning"}`}>
                  {r.status}
                </span>
                {r.status !== "approved" && (
                  <button onClick={() => setStatus(r.id, "approved")} className="min-h-10 px-4 rounded-full bg-brand text-brand-foreground text-sm">Approve</button>
                )}
                {r.status !== "rejected" && (
                  <button onClick={() => setStatus(r.id, "rejected")} className="min-h-10 px-4 rounded-full border border-border text-sm hover:bg-muted">Reject</button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="max-w-4xl mx-auto px-6 sm:px-10 py-12">
        <span className="hud-tag text-monitor">Owner console</span>
        <h1 className="font-serif text-4xl mt-3 mb-4">Payment notices</h1>
        {body}
      </main>
      <SiteFooter />
    </div>
  );
}
