import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getBarbeariaIdForSession } from "@/lib/auth-barbearia";
import { prisma } from "@/lib/prisma";
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

  const barbeariaId = await getBarbeariaIdForSession();
  if (!barbeariaId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <p className="text-muted-foreground">Nenhuma barbearia vinculada.</p>
      </div>
    );
  }

  if (session.user.role === "barbearia") {
    const barbearia = await prisma.barbearia.findUnique({
      where: { id: barbeariaId },
      select: { ativo: true, planoVencidoEm: true },
    });
    if (barbearia && (!barbearia.ativo || (barbearia.planoVencidoEm && barbearia.planoVencidoEm < new Date()))) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <div className="max-w-md rounded-lg border bg-card p-6 text-center shadow-lg shadow-blue-500/10">
            <h1 className="text-xl font-semibold text-destructive">
              {!barbearia.ativo ? "Barbearia inativa" : "Plano vencido"}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {!barbearia.ativo
                ? "Sua barbearia está inativa e não pode acessar o painel."
                : "O plano de acesso ao painel venceu. Entre em contato com o administrador para renovar."}
            </p>
            <Link
              href="/contato"
              className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Falar com suporte
            </Link>
          </div>
        </div>
      );
    }
  }

  return <BarbeariaDashboardShell>{children}</BarbeariaDashboardShell>;
}
