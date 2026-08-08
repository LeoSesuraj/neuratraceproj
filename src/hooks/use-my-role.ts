import { useQuery } from "@tanstack/react-query";
import { getMyRole } from "@/lib/app.functions";
import { applyDemoPersona, type RoleInfo } from "@/lib/demo-personas";

export function useMyRole() {
  return useQuery<RoleInfo>({
    queryKey: ["my-role"],
    queryFn: async () => applyDemoPersona((await getMyRole()) as RoleInfo),
  });
}
