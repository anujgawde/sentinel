import { NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { createPlan, listPlans, getPlanStatus, getLatestRun, getLatestBaseline } from "@/lib/db";

export async function GET() {
  const plans = listPlans();
  const enriched = plans.map((plan) => ({
    ...plan,
    status: getPlanStatus(plan.id),
    latestRun: getLatestRun(plan.id),
    latestBaseline: getLatestBaseline(plan.id),
  }));
  return NextResponse.json(enriched);
}

export async function POST(request: Request) {
  const body = await request.json();
  const now = new Date().toISOString();
  const plan = createPlan({
    id: uuid(),
    name: body.name,
    workflowUrl: body.workflowUrl,
    outcomeSelectors: body.outcomeSelectors || [],
    mode: body.mode || "login",
    schedule: body.schedule || "manual",
    enabled: body.enabled !== false,
    createdAt: now,
    updatedAt: now,
  });
  return NextResponse.json(plan, { status: 201 });
}
