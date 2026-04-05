"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function ShellWrapper({
  sidebar,
  children,
}: {
  sidebar: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isFakeApp = pathname.startsWith("/fakeapp");

  if (isFakeApp) {
    return <>{children}</>;
  }

  return (
    <div className="h-full flex">
      {sidebar}
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="max-w-5xl mx-auto px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
