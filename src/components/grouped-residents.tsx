import { Building2 } from "lucide-react";

export type ResidentWithFacility = {
  id: string;
  name: string;
  photo_url: string | null;
  facility_id: string | null;
  dementia_type: string | null;
  facilities?: { name: string } | { name: string }[] | null;
};

export function facilityName(r: ResidentWithFacility): string {
  const f = r.facilities;
  if (!f) return "Unassigned";
  if (Array.isArray(f)) return f[0]?.name ?? "Unassigned";
  return f.name ?? "Unassigned";
}

export function groupByFacility<T extends ResidentWithFacility>(
  residents: T[],
): Array<{ facilityId: string | null; facilityName: string; residents: T[] }> {
  const map = new Map<string, { facilityId: string | null; facilityName: string; residents: T[] }>();
  for (const r of residents) {
    const key = r.facility_id ?? "__none__";
    const name = facilityName(r);
    if (!map.has(key)) {
      map.set(key, { facilityId: r.facility_id, facilityName: name, residents: [] });
    }
    map.get(key)!.residents.push(r);
  }
  return Array.from(map.values()).sort((a, b) =>
    a.facilityName.localeCompare(b.facilityName),
  );
}

export function FacilityHeader({ name, count }: { name: string; count: number }) {
  return (
    <div className="flex items-center gap-2 border-b border-border pb-2">
      <Building2 className="h-4 w-4 text-primary" />
      <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">
        {name}
      </h2>
      <span className="rounded-full bg-surface px-2 py-0.5 text-[11px] text-muted-foreground">
        {count} {count === 1 ? "resident" : "residents"}
      </span>
    </div>
  );
}
