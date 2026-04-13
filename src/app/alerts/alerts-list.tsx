"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { usePoll } from "@/components/use-poll";
import type { Alert } from "@/lib/schema";

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const stateVariant: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  open: "destructive",
  acknowledged: "secondary",
  resolved: "outline",
};

export function AlertsList({ initialAlerts }: { initialAlerts: Alert[] }) {
  const polled = usePoll<Alert[]>("/api/alerts", 2000);
  const alerts = polled ?? initialAlerts;

  if (alerts.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center text-muted-foreground">
          <p>No alerts. All canaries are healthy.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {alerts.map((alert) => (
        <Card key={alert.id}>
          <CardContent className="py-4 px-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    alert.state === "open"
                      ? "bg-destructive"
                      : alert.state === "acknowledged"
                        ? "bg-amber-500"
                        : "bg-muted-foreground"
                  }`}
                />
                <p className="text-sm truncate">{alert.title}</p>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <span className="text-xs text-muted-foreground w-16 text-right">
                  {timeAgo(alert.createdAt)}
                </span>
                <Separator orientation="vertical" className="h-5" />
                <div className="w-24 flex justify-center">
                  <Badge
                    variant={stateVariant[alert.state] || "outline"}
                    className="font-normal text-xs"
                  >
                    {alert.state}
                  </Badge>
                </div>
                <Separator orientation="vertical" className="h-5" />
                <Link
                  href={`/canaries/${alert.canaryPlanId}`}
                  className="text-xs text-primary hover:underline whitespace-nowrap"
                >
                  View Canary &rarr;
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
