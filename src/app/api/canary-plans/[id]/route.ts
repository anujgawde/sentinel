import { NextResponse } from "next/server";
import { getPlan, getPlanStatus, getLatestRun, getLatestBaseline } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const plan = getPlan(id);
  if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });

  return NextResponse.json({
    ...plan,
    status: getPlanStatus(plan.id),
    latestRun: getLatestRun(plan.id),
    latestBaseline: getLatestBaseline(plan.id),
  });
}
