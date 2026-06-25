import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getActivities, createActivity } from "@/lib/services/crop-service";
import { MOCK_ACTIVITIES, MOCK_EXPENSES } from "@/lib/mock/crops";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const plantingId = searchParams.get("planting_id");
    const type = searchParams.get("type") || undefined;

    if (!plantingId) {
      return NextResponse.json({ error: "planting_id is required" }, { status: 400 });
    }

    const result = await getActivities(plantingId, type);

    if (result) {
      return NextResponse.json({ activities: result });
    }

    let activities = MOCK_ACTIVITIES.filter((a) => a.planting_id === plantingId);

    if (type) {
      activities = activities.filter((a) => a.type === type);
    }

    activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const activitiesWithExpenses = activities.map((act) => ({
      ...act,
      expense: act.expense_id
        ? MOCK_EXPENSES.find((e) => e.id === act.expense_id) || null
        : null,
    }));

    return NextResponse.json({ activities: activitiesWithExpenses });
  } catch (err) {
    console.error("Activities GET error:", err);
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 });
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
    const { planting_id, crop_id, type, date, notes, product_name, quantity, unit, expense_amount, expense_category } = body;

    if (!planting_id || !type || !date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await createActivity({
      planting_id,
      crop_id,
      type,
      date,
      notes,
      product_name,
      quantity: quantity || undefined,
      unit,
      expense_amount: expense_amount || undefined,
      expense_category: expense_category || undefined,
    });

    if (result) {
      return NextResponse.json({ activity: result }, { status: 201 });
    }

    const newActivity = {
      id: `mock-act-${Date.now()}`,
      planting_id,
      crop_id: crop_id || null,
      type,
      date,
      notes: notes || null,
      photos: [],
      product_name: product_name || null,
      quantity: quantity || null,
      unit: unit || null,
      expense_id: null,
      created_at: new Date().toISOString(),
    };

    return NextResponse.json({ activity: newActivity }, { status: 201 });
  } catch (err) {
    console.error("Activities POST error:", err);
    return NextResponse.json({ error: "Failed to create activity" }, { status: 500 });
  }
}
