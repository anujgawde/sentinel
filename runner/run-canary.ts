import { chromium } from "playwright";
import {
  extractDomFingerprint,
  computeRedirectHostsHash,
  computeDomFingerprintHash,
  computeStepShapeHash,
  checkOutcomes,
  type RunArtifacts,
  type StepRecord,
} from "./extract-artifacts";

interface CanaryConfig {
  url: string;
  outcomeSelectors: { name: string; selector: string }[];
}

async function run() {
  const configArg = process.argv[2];
  if (!configArg) {
    console.error("Usage: npx tsx runner/run-canary.ts '<json config>'");
    process.exit(1);
  }

  const config: CanaryConfig = JSON.parse(configArg);
  const steps: StepRecord[] = [];
  const stepTimings: number[] = [];
  const redirectHosts = new Set<string>();
  const startTime = Date.now();

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Track redirect hosts
  page.on("response", (response) => {
    try {
      const url = new URL(response.url());
      redirectHosts.add(url.hostname);
    } catch {
      // ignore malformed URLs
    }
  });

  // Step 1: Navigate to start URL
  let stepStart = Date.now();
  await page.goto(config.url, { waitUntil: "networkidle" });
  stepTimings.push(Date.now() - stepStart);
  steps.push({ action: "navigate", target: `page:${new URL(config.url).pathname}` });

  // Step 2: Wait for login form and click submit
  stepStart = Date.now();
  const submitButton = await page.$('button[type="submit"]');
  if (submitButton) {
    const role = (await submitButton.getAttribute("role")) || "button";
    const ariaLabel = (await submitButton.getAttribute("aria-label")) || "submit";
    steps.push({ action: "click", target: `${role}:${ariaLabel}` });
    await submitButton.click();
    // Wait for client-side navigation away from login page
    await page.waitForFunction(
      () => !window.location.pathname.includes("/fakeapp/login"),
      { timeout: 10000 }
    );
    await page.waitForLoadState("domcontentloaded");
  }
  stepTimings.push(Date.now() - stepStart);

  // Step 3: If MFA page appears, handle it
  if (page.url().includes("/fakeapp/mfa")) {
    stepStart = Date.now();
    steps.push({ action: "navigate", target: "page:/fakeapp/mfa" });
    const mfaButton = await page.$('button[type="submit"]');
    if (mfaButton) {
      const role = (await mfaButton.getAttribute("role")) || "button";
      const ariaLabel = (await mfaButton.getAttribute("aria-label")) || "submit";
      steps.push({ action: "click", target: `${role}:${ariaLabel}` });
      await mfaButton.click();
      await page.waitForFunction(
        () => window.location.pathname.includes("/fakeapp/home"),
        { timeout: 10000 }
      );
      await page.waitForLoadState("domcontentloaded");
    }
    stepTimings.push(Date.now() - stepStart);
  }

  const totalMs = Date.now() - startTime;

  // Extract artifacts
  const domSignature = await extractDomFingerprint(page);
  const hostsArray = Array.from(redirectHosts).sort();
  const outcomeChecks = await checkOutcomes(page, config.outcomeSelectors);

  const artifacts: RunArtifacts = {
    redirectHosts: hostsArray,
    redirectHostsHash: computeRedirectHostsHash(hostsArray),
    domFingerprintHash: computeDomFingerprintHash(domSignature),
    stepShapeHash: computeStepShapeHash(steps),
    timing: { stepMs: stepTimings, totalMs },
    outcomeChecks,
  };

  await browser.close();

  // Output only the artifact JSON to stdout
  console.log(JSON.stringify(artifacts, null, 2));
}

run().catch((err) => {
  console.error("Canary run failed:", err.message);
  process.exit(1);
});
