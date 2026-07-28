import { createFileRoute } from "@tanstack/react-router";

// Temporary maintenance endpoint to remove pre-existing demo family accounts.
// Delete this file after use. Idempotent.
export const Route = createFileRoute("/api/public/delete-demo-family")({
  server: {
    handlers: {
      GET: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const emails = [
          "family@neuratrace.demo",
          "family@neurotrace.demo",
        ];
        const results: Array<{ email: string; deleted: boolean; error?: string }> = [];

        // Page through auth users to find matches (admin.listUsers is paginated).
        const targets: Array<{ id: string; email: string }> = [];
        let page = 1;
        for (;;) {
          const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 });
          if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
          for (const u of data.users) {
            if (u.email && emails.includes(u.email.toLowerCase())) {
              targets.push({ id: u.id, email: u.email.toLowerCase() });
            }
          }
          if (data.users.length < 200) break;
          page += 1;
          if (page > 20) break;
        }

        for (const t of targets) {
          // Best-effort cleanup of dependent public rows.
          await supabaseAdmin.from("resident_family").delete().eq("user_id", t.id);
          await supabaseAdmin.from("user_roles").delete().eq("user_id", t.id);
          await supabaseAdmin.from("profiles").delete().eq("id", t.id);
          const { error } = await supabaseAdmin.auth.admin.deleteUser(t.id);
          results.push({ email: t.email, deleted: !error, error: error?.message });
        }

        return new Response(
          JSON.stringify({ ok: true, checked: emails, deleted: results }, null, 2),
          { headers: { "content-type": "application/json" } },
        );
      },
    },
  },
});
