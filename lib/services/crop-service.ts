import { createClient } from "@/lib/supabase/server";
import type {
  Planting,
  PlantingCrop,
  Activity,
  Expense,
  Harvest,
} from "@/lib/types";

interface GetPlantingsFilters {
  season?: string;
  season_year?: number;
  status?: string;
  limit?: number;
}

interface CreatePlantingData {
  field_name: string;
  municipality: string;
  area_ha: number;
  season: string;
  season_year: number;
  planting_date: string;
  budget_amount?: number;
  notes?: string;
  crops: {
    crop_type: string;
    variety?: string;
    area_ha?: number;
    expected_harvest_date?: string;
    is_main?: boolean;
    planted_date?: string;
  }[];
}

interface UpdatePlantingData {
  field_name?: string;
  municipality?: string;
  area_ha?: number;
  season?: string;
  season_year?: number;
  planting_date?: string;
  budget_amount?: number;
  notes?: string;
  status?: string;
}

interface CreateActivityData {
  planting_id: string;
  crop_id?: string;
  type: string;
  date: string;
  notes?: string;
  product_name?: string;
  quantity?: number;
  unit?: string;
  expense_amount?: number;
  expense_category?: string;
}

interface CreateExpenseData {
  planting_id: string;
  category: string;
  amount: number;
  date: string;
  description?: string;
  activity_id?: string;
}

interface CreateHarvestData {
  planting_crop_id: string;
  harvest_date: string;
  yield_amount: number;
  yield_unit: string;
  grade?: string;
  moisture_content?: number;
  sold_to?: string;
  price_per_unit?: number;
  notes?: string;
}

function toPlanting(
  row: Record<string, unknown>,
  crops: PlantingCrop[],
  activities: Activity[],
  harvests: Harvest[],
  expenseTotal: number,
): Planting {
  return {
    id: row.id as string,
    farmer_id: row.farmer_id as string,
    field_name: row.field_name as string,
    municipality: row.municipality as string,
    area_ha: Number(row.area_ha),
    season: row.season as Planting["season"],
    season_year: row.season_year as number,
    planting_date: row.planting_date as string,
    budget_amount: Number(row.budget_amount),
    notes: (row.notes as string) || null,
    status: row.status as Planting["status"],
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    crops,
    activities,
    harvests,
    expense_total: expenseTotal,
  };
}

export async function getPlantings(
  farmerId: string,
  filters: GetPlantingsFilters = {},
) {
  const supabase = await createClient();

  let query = supabase
    .from("plantings")
    .select("*, planting_crops(*)")
    .eq("farmer_id", farmerId)
    .order("created_at", { ascending: false });

  if (filters.status) {
    query = query.eq("status", filters.status);
  }
  if (filters.season) {
    query = query.eq("season", filters.season);
  }
  if (filters.season_year) {
    query = query.eq("season_year", filters.season_year);
  }
  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  const { data: rows, error } = await query;
  if (error || !rows?.length) return null;

  const plantingIds = rows.map((r) => r.id);

  const [{ data: expenseRows }, { data: activityRows }, { data: harvestRows }] =
    await Promise.all([
      supabase
        .from("expenses")
        .select("planting_id, amount")
        .in("planting_id", plantingIds),
      supabase
        .from("activities")
        .select("*")
        .in("planting_id", plantingIds)
        .order("date", { ascending: false }),
      supabase
        .from("harvests")
        .select("*, planting_crop:planting_crop_id(crop_type)")
        .in(
          "planting_crop_id",
          rows.flatMap(
            (r) =>
              (r.planting_crops as { id: string }[])?.map((pc) => pc.id) || [],
          ),
        ),
    ]);

  const expenseMap = new Map<string, number>();
  expenseRows?.forEach((e) => {
    const current = expenseMap.get(e.planting_id) || 0;
    expenseMap.set(e.planting_id, current + Number(e.amount));
  });

  const activitiesByPlanting = new Map<string, Activity[]>();
  activityRows?.forEach((a) => {
    const list = activitiesByPlanting.get(a.planting_id) || [];
    if (list.length < 5) {
      list.push({
        id: a.id,
        planting_id: a.planting_id,
        crop_id: a.crop_id,
        type: a.type,
        date: a.date,
        notes: a.notes,
        photos: a.photos || [],
        product_name: a.product_name,
        quantity: a.quantity ? Number(a.quantity) : null,
        unit: a.unit,
        expense_id: a.expense_id,
        created_at: a.created_at,
      });
    }
    activitiesByPlanting.set(a.planting_id, list);
  });

  const harvestsByCropId = new Map<string, Harvest[]>();
  (harvestRows as unknown as Harvest[])?.forEach((h) => {
    const list = harvestsByCropId.get(h.planting_crop_id) || [];
    list.push(h);
    harvestsByCropId.set(h.planting_crop_id, list);
  });

  return rows.map((row) => {
    const crops: PlantingCrop[] = (
      (row.planting_crops || []) as Record<string, unknown>[]
    ).map((pc: Record<string, unknown>) => ({
      id: pc.id as string,
      planting_id: pc.planting_id as string,
      crop_type: pc.crop_type as string,
      variety: (pc.variety as string) || null,
      area_ha: pc.area_ha ? Number(pc.area_ha) : null,
      expected_harvest_date: (pc.expected_harvest_date as string) || null,
      status: pc.status as PlantingCrop["status"],
      current_stage: (pc.current_stage as string) || null,
      is_main: pc.is_main as boolean,
      planted_date: (pc.planted_date as string) || null,
      created_at: pc.created_at as string,
      updated_at: pc.updated_at as string,
    }));

    const harvests = crops.flatMap(
      (c) => harvestsByCropId.get(c.id) || [],
    );

    return toPlanting(
      row,
      crops,
      activitiesByPlanting.get(row.id) || [],
      harvests,
      expenseMap.get(row.id) || 0,
    );
  });
}

