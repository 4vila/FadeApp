import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { LayoutDashboard, Store, Users, Home } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/admin");
  if (session.user.role !== "admin") redirect("/login?error=Unauthorized");

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 border-r bg-muted/30 p-4">
        <p className="font-semibold flex items-center gap-2">
          <LayoutDashboard className="h-5 w-5" />
          Painel Admin
        </p>
        <nav className="mt-4 flex flex-col gap-2 text-sm">
          <Link
            href="/admin"
            className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-muted"
          >
            <LayoutDashboard className="h-4 w-4" />
            Resumo
          </Link>
          <Link
            href="/admin/barbearias"
            className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-muted"
          >
            <Store className="h-4 w-4" />
            Barbearias
          </Link>
          <Link
            href="/admin/usuarios"
            className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-muted"
          >
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
      </aside>
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
