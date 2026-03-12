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

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return jsonError("Faça login para agendar.", 401);
    }
    if (session.user.role !== "cliente") {
      return jsonError("Apenas clientes podem agendar.", 403);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonError("Corpo da requisição inválido.", 400);
    }
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const dataHora = new Date(parsed.data.dataHora);
    if (Number.isNaN(dataHora.getTime()) || dataHora < new Date()) {
      return jsonError("Data/hora inválida ou no passado.", 400);
    }

    const [servico, profissional] = await Promise.all([
      prisma.servico.findFirst({
        where: {
          id: parsed.data.servicoId,
          barbeariaId: parsed.data.barbeariaId,
        },
        select: { id: true, duracao: true },
      }),
      prisma.profissional.findFirst({
        where: {
          id: parsed.data.profissionalId,
          barbeariaId: parsed.data.barbeariaId,
        },
      }),
    ]);

    if (!servico) {
      return jsonError("Serviço não encontrado.", 404);
    }
    if (!profissional) {
      return jsonError("Profissional não encontrado nesta barbearia.", 400);
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
      return jsonError("Horário não disponível.", 409);
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

    const payload = {
      id: agendamento.id,
      barbeariaId: agendamento.barbeariaId,
      clienteId: agendamento.clienteId,
      profissionalId: agendamento.profissionalId,
      servicoId: agendamento.servicoId,
      dataHora: agendamento.dataHora.toISOString(),
      status: agendamento.status,
      criadoEm: agendamento.criadoEm.toISOString(),
      servico: agendamento.servico,
      profissional: agendamento.profissional,
    };
    return NextResponse.json(payload, { status: 201 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro ao confirmar agendamento.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
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
