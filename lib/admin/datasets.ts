import type { createClient } from "@/lib/supabase/server";
import { fetchAll } from "@/lib/admin/guard";

type Supabase = Awaited<ReturnType<typeof createClient>>;
type Row = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

export const DATASET_TYPES = ["farmers", "plantings", "harvests", "listings"] as const;
export type DatasetType = (typeof DATASET_TYPES)[number];

export interface Dataset {
  headers: string[];
  rows: (string | number | null)[][];
}

// PostgREST embeds can type as object or array; normalise to a single row.
const one = (v: unknown) => (Array.isArray(v) ? v[0] : v) as Row | null | undefined;

// Every dataset starts with [Farmer name, Phone] so the UI can filter by farmer.
export async function loadDataset(supabase: Supabase, type: DatasetType): Promise<Dataset> {
  if (type === "farmers") {
    const [farmers, plantings, listings] = await Promise.all([
      fetchAll<Row>((a, b) => supabase.from("profiles").select("id, full_name, phone, email, created_at")
        .eq("role", "farmer").order("created_at", { ascending: false }).range(a, b)),
      fetchAll<Row>((a, b) => supabase.from("plantings").select("farmer_id, area_ha").range(a, b)),
      fetchAll<Row>((a, b) => supabase.from("listings").select("farmer_id").range(a, b)),
    ]);
    const mine = (arr: Row[], id: string) => arr.filter((r) => r.farmer_id === id);
    return {
      headers: ["Name", "Phone", "Email", "Joined", "Plantings", "Total area (ha)", "Listings"],
      rows: farmers.map((f) => {
        const p = mine(plantings, f.id);
        return [f.full_name, f.phone, f.email, f.created_at, p.length,
          p.reduce((n, x) => n + (Number(x.area_ha) || 0), 0), mine(listings, f.id).length];
      }),
    };
  }

  if (type === "plantings") {
    const data = await fetchAll<Row>((a, b) => supabase.from("plantings")
      .select("*, farmer:farmer_id(full_name, phone), planting_crops(crop_type, variety, status)")
      .order("created_at", { ascending: false }).range(a, b));
    return {
      headers: ["Farmer", "Phone", "Field", "Municipality", "Area (ha)", "Season", "Year",
        "Planting date", "Budget", "Status", "Crops", "Notes"],
      rows: data.map((p) => [one(p.farmer)?.full_name, one(p.farmer)?.phone, p.field_name,
        p.municipality, p.area_ha, p.season, p.season_year, p.planting_date, p.budget_amount, p.status,
        (p.planting_crops ?? []).map((c: Row) => `${c.crop_type}${c.variety ? ` (${c.variety})` : ""} [${c.status}]`).join("; "),
        p.notes]),
    };
  }

  if (type === "harvests") {
    const data = await fetchAll<Row>((a, b) => supabase.from("harvests")
      .select("*, planting_crops(crop_type, plantings(field_name, municipality, farmer:farmer_id(full_name, phone)))")
      .order("harvest_date", { ascending: false }).range(a, b));
    return {
      headers: ["Farmer", "Phone", "Field", "Municipality", "Crop", "Harvest date", "Yield", "Unit",
        "Grade", "Moisture %", "Sold to", "Price per unit", "Total revenue", "Notes"],
      rows: data.map((h) => {
        const pc = one(h.planting_crops), pl = one(pc?.plantings), f = one(pl?.farmer);
        return [f?.full_name, f?.phone, pl?.field_name, pl?.municipality, pc?.crop_type, h.harvest_date,
          h.yield_amount, h.yield_unit, h.grade, h.moisture_content, h.sold_to, h.price_per_unit,
          h.total_revenue, h.notes];
      }),
    };
  }

  const data = await fetchAll<Row>((a, b) => supabase.from("listings")
    .select("*, farmer:farmer_id(full_name, phone)").order("created_at", { ascending: false }).range(a, b));
  return {
    headers: ["Farmer", "Phone", "Crop", "Quantity", "Price", "Grade", "Municipality",
      "Harvest date", "Status", "Description", "Posted"],
    rows: data.map((l) => [one(l.farmer)?.full_name, one(l.farmer)?.phone, l.crop, l.quantity,
      l.price, l.grade, l.municipality, l.harvest_date, l.status, l.description, l.created_at]),
  };
}
