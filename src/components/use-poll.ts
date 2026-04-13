"use client";

import { useEffect, useState } from "react";

/**
 * Polls the given URL on an interval and returns the parsed JSON.
 * Used to give the dashboard a real-time feel without WebSockets.
 */
export function usePoll<T>(url: string, intervalMs = 3000): T | null {
  const [data, setData] = useState<T | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const res = await fetch(url);
        if (!res.ok) return;
        const json = (await res.json()) as T;
        if (!cancelled) setData(json);
      } catch {
        // ignore transient errors
      }
    }

    fetchData();
    const id = setInterval(fetchData, intervalMs);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [url, intervalMs]);

  return data;
}