export async function getPlantingById(id: string) {
  const supabase = await createClient();

  const { data: row, error } = await supabase
    .from("plantings")
    .select("*, planting_crops(*)")
    .eq("id", id)
    .single();

  if (error || !row) return null;

  const plantingCropIds = (
    (row.planting_crops || []) as { id: string }[]
  ).map((pc) => pc.id);

  const [
    { data: expenseRows },
    { data: activityRows },
    { data: harvestRows },
  ] = await Promise.all([
    supabase.from("expenses").select("*").eq("planting_id", id),
    supabase
      .from("activities")
      .select("*")
      .eq("planting_id", id)
      .order("date", { ascending: false }),
    plantingCropIds.length
      ? supabase
          .from("harvests")
          .select("*")
          .in("planting_crop_id", plantingCropIds)
      : Promise.resolve({ data: [] }),
  ]);

  const crops: PlantingCrop[] = (
    (row.planting_crops || []) as Record<string, unknown>[]
  ).map((pc: Record<string, unknown>) => ({
    id: pc.id as string,
    planting_id: pc.planting_id as string,
    crop_type: pc.crop_type as string,
    variety: (pc.variety as string) || null,
    area_ha: pc.area_ha ? Number(pc.area_ha) : null,
    expected_harvest_date: (pc.expected_harvest_date as string) || null,
    status: pc.status as PlantingCrop["status"],
    current_stage: (pc.current_stage as string) || null,
    is_main: pc.is_main as boolean,
    planted_date: (pc.planted_date as string) || null,
    created_at: pc.created_at as string,
    updated_at: pc.updated_at as string,
  }));

  const expenses: Expense[] = (expenseRows || []).map((e) => ({
    id: e.id,
    planting_id: e.planting_id,
    category: e.category,
    amount: Number(e.amount),
    date: e.date,
    description: e.description,
    receipt_photo: e.receipt_photo,
    activity_id: e.activity_id,
    created_at: e.created_at,
  }));

  const activities: Activity[] = (activityRows || []).map((a) => ({
    id: a.id,
    planting_id: a.planting_id,
    crop_id: a.crop_id,
    type: a.type,
    date: a.date,
    notes: a.notes,
    photos: a.photos || [],
    product_name: a.product_name,
    quantity: a.quantity ? Number(a.quantity) : null,
    unit: a.unit,
    expense_id: a.expense_id,
    created_at: a.created_at,
  }));

  const harvests: Harvest[] = ((harvestRows || []) as unknown as Harvest[]).map(
    (h) => ({
      ...h,
      yield_amount: Number(h.yield_amount),
      total_revenue: h.total_revenue ? Number(h.total_revenue) : null,
      price_per_unit: h.price_per_unit ? Number(h.price_per_unit) : null,
      moisture_content: h.moisture_content
        ? Number(h.moisture_content)
        : null,
    }),
  );

  const expenseTotal = expenses.reduce(
    (sum, e) => sum + Number(e.amount),
    0,
  );

  return toPlanting(row, crops, activities, harvests, expenseTotal);
}

