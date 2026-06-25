import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPlantings, createPlanting } from "@/lib/services/crop-service";
import { MOCK_PLANTINGS } from "@/lib/mock/crops";
import type { CreatePlantingInput } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const season = searchParams.get("season") || undefined;
    const seasonYear = searchParams.get("season_year") || undefined;
    const status = searchParams.get("status") || "active";
    const limit = searchParams.get("limit") || undefined;

    const result = await getPlantings(user.id, {
      season,
      season_year: seasonYear ? parseInt(seasonYear, 10) : undefined,
      status,
      limit: limit ? parseInt(limit, 10) : undefined,
    });

    if (result && result.length > 0) {
      return NextResponse.json({ plantings: result });
    }

    let plantings = MOCK_PLANTINGS.filter((p) => {
      if (p.status !== status) return false;
      if (season && p.season !== season) return false;
      if (seasonYear && p.season_year !== parseInt(seasonYear, 10)) return false;
      return true;
    });

    if (limit) {
      plantings = plantings.slice(0, parseInt(limit, 10));
    }

    return NextResponse.json({ plantings });
  } catch (err) {
    console.error("Crops GET error:", err);
    const { MOCK_PLANTINGS } = await import("@/lib/mock/crops");
    return NextResponse.json({ plantings: MOCK_PLANTINGS });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: CreatePlantingInput = await request.json();
    const { field_name, municipality, area_ha, season, season_year, planting_date, crops } = body;

    if (!field_name || !municipality || !area_ha || !season || !season_year || !planting_date || !crops?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await createPlanting(user.id, body);

    if (result) {
      return NextResponse.json({ planting: result }, { status: 201 });
    }

    const newId = `mock-${Date.now()}`;
    const newCrops = crops.map((crop, i) => ({
      id: `${newId}-crop-${i}`,
      planting_id: newId,
      crop_type: crop.crop_type,
      variety: crop.variety || null,
      area_ha: crop.area_ha || null,
      expected_harvest_date: crop.expected_harvest_date || null,
      status: "planted" as const,
      current_stage: null,
      is_main: crop.is_main !== false,
      planted_date: crop.planted_date || planting_date,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const newPlanting = {
      id: newId,
      farmer_id: "farmer-mock-001",
      field_name,
      municipality,
      area_ha,
      season,
      season_year,
      planting_date,
      budget_amount: body.budget_amount || 0,
      notes: body.notes || null,
      status: "active" as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      crops: newCrops,
      activities: [],
      harvests: [],
      expense_total: 0,
    };

    return NextResponse.json({ planting: newPlanting }, { status: 201 });
  } catch (err) {
    console.error("Crops POST error:", err);
    return NextResponse.json({ error: "Failed to create planting" }, { status: 500 });
  }
}
