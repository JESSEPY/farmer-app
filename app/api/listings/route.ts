import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const crop = searchParams.get("crop");
    const municipality = searchParams.get("municipality");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "newest";

    let query = supabase
      .from("listings")
      .select("*, farmer:farmer_id(full_name, email, phone)")
      .eq("status", "active");

    switch (sort) {
      case "price_asc":
        query = query.order("price", { ascending: true });
        break;
      case "price_desc":
        query = query.order("price", { ascending: false });
        break;
      case "quantity_desc":
        query = query.order("quantity", { ascending: false });
        break;
      default:
        query = query.order("created_at", { ascending: false });
    }

    if (crop) {
      query = query.eq("crop", crop);
    }

    if (municipality) {
      query = query.eq("municipality", municipality);
    }

    if (search) {
      query = query.ilike("crop", `%${search}%`);
    }

    const { data: listings, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ listings });
  } catch (err) {
    console.error("Listings GET error:", err);
    return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "farmer") {
      return NextResponse.json({ error: "Only farmers can create listings" }, { status: 403 });
    }

    const formData = await request.formData();
    const crop = formData.get("crop") as string;
    const quantity = formData.get("quantity") as string;
    const price = parseFloat(formData.get("price") as string);
    const grade = formData.get("grade") as string;
    const municipality = formData.get("municipality") as string;
    const description = formData.get("description") as string | null;
    const harvest_date = formData.get("harvest_date") as string | null;
    const photoFiles = formData.getAll("photos") as File[];

    if (!crop || !quantity || !price || !grade || !municipality) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const photoUrls: string[] = [];
    for (const file of photoFiles) {
      if (file.size === 0) continue;
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("listing-photos")
        .upload(fileName, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        console.error("Photo upload error:", uploadError);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("listing-photos")
        .getPublicUrl(fileName);

      photoUrls.push(publicUrl);
    }

    const { data: listing, error } = await supabase
      .from("listings")
      .insert({
        farmer_id: user.id,
        crop,
        quantity,
        price,
        grade,
        municipality,
        description: description || null,
        harvest_date: harvest_date || null,
        photos: photoUrls,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ listing }, { status: 201 });
  } catch (err) {
    console.error("Listings POST error:", err);
    return NextResponse.json({ error: "Failed to create listing" }, { status: 500 });
  }
}
