import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBarbeariaAccess } from "@/lib/auth-barbearia";

export async function GET(request: NextRequest) {
  const access = await requireBarbeariaAccess();
  if ("error" in access) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from"); // YYYY-MM-DD
  const to = searchParams.get("to");

  const fromDate = from ? new Date(from + "T00:00:00") : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const toDate = to ? new Date(to + "T23:59:59") : new Date();

  const [agendamentos, realizados, porServico] = await Promise.all([
    prisma.agendamento.count({
      where: {
        barbeariaId: access.barbeariaId,
        dataHora: { gte: fromDate, lte: toDate },
      },
    }),
    prisma.agendamento.findMany({
      where: {
        barbeariaId: access.barbeariaId,
        status: "realizado",
        dataHora: { gte: fromDate, lte: toDate },
      },
      include: { servico: { select: { preco: true } } },
    }),
    prisma.agendamento.groupBy({
      by: ["servicoId"],
      where: {
        barbeariaId: access.barbeariaId,
        status: "realizado",
        dataHora: { gte: fromDate, lte: toDate },
      },
      _count: true,
    }),
  ]);

  const faturamento = realizados.reduce((acc, a) => acc + Number(a.servico.preco), 0);
  const servicoIds = [...new Set(porServico.map((s) => s.servicoId))];
  const servicos = servicoIds.length
    ? await prisma.servico.findMany({
        where: { id: { in: servicoIds } },
        select: { id: true, name: true },
      })
    : [];
  const servicosMap = Object.fromEntries(servicos.map((s) => [s.id, s.name]));
  const maisVendidos = porServico
    .map((s) => ({ name: servicosMap[s.servicoId] ?? s.servicoId, count: s._count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return NextResponse.json({
    periodo: { from: fromDate, to: toDate },
    totalAgendamentos: agendamentos,
    atendimentosRealizados: realizados.length,
    faturamento,
    servicosMaisVendidos: maisVendidos,
  });
}
