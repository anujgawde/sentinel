/**
 * Seed script: Creates a demo canary plan for the fake app login workflow.
 * Usage: npx tsx scripts/seed.ts
 */

const API_BASE = process.env.API_BASE || "http://localhost:3000";

async function seed() {
  console.log("Seeding Sentinel demo data...\n");

  // 1. Create canary plan
  const planRes = await fetch(`${API_BASE}/api/canary-plans`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Acme Corp Login",
      workflowUrl: `${API_BASE}/fakeapp/login`,
      outcomeSelectors: [
        { name: "welcome_message", selector: '[aria-label="Welcome message"]' },
        { name: "user_menu", selector: '[aria-label="User menu"]' },
      ],
      mode: "login",
      schedule: "every 6h",
    }),
  });
  const plan = await planRes.json();
  console.log(`Created canary plan: ${plan.name} (${plan.id})`);

  // 2. Trigger initial run
  console.log("Running initial canary...");
  const runRes = await fetch(
    `${API_BASE}/api/canary-plans/${plan.id}/trigger`,
    {
      method: "POST",
    },
  );
  const runData = await runRes.json();
  console.log(
    `Run complete: ${runData.run.status}, ${runData.findings.length} findings`,
  );

  // 3. Promote to baseline
  console.log("Promoting to baseline...");
  const baselineRes = await fetch(
    `${API_BASE}/api/canary-plans/${plan.id}/baseline`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ runId: runData.run.id }),
    },
  );
  const baseline = await baselineRes.json();
  console.log(`Baseline created: v${baseline.version}`);

  // 4. Run a few healthy canary runs
  for (let i = 0; i < 3; i++) {
    console.log(`Running healthy canary ${i + 1}/3...`);
    await fetch(`${API_BASE}/api/canary-plans/${plan.id}/trigger`, {
      method: "POST",
    });
  }

  console.log("\nSeed complete!");
  console.log(`View dashboard: ${API_BASE}/canaries/${plan.id}`);
  console.log("\nTo simulate drift: npx tsx scripts/simulate-drift.ts on");
}

seed().catch(console.error);
