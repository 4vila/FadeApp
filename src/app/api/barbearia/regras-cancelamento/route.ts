import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBarbeariaAccess } from "@/lib/auth-barbearia";
import { z } from "zod";

const updateSchema = z.object({
  horasAntecedenciaMinima: z.number().int().min(0),
});

export async function GET() {
  const access = await requireBarbeariaAccess();
  if ("error" in access) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }
  const regra = await prisma.regraCancelamento.findUnique({
    where: { barbeariaId: access.barbeariaId },
  });
  return NextResponse.json(regra ?? { horasAntecedenciaMinima: 2 });
}

export async function PUT(request: Request) {
  const access = await requireBarbeariaAccess();
  if ("error" in access) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }
  const body = await request.json().catch(() => ({}));
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }
  const regra = await prisma.regraCancelamento.upsert({
    where: { barbeariaId: access.barbeariaId },
    create: {
      barbeariaId: access.barbeariaId,
      horasAntecedenciaMinima: parsed.data.horasAntecedenciaMinima,
    },
    update: { horasAntecedenciaMinima: parsed.data.horasAntecedenciaMinima },
  });
  return NextResponse.json(regra);
}
