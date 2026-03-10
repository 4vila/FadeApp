import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";

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
        <nav className="mt-4 flex flex-col gap-2 text-sm">
          <Link href="/barbearia/dashboard" className="hover:underline">
            Resumo
          </Link>
          <Link href="/barbearia/dashboard/profissionais" className="hover:underline">
            Profissionais
          </Link>
          <Link href="/barbearia/dashboard/servicos" className="hover:underline">
            Serviços
          </Link>
          <Link href="/barbearia/dashboard/agendamentos" className="hover:underline">
            Agendamentos
          </Link>
          <Link href="/barbearia/dashboard/relatorios" className="hover:underline">
            Relatórios
          </Link>
          <Link href="/barbearia/dashboard/config" className="hover:underline">
            Configurações
          </Link>
        </nav>
        <Link href="/" className="mt-6 block text-sm text-muted-foreground hover:underline">
          Voltar ao site
        </Link>
      </aside>
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
