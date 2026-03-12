import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminDashboardShell } from "@/components/admin/AdminDashboardShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/admin");
  if (session.user.role !== "admin") redirect("/login?error=Unauthorized");

  return <AdminDashboardShell>{children}</AdminDashboardShell>;
}
