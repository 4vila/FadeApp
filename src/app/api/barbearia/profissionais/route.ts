import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBarbeariaAccess } from "@/lib/auth-barbearia";
import bcrypt from "bcryptjs";
import { z } from "zod";

const createProfissionalSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  especialidades: z.string().optional(),
  phone: z.string().optional(),
  photo: z.union([z.string().url(), z.literal("")]).optional().nullable().transform((v) => (v === "" ? null : v)),
});

export async function GET() {
  const access = await requireBarbeariaAccess();
  if ("error" in access) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }
  const list = await prisma.profissional.findMany({
    where: { barbeariaId: access.barbeariaId },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  return NextResponse.json(list);
}

export async function POST(request: Request) {
  const access = await requireBarbeariaAccess();
  if ("error" in access) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }
  const body = await request.json().catch(() => ({}));
  const parsed = createProfissionalSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 400 });
  }
  const existingUser = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });
  if (existingUser) {
    return NextResponse.json({ error: "Já existe usuário com este email." }, { status: 400 });
  }
  const hashedPassword = await bcrypt.hash(parsed.data.password, 10);
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      password: hashedPassword,
      role: "profissional",
      barbeariaId: access.barbeariaId,
      phone: parsed.data.phone,
    },
  });
  const profissional = await prisma.profissional.create({
    data: {
      userId: user.id,
      barbeariaId: access.barbeariaId,
      especialidades: parsed.data.especialidades ?? undefined,
      photo: parsed.data.photo ?? undefined,
    },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  return NextResponse.json(profissional, { status: 201 });
}