export async function createPlanting(
  farmerId: string,
  data: CreatePlantingData,
) {
  const supabase = await createClient();

  const { data: planting, error } = await supabase
    .from("plantings")
    .insert({
      farmer_id: farmerId,
      field_name: data.field_name,
      municipality: data.municipality,
      area_ha: data.area_ha,
      season: data.season,
      season_year: data.season_year,
      planting_date: data.planting_date,
      budget_amount: data.budget_amount || 0,
      notes: data.notes || null,
    })
    .select()
    .single();

  if (error || !planting) return null;

  const cropRows = data.crops.map((c) => ({
    planting_id: planting.id,
    crop_type: c.crop_type,
    variety: c.variety || null,
    area_ha: c.area_ha || null,
    expected_harvest_date: c.expected_harvest_date || null,
    is_main: c.is_main !== false,
    planted_date: c.planted_date || data.planting_date,
  }));

  const { data: plantingCrops } = await supabase
    .from("planting_crops")
    .insert(cropRows)
    .select();

  return toPlanting(
    planting,
    (plantingCrops || []).map((pc: Record<string, unknown>) => ({
      id: pc.id as string,
      planting_id: pc.planting_id as string,
      crop_type: pc.crop_type as string,
      variety: (pc.variety as string) || null,
      area_ha: pc.area_ha ? Number(pc.area_ha) : null,
      expected_harvest_date: (pc.expected_harvest_date as string) || null,
      status: pc.status as PlantingCrop["status"],
      current_stage: (pc.current_stage as string) || null,
      is_main: pc.is_main as boolean,
      planted_date: (pc.planted_date as string) || null,
      created_at: pc.created_at as string,
      updated_at: pc.updated_at as string,
    })),
    [],
    [],
    0,
  );
}

export async function updatePlanting(
  id: string,
  data: UpdatePlantingData,
) {
  const supabase = await createClient();

  const { data: planting, error } = await supabase
    .from("plantings")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error || !planting) return null;
  return planting;
}

export async function archivePlanting(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("plantings")
    .update({ status: "archived" })
    .eq("id", id);

  return !error;
}

export async function getActivities(
  plantingId: string,
  type?: string,
) {
  const supabase = await createClient();

  let query = supabase
    .from("activities")
    .select("*")
    .eq("planting_id", plantingId)
    .order("date", { ascending: false });

  if (type) {
    query = query.eq("type", type);
  }

  const { data: rows, error } = await query;
  if (error || !rows) return null;

  const withExpenses = await Promise.all(
    rows.map(async (a) => {
      let expense = null;
      if (a.expense_id) {
        const { data: e } = await supabase
          .from("expenses")
          .select("*")
          .eq("id", a.expense_id)
          .single();
        expense = e;
      }
      return {
        id: a.id,
        planting_id: a.planting_id,
        crop_id: a.crop_id,
        type: a.type,
        date: a.date,
        notes: a.notes,
        photos: a.photos || [],
        product_name: a.product_name,
        quantity: a.quantity ? Number(a.quantity) : null,
        unit: a.unit,
        expense_id: a.expense_id,
        created_at: a.created_at,
        expense,
      };
    }),
  );

  return withExpenses;
}

export async function createActivity(data: CreateActivityData) {
  const supabase = await createClient();

  if (data.expense_amount && data.expense_category) {
    const { data: expense, error: expenseError } = await supabase
      .from("expenses")
      .insert({
        planting_id: data.planting_id,
        category: data.expense_category,
        amount: data.expense_amount,
        date: data.date,
        description: data.notes || null,
      })
      .select()
      .single();

    if (expenseError) return null;

    const { data: activity, error: activityError } = await supabase
      .from("activities")
      .insert({
        planting_id: data.planting_id,
        crop_id: data.crop_id || null,
        type: data.type,
        date: data.date,
        notes: data.notes || null,
        product_name: data.product_name || null,
        quantity: data.quantity || null,
        unit: data.unit || null,
        expense_id: expense.id,
      })
      .select()
      .single();

    if (activityError) return null;

    return {
      ...activity,
      quantity: activity.quantity ? Number(activity.quantity) : null,
      expense,
    };
  }

  const { data: activity, error } = await supabase
    .from("activities")
    .insert({
      planting_id: data.planting_id,
      crop_id: data.crop_id || null,
      type: data.type,
      date: data.date,
      notes: data.notes || null,
      product_name: data.product_name || null,
      quantity: data.quantity || null,
      unit: data.unit || null,
    })
    .select()
    .single();

  if (error || !activity) return null;

  return {
    ...activity,
    quantity: activity.quantity ? Number(activity.quantity) : null,
    expense: null,
  };
}

