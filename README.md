# Sentinel: Workflow Canary and Drift Radar

A proactive monitoring system that detects workflow drift in browser-automated SSO login flows before users are impacted. Built as a prototype for [Aglide](https://aglide.com)'s zero-trust, local-agent architecture.

## The Problem

Aglide runs on-device browser agents to automate login and lifecycle workflows for apps that don't support SAML/SCIM. When a target app changes its login UI (renamed button, new MFA step, altered redirect chain), the workflow silently breaks and employees get locked out of mission-critical apps.

**Sentinel** solves this by running scheduled canary executions of workflows, comparing each run against a known-good baseline, and alerting IT/security admins before real users are affected.

## Why This Architecture

Aglide's core constraint is zero-knowledge: the platform never has access to user sessions, credentials, or application data. Sentinel respects this by:

- **Storing only privacy-safe artifacts**: SHA-256 hashes of reduced DOM signatures, domain-only redirect chains, timing metrics, and boolean outcome checks. Never raw HTML, screenshots, input values, or cookies.
- **Running locally**: The Playwright canary runner executes on-device, matching Aglide's local-agent model. Only hashes and metrics are sent to the API.
- **Fingerprinting without content**: DOM fingerprints are computed from structural features (tag names, ARIA roles, input types) with text content and dynamic IDs/classes excluded.

## Quick Start

```bash
npm install
npx playwright install chromium
npm run dev
```

In a separate terminal:

```bash
npm run seed
```

Then open [http://localhost:3000/canaries](http://localhost:3000/canaries).

## Demo Walkthrough

### 1. Baseline captured, canary healthy

After running `npm run seed`, you'll see a canary plan for "Acme Corp Login" with a baseline (v1) and several healthy runs. The dashboard shows all green.

You can also visit [http://localhost:3000/fakeapp/login](http://localhost:3000/fakeapp/login) to see the target app, a fully branded SaaS application (Acme Corp) with its own design, separate from Sentinel's dashboard. This is the app being monitored.

### 2. Simulate real-world drift

```bash
npm run drift:on
```

This changes the target app's behavior:

- Login button label changes from "Sign In" to "Log In"
- An MFA interstitial page is inserted in the login flow

Visit [http://localhost:3000/fakeapp/login](http://localhost:3000/fakeapp/login) to see the change. The button now says "Log In", and clicking it goes through an MFA page before reaching the dashboard.

### 3. Detect drift

Click **"Run Canary Now"** on the detail page. Sentinel detects:

- **Step Shape Drift**: The workflow now has extra steps (MFA page) and the button's accessible name changed. Severity: Critical (60 base x 1.2 login multiplier = 72).

An alert is created and shown on the dashboard.

### 4. Resolve or promote

- **Acknowledge**: "I see this, I'm investigating." Alert stays open, no duplicate alerts on re-runs.
- **Resolve**: "This is handled." Alert closes. Next drift run creates a new alert.
- **Promote to Baseline**: "The app changed, and that's fine." Captures the current run as the new baseline. Next canary run compares against it, healthy again.

```bash
npm run drift:off   # Reset the target app to original state
```

## Tech Stack

| Layer              | Technology              | Rationale                                                    |
| ------------------ | ----------------------- | ------------------------------------------------------------ |
| Framework          | Next.js 16 (App Router) | Full-stack TypeScript, server components for data fetching   |
| Browser automation | Playwright              | Headless canary execution, DOM inspection, redirect tracking |
| Persistence        | SQLite (better-sqlite3) | Zero-config, local-first, queryable. No external DB needed   |
| UI                 | Tailwind v4 + shadcn/ui | Aglide-inspired design system with dark green sidebar        |
| Font               | Outfit (via next/font)  | Matches Aglide's typography                                  |

## API Endpoints

| Method   | Path                             | Purpose                                     |
| -------- | -------------------------------- | ------------------------------------------- |
| GET/POST | `/api/canary-plans`              | List/create canary plans                    |
| GET      | `/api/canary-plans/:id`          | Plan detail + status                        |
| POST     | `/api/canary-plans/:id/trigger`  | Trigger a canary run (spawns Playwright)    |
| POST     | `/api/canary-plans/:id/baseline` | Promote a run to baseline                   |
| GET      | `/api/canary-plans/:id/runs`     | Run history                                 |
| GET      | `/api/alerts`                    | List alerts (optional `?state=open` filter) |
| POST     | `/api/alerts/:id/ack`            | Acknowledge alert                           |
| POST     | `/api/alerts/:id/resolve`        | Resolve alert                               |

## Project Structure

```
sentinel/
  drift-config.json    # Drift mode toggle (read by fake app)
  runner/              # Playwright canary runner (local execution)
    run-canary.ts      # Main runner: navigates flow, captures artifacts
    extract-artifacts.ts # DOM fingerprinting, redirect capture, outcome checks
    hash.ts            # SHA-256 utility
  scripts/             # Seed data + drift simulation
    seed.ts            # Creates plan, baseline, healthy runs
    simulate-drift.ts  # Toggles drift-config.json on/off
  src/
    app/
      api/             # REST API routes
      canaries/        # Sentinel dashboard: overview + detail pages
      alerts/          # Alert list page
      fakeapp/         # Target app (Acme Corp), fully branded, separate UI
        login/         # Login page (button label changes in drift mode)
        mfa/           # MFA page (only appears in drift mode)
        home/          # Dashboard with stats, activity feed
    lib/
      db.ts            # SQLite persistence + typed query layer
      drift.ts         # Drift heuristic engine (5 detection types)
      severity.ts      # Severity scoring with login multiplier
      schema.ts        # TypeScript interfaces for all entities
    components/
      sidebar.tsx      # Dark green nav sidebar
      shell-wrapper.tsx # Route-aware layout (hides shell on fakeapp routes)
      status-badge.tsx  # Health status indicator
      ui/              # shadcn/ui components (Badge, Card, Button, etc.)
```
