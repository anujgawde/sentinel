import type { DriftFinding, CanaryStatus } from "./schema";

export function computeOverallSeverity(
  findings: DriftFinding[],
  mode: "login" | "lifecycle" = "login"
): number {
  if (findings.length === 0) return 0;
  const maxSeverity = Math.max(...findings.map((f) => f.severity));
  const multiplier = mode === "login" ? 1.2 : 1.0;
  return Math.min(100, Math.round(maxSeverity * multiplier));
}

export function severityToStatus(severity: number): CanaryStatus {
  if (severity >= 60) return "critical";
  if (severity >= 20) return "warning";
  return "healthy";
}

export function severityLabel(severity: number): string {
  if (severity >= 60) return "Critical";
  if (severity >= 20) return "Warning";
  if (severity > 0) return "Info";
  return "Healthy";
}
