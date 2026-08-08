import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/list-demo")({
  server: {
    handlers: {
      GET: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: profiles, error: e1 } = await supabaseAdmin
          .from("profiles")
          .select("id, email, name");
        const { data: roles, error: e2 } = await supabaseAdmin
          .from("user_roles")
          .select("user_id, role");
        return Response.json({ profiles, roles, e1, e2 });
      },
    },
  },
});
