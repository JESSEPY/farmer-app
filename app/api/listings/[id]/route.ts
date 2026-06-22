import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data: listing, error } = await supabase
      .from("listings")
      .select("*, farmer:farmer_id(full_name, email, phone)")
      .eq("id", id)
      .single();

    if (error || !listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.status !== "active") {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.id !== listing.farmer_id) {
        return NextResponse.json({ error: "Listing not found" }, { status: 404 });
      }
    }

    return NextResponse.json({ listing });
  } catch (err) {
    console.error("Listing GET error:", err);
    return NextResponse.json({ error: "Failed to fetch listing" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const { data: existing } = await supabase
      .from("listings")
      .select("farmer_id, photos")
      .eq("id", id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (existing.farmer_id !== user.id) {
      return NextResponse.json({ error: "Not authorized to update this listing" }, { status: 403 });
    }

    const formData = await request.formData();
    const updates: Record<string, any> = {};

    const textFields = ["crop", "quantity", "grade", "municipality", "description", "harvest_date", "status"];
    for (const field of textFields) {
      const value = formData.get(field);
      if (value !== null) {
        updates[field] = value;
      }
    }

    const price = formData.get("price");
    if (price !== null) {
      updates.price = parseFloat(price as string);
    }

    const photoFiles = formData.getAll("photos") as File[];
    if (photoFiles.length > 0) {
      const existingPhotos: string[] = Array.isArray(existing.photos) ? existing.photos : [];
      const newPhotoUrls: string[] = [...existingPhotos];

      for (const file of photoFiles) {
        if (file.size === 0) continue;
        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("listing-photos")
          .upload(fileName, file, { contentType: file.type });

        if (uploadError) continue;

        const { data: { publicUrl } } = supabase.storage
          .from("listing-photos")
          .getPublicUrl(fileName);

        newPhotoUrls.push(publicUrl);
      }

      updates.photos = newPhotoUrls;
    }

    updates.updated_at = new Date().toISOString();

    const { data: listing, error } = await supabase
      .from("listings")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ listing });
  } catch (err) {
    console.error("Listing PUT error:", err);
    return NextResponse.json({ error: "Failed to update listing" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const { data: existing } = await supabase
      .from("listings")
      .select("farmer_id")
      .eq("id", id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (existing.farmer_id !== user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const { error } = await supabase
      .from("listings")
      .update({ status: "archived", updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Listing archived" });
  } catch (err) {
    console.error("Listing DELETE error:", err);
    return NextResponse.json({ error: "Failed to archive listing" }, { status: 500 });
  }
}
