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
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 border-r bg-muted/30 p-4 md:block">
        <p className="flex items-center gap-2 font-semibold">
          <LayoutDashboard className="h-5 w-5" />
          Painel Admin
        </p>
        <AdminNav />
      </aside>

      {/* Mobile: header + sheet */}
      <div className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-40 flex h-12 items-center gap-2 border-b bg-background px-4 md:hidden">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted" aria-label="Abrir menu">
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-4">
              <p className="flex items-center gap-2 font-semibold">
                <LayoutDashboard className="h-5 w-5" />
                Painel Admin
              </p>
              <AdminNav />
            </SheetContent>
          </Sheet>
          <span className="font-semibold">Painel Admin</span>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
