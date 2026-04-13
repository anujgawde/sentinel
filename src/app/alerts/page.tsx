import { listAlerts } from "@/lib/db";
import { AlertsList } from "./alerts-list";

export const dynamic = "force-dynamic";

export default function AlertsPage() {
  const alerts = listAlerts();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-medium">Alerts</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Drift alerts across all monitored workflows
        </p>
      </div>

      <AlertsList initialAlerts={alerts} />
    </div>
  );
}
