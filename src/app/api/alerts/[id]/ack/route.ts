import { NextResponse } from "next/server";
import { updateAlertState } from "@/lib/db";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const alert = updateAlertState(id, "acknowledged");
  if (!alert) return NextResponse.json({ error: "Alert not found" }, { status: 404 });
  return NextResponse.json(alert);
}
