import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const claimSchema = z.object({
  firstName: z.string().trim().min(1).max(60),
  lastName: z.string().trim().min(1).max(60),
  phone: z.string().trim().min(6).max(25).regex(/^[+0-9 ()-]+$/),
  note: z.string().trim().max(300).optional(),
  topMatch: z.string().trim().max(120).optional(),
});

/** Public: a visitor reports that they sent the InstaPay transfer. */
export const submitPaymentClaim = createServerFn({ method: "POST" })
  .inputValidator((d) => claimSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("payment_claims")
      .insert({
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
        note: data.note ?? null,
        top_match: data.topMatch ?? null,
      })
      .select("id, status")
      .single();
    if (error || !row) {
      console.error("submitPaymentClaim", error);
      throw new Error("Could not send your payment notice. Please try again.");
    }
    return { id: row.id, status: row.status };
  });

/** Public: returns only the status of one claim (id is an unguessable UUID). */
export const getPaymentClaimStatus = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("payment_claims")
      .select("status")
      .eq("id", data.id)
      .maybeSingle();
    return { status: row?.status ?? null };
  });

export const amIAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    return { admin: !!data };
  });

export const listPaymentClaims = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("payment_claims")
      .select("id, first_name, last_name, phone, note, top_match, status, created_at, reviewed_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error("Could not load payment notices.");
    return data ?? [];
  });

export const reviewPaymentClaim = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ id: z.string().uuid(), status: z.enum(["approved", "rejected", "pending"]) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("payment_claims")
      .update({ status: data.status, reviewed_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw new Error("Could not update.");
    return { ok: true };
  });
