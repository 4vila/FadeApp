import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBarbeariaAccess } from "@/lib/auth-barbearia";
import type { StatusAgendamento } from "@prisma/client";

export async function GET(request: NextRequest) {
  const access = await requireBarbeariaAccess();
  if ("error" in access) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }
  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where: {
    barbeariaId: string;
    status?: StatusAgendamento;
    dataHora?: { gte?: Date; lte?: Date };
  } = {
    barbeariaId: access.barbeariaId,
  };
  if (statusParam === "confirmado" || statusParam === "cancelado" || statusParam === "realizado") {
    where.status = statusParam;
  }
  if (from || to) {
    where.dataHora = {};
    if (from) where.dataHora.gte = new Date(from);
    if (to) where.dataHora.lte = new Date(to);
  }

  const list = await prisma.agendamento.findMany({
    where,
    include: {
      cliente: { select: { id: true, name: true, email: true, phone: true } },
      profissional: { include: { user: { select: { name: true } } } },
      servico: { select: { name: true, duracao: true, preco: true } },
    },
    orderBy: { dataHora: "asc" },
  });
  return NextResponse.json(list);
}
