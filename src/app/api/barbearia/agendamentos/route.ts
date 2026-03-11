import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBarbeariaAccess } from "@/lib/auth-barbearia";
import type { StatusAgendamento } from "@prisma/client";
import { z } from "zod";

const createSchema = z.object({
  clienteEmail: z.string().email(),
  profissionalId: z.string().min(1),
  servicoId: z.string().min(1),
  dataHora: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const access = await requireBarbeariaAccess();
  if ("error" in access) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }
  const body = await request.json().catch(() => ({}));
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 400 });
  }
  const cliente = await prisma.user.findFirst({
    where: { email: parsed.data.clienteEmail.trim().toLowerCase(), role: "cliente" },
  });
  if (!cliente) {
    return NextResponse.json({ error: "Cliente não encontrado com este e-mail." }, { status: 404 });
  }
  const dataHora = new Date(parsed.data.dataHora);
  if (isNaN(dataHora.getTime()) || dataHora < new Date()) {
    return NextResponse.json({ error: "Data/hora inválida ou no passado." }, { status: 400 });
  }
  const servico = await prisma.servico.findFirst({
    where: { id: parsed.data.servicoId, barbeariaId: access.barbeariaId },
  });
  if (!servico) {
    return NextResponse.json({ error: "Serviço não encontrado." }, { status: 404 });
  }
  const profissional = await prisma.profissional.findFirst({
    where: { id: parsed.data.profissionalId, barbeariaId: access.barbeariaId },
  });
  if (!profissional) {
    return NextResponse.json({ error: "Profissional não encontrado." }, { status: 404 });
  }
  const fim = new Date(dataHora);
  fim.setMinutes(fim.getMinutes() + servico.duracao);
  const todosNoDia = await prisma.agendamento.findMany({
    where: {
      profissionalId: parsed.data.profissionalId,
      status: "confirmado",
      dataHora: {
        gte: new Date(dataHora.getFullYear(), dataHora.getMonth(), dataHora.getDate(), 0, 0, 0),
        lt: new Date(dataHora.getFullYear(), dataHora.getMonth(), dataHora.getDate() + 1, 0, 0, 0),
      },
    },
    include: { servico: { select: { duracao: true } } },
  });
  const conflito = todosNoDia.some((a) => {
    const aFim = new Date(a.dataHora);
    aFim.setMinutes(aFim.getMinutes() + a.servico.duracao);
    return dataHora < aFim && fim > a.dataHora;
  });
  if (conflito) {
    return NextResponse.json({ error: "Horário em conflito com outro agendamento." }, { status: 409 });
  }
  const agendamento = await prisma.agendamento.create({
    data: {
      barbeariaId: access.barbeariaId,
      clienteId: cliente.id,
      profissionalId: parsed.data.profissionalId,
      servicoId: parsed.data.servicoId,
      dataHora,
      status: "confirmado",
    },
    include: {
      cliente: { select: { name: true, email: true } },
      profissional: { include: { user: { select: { name: true } } } },
      servico: { select: { name: true } },
    },
  });
  return NextResponse.json(agendamento, { status: 201 });
}

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
      servico: { select: { id: true, name: true, duracao: true, preco: true } },
    },
    orderBy: { dataHora: "asc" },
  });
  return NextResponse.json(list);
}
