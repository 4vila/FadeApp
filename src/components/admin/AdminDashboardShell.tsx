"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AdminNav } from "@/components/admin/AdminNav";
export function AdminDashboardShell({ children }: { children: React.ReactNode }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => setSheetOpen(false), [pathname]);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-border/80 bg-card md:block">
        <div className="sticky top-0 flex h-14 items-center border-b border-border/80 px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <LayoutDashboard className="h-4 w-4" />
            </div>
            <span className="font-semibold tracking-tight">Painel Admin</span>
          </div>
        </div>
        <div className="p-3">
          <AdminNav />
        </div>
      </aside>

      {/* Mobile: header + sheet */}
      <div className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-border/80 bg-card px-4 md:hidden">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted" aria-label="Abrir menu">
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-4">
              <div className="flex items-center gap-2 font-semibold mb-4">
                <LayoutDashboard className="h-5 w-5 text-primary" />
                Painel Admin
              </div>
              <AdminNav />
            </SheetContent>
          </Sheet>
          <span className="font-semibold">Painel Admin</span>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="mx-auto max-w-4xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
