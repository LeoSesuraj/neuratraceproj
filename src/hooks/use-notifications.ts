import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  countUnreadNotifications,
  listMyNotifications,
} from "@/lib/notifications.functions";

export const NOTIFICATIONS_KEY = ["notifications"] as const;
export const UNREAD_NOTIFICATIONS_KEY = ["notifications", "unread-count"] as const;

/**
 * Subscribes to realtime notifications for the current user and invalidates
 * the unread-count + list queries on any change. Call once near the root of
 * the authenticated shell.
 */
export function useNotificationsRealtime(userId: string | null) {
  const qc = useQueryClient();
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          qc.invalidateQueries({ queryKey: UNREAD_NOTIFICATIONS_KEY });
          qc.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, qc]);
}

export function useUnreadNotificationsCount() {
  return useQuery({
    queryKey: UNREAD_NOTIFICATIONS_KEY,
    queryFn: () => countUnreadNotifications(),
    refetchOnWindowFocus: true,
    staleTime: 10_000,
  });
}

export function useMyNotifications() {
  return useQuery({
    queryKey: NOTIFICATIONS_KEY,
    queryFn: () => listMyNotifications(),
    refetchOnWindowFocus: true,
    staleTime: 10_000,
  });
}
