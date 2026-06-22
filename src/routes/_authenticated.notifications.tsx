import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Bell, MessageCircle } from "lucide-react";
import {
  useMyNotifications,
  NOTIFICATIONS_KEY,
  UNREAD_NOTIFICATIONS_KEY,
} from "@/hooks/use-notifications";
import { markAllNotificationsRead } from "@/lib/notifications.functions";

export const Route = createFileRoute("/_authenticated/notifications")({
  component: NotificationsPage,
});

function formatTime(iso: string) {
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function NotificationsPage() {
  const qc = useQueryClient();
  const { data: notifications = [], isLoading } = useMyNotifications();

  const markAll = useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
      qc.invalidateQueries({ queryKey: UNREAD_NOTIFICATIONS_KEY });
    },
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-primary">Notifications</p>
          <h1 className="mt-1 text-3xl">What's new</h1>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => markAll.mutate()}
            disabled={markAll.isPending}
            className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium shadow-soft hover:bg-surface disabled:opacity-50"
          >
            {markAll.isPending ? "Marking…" : "Mark all as read"}
          </button>
        )}
      </header>

      <section className="mt-6 overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
        {isLoading ? (
          <p className="px-5 py-8 text-sm text-muted-foreground">Loading…</p>
        ) : notifications.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-sky-soft">
              <Bell className="h-5 w-5 text-primary" aria-hidden />
            </div>
            <p className="mt-3 text-base text-muted-foreground">
              No notifications yet. New messages and resident updates will show up here.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {notifications.map((n) => {
              const content = (
                <div className="flex items-start gap-3 px-5 py-4">
                  <div
                    className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-2xl ${
                      n.read ? "bg-surface" : "bg-sky-soft"
                    }`}
                  >
                    <MessageCircle className="h-4 w-4 text-primary" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <p className="text-sm font-semibold">
                        {n.resident_name ?? "Update"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTime(n.created_at)}
                      </p>
                      {!n.read && (
                        <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
                          New
                        </span>
                      )}
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {(n.message ?? "").slice(0, 60)}
                      {(n.message?.length ?? 0) > 60 ? "…" : ""}
                    </p>
                  </div>
                </div>
              );
              const className = `block transition-colors ${
                n.read ? "hover:bg-surface" : "bg-sky-soft/40 hover:bg-sky-soft/60"
              }`;
              if (n.resident_id) {
                return (
                  <li key={n.id}>
                    <Link
                      to="/resident/$residentId"
                      params={{ residentId: n.resident_id }}
                      className={className}
                    >
                      {content}
                    </Link>
                  </li>
                );
              }
              return (
                <li key={n.id} className={className}>
                  {content}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
