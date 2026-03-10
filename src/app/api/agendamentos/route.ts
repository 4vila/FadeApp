import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const createSchema = z.object({
  barbeariaId: z.string(),
  profissionalId: z.string(),
  servicoId: z.string(),
  dataHora: z.string(), // ISO datetime
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Faça login para agendar." }, { status: 401 });
  }
  if (session.user.role !== "cliente") {
    return NextResponse.json({ error: "Apenas clientes podem agendar." }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 400 });
  }

  const dataHora = new Date(parsed.data.dataHora);
  if (isNaN(dataHora.getTime()) || dataHora < new Date()) {
    return NextResponse.json({ error: "Data/hora inválida ou no passado." }, { status: 400 });
  }

  const servico = await prisma.servico.findFirst({
    where: {
      id: parsed.data.servicoId,
      barbeariaId: parsed.data.barbeariaId,
    },
  });

  if (!servico) {
    return NextResponse.json({ error: "Serviço não encontrado." }, { status: 404 });
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
    return NextResponse.json({ error: "Horário não disponível." }, { status: 409 });
  }

  const agendamento = await prisma.agendamento.create({
    data: {
      barbeariaId: parsed.data.barbeariaId,
      clienteId: session.user.id,
      profissionalId: parsed.data.profissionalId,
      servicoId: parsed.data.servicoId,
      dataHora,
      status: "confirmado",
    },
    include: {
      servico: { select: { name: true } },
      profissional: { include: { user: { select: { name: true } } } },
    },
  });

  return NextResponse.json(agendamento, { status: 201 });
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const byCliente = searchParams.get("cliente") === "true" || !searchParams.get("barbearia");

  if (byCliente && session.user.role === "cliente") {
    const list = await prisma.agendamento.findMany({
      where: { clienteId: session.user.id },
      include: {
        barbearia: { select: { name: true } },
        servico: { select: { name: true, duracao: true, preco: true } },
        profissional: { include: { user: { select: { name: true } } } },
      },
      orderBy: { dataHora: "desc" },
    });
    return NextResponse.json(list);
  }

  return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
}
