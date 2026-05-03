import { NextResponse } from "next/server";

export async function GET() {
  const version = Date.now().toString();
  
  return NextResponse.json({ version });
}