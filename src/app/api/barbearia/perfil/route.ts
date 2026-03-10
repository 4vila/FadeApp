import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBarbeariaAccess } from "@/lib/auth-barbearia";
import { z } from "zod";

const updatePerfilSchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  phone: z.string().optional(),
  logo: z.string().url().optional().nullable(),
  horarioFuncionamento: z.record(z.string(), z.object({ inicio: z.string(), fim: z.string() })).optional(),
});

export async function GET() {
  const access = await requireBarbeariaAccess();
  if ("error" in access) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }
  const barbearia = await prisma.barbearia.findUnique({
    where: { id: access.barbeariaId },
  });
  if (!barbearia) {
    return NextResponse.json({ error: "Barbearia não encontrada" }, { status: 404 });
  }
  return NextResponse.json(barbearia);
}

export async function PATCH(request: Request) {
  const access = await requireBarbeariaAccess();
  if ("error" in access) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }
  const body = await request.json().catch(() => ({}));
  const parsed = updatePerfilSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 400 });
  }
  const updated = await prisma.barbearia.update({
    where: { id: access.barbeariaId },
    data: parsed.data,
  });
  return NextResponse.json(updated);
}
