import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { BarbeariaDashboardShell } from "@/components/barbearia/BarbeariaDashboardShell";

export default async function BarbeariaDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/barbearia/dashboard");
  if (session.user.role !== "barbearia" && session.user.role !== "admin") {
    redirect("/login?error=Unauthorized");
  }

  return <BarbeariaDashboardShell>{children}</BarbeariaDashboardShell>;
}
