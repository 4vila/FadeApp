import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getBarbeariaIdForSession } from "@/lib/auth-barbearia";
import { redirect } from "next/navigation";
import { CriarBarbeariaForm } from "./CriarBarbeariaForm";

export default async function BarbeariaDashboardPage() {
  const barbeariaId = await getBarbeariaIdForSession();
  if (!barbeariaId) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Painel</h1>
        <p className="text-muted-foreground">Nenhuma barbearia encontrada. Crie uma para começar.</p>
        <CriarBarbeariaForm />
      </div>
    );
  }

  const [barbearia, agendamentosHoje] = await Promise.all([
    prisma.barbearia.findUnique({
      where: { id: barbeariaId },
      select: { name: true },
    }),
    prisma.agendamento.count({
      where: {
        barbeariaId,
        status: "confirmado",
        dataHora: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
    }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold">{barbearia?.name ?? "Painel"}</h1>
      <p className="text-muted-foreground">Resumo do dia</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Link
          href="/barbearia/dashboard/agendamentos"
          className="rounded-lg border p-4 hover:bg-muted/50"
        >
          <p className="font-medium">Agendamentos hoje</p>
          <p className="text-2xl font-bold">{agendamentosHoje}</p>
        </Link>
        <Link
          href="/barbearia/dashboard/profissionais"
          className="rounded-lg border p-4 hover:bg-muted/50"
        >
          <p className="font-medium">Profissionais</p>
          <p className="text-muted-foreground">Gerenciar</p>
        </Link>
        <Link
          href="/barbearia/dashboard/servicos"
          className="rounded-lg border p-4 hover:bg-muted/50"
        >
          <p className="font-medium">Serviços</p>
          <p className="text-muted-foreground">Gerenciar</p>
        </Link>
      </div>
    </div>
  );
}
