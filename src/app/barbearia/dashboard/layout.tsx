import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { BarbeariaNav } from "@/components/barbearia/BarbeariaNav";

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

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 border-r bg-muted/30 p-4">
        <p className="font-semibold">Painel Barbearia</p>
        <BarbeariaNav />
      </aside>
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
