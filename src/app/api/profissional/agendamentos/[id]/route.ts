import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Permite ao profissional atualizar um agendamento seu: check-in (realizado) ou não compareceu (cancelado).
 * Body: { action: "checkin" | "nao_compareceu" }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const action = body.action as string;

  const agendamento = await prisma.agendamento.findFirst({
    where: {
      id,
      profissionalId: profissional.id,
    },
  });

  if (!agendamento) {
    return NextResponse.json({ error: "Agendamento não encontrado" }, { status: 404 });
  }

  if (agendamento.status !== "confirmado") {
    return NextResponse.json(
      { error: "Este agendamento já foi finalizado ou cancelado." },
      { status: 400 }
    );
  }

  if (action === "checkin") {
    await prisma.agendamento.update({
      where: { id },
      data: { status: "realizado" },
    });
    return NextResponse.json({ ok: true, status: "realizado" });
  }

  if (action === "nao_compareceu") {
    await prisma.agendamento.update({
      where: { id },
      data: { status: "cancelado", observacao: "Cliente não compareceu" },
    });
    return NextResponse.json({ ok: true, status: "cancelado" });
  }

  return NextResponse.json({ error: "Ação inválida. Use checkin ou nao_compareceu." }, { status: 400 });
}
