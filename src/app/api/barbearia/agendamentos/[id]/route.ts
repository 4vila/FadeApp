import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBarbeariaAccess } from "@/lib/auth-barbearia";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum(["confirmado", "cancelado", "realizado"]).optional(),
  dataHora: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await requireBarbeariaAccess();
  if ("error" in access) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }
  const { id } = await params;
  const agendamento = await prisma.agendamento.findFirst({
    where: { id, barbeariaId: access.barbeariaId },
  });
  if (!agendamento) {
    return NextResponse.json({ error: "Agendamento não encontrado." }, { status: 404 });
  }
  const body = await request.json().catch(() => ({}));
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }
  const data: { status?: "confirmado" | "cancelado" | "realizado"; dataHora?: Date } = {};
  if (parsed.data.status) data.status = parsed.data.status;
  if (parsed.data.dataHora) {
    const novaData = new Date(parsed.data.dataHora);
    if (isNaN(novaData.getTime())) {
      return NextResponse.json({ error: "Data/hora inválida." }, { status: 400 });
    }
    data.dataHora = novaData;
  }
  const updated = await prisma.agendamento.update({
    where: { id },
    data,
    include: {
      cliente: { select: { name: true, email: true } },
      profissional: { include: { user: { select: { name: true } } } },
      servico: { select: { name: true, duracao: true, preco: true } },
    },
  });
  return NextResponse.json(updated);
}
