import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getExpenses, createExpense } from "@/lib/services/crop-service";
import { MOCK_EXPENSES, MOCK_PLANTINGS } from "@/lib/mock/crops";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const plantingId = searchParams.get("planting_id") || undefined;
    const farmWide = searchParams.get("farm-wide");

    const result = await getExpenses(plantingId, farmWide === "true");

    if (result) {
      return NextResponse.json({ expenses: result.expenses, total: result.total });
    }

    if (farmWide === "true") {
      const allExpenses = MOCK_EXPENSES.map((e) => ({
        ...e,
        planting: MOCK_PLANTINGS.find((p) => p.id === e.planting_id)
          ? { field_name: MOCK_PLANTINGS.find((p) => p.id === e.planting_id)!.field_name }
          : null,
      }));

      const total = allExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
      return NextResponse.json({ expenses: allExpenses, total });
    }

    if (!plantingId) {
      return NextResponse.json({ error: "planting_id is required" }, { status: 400 });
    }

    const expenses = MOCK_EXPENSES.filter((e) => e.planting_id === plantingId);
    const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    return NextResponse.json({ expenses, total });
  } catch (err) {
    console.error("Expenses GET error:", err);
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
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
    const { planting_id, category, amount, date, description, activity_id } = body;

    if (!planting_id || !category || !amount || !date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await createExpense({
      planting_id,
      category,
      amount,
      date,
      description,
      activity_id,
    });

    if (result) {
      return NextResponse.json({ expense: result }, { status: 201 });
    }

    const newExpense = {
      id: `mock-exp-${Date.now()}`,
      planting_id,
      category,
      amount,
      date,
      description: description || null,
      receipt_photo: null,
      activity_id: activity_id || null,
      created_at: new Date().toISOString(),
    };

    return NextResponse.json({ expense: newExpense }, { status: 201 });
  } catch (err) {
    console.error("Expenses POST error:", err);
    return NextResponse.json({ error: "Failed to create expense" }, { status: 500 });
  }
}
