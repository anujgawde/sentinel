import { NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { getRun, getLatestBaseline, createBaseline } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: canaryPlanId } = await params;
  const body = await request.json();
  const runId = body.runId;

  const run = getRun(runId);
  if (!run) return NextResponse.json({ error: "Run not found" }, { status: 404 });

  const latestBaseline = getLatestBaseline(canaryPlanId);
  const version = latestBaseline ? latestBaseline.version + 1 : 1;

  const baseline = createBaseline({
    id: uuid(),
    canaryPlanId,
    version,
    capturedAt: new Date().toISOString(),
    capturedBy: "operator",
    artifacts: {
      redirectHosts: run.artifacts.redirectHosts,
      redirectHostsHash: run.artifacts.redirectHostsHash,
      domFingerprintHash: run.artifacts.domFingerprintHash,
      stepShapeHash: run.artifacts.stepShapeHash,
      timing: run.artifacts.timing,
    },
  });

  return NextResponse.json(baseline, { status: 201 });
}
