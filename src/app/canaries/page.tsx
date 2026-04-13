import Link from "next/link";
import { listPlans, getPlanStatus, getLatestRun, getLatestBaseline } from "@/lib/db";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AutoRefreshOverview } from "./auto-refresh";

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

export default function CanariesPage() {
  const plans = listPlans();

  return (
    <div>
      <AutoRefreshOverview />
      <div className="mb-8">
        <h1 className="text-xl font-medium">Canaries</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor workflow health across your critical apps
        </p>
      </div>

      {plans.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <p>No canary plans configured yet.</p>
            <p className="text-sm mt-1">
              Run <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">npm run seed</code> to create a demo plan.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {plans.map((plan) => {
            const status = getPlanStatus(plan.id);
            const latestRun = getLatestRun(plan.id);
            const baseline = getLatestBaseline(plan.id);
            const maxSeverity = latestRun?.findings?.length
              ? Math.max(...latestRun.findings.map((f) => f.severity))
              : 0;

            return (
              <Link key={plan.id} href={`/canaries/${plan.id}`} className="block">
                <Card className="hover:shadow-sm transition-shadow cursor-pointer">
                  <CardContent className="py-4 px-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-medium text-sm">{plan.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {plan.mode} workflow
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                          <p className="text-xs text-muted-foreground">Last run</p>
                          <p className="text-sm">{latestRun ? timeAgo(latestRun.endedAt) : "\u2014"}</p>
                        </div>
                        <Separator orientation="vertical" className="h-8" />
                        <div className="text-right hidden sm:block">
                          <p className="text-xs text-muted-foreground">Baseline</p>
                          <p className="text-sm font-mono">{baseline ? `v${baseline.version}` : "\u2014"}</p>
                        </div>
                        <Separator orientation="vertical" className="h-8" />
                        {maxSeverity > 0 && (
                          <>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">Severity</p>
                              <p className={`text-sm font-medium ${maxSeverity >= 60 ? "text-destructive" : "text-amber-600"}`}>
                                {maxSeverity}
                              </p>
                            </div>
                            <Separator orientation="vertical" className="h-8" />
                          </>
                        )}
                        <StatusBadge status={status} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
