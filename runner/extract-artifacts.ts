import type { Page } from "playwright";
import { sha256 } from "./hash";

export interface RunArtifacts {
  redirectHosts: string[];
  redirectHostsHash: string;
  domFingerprintHash: string;
  stepShapeHash: string;
  timing: { stepMs: number[]; totalMs: number };
  outcomeChecks: { name: string; ok: boolean }[];
}

export interface StepRecord {
  action: "navigate" | "click" | "type" | "wait";
  target: string; // semantic descriptor: role + aria-label
}

/**
 * Extract a reduced DOM signature from the current page.
 * Includes: tagName, role, aria-label, input type.
 * Excludes: text content, IDs, classes (volatile).
 */
export async function extractDomFingerprint(page: Page): Promise<string> {
  const signature = await page.evaluate(() => {
    const nodes: string[] = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
    let node = walker.currentNode as Element;
    while (node) {
      const tag = node.tagName?.toLowerCase() || "";
      const role = node.getAttribute("role") || "";
      const ariaLabel = node.getAttribute("aria-label") || "";
      const inputType = node.tagName === "INPUT" ? (node as HTMLInputElement).type : "";
      nodes.push([tag, role, ariaLabel, inputType].filter(Boolean).join(":"));
      const next = walker.nextNode();
      if (!next) break;
      node = next as Element;
    }
    return nodes.join("|");
  });
  return signature;
}

export function computeRedirectHostsHash(hosts: string[]): string {
  return sha256(JSON.stringify(hosts));
}

export function computeDomFingerprintHash(signature: string): string {
  return sha256(signature);
}

export function computeStepShapeHash(steps: StepRecord[]): string {
  const shape = steps.map((s) => `${s.action}:${s.target}`).join("|");
  return sha256(shape);
}

export function checkOutcomes(
  page: Page,
  selectors: { name: string; selector: string }[]
): Promise<{ name: string; ok: boolean }[]> {
  return Promise.all(
    selectors.map(async ({ name, selector }) => {
      try {
        const el = await page.$(selector);
        return { name, ok: el !== null };
      } catch {
        return { name, ok: false };
      }
    })
  );
}
