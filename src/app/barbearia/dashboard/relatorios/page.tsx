import { getBarbeariaIdForSession } from "@/lib/auth-barbearia";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function RelatoriosPage() {
  const barbeariaId = await getBarbeariaIdForSession();
  if (!barbeariaId) redirect("/login");

  const [totalAgendamentos, realizados, servicosMaisVendidos] = await Promise.all([
    prisma.agendamento.count({ where: { barbeariaId } }),
    prisma.agendamento.count({
      where: { barbeariaId, status: "realizado" },
    }),
    prisma.agendamento.groupBy({
      by: ["servicoId"],
      where: { barbeariaId, status: "realizado" },
      _count: true,
    }),
  ]);

  const servicoIds = servicosMaisVendidos.map((s) => s.servicoId);
  const servicos = servicoIds.length
    ? await prisma.servico.findMany({
        where: { id: { in: servicoIds } },
        select: { id: true, name: true },
      })
    : [];
  const servicosMap = Object.fromEntries(servicos.map((s) => [s.id, s.name]));

  return (
    <div>
      <h1 className="text-2xl font-bold">Relatórios</h1>
      <p className="text-muted-foreground">Visão geral da barbearia.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Total de agendamentos</p>
          <p className="text-2xl font-bold">{totalAgendamentos}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Atendimentos realizados</p>
          <p className="text-2xl font-bold">{realizados}</p>
        </div>
      </div>
      <div className="mt-6">
        <h2 className="font-semibold">Serviços mais realizados</h2>
        <ul className="mt-2 space-y-1 text-sm">
          {servicosMaisVendidos
            .sort((a, b) => b._count - a._count)
            .slice(0, 10)
            .map((s) => (
              <li key={s.servicoId}>
                {servicosMap[s.servicoId] ?? s.servicoId}: {s._count}
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
