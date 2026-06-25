import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getHarvests, createHarvest } from "@/lib/services/crop-service";
import { MOCK_HARVESTS } from "@/lib/mock/crops";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const plantingCropId = searchParams.get("planting_crop_id");

    if (!plantingCropId) {
      return NextResponse.json({ error: "planting_crop_id is required" }, { status: 400 });
    }

    const result = await getHarvests(plantingCropId);

    if (result) {
      return NextResponse.json(result);
    }

    const harvests = MOCK_HARVESTS.filter((h) => h.planting_crop_id === plantingCropId);
    const totalYield = harvests.reduce((sum, h) => sum + Number(h.yield_amount), 0);
    const totalRevenue = harvests.reduce((sum, h) => sum + (h.total_revenue ? Number(h.total_revenue) : 0), 0);

    return NextResponse.json({ harvests, total_yield: totalYield, total_revenue: totalRevenue });
  } catch (err) {
    console.error("Harvests GET error:", err);
    return NextResponse.json({ error: "Failed to fetch harvests" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { planting_crop_id, harvest_date, yield_amount, yield_unit, grade, moisture_content, sold_to, price_per_unit, notes } = body;

    if (!planting_crop_id || !harvest_date || !yield_amount || !yield_unit) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await createHarvest({
      planting_crop_id,
      harvest_date,
      yield_amount,
      yield_unit,
      grade,
      moisture_content,
      sold_to,
      price_per_unit,
      notes,
    });

    if (result) {
      return NextResponse.json({ harvest: result }, { status: 201 });
    }

    const totalRevenue = price_per_unit && sold_to
      ? (yield_amount / (yield_unit === "kg" ? 1 : 50)) * price_per_unit
      : null;

    const newHarvest = {
      id: `mock-har-${Date.now()}`,
      planting_crop_id,
      harvest_date,
      yield_amount,
      yield_unit,
      grade: grade || null,
      moisture_content: moisture_content || null,
      sold_to: sold_to || null,
      price_per_unit: price_per_unit || null,
      total_revenue: totalRevenue,
      notes: notes || null,
      photos: [],
      listing_id: null,
      created_at: new Date().toISOString(),
    };

    return NextResponse.json({ harvest: newHarvest }, { status: 201 });
  } catch (err) {
    console.error("Harvests POST error:", err);
    return NextResponse.json({ error: "Failed to record harvest" }, { status: 500 });
  }
}
