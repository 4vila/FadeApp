"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Store, Users, Home } from "lucide-react";

export function AdminNav() {
  const pathname = usePathname();

  const isActive = (path: string) =>
    path === "/admin" ? pathname === "/admin" : pathname.startsWith(path);

  const linkClass = (path: string) =>
    `flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted ${
      isActive(path) ? "bg-muted font-medium" : ""
    }`;

  return (
    <>
      <nav className="mt-4 flex flex-col gap-2">
        <Link href="/admin" className={linkClass("/admin")}>
          <LayoutDashboard className="h-4 w-4" />
          Resumo
        </Link>
        <Link href="/admin/barbearias" className={linkClass("/admin/barbearias")}>
          <Store className="h-4 w-4" />
          Barbearias
        </Link>
        <Link href="/admin/usuarios" className={linkClass("/admin/usuarios")}>
          <Users className="h-4 w-4" />
          Usuários
        </Link>
      </nav>
      <Link
        href="/"
        className="mt-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <Home className="h-4 w-4" />
        Voltar ao site
      </Link>
    </>
  );
}
