"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { Shield, Bell, Settings, Activity } from "lucide-react";
import { usePoll } from "@/components/use-poll";

const navItems = [
  { href: "/canaries", label: "Canaries", icon: Activity },
  { href: "/alerts", label: "Alerts", icon: Bell },
];

export function Sidebar() {
  const pathname = usePathname();
  const openAlerts = usePoll<{ id: string }[]>("/api/alerts?state=open", 3000);
  const openCount = openAlerts?.length ?? 0;

  if (pathname.startsWith("/fakeapp")) return null;

  return (
    <aside className="w-16 bg-sidebar flex flex-col items-center shrink-0 h-full border-r border-sidebar-border">
      {/* Logo */}
      <div className="h-14 flex items-center justify-center">
        <Link href="/canaries">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <Shield className="w-4 h-4 text-sidebar-primary-foreground" />
          </div>
        </Link>
      </div>

      <Separator className="w-8 bg-sidebar-border" />

      {/* Nav */}
      <nav className="flex flex-col items-center gap-1 pt-3 flex-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          const showBadge = item.href === "/alerts" && openCount > 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                relative flex flex-col items-center justify-center gap-0.5 w-11 h-11 rounded-lg transition-colors text-[10px] font-light
                ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                }
              `}
            >
              <Icon className="w-4.5 h-4.5" strokeWidth={1.5} />
              <span>{item.label}</span>
              {showBadge && (
                <span className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-destructive text-white text-[9px] font-medium flex items-center justify-center leading-none">
                  {openCount > 9 ? "9+" : openCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="pb-4">
        <div className="w-11 h-11 rounded-lg flex items-center justify-center text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors cursor-pointer">
          <Settings className="w-4.5 h-4.5" strokeWidth={1.5} />
        </div>
      </div>
    </aside>
  );
}
