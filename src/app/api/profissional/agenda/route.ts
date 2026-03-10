import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  if (session.user.role !== "profissional") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const profissional = await prisma.profissional.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!profissional) {
    return NextResponse.json({ error: "Profissional não encontrado" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from"); // YYYY-MM-DD
  const to = searchParams.get("to");

  const fromDate = from ? new Date(from + "T00:00:00") : new Date(new Date().setHours(0, 0, 0, 0));
  const toDate = to ? new Date(to + "T23:59:59") : new Date(fromDate);
  toDate.setDate(toDate.getDate() + 6);

  const agendamentos = await prisma.agendamento.findMany({
    where: {
      profissionalId: profissional.id,
      dataHora: { gte: fromDate, lte: toDate },
    },
    include: {
      cliente: { select: { name: true, email: true } },
      servico: { select: { name: true, duracao: true } },
    },
    orderBy: { dataHora: "asc" },
  });

  return NextResponse.json(agendamentos);
}
