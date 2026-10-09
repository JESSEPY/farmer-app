import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/guard";
import { DATASET_TYPES, loadDataset, type DatasetType } from "@/lib/admin/datasets";

export async function GET(request: NextRequest) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const type = request.nextUrl.searchParams.get("type") as DatasetType;
  if (!DATASET_TYPES.includes(type)) {
    return NextResponse.json({ error: "Unknown data type" }, { status: 400 });
  }

  try {
    const dataset = await loadDataset(guard.supabase, type);
    return NextResponse.json(dataset, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("Admin data error:", err);
    return NextResponse.json({ error: "Failed to load data" }, { status: 500 });
  }
}