export async function getExpenses(
  plantingId?: string,
  farmWide?: boolean,
) {
  const supabase = await createClient();

  if (farmWide) {
    const { data: supabaseUser } = await supabase.auth.getUser();
    if (!supabaseUser.user) return null;

    const { data: plantings } = await supabase
      .from("plantings")
      .select("id, field_name")
      .eq("farmer_id", supabaseUser.user.id);

    if (!plantings?.length) return { expenses: [], total: 0 };

    const plantingIds = plantings.map((p) => p.id);

    const { data: rows } = await supabase
      .from("expenses")
      .select("*")
      .in("planting_id", plantingIds);

    const fieldMap = new Map(plantings.map((p) => [p.id, p.field_name]));

    const expenses = (rows || []).map((e) => ({
      id: e.id,
      planting_id: e.planting_id,
      category: e.category,
      amount: Number(e.amount),
      date: e.date,
      description: e.description,
      receipt_photo: e.receipt_photo,
      activity_id: e.activity_id,
      created_at: e.created_at,
      planting: { field_name: fieldMap.get(e.planting_id) || null },
    }));

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    return { expenses, total };
  }

  if (!plantingId) return null;

  const { data: rows, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("planting_id", plantingId);

  if (error) return null;

  const expenses = (rows || []).map((e) => ({
    id: e.id,
    planting_id: e.planting_id,
    category: e.category,
    amount: Number(e.amount),
    date: e.date,
    description: e.description,
    receipt_photo: e.receipt_photo,
    activity_id: e.activity_id,
    created_at: e.created_at,
  }));

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  return { expenses, total };
}

export async function createExpense(data: CreateExpenseData) {
  const supabase = await createClient();

  const { data: expense, error } = await supabase
    .from("expenses")
    .insert({
      planting_id: data.planting_id,
      category: data.category,
      amount: data.amount,
      date: data.date,
      description: data.description || null,
      activity_id: data.activity_id || null,
    })
    .select()
    .single();

  if (error || !expense) return null;

  return {
    ...expense,
    amount: Number(expense.amount),
  };
}

export async function getHarvests(plantingCropId: string) {
  const supabase = await createClient();

  const { data: rows, error } = await supabase
    .from("harvests")
    .select("*")
    .eq("planting_crop_id", plantingCropId);

  if (error) return null;

  const harvests = (rows || []).map((h) => ({
    id: h.id,
    planting_crop_id: h.planting_crop_id,
    harvest_date: h.harvest_date,
    yield_amount: Number(h.yield_amount),
    yield_unit: h.yield_unit,
    grade: h.grade,
    moisture_content: h.moisture_content
      ? Number(h.moisture_content)
      : null,
    sold_to: h.sold_to,
    price_per_unit: h.price_per_unit
      ? Number(h.price_per_unit)
      : null,
    total_revenue: h.total_revenue ? Number(h.total_revenue) : null,
    notes: h.notes,
    photos: h.photos || [],
    listing_id: h.listing_id,
    created_at: h.created_at,
  }));

  const totalYield = harvests.reduce(
    (sum, h) => sum + h.yield_amount,
    0,
  );
  const totalRevenue = harvests.reduce(
    (sum, h) => sum + (h.total_revenue || 0),
    0,
  );

  return { harvests, total_yield: totalYield, total_revenue: totalRevenue };
}

export async function createHarvest(data: CreateHarvestData) {
  const supabase = await createClient();

  const totalRevenue = data.price_per_unit && data.sold_to
    ? data.yield_amount * data.price_per_unit
    : null;

  const { data: harvest, error } = await supabase
    .from("harvests")
    .insert({
      planting_crop_id: data.planting_crop_id,
      harvest_date: data.harvest_date,
      yield_amount: data.yield_amount,
      yield_unit: data.yield_unit,
      grade: data.grade || null,
      moisture_content: data.moisture_content || null,
      sold_to: data.sold_to || null,
      price_per_unit: data.price_per_unit || null,
      total_revenue: totalRevenue,
      notes: data.notes || null,
    })
    .select()
    .single();

  if (error || !harvest) return null;

  return {
    ...harvest,
    yield_amount: Number(harvest.yield_amount),
    total_revenue: harvest.total_revenue
      ? Number(harvest.total_revenue)
      : null,
    price_per_unit: harvest.price_per_unit
      ? Number(harvest.price_per_unit)
      : null,
    moisture_content: harvest.moisture_content
      ? Number(harvest.moisture_content)
      : null,
  };
}
