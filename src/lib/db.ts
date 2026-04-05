import Database from "better-sqlite3";
import path from "path";
import type {
  CanaryPlan,
  Baseline,
  CanaryRun,
  DriftFinding,
  Alert,
  AlertState,
  RunArtifactsData,
  BaselineArtifacts,
  CanaryStatus,
} from "./schema";

const DB_PATH = path.join(process.cwd(), "data", "sentinel.db");

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (_db) return _db;
  _db = new Database(DB_PATH);
  _db.pragma("journal_mode = WAL");
  migrate(_db);
  return _db;
}

function migrate(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS canary_plans (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      workflow_url TEXT NOT NULL,
      outcome_selectors TEXT NOT NULL,
      mode TEXT NOT NULL DEFAULT 'login',
      schedule TEXT NOT NULL DEFAULT 'manual',
      enabled INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS baselines (
      id TEXT PRIMARY KEY,
      canary_plan_id TEXT NOT NULL,
      version INTEGER NOT NULL,
      captured_at TEXT NOT NULL,
      captured_by TEXT NOT NULL DEFAULT 'system',
      artifacts TEXT NOT NULL,
      FOREIGN KEY (canary_plan_id) REFERENCES canary_plans(id)
    );

    CREATE TABLE IF NOT EXISTS canary_runs (
      id TEXT PRIMARY KEY,
      canary_plan_id TEXT NOT NULL,
      started_at TEXT NOT NULL,
      ended_at TEXT NOT NULL,
      status TEXT NOT NULL,
      artifacts TEXT NOT NULL,
      FOREIGN KEY (canary_plan_id) REFERENCES canary_plans(id)
    );

    CREATE TABLE IF NOT EXISTS drift_findings (
      id TEXT PRIMARY KEY,
      canary_run_id TEXT NOT NULL,
      type TEXT NOT NULL,
      severity INTEGER NOT NULL,
      description TEXT NOT NULL,
      FOREIGN KEY (canary_run_id) REFERENCES canary_runs(id)
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY,
      canary_plan_id TEXT NOT NULL,
      canary_run_id TEXT NOT NULL,
      state TEXT NOT NULL DEFAULT 'open',
      severity INTEGER NOT NULL,
      title TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (canary_plan_id) REFERENCES canary_plans(id),
      FOREIGN KEY (canary_run_id) REFERENCES canary_runs(id)
    );
  `);
}

// ── Canary Plans ──

export function createPlan(plan: CanaryPlan): CanaryPlan {
  const db = getDb();
  db.prepare(`
    INSERT INTO canary_plans (id, name, workflow_url, outcome_selectors, mode, schedule, enabled, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    plan.id, plan.name, plan.workflowUrl,
    JSON.stringify(plan.outcomeSelectors),
    plan.mode, plan.schedule, plan.enabled ? 1 : 0,
    plan.createdAt, plan.updatedAt
  );
  return plan;
}

export function getPlan(id: string): CanaryPlan | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM canary_plans WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  return row ? rowToPlan(row) : null;
}

export function listPlans(): CanaryPlan[] {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM canary_plans ORDER BY created_at DESC").all() as Record<string, unknown>[];
  return rows.map(rowToPlan);
}

