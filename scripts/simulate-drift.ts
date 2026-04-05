/**
 * Toggle drift mode for the fake app.
 * Usage:
 *   npx tsx scripts/simulate-drift.ts on    # Enable drift (button rename + MFA step)
 *   npx tsx scripts/simulate-drift.ts off   # Disable drift (back to normal)
 */

import { writeFileSync } from "fs";
import { join } from "path";

const mode = process.argv[2];

if (mode !== "on" && mode !== "off") {
  console.log("Usage: npx tsx scripts/simulate-drift.ts [on|off]");
  process.exit(1);
}

const driftMode = mode === "on";
const configPath = join(process.cwd(), "drift-config.json");
writeFileSync(configPath, JSON.stringify({ driftMode }, null, 2));

if (driftMode) {
  console.log("Drift mode ON");
  console.log("  - Login button label changed: 'Sign In' → 'Log In'");
  console.log("  - MFA interstitial page inserted in flow");
  console.log("  - Step shape will change (new MFA step)");
  console.log("\nRun a canary to detect the drift.");
} else {
  console.log("Drift mode OFF — fake app restored to baseline behavior.");
}
