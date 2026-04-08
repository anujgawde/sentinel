import { v4 as uuid } from "uuid";
import type { BaselineArtifacts, RunArtifactsData, DriftFinding } from "./schema";

export function computeDrift(
  baseline: BaselineArtifacts,
  current: RunArtifactsData,
  runId: string
): DriftFinding[] {
  const findings: DriftFinding[] = [];

  // 1. Redirect chain drift
  if (current.redirectHostsHash !== baseline.redirectHostsHash) {
    const newHosts = current.redirectHosts.filter(
      (h) => !baseline.redirectHosts.includes(h)
    );
    const removedHosts = baseline.redirectHosts.filter(
      (h) => !current.redirectHosts.includes(h)
    );
    const severity = newHosts.length > 0 ? 70 : 40;
    const parts: string[] = [];
    if (newHosts.length > 0) parts.push(`new domains: ${newHosts.join(", ")}`);
    if (removedHosts.length > 0) parts.push(`removed domains: ${removedHosts.join(", ")}`);
    if (parts.length === 0) parts.push("redirect chain order or length changed");

    findings.push({
      id: uuid(),
      canaryRunId: runId,
      type: "REDIRECT_DRIFT",
      severity,
      description: `Redirect chain changed: ${parts.join("; ")}`,
    });
  }

  // 2. DOM fingerprint drift
  if (current.domFingerprintHash !== baseline.domFingerprintHash) {
    findings.push({
      id: uuid(),
      canaryRunId: runId,
      type: "DOM_DRIFT",
      severity: 50,
      description:
        "DOM fingerprint mismatch on landing page. Page structure (tags, roles, ARIA labels) changed from baseline.",
    });
  }

  // 3. Step shape drift
  if (current.stepShapeHash !== baseline.stepShapeHash) {
    findings.push({
      id: uuid(),
      canaryRunId: runId,
      type: "STEP_SHAPE_DRIFT",
      severity: 60,
      description:
        "Workflow step shape changed. Number of steps, action types, or target element signatures differ from baseline (possible new MFA step or renamed element).",
    });
  }

  // 4. Timing drift (totalMs > 3x baseline)
  if (
    baseline.timing.totalMs > 0 &&
    current.timing.totalMs > 3 * baseline.timing.totalMs
  ) {
    findings.push({
      id: uuid(),
      canaryRunId: runId,
      type: "TIMING_DRIFT",
      severity: 30,
      description: `Total run time (${current.timing.totalMs}ms) exceeds 3x baseline (${baseline.timing.totalMs}ms)`,
    });
  }

  // 5. Outcome check failures
  const failedChecks = current.outcomeChecks.filter((c) => !c.ok);
  if (failedChecks.length > 0) {
    findings.push({
      id: uuid(),
      canaryRunId: runId,
      type: "OUTCOME_FAIL",
      severity: 80,
      description: `Expected post-conditions failed: ${failedChecks.map((c) => c.name).join(", ")}`,
    });
  }

  return findings;
}
