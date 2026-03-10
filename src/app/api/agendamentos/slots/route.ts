import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function parseTime(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function timeToString(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const barbeariaId = searchParams.get("barbeariaId");
  const profissionalId = searchParams.get("profissionalId");
  const servicoId = searchParams.get("servicoId");
  const dataStr = searchParams.get("data"); // YYYY-MM-DD

  if (!barbeariaId || !profissionalId || !servicoId || !dataStr) {
    return NextResponse.json(
      { error: "barbeariaId, profissionalId, servicoId e data são obrigatórios" },
      { status: 400 }
    );
  }

  const data = new Date(dataStr + "T12:00:00");
  if (isNaN(data.getTime())) {
    return NextResponse.json({ error: "Data inválida" }, { status: 400 });
  }

  const [barbearia, servico, agendamentos, bloqueios] = await Promise.all([
    prisma.barbearia.findUnique({
      where: { id: barbeariaId },
      select: { horarioFuncionamento: true },
    }),
    prisma.servico.findFirst({
      where: { id: servicoId, barbeariaId },
      select: { duracao: true },
    }),
    prisma.agendamento.findMany({
      where: {
        profissionalId,
        status: "confirmado",
        dataHora: {
          gte: new Date(data.getFullYear(), data.getMonth(), data.getDate(), 0, 0, 0),
          lt: new Date(data.getFullYear(), data.getMonth(), data.getDate() + 1, 0, 0, 0),
        },
      },
      select: { dataHora: true },
    }),
    prisma.agenda.findMany({
      where: {
        profissionalId,
        data: data,
        disponivel: false,
      },
      select: { horaInicio: true, horaFim: true },
    }),
  ]);

  if (!servico) {
    return NextResponse.json({ error: "Serviço não encontrado" }, { status: 404 });
  }

  const horario = barbearia?.horarioFuncionamento as Record<string, { inicio?: string; fim?: string }> | null;
  const dayKey = String(data.getDay());
  const range = horario?.[dayKey] ?? { inicio: "09:00", fim: "18:00" };
  const inicioMin = parseTime(range.inicio ?? "09:00");
  const fimMin = parseTime(range.fim ?? "18:00");
  const duracao = servico.duracao;

  const ocupados: { start: number; end: number }[] = [
    ...agendamentos.map((a) => {
      const d = new Date(a.dataHora);
      const start = d.getHours() * 60 + d.getMinutes();
      return { start, end: start + duracao };
    }),
    ...bloqueios.map((b) => ({
      start: parseTime(b.horaInicio),
      end: parseTime(b.horaFim),
    })),
  ];

  const slots: string[] = [];
  const slotStep = 30;
  for (let start = inicioMin; start + duracao <= fimMin; start += slotStep) {
    const end = start + duracao;
    const conflito = ocupados.some(
      (o) => (start >= o.start && start < o.end) || (end > o.start && end <= o.end) || (start <= o.start && end >= o.end)
    );
    if (!conflito) slots.push(timeToString(start));
  }

  return NextResponse.json({ slots });
}
