import { notFound } from "next/navigation";
import { getPlan, getPlanStatus, getLatestBaseline, getRunsForPlan, getOpenAlertForPlan } from "@/lib/db";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CanaryActions } from "./actions";

export const dynamic = "force-dynamic";

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const driftConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  REDIRECT_DRIFT:   { label: "Redirect Drift",   variant: "outline" },
  DOM_DRIFT:        { label: "DOM Drift",         variant: "outline" },
  STEP_SHAPE_DRIFT: { label: "Step Shape Drift",  variant: "outline" },
  TIMING_DRIFT:     { label: "Timing Drift",      variant: "outline" },
  OUTCOME_FAIL:     { label: "Outcome Failure",   variant: "destructive" },
  HARD_FAILURE:     { label: "Hard Failure",       variant: "destructive" },
};

export default async function CanaryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const plan = getPlan(id);
  if (!plan) notFound();

  const status = getPlanStatus(id);
  const baseline = getLatestBaseline(id);
  const runs = getRunsForPlan(id, 20);
  const openAlert = getOpenAlertForPlan(id);

  const latestRun = runs[0] || null;
  const latestRunFindings = latestRun?.findings || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-medium">{plan.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {plan.mode} workflow &middot; {plan.schedule === "manual" ? "Manual trigger" : plan.schedule}
            </p>
          </div>
          <StatusBadge status={status} />
        </div>

        <Separator className="mt-4" />
      </div>

      {/* Actions */}
      <CanaryActions
        planId={id}
        latestRunId={latestRun?.id || null}
        hasBaseline={!!baseline}
        openAlertId={openAlert?.id || null}
      />

      {/* Active alert */}
      {openAlert && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="py-4 px-5">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-destructive animate-pulse shrink-0" />
              <div>
                <p className="text-sm font-medium">{openAlert.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {openAlert.state} &middot; {timeAgo(openAlert.createdAt)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-xs font-normal text-muted-foreground uppercase tracking-wide">Baseline</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            {baseline ? (
              <div className="space-y-1.5">
                <p className="text-2xl font-medium">v{baseline.version}</p>
                <p className="text-xs text-muted-foreground">{timeAgo(baseline.capturedAt)}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Not captured</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-xs font-normal text-muted-foreground uppercase tracking-wide">Last Run</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            {latestRun ? (
              <div className="space-y-1.5">
                <p className="text-2xl font-medium">{latestRun.artifacts.timing.totalMs}<span className="text-sm text-muted-foreground font-normal">ms</span></p>
                <p className="text-xs text-muted-foreground">{timeAgo(latestRun.endedAt)}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No runs yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-xs font-normal text-muted-foreground uppercase tracking-wide">Findings</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <div className="space-y-1.5">
              <p className={`text-2xl font-medium ${latestRunFindings.length > 0 ? "text-destructive" : ""}`}>
                {latestRunFindings.length}
              </p>
              <p className="text-xs text-muted-foreground">
                {latestRunFindings.length === 0 ? "All clear" : "Requires attention"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Drift findings */}
      {latestRunFindings.length > 0 && (
        <Card>
          <CardHeader className="pb-3 pt-5 px-5">
            <CardTitle className="text-sm font-medium">Drift Findings</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="space-y-3">
              {latestRunFindings.map((finding) => {
                const c = driftConfig[finding.type] || { label: finding.type, variant: "outline" as const };
                return (
                  <div key={finding.id} className="flex items-start gap-3 p-3 rounded-md border bg-muted/30">
                    <Badge variant={c.variant} className="shrink-0 text-xs font-normal">
                      {c.label}
                    </Badge>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-relaxed">{finding.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">Severity {finding.severity}/100</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Baseline detail */}
      {baseline && (
        <Card>
          <CardHeader className="pb-3 pt-5 px-5">
            <CardTitle className="text-sm font-medium">Baseline Artifacts</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="grid grid-cols-1 gap-3 text-sm">
              {[
                { label: "DOM Fingerprint", value: baseline.artifacts.domFingerprintHash },
                { label: "Step Shape", value: baseline.artifacts.stepShapeHash },
                { label: "Redirect Hosts", value: baseline.artifacts.redirectHostsHash },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-4 py-1.5">
                  <span className="text-muted-foreground shrink-0">{item.label}</span>
                  <span className="font-mono text-xs text-muted-foreground truncate">{item.value}</span>
                </div>
              ))}
              <Separator />
              <div className="flex items-center justify-between gap-4 py-1.5">
                <span className="text-muted-foreground">Hosts</span>
                <span className="font-mono text-xs">{baseline.artifacts.redirectHosts.join(", ")}</span>
              </div>
              <div className="flex items-center justify-between gap-4 py-1.5">
                <span className="text-muted-foreground">Baseline Timing</span>
                <span className="font-mono text-xs">{baseline.artifacts.timing.totalMs}ms</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Run history */}
      <Card className="overflow-visible">
        <CardHeader className="pb-3 pt-5 px-5">
          <CardTitle className="text-sm font-medium">Run History</CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5 overflow-visible">
          {runs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No runs yet.</p>
          ) : (
            <div className="flex gap-1 items-end h-12 pt-10">
              {runs.slice().reverse().map((run) => {
                const hasDrift = run.findings.length > 0;
                const maxSev = hasDrift ? Math.max(...run.findings.map((f) => f.severity)) : 0;
                const bg =
                  maxSev >= 60 ? "bg-destructive" :
                  maxSev >= 20 ? "bg-amber-400" :
                  run.status === "fail" ? "bg-destructive" :
                  "bg-primary/60";

                return (
                  <div key={run.id} className="group relative flex-1 max-w-4">
                    <div className={`h-10 rounded-sm ${bg} transition-opacity hover:opacity-80`} />
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block bg-popover border rounded-md shadow-md p-2.5 text-xs whitespace-nowrap z-50">
                      <p className="font-medium">{new Date(run.endedAt).toLocaleTimeString()}</p>
                      <p className="text-muted-foreground">{run.findings.length} findings &middot; {run.artifacts.timing.totalMs}ms</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
