import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/link-check")({
  server: {
    handlers: {
      GET: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const out: Record<string, unknown> = {};
        const { data: users, error: uerr } = await supabaseAdmin.auth.admin.listUsers({ perPage: 200 });
        out.authError = uerr?.message ?? null;
        const fam = users?.users.find((u) => u.email === "family@neuratrace.demo");
        out.familyUser = fam ? { id: fam.id, email: fam.email } : null;
        const { data: res, error: rerr } = await supabaseAdmin
          .from("residents")
          .select("id, name, facility_id")
          .ilike("name", "Margaret%");
        out.residents = res;
        out.residentsError = rerr?.message ?? null;
        if (fam) {
          const { data: rf, error: rferr } = await supabaseAdmin
            .from("resident_family")
            .select("*")
            .eq("user_id", fam.id);
          out.links = rf;
          out.linksError = rferr?.message ?? null;
          const { data: roles } = await supabaseAdmin
            .from("user_roles")
            .select("*")
            .eq("user_id", fam.id);
          out.roles = roles;
        }
        return new Response(JSON.stringify(out, null, 2), {
          headers: { "content-type": "application/json" },
        });
      },
    },
  },
});
