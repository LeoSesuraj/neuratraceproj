import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getMyPhiAck = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("phi_acknowledgments")
      .select("acknowledged_at, version")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error && error.code !== "PGRST116") {
      // Table missing during rollout, treat as un-acked.
      return { acknowledged: false as const };
    }
    return {
      acknowledged: !!data,
      acknowledged_at: data?.acknowledged_at ?? null,
    };
  });

export const acknowledgePhi = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
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