function rowToPlan(row: Record<string, unknown>): CanaryPlan {
  return {
    id: row.id as string,
    name: row.name as string,
    workflowUrl: row.workflow_url as string,
    outcomeSelectors: JSON.parse(row.outcome_selectors as string),
    mode: row.mode as "login" | "lifecycle",
    schedule: row.schedule as string,
    enabled: Boolean(row.enabled),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

// ── Baselines ──

export function createBaseline(baseline: Baseline): Baseline {
  const db = getDb();
  db.prepare(`
    INSERT INTO baselines (id, canary_plan_id, version, captured_at, captured_by, artifacts)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    baseline.id, baseline.canaryPlanId, baseline.version,
    baseline.capturedAt, baseline.capturedBy,
    JSON.stringify(baseline.artifacts)
  );
  return baseline;
}

export function getLatestBaseline(canaryPlanId: string): Baseline | null {
  const db = getDb();
  const row = db.prepare(
    "SELECT * FROM baselines WHERE canary_plan_id = ? ORDER BY version DESC LIMIT 1"
  ).get(canaryPlanId) as Record<string, unknown> | undefined;
  return row ? rowToBaseline(row) : null;
}

function rowToBaseline(row: Record<string, unknown>): Baseline {
  return {
    id: row.id as string,
    canaryPlanId: row.canary_plan_id as string,
    version: row.version as number,
    capturedAt: row.captured_at as string,
    capturedBy: row.captured_by as string,
    artifacts: JSON.parse(row.artifacts as string) as BaselineArtifacts,
  };
}

// ── Canary Runs ──

export function createRun(run: CanaryRun): CanaryRun {
  const db = getDb();
  db.prepare(`
    INSERT INTO canary_runs (id, canary_plan_id, started_at, ended_at, status, artifacts)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    run.id, run.canaryPlanId, run.startedAt, run.endedAt,
    run.status, JSON.stringify(run.artifacts)
  );
  return run;
}

export function getRun(id: string): CanaryRun | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM canary_runs WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  if (!row) return null;
  const run = rowToRun(row);
  run.findings = getFindingsForRun(run.id);
  return run;
}

export function getRunsForPlan(canaryPlanId: string, limit = 50): CanaryRun[] {
  const db = getDb();
  const rows = db.prepare(
    "SELECT * FROM canary_runs WHERE canary_plan_id = ? ORDER BY started_at DESC LIMIT ?"
  ).all(canaryPlanId, limit) as Record<string, unknown>[];
  return rows.map((row) => {
    const run = rowToRun(row);
    run.findings = getFindingsForRun(run.id);
    return run;
  });
}

export function getLatestRun(canaryPlanId: string): CanaryRun | null {
  const runs = getRunsForPlan(canaryPlanId, 1);
  return runs[0] || null;
}

function rowToRun(row: Record<string, unknown>): CanaryRun {
  return {
    id: row.id as string,
    canaryPlanId: row.canary_plan_id as string,
    startedAt: row.started_at as string,
    endedAt: row.ended_at as string,
    status: row.status as "success" | "fail",
    artifacts: JSON.parse(row.artifacts as string) as RunArtifactsData,
    findings: [],
  };
}

// ── Drift Findings ──

export function createFinding(finding: DriftFinding): DriftFinding {
  const db = getDb();
  db.prepare(`
    INSERT INTO drift_findings (id, canary_run_id, type, severity, description)
    VALUES (?, ?, ?, ?, ?)
  `).run(finding.id, finding.canaryRunId, finding.type, finding.severity, finding.description);
  return finding;
}

export function getFindingsForRun(canaryRunId: string): DriftFinding[] {
  const db = getDb();
  const rows = db.prepare(
    "SELECT * FROM drift_findings WHERE canary_run_id = ? ORDER BY severity DESC"
  ).all(canaryRunId) as Record<string, unknown>[];
  return rows.map((row) => ({
    id: row.id as string,
    canaryRunId: row.canary_run_id as string,
    type: row.type as DriftFinding["type"],
    severity: row.severity as number,
    description: row.description as string,
  }));
}

// ── Alerts ──

export function createAlert(alert: Alert): Alert {
  const db = getDb();
  db.prepare(`
    INSERT INTO alerts (id, canary_plan_id, canary_run_id, state, severity, title, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    alert.id, alert.canaryPlanId, alert.canaryRunId,
    alert.state, alert.severity, alert.title,
    alert.createdAt, alert.updatedAt
  );
  return alert;
}

export function getOpenAlertForPlan(canaryPlanId: string): Alert | null {
  const db = getDb();
  const row = db.prepare(
    "SELECT * FROM alerts WHERE canary_plan_id = ? AND state = 'open' ORDER BY created_at DESC LIMIT 1"
  ).get(canaryPlanId) as Record<string, unknown> | undefined;
  return row ? rowToAlert(row) : null;
}

export function listAlerts(state?: AlertState): Alert[] {
  const db = getDb();
  let rows: Record<string, unknown>[];
  if (state) {
    rows = db.prepare("SELECT * FROM alerts WHERE state = ? ORDER BY created_at DESC").all(state) as Record<string, unknown>[];
  } else {
    rows = db.prepare("SELECT * FROM alerts ORDER BY created_at DESC").all() as Record<string, unknown>[];
  }
  return rows.map(rowToAlert);
}

export function updateAlertState(id: string, state: AlertState): Alert | null {
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare("UPDATE alerts SET state = ?, updated_at = ? WHERE id = ?").run(state, now, id);
  const row = db.prepare("SELECT * FROM alerts WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  return row ? rowToAlert(row) : null;
}

function rowToAlert(row: Record<string, unknown>): Alert {
  return {
    id: row.id as string,
    canaryPlanId: row.canary_plan_id as string,
    canaryRunId: row.canary_run_id as string,
    state: row.state as AlertState,
    severity: row.severity as number,
    title: row.title as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

// ── Status helpers ──

export function getPlanStatus(canaryPlanId: string): CanaryStatus {
  const latestRun = getLatestRun(canaryPlanId);
  if (!latestRun) return "never_run";
  if (latestRun.status === "fail") return "error";
  if (latestRun.findings.length === 0) return "healthy";
  const plan = getPlan(canaryPlanId);
  const mode = plan?.mode || "login";
  const maxSeverity = Math.max(...latestRun.findings.map((f) => f.severity));
  const multiplier = mode === "login" ? 1.2 : 1.0;
  const overall = Math.min(100, Math.round(maxSeverity * multiplier));
  if (overall >= 60) return "critical";
  if (overall >= 20) return "warning";
  return "healthy";
}
