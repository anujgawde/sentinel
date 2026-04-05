import { NextResponse } from "next/server";
import { getRunsForPlan } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get("limit") || "50", 10);
  const runs = getRunsForPlan(id, limit);
  return NextResponse.json(runs);
}
