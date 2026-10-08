import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPlantingById, updatePlanting, archivePlanting } from "@/lib/services/crop-service";
import { MOCK_PLANTINGS, isSampleId } from "@/lib/mock/crops";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (isSampleId(id)) {
      const planting = MOCK_PLANTINGS.find((p) => p.id === id);
      if (!planting) {
        return NextResponse.json({ error: "Planting not found" }, { status: 404 });
      }
      return NextResponse.json({ planting, sample: true });
    }

    const result = await getPlantingById(id);

    if (!result) {
      return NextResponse.json({ error: "Planting not found" }, { status: 404 });
    }

    return NextResponse.json({ planting: result, sample: false });
  } catch (err) {
    console.error("Planting GET error:", err);
    return NextResponse.json({ error: "Failed to fetch planting" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (isSampleId(id)) {
      return NextResponse.json({ error: "This is sample data and cannot be edited. Add your own crop first." }, { status: 400 });
    }
    const body = await request.json();

    const allowedFields = [
      "field_name", "municipality", "area_ha", "season",
      "season_year", "planting_date", "budget_amount", "notes", "status",
    ];

    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    const result = await updatePlanting(id, updates);

    if (result) {
      return NextResponse.json({ planting: result });
    }

    return NextResponse.json({ error: "Planting not found or could not be updated" }, { status: 404 });
  } catch (err) {
    console.error("Planting PUT error:", err);
    return NextResponse.json({ error: "Failed to update planting" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (isSampleId(id)) {
      return NextResponse.json({ error: "This is sample data and cannot be archived." }, { status: 400 });
    }
    const ok = await archivePlanting(id);

    if (ok) {
      return NextResponse.json({ message: "Planting archived" });
    }

    return NextResponse.json({ error: "Planting not found or could not be archived" }, { status: 404 });
  } catch (err) {
    console.error("Planting DELETE error:", err);
    return NextResponse.json({ error: "Failed to archive planting" }, { status: 500 });
  }
}
