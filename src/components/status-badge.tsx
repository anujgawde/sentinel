import { Badge } from "@/components/ui/badge";
import type { CanaryStatus } from "@/lib/schema";

const config: Record<CanaryStatus, { label: string; dot: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  healthy:   { label: "Healthy",   dot: "bg-emerald-500", variant: "secondary" },
  warning:   { label: "Warning",   dot: "bg-amber-500",   variant: "secondary" },
  critical:  { label: "Critical",  dot: "bg-red-500",     variant: "destructive" },
  never_run: { label: "Never Run", dot: "bg-gray-400",    variant: "outline" },
  error:     { label: "Error",     dot: "bg-red-500",     variant: "destructive" },
};

export function StatusBadge({ status }: { status: CanaryStatus }) {
  const c = config[status];
  return (
    <Badge variant={c.variant} className="gap-1.5 font-normal">
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </Badge>
  );
}
