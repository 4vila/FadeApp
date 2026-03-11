import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LayoutDashboard } from "lucide-react";
import { AdminNav } from "@/components/admin/AdminNav";

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
        <AdminNav />
      </aside>
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
