import { NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import {
  createRun,
  createFinding,
  createAlert,
  getOpenAlertForPlan,
  getLatestBaseline,
  getPlan,
} from "@/lib/db";
import { computeDrift } from "@/lib/drift";
import { computeOverallSeverity } from "@/lib/severity";
import type { RunArtifactsData } from "@/lib/schema";

export async function POST(request: Request) {
  const body = await request.json();
  const { canaryPlanId, startedAt, endedAt, status, artifacts } = body as {
    canaryPlanId: string;
    startedAt: string;
    endedAt: string;
    status: "success" | "fail";
    artifacts: RunArtifactsData;
  };

  const plan = getPlan(canaryPlanId);
  if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });

  const runId = uuid();

  const baseline = getLatestBaseline(canaryPlanId);
  const findings = baseline
    ? computeDrift(baseline.artifacts, artifacts, runId)
    : [];

  const overallSeverity = computeOverallSeverity(findings, plan.mode);

  const run = createRun({
    id: runId,
    canaryPlanId,
    startedAt,
    endedAt,
    status,
    artifacts,
    findings: [],
  });

  for (const finding of findings) {
    createFinding(finding);
  }
  run.findings = findings;

  let createdAlert = null;
  if (overallSeverity >= 20) {
    const existingAlert = getOpenAlertForPlan(canaryPlanId);
    if (!existingAlert) {
      const now = new Date().toISOString();
      createdAlert = createAlert({
        id: uuid(),
        canaryPlanId,
        canaryRunId: runId,
        state: "open",
        severity: overallSeverity,
        title: `Drift detected in ${plan.name} — severity ${overallSeverity}`,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  return NextResponse.json({ runId, findings, alert: createdAlert });
}
