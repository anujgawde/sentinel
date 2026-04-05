import { NextResponse } from "next/server";
import { listAlerts } from "@/lib/db";
import type { AlertState } from "@/lib/schema";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const state = url.searchParams.get("state") as AlertState | null;
  const alerts = listAlerts(state || undefined);
  return NextResponse.json(alerts);
}
