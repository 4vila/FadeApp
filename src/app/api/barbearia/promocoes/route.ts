import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBarbeariaAccess } from "@/lib/auth-barbearia";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1),
  descricao: z.string().optional(),
  tipoDesconto: z.enum(["percentual", "valor"]),
  valor: z.number().nonnegative(),
  servicoIds: z.array(z.string()).optional(),
  dataInicio: z.string(), // YYYY-MM-DD
  dataFim: z.string(),
});

export async function GET() {
  const access = await requireBarbeariaAccess();
  if ("error" in access) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }
  const list = await prisma.promocao.findMany({
    where: { barbeariaId: access.barbeariaId },
    orderBy: { dataFim: "desc" },
  });
  return NextResponse.json(list);
}

export async function POST(request: Request) {
  const access = await requireBarbeariaAccess();
  if ("error" in access) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }
  const body = await request.json().catch(() => ({}));
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }
  const promocao = await prisma.promocao.create({
    data: {
      barbeariaId: access.barbeariaId,
      name: parsed.data.name,
      descricao: parsed.data.descricao,
      tipoDesconto: parsed.data.tipoDesconto,
      valor: parsed.data.valor,
      servicoIds: parsed.data.servicoIds ?? undefined,
      dataInicio: new Date(parsed.data.dataInicio),
      dataFim: new Date(parsed.data.dataFim),
    },
  });
  return NextResponse.json(promocao, { status: 201 });
}
