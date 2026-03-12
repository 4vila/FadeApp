import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBarbeariaAccess } from "@/lib/auth-barbearia";
import { z } from "zod";

const updateSchema = z.object({
  especialidades: z.string().optional(),
  photo: z.union([z.string().url(), z.literal("")]).optional().nullable().transform((v) => (v === "" ? null : v)),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await requireBarbeariaAccess();
  if ("error" in access) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }
  const { id } = await params;
  const p = await prisma.profissional.findFirst({
    where: { id, barbeariaId: access.barbeariaId },
    include: { user: { select: { name: true, email: true } } },
  });
  if (!p) return NextResponse.json({ error: "Profissional não encontrado" }, { status: 404 });
  return NextResponse.json(p);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await requireBarbeariaAccess();
  if ("error" in access) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }
  const { id } = await params;
  const exists = await prisma.profissional.findFirst({
    where: { id, barbeariaId: access.barbeariaId },
  });
  if (!exists) return NextResponse.json({ error: "Profissional não encontrado" }, { status: 404 });
  const body = await request.json().catch(() => ({}));
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }
  const updated = await prisma.profissional.update({
    where: { id },
    data: parsed.data,
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
  const exists = await prisma.profissional.findFirst({
    where: { id, barbeariaId: access.barbeariaId },
  });
  if (!exists) return NextResponse.json({ error: "Profissional não encontrado" }, { status: 404 });
  await prisma.profissional.delete({ where: { id } });
  await prisma.user.delete({ where: { id: exists.userId } }).catch(() => {});
  return NextResponse.json({ success: true });
}
