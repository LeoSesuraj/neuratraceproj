import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getMyPhiAck = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (context.supabase as any)
      .from("phi_acknowledgments")
      .select("acknowledged_at, version")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) {
      // Table missing during rollout: treat as un-acked so users still see the prompt.
      return { acknowledged: false as const, acknowledged_at: null };
    }
    const row = data as { acknowledged_at: string; version: string } | null;
    return {
      acknowledged: !!row,
      acknowledged_at: row?.acknowledged_at ?? null,
    };
  });

export const acknowledgePhi = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabaseAdmin as any)
      .from("phi_acknowledgments")
      .upsert(
        {
          user_id: context.userId,
          acknowledged_at: new Date().toISOString(),
          version: "v1",
        },
        { onConflict: "user_id" },
      );
    if (error) throw new Error(error.message);
    return { ok: true };
  });
