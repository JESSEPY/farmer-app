import { NextResponse } from "next/server";
import { getMasbateMunicipalities } from "@/lib/services/municipalities";

export async function GET() {
  const { names, source } = await getMasbateMunicipalities();
  return NextResponse.json(
    { municipalities: names, source },
    { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } }
  );
}
