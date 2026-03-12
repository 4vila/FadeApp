import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const PLANO_DIAS: Record<string, number> = {
  "30": 30,
  "60": 60,
  "90": 90,
  anual: 365,
};

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }
  const { id } = await params;
  const body = await _request.json().catch(() => ({}));

  const ativo = body.ativo;
  const planoVencidoEm = body.planoVencidoEm;
  const planoTipo = body.planoTipo;
  const plano = body.plano; // "30" | "60" | "90" | "anual" — ativa por X dias a partir de agora

  const data: { ativo?: boolean; planoVencidoEm?: Date | null; planoTipo?: string | null } = {};

  if (typeof ativo === "boolean") data.ativo = ativo;
  if (planoVencidoEm !== undefined) {
    data.planoVencidoEm = planoVencidoEm ? new Date(planoVencidoEm) : null;
  }
  if (planoTipo !== undefined) data.planoTipo = planoTipo ?? null;

  if (plano && typeof plano === "string" && PLANO_DIAS[plano] !== undefined) {
    const dias = PLANO_DIAS[plano];
    const vencimento = new Date();
    vencimento.setDate(vencimento.getDate() + dias);
    data.planoVencidoEm = vencimento;
    data.planoTipo = plano;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nenhum campo válido para atualizar." }, { status: 400 });
  }

  try {
    const updated = await prisma.barbearia.update({
      where: { id },
      data,
    });
    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json({ error: "Barbearia não encontrada ou erro ao atualizar." }, { status: 404 });
  }
}
