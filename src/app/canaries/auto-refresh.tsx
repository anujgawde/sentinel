"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/**
 * Polls the canary plans endpoint and triggers a router refresh
 * when any plan's status or findings count changes.
 */
export function AutoRefreshOverview() {
  const router = useRouter();
  const lastSnapshot = useRef<string>("");

  useEffect(() => {
    let cancelled = false;

    async function tick() {
      try {
        const res = await fetch("/api/canary-plans");
        if (!res.ok) return;
        const plans = await res.json();
        const snapshot = JSON.stringify(
          plans.map((p: { id: string; status: string; latestRun?: { id: string } }) => ({
            id: p.id,
            status: p.status,
            runId: p.latestRun?.id ?? null,
          }))
        );
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
  }, [router]);

  return null;
}
