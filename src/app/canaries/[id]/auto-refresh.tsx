"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/**
 * Polls the plan endpoint and triggers a router refresh
 * when the latest run id or open alert id changes.
 * Gives the detail page a real-time feel without WebSockets.
 */
export function AutoRefresh({ planId }: { planId: string }) {
  const router = useRouter();
  const lastSnapshot = useRef<string>("");

  useEffect(() => {
    let cancelled = false;

    async function tick() {
      try {
        const res = await fetch(`/api/canary-plans/${planId}`);
        if (!res.ok) return;
        const data = await res.json();
        const snapshot = JSON.stringify({
          runId: data.latestRun?.id ?? null,
          findings: data.latestRun?.findings?.length ?? 0,
          status: data.status ?? null,
        });
        if (lastSnapshot.current && lastSnapshot.current !== snapshot && !cancelled) {
          router.refresh();
        }
        lastSnapshot.current = snapshot;
      } catch {
        // ignore
      }
    }

    tick();
    const id = setInterval(tick, 2000);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [planId, router]);

  return null;
}
