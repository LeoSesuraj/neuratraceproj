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

        // Tables that may reference auth.users. We nuke rows in these first
        // so GoTrue's deleteUser doesn't trip on a stray FK or trigger.
        // All FKs are CASCADE/SET NULL, but a broken trigger on one of these
        // can surface as "Database error deleting user" from GoTrue.
        const wipeTables = [
          "notifications",
          "messages",
          "coach_conversations",
          "coach_messages",
          "login_events",
          "posts",
          "mood_logs",
          "weekly_surveys",
          "decline_alerts",
          "daily_notes",
          "alerts",
          "invites",
          "staff_requests",
          "resident_family",
          "resident_staff",
          "family_links",
          "user_roles",
          "profiles",
        ];
        const wipeResults: Record<string, string | number> = {};
        for (const t of wipeTables) {
          const { error, count } = await db
            .from(t)
            .delete({ count: "exact" })
            .not("id", "is", null);
          wipeResults[t] = error ? `err:${error.message}` : (count ?? 0);
        }

        let deleted = 0;
        const failures: Array<{ id: string; email: string | null; error: string }> = [];
        for (let page = 1; page < 100; page++) {
          const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 });
          if (error) {
            return new Response(
              JSON.stringify({ ok: false, error: `listUsers: ${error.message}`, wipeResults }),
              { status: 500, headers: { "content-type": "application/json" } },
            );
          }
          const users = data?.users ?? [];
          if (users.length === 0) break;
          for (const u of users) {
            const { error: delErr } = await db.auth.admin.deleteUser(u.id);
            if (delErr) {
              failures.push({ id: u.id, email: u.email ?? null, error: delErr.message });
            } else {
              deleted++;
            }
          }
          if (users.length < 200) break;
        }

        // If our target email still exists (delete failed above), update its
        // password in place instead of creating a new one.
        let userId: string | null = null;
        const existing = failures.find((f) => f.email === email);
        if (existing) {
          const { error: updErr } = await db.auth.admin.updateUserById(existing.id, {
            password,
            email_confirm: true,
          });
          if (updErr) {
            return new Response(
              JSON.stringify({ ok: false, error: `updateUser: ${updErr.message}`, failures, wipeResults }),
              { status: 500, headers: { "content-type": "application/json" } },
            );
          }
          userId = existing.id;
        } else {
          const { data: created, error: createErr } = await db.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
          });
          if (createErr || !created?.user) {
            return new Response(
              JSON.stringify({
                ok: false,
                error: `createUser: ${createErr?.message ?? "unknown"}`,
                failures,
                wipeResults,
              }),
              { status: 500, headers: { "content-type": "application/json" } },
            );
          }
          userId = created.user.id;
        }

        const { error: roleErr } = await db
          .from("user_roles")
          .insert({ user_id: userId, role: "super_admin" });

        return new Response(
          JSON.stringify({
            ok: true,
            deleted,
            failures,
            wipeResults,
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
