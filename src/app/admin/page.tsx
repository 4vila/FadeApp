import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Store, Users, Calendar, UserCheck } from "lucide-react";

export default async function AdminDashboardPage() {
  const [totalBarbearias, totalUsuarios, agendamentosHoje, agendamentosMes] =
    await Promise.all([
      prisma.barbearia.count(),
      prisma.user.count(),
      prisma.agendamento.count({
        where: {
          status: "confirmado",
          dataHora: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      }),
      prisma.agendamento.count({
        where: {
          status: "confirmado",
          dataHora: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ]);

  const usuariosPorRole = await prisma.user.groupBy({
    by: ["role"],
    _count: { id: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Painel Administrativo</h1>
      <p className="text-muted-foreground">
        Visão geral da plataforma FadeApp
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/admin/barbearias"
          className="rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50"
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <Store className="h-5 w-5" />
            <span className="text-sm font-medium">Barbearias</span>
          </div>
          <p className="mt-2 text-2xl font-bold">{totalBarbearias}</p>
        </Link>
        <Link
          href="/admin/usuarios"
          className="rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50"
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-5 w-5" />
            <span className="text-sm font-medium">Usuários</span>
          </div>
          <p className="mt-2 text-2xl font-bold">{totalUsuarios}</p>
        </Link>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-5 w-5" />
            <span className="text-sm font-medium">Agendamentos hoje</span>
          </div>
          <p className="mt-2 text-2xl font-bold">{agendamentosHoje}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-5 w-5" />
            <span className="text-sm font-medium">Agendamentos no mês</span>
          </div>
          <p className="mt-2 text-2xl font-bold">{agendamentosMes}</p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold">Usuários por perfil</h2>
        <div className="mt-3 flex flex-wrap gap-4">
          {usuariosPorRole.map(({ role, _count }) => (
            <div
              key={role}
              className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2"
            >
              <UserCheck className="h-4 w-4 text-muted-foreground" />
              <span className="capitalize">{role}</span>
              <span className="font-bold">{_count.id}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/admin/barbearias/nova"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Nova barbearia
        </Link>
        <Link
          href="/admin/usuarios/novo"
          className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
        >
          Novo usuário
        </Link>
      </div>
    </div>
  );
}
