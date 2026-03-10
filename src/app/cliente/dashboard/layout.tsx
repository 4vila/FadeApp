import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";

export default async function ClienteDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/cliente/dashboard");
  if (session.user.role !== "cliente") redirect("/login?error=Unauthorized");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-muted/30 px-4 py-3">
        <div className="container flex items-center justify-between">
          <Link href="/cliente/dashboard" className="font-semibold">
            Minha área
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link href="/cliente/dashboard" className="hover:underline">
              Agendamentos
            </Link>
            <Link href="/cliente/dashboard/perfil" className="hover:underline">
              Perfil
            </Link>
            <Link href="/" className="text-muted-foreground hover:underline">
              Voltar ao site
            </Link>
          </nav>
        </div>
      </header>
      <main className="container flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
