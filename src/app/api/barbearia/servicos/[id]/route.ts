import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBarbeariaAccess } from "@/lib/auth-barbearia";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  duracao: z.number().int().positive().optional(),
  preco: z.number().nonnegative().optional(),
  photo: z.string().optional().nullable().transform((v) => (v === "" ? null : v)),
  profissionalIds: z.array(z.string()).optional(),
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
  const exists = await prisma.servico.findFirst({
    where: { id, barbeariaId: access.barbeariaId },
  });
  if (!exists) return NextResponse.json({ error: "Serviço não encontrado" }, { status: 404 });
  const body = await request.json().catch(() => ({}));
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }
  const { profissionalIds, ...data } = parsed.data;
  await prisma.servico.update({
    where: { id },
    data,
  });
  if (profissionalIds !== undefined) {
    await prisma.profissionalServico.deleteMany({ where: { servicoId: id } });
    if (profissionalIds.length > 0) {
      await prisma.profissionalServico.createMany({
        data: profissionalIds.map((profissionalId) => ({ profissionalId, servicoId: id })),
        skipDuplicates: true,
      });
    }
  }
  const updated = await prisma.servico.findUnique({
    where: { id },
    include: { profissionais: true },
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await requireBarbeariaAccess();
  if ("error" in access) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }
  const { id } = await params;
  const exists = await prisma.servico.findFirst({
    where: { id, barbeariaId: access.barbeariaId },
  });
  if (!exists) return NextResponse.json({ error: "Serviço não encontrado" }, { status: 404 });
  await prisma.servico.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
