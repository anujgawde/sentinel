import { NextResponse } from "next/server";
import { spawn } from "child_process";
import { v4 as uuid } from "uuid";
import path from "path";
import {
  getPlan,
  getLatestBaseline,
  createRun,
  createFinding,
  createAlert,
  getOpenAlertForPlan,
} from "@/lib/db";
import { computeDrift } from "@/lib/drift";
import { computeOverallSeverity } from "@/lib/severity";
import type { RunArtifactsData } from "@/lib/schema";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: canaryPlanId } = await params;
  const plan = getPlan(canaryPlanId);
  if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });

  const config = JSON.stringify({
    url: plan.workflowUrl,
    outcomeSelectors: plan.outcomeSelectors,
  });

  // Run the Playwright canary runner as a child process
  const artifacts = await new Promise<RunArtifactsData>((resolve, reject) => {
    const runnerPath = path.join(process.cwd(), "runner", "run-canary.ts");
    const child = spawn("npx", ["tsx", runnerPath, config], {
      cwd: process.cwd(),
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (data: Buffer) => { stdout += data.toString(); });
    child.stderr.on("data", (data: Buffer) => { stderr += data.toString(); });
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Runner exited with code ${code}: ${stderr}`));
        return;
      }
      try {
        resolve(JSON.parse(stdout));
      } catch {
        reject(new Error(`Failed to parse runner output: ${stdout}`));
      }
    });
  });

  const now = new Date().toISOString();
  const runId = uuid();
  const startedAt = now;
  const endedAt = new Date().toISOString();

  // Compute drift against baseline
  const baseline = getLatestBaseline(canaryPlanId);
  let findings = baseline
    ? computeDrift(baseline.artifacts, artifacts, runId)
    : [];

  const overallSeverity = computeOverallSeverity(findings, plan.mode);
  const hasFailed = artifacts.outcomeChecks.some((c) => !c.ok);

  // Store run
  const run = createRun({
    id: runId,
    canaryPlanId,
    startedAt,
    endedAt,
    status: hasFailed ? "fail" : "success",
    artifacts,
    findings: [],
  });

  // Store findings
  for (const finding of findings) {
    createFinding(finding);
  }
  run.findings = findings;

  // Create alert if severity warrants it and no open alert exists
  let createdAlert = null;
  if (overallSeverity >= 20) {
    const existingAlert = getOpenAlertForPlan(canaryPlanId);
    if (!existingAlert) {
      createdAlert = createAlert({
        id: uuid(),
        canaryPlanId,
        canaryRunId: runId,
        state: "open",
        severity: overallSeverity,
        title: `Drift detected in ${plan.name}, severity ${overallSeverity}`,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  return NextResponse.json({
    run,
    findings,
    alert: createdAlert,
    overallSeverity,
  });
}
