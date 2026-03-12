import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Store, Users, Calendar, UserCheck, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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

  const roleLabels: Record<string, string> = {
    admin: "Administrador",
    barbearia: "Barbearia",
    profissional: "Profissional",
    cliente: "Cliente",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Painel Administrativo</h1>
      <p className="text-muted-foreground mt-1">
        Visão geral da plataforma FadeApp
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/admin/barbearias"
          className="rounded-lg border border-border/80 bg-card p-4 shadow-sm transition-colors hover:bg-muted/50 min-h-[100px] flex flex-col"
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <Store className="h-5 w-5" />
            <span className="text-sm font-medium">Barbearias</span>
          </div>
          <p className="mt-2 text-2xl font-bold">{totalBarbearias}</p>
        </Link>
        <Link
          href="/admin/usuarios"
          className="rounded-lg border border-border/80 bg-card p-4 shadow-sm transition-colors hover:bg-muted/50 min-h-[100px] flex flex-col"
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-5 w-5" />
            <span className="text-sm font-medium">Usuários</span>
          </div>
          <p className="mt-2 text-2xl font-bold">{totalUsuarios}</p>
        </Link>
        <div className="rounded-lg border border-border/80 bg-card p-4 shadow-sm min-h-[100px] flex flex-col">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-5 w-5" />
            <span className="text-sm font-medium">Agendamentos hoje</span>
          </div>
          <p className="mt-2 text-2xl font-bold">{agendamentosHoje}</p>
        </div>
        <div className="rounded-lg border border-border/80 bg-card p-4 shadow-sm min-h-[100px] flex flex-col">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-5 w-5" />
            <span className="text-sm font-medium">Agendamentos no mês</span>
          </div>
          <p className="mt-2 text-2xl font-bold">{agendamentosMes}</p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold">Usuários por perfil</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          {usuariosPorRole.map(({ role, _count }) => (
            <Card key={role} className="shadow-sm border-border/80">
              <CardContent className="flex items-center gap-2 px-4 py-3">
                <UserCheck className="h-4 w-4 text-muted-foreground" />
                <span>{roleLabels[role] ?? role}</span>
                <span className="font-bold">{_count.id}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/admin/barbearias/nova" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nova barbearia
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/admin/usuarios/novo" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo usuário
          </Link>
        </Button>
      </div>
    </div>
  );
}
