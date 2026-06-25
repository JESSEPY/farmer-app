export type Season = "wet" | "dry";
export type PlantingStatus = "active" | "archived";
export type CropStatus = "planted" | "growing" | "harvest-ready" | "harvested";
export type ActivityType =
  | "land-preparation"
  | "planting"
  | "fertilizer"
  | "pesticide"
  | "herbicide"
  | "irrigation"
  | "weeding"
  | "observation"
  | "pest-spotted"
  | "weather"
  | "harvest"
  | "post-harvest"
  | "expense-only"
  | "other";
export type ExpenseCategory =
  | "seeds"
  | "fertilizer"
  | "pesticide"
  | "herbicide"
  | "labor"
  | "irrigation"
  | "transport"
  | "rental"
  | "post-harvest"
  | "other";
export type HarvestGrade = "premium" | "standard" | "reject";
export type WeatherSource = "manual" | "api";

export interface Planting {
  id: string;
  farmer_id: string;
  field_name: string;
  municipality: string;
  area_ha: number;
  season: Season;
  season_year: number;
  planting_date: string;
  budget_amount: number;
  notes: string | null;
  status: PlantingStatus;
  created_at: string;
  updated_at: string;
  crops?: PlantingCrop[];
  activities?: Activity[];
  expenses?: Expense[];
  harvests?: Harvest[];
  expense_total?: number;
}

export interface PlantingCrop {
  id: string;
  planting_id: string;
  crop_type: string;
  variety: string | null;
  area_ha: number | null;
  expected_harvest_date: string | null;
  status: CropStatus;
  current_stage: string | null;
  is_main: boolean;
  planted_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  planting_id: string;
  crop_id: string | null;
  type: ActivityType;
  date: string;
  notes: string | null;
  photos: string[];
  product_name: string | null;
  quantity: number | null;
  unit: string | null;
  expense_id: string | null;
  created_at: string;
}

export interface Expense {
  id: string;
  planting_id: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  description: string | null;
  receipt_photo: string | null;
  activity_id: string | null;
  created_at: string;
}

export interface Harvest {
  id: string;
  planting_crop_id: string;
  harvest_date: string;
  yield_amount: number;
  yield_unit: string;
  grade: HarvestGrade | null;
  moisture_content: number | null;
  sold_to: string | null;
  price_per_unit: number | null;
  total_revenue: number | null;
  notes: string | null;
  photos: string[];
  listing_id: string | null;
  created_at: string;
}

export interface WeatherLog {
  id: string;
  planting_id: string;
  date: string;
  condition: string;
  notes: string | null;
  source: WeatherSource;
  created_at: string;
}

export interface CreatePlantingInput {
  field_name: string;
  municipality: string;
  area_ha: number;
  season: Season;
  season_year: number;
  planting_date: string;
  budget_amount?: number;
  notes?: string;
  crops: CreatePlantingCropInput[];
}

export interface CreatePlantingCropInput {
  crop_type: string;
  variety?: string;
  area_ha?: number;
  expected_harvest_date?: string;
  is_main?: boolean;
  planted_date?: string;
}

export interface UpdatePlantingInput {
  field_name?: string;
  municipality?: string;
  area_ha?: number;
  season?: Season;
  season_year?: number;
  planting_date?: string;
  budget_amount?: number;
  notes?: string;
  status?: PlantingStatus;
}

export interface CreateActivityInput {
  planting_id: string;
  crop_id?: string;
  type: ActivityType;
  date: string;
  notes?: string;
  product_name?: string;
  quantity?: number;
  unit?: string;
  photos?: string[];
  expense_amount?: number;
  expense_category?: ExpenseCategory;
}

export interface CreateExpenseInput {
  planting_id: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  description?: string;
  activity_id?: string;
}

export interface CreateHarvestInput {
  planting_crop_id: string;
  harvest_date: string;
  yield_amount: number;
  yield_unit: string;
  grade?: HarvestGrade;
  moisture_content?: number;
  sold_to?: string;
  price_per_unit?: number;
  notes?: string;
}

export const CROP_TYPES = [
  "Rice (Palay)",
  "Corn",
  "Coconut",
  "Cassava",
  "Sweet Potato",
  "Peanut",
  "Mongo (Mung Bean)",
  "Tomato",
  "Eggplant",
  "Pepper",
  "Okra",
  "Squash",
  "Banana",
  "Papaya",
  "Watermelon",
] as const;

export const MUNICIPALITIES = [
  "Mobo", "Milagros", "Aroroy", "Baleno", "Balud", "Cawayan",
  "Claveria", "Dapa", "Esperanza", "Mandaon", "Pilar",
  "San Fernando", "San Jose", "Uson",
] as const;

export const ACTIVITY_TYPES: { value: ActivityType; label: string; icon: string }[] = [
  { value: "land-preparation", label: "Land Preparation", icon: "🚜" },
  { value: "planting", label: "Planting / Sowing", icon: "🌱" },
  { value: "fertilizer", label: "Fertilizer Application", icon: "🧪" },
  { value: "pesticide", label: "Pesticide Application", icon: "🪲" },
  { value: "herbicide", label: "Herbicide Application", icon: "🌿" },
  { value: "irrigation", label: "Irrigation / Drainage", icon: "💧" },
  { value: "weeding", label: "Weeding", icon: "🔧" },
  { value: "observation", label: "Field Observation", icon: "👁️" },
  { value: "pest-spotted", label: "Pest / Disease Spotted", icon: "⚠️" },
  { value: "weather", label: "Weather Note", icon: "☀️" },
  { value: "harvest", label: "Harvest", icon: "🌾" },
  { value: "post-harvest", label: "Post-Harvest", icon: "🏭" },
  { value: "expense-only", label: "Expense Only", icon: "💰" },
  { value: "other", label: "Other", icon: "📌" },
];

export const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: "seeds", label: "Seeds" },
  { value: "fertilizer", label: "Fertilizer" },
  { value: "pesticide", label: "Pesticide" },
  { value: "herbicide", label: "Herbicide" },
  { value: "labor", label: "Labor" },
  { value: "irrigation", label: "Irrigation" },
  { value: "transport", label: "Transport" },
  { value: "rental", label: "Rental" },
  { value: "post-harvest", label: "Post-Harvest" },
  { value: "other", label: "Other" },
];
