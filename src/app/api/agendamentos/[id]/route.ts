import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const action = body.action as string; // "cancelar" | "reagendar"

  const agendamento = await prisma.agendamento.findFirst({
    where: { id, clienteId: session.user.id },
    include: { barbearia: { include: { regraCancelamento: true } } },
  });

  if (!agendamento) {
    return NextResponse.json({ error: "Agendamento não encontrado" }, { status: 404 });
  }

  if (action === "cancelar") {
    const regra = agendamento.barbearia.regraCancelamento?.horasAntecedenciaMinima ?? 2;
    const limite = new Date(agendamento.dataHora);
    limite.setHours(limite.getHours() - regra);
    if (new Date() > limite) {
      return NextResponse.json(
        { error: `Cancelamento permitido até ${regra}h antes do horário.` },
        { status: 400 }
      );
    }
    await prisma.agendamento.update({
      where: { id },
      data: { status: "cancelado" },
    });
    return NextResponse.json({ success: true });
  }

  if (action === "reagendar" && body.dataHora) {
    const novaData = new Date(body.dataHora);
    if (isNaN(novaData.getTime()) || novaData < new Date()) {
      return NextResponse.json({ error: "Data/hora inválida." }, { status: 400 });
    }
    const conflito = await prisma.agendamento.findFirst({
      where: {
        profissionalId: agendamento.profissionalId,
        status: "confirmado",
        id: { not: id },
        dataHora: novaData,
      },
    });
    if (conflito) {
      return NextResponse.json({ error: "Horário não disponível." }, { status: 409 });
    }
    await prisma.agendamento.update({
      where: { id },
      data: { dataHora: novaData },
    });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
}
