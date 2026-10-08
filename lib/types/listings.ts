export interface Listing {
  id: string;
  farmer_id: string;
  crop: string;
  quantity: string;
  price: number;
  grade: string;
  municipality: string;
  description: string | null;
  harvest_date: string | null;
  photos: string[];
  status: "active" | "archived";
  created_at: string;
  updated_at: string;
}

export interface ListingWithFarmer extends Listing {
  // null when the seller profile is not readable by the current user
  farmer: {
    full_name: string | null;
    phone: string | null;
  } | null;
}

export interface CreateListingInput {
  crop: string;
  quantity: string;
  price: number;
  grade: string;
  municipality: string;
  description?: string;
  harvest_date?: string;
}

export interface UpdateListingInput {
  crop?: string;
  quantity?: string;
  price?: number;
  grade?: string;
  municipality?: string;
  description?: string;
  harvest_date?: string;
  status?: "active" | "archived";
}
