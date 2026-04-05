export interface CanaryPlan {
  id: string;
  name: string;
  workflowUrl: string;
  outcomeSelectors: { name: string; selector: string }[];
  mode: "login" | "lifecycle";
  schedule: string; // cron-like or "manual"
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Baseline {
  id: string;
  canaryPlanId: string;
  version: number;
  capturedAt: string;
  capturedBy: string;
  artifacts: BaselineArtifacts;
}

export interface BaselineArtifacts {
  redirectHosts: string[];
  redirectHostsHash: string;
  domFingerprintHash: string;
  stepShapeHash: string;
  timing: { stepMs: number[]; totalMs: number };
}

export interface CanaryRun {
  id: string;
  canaryPlanId: string;
  startedAt: string;
  endedAt: string;
  status: "success" | "fail";
  artifacts: RunArtifactsData;
  findings: DriftFinding[];
}

export interface RunArtifactsData {
  redirectHosts: string[];
  redirectHostsHash: string;
  domFingerprintHash: string;
  stepShapeHash: string;
  timing: { stepMs: number[]; totalMs: number };
  outcomeChecks: { name: string; ok: boolean }[];
}

export type DriftType =
  | "REDIRECT_DRIFT"
  | "DOM_DRIFT"
  | "TIMING_DRIFT"
  | "STEP_SHAPE_DRIFT"
  | "OUTCOME_FAIL"
  | "HARD_FAILURE";

export interface DriftFinding {
  id: string;
  canaryRunId: string;
  type: DriftType;
  severity: number;
  description: string;
}

export type AlertState = "open" | "acknowledged" | "resolved";

export interface Alert {
  id: string;
  canaryPlanId: string;
  canaryRunId: string;
  state: AlertState;
  severity: number;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export type CanaryStatus = "healthy" | "warning" | "critical" | "never_run" | "error";
