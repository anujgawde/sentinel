"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CanaryActions({
  planId,
  latestRunId,
  hasBaseline,
  openAlertId,
}: {
  planId: string;
  latestRunId: string | null;
  hasBaseline: boolean;
  openAlertId: string | null;
}) {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [promoting, setPromoting] = useState(false);

  async function triggerRun() {
    setRunning(true);
    try {
      await fetch(`/api/canary-plans/${planId}/trigger`, { method: "POST" });
      router.refresh();
    } finally {
      setRunning(false);
    }
  }

  async function promoteBaseline() {
    if (!latestRunId) return;
    setPromoting(true);
    try {
      await fetch(`/api/canary-plans/${planId}/baseline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId: latestRunId }),
      });
      router.refresh();
    } finally {
      setPromoting(false);
    }
  }

  async function ackAlert() {
    if (!openAlertId) return;
    await fetch(`/api/alerts/${openAlertId}/ack`, { method: "POST" });
    router.refresh();
  }

  async function resolveAlert() {
    if (!openAlertId) return;
    await fetch(`/api/alerts/${openAlertId}/resolve`, { method: "POST" });
    router.refresh();
  }

  return (
    <div className="flex gap-2 flex-wrap">
      <Button size="sm" onClick={triggerRun} disabled={running}>
        {running ? "Running\u2026" : "Run Canary Now"}
      </Button>
      {latestRunId && (
        <Button size="sm" variant="outline" onClick={promoteBaseline} disabled={promoting}>
          {promoting ? "Promoting\u2026" : "Promote to Baseline"}
        </Button>
      )}
      {openAlertId && (
        <>
          <Button size="sm" variant="secondary" onClick={ackAlert}>
            Acknowledge
          </Button>
          <Button size="sm" variant="outline" onClick={resolveAlert}>
            Resolve
          </Button>
        </>
      )}
    </div>
  );
}
