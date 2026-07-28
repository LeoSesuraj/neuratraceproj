import { createFileRoute } from "@tanstack/react-router";

// TEMPORARY one-shot bootstrap endpoint. Delete this file (and the
// BOOTSTRAP_SUPERADMIN_PASSWORD secret) once the super admin exists.
export const Route = createFileRoute("/api/public/bootstrap-superadmin")({
  server: {
    handlers: {
      POST: async () => {
        const password = process.env.BOOTSTRAP_SUPERADMIN_PASSWORD;
        if (!password) {
          return new Response(
            JSON.stringify({ ok: false, error: "Bootstrap disabled" }),
            { status: 403, headers: { "content-type": "application/json" } },
          );
        }
        if (password.length < 8) {
          return new Response(
            JSON.stringify({ ok: false, error: "Password too short" }),
            { status: 400, headers: { "content-type": "application/json" } },
          );
        }

        const email = "leonelbaskin@gmail.com";
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const db = supabaseAdmin as any;

        let deleted = 0;
        for (let page = 1; page < 100; page++) {
          const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 });
          if (error) {
            return new Response(
              JSON.stringify({ ok: false, error: `listUsers: ${error.message}` }),
              { status: 500, headers: { "content-type": "application/json" } },
            );
          }
          const users = data?.users ?? [];
          if (users.length === 0) break;
          for (const u of users) {
            const { error: delErr } = await db.auth.admin.deleteUser(u.id);
            if (delErr) {
              return new Response(
                JSON.stringify({ ok: false, error: `deleteUser ${u.id}: ${delErr.message}` }),
                { status: 500, headers: { "content-type": "application/json" } },
              );
            }
            deleted++;
          }
          if (users.length < 200) break;
        }

        const { data: created, error: createErr } = await db.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });
        if (createErr || !created?.user) {
          return new Response(
            JSON.stringify({ ok: false, error: `createUser: ${createErr?.message ?? "unknown"}` }),
            { status: 500, headers: { "content-type": "application/json" } },
          );
        }
        const userId = created.user.id;

        const { error: roleErr } = await db
          .from("user_roles")
          .insert({ user_id: userId, role: "super_admin" });

        return new Response(
          JSON.stringify({
            ok: true,
            deleted,
            userId,
            email,
            roleWarning: roleErr?.message ?? null,
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      },
    },
  },
});
