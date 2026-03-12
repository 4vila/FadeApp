import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z.enum(["admin", "barbearia", "profissional", "cliente"]).optional(),
  barbeariaId: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      barbeariaId: true,
      phone: true,
      createdAt: true,
      barbearia: { select: { id: true, name: true } },
    },
  });
  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }
  return NextResponse.json(user);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  const data: { name?: string; email?: string; password?: string; role?: Role; barbeariaId?: string | null; phone?: string | null } = {};
  if (parsed.data.name !== undefined) data.name = parsed.data.name.trim();
  if (parsed.data.email !== undefined) {
    const emailLower = parsed.data.email.trim().toLowerCase();
    const conflict = await prisma.user.findFirst({
      where: { email: emailLower, id: { not: id } },
    });
    if (conflict) {
      return NextResponse.json({ error: "Já existe outro usuário com este email." }, { status: 400 });
    }
    data.email = emailLower;
  }
  if (parsed.data.password !== undefined && parsed.data.password.length >= 6) {
    data.password = await bcrypt.hash(parsed.data.password, 10);
  }
  if (parsed.data.role !== undefined) data.role = parsed.data.role as Role;
  if (parsed.data.barbeariaId !== undefined) data.barbeariaId = parsed.data.barbeariaId;
  if (parsed.data.phone !== undefined) data.phone = parsed.data.phone;

  if ((data.role === "barbearia" || data.role === "profissional") && (data.barbeariaId ?? existing.barbeariaId)) {
    const barbeariaId = data.barbeariaId ?? existing.barbeariaId;
    const barbearia = await prisma.barbearia.findUnique({ where: { id: barbeariaId! } });
    if (!barbearia) {
      return NextResponse.json({ error: "Barbearia não encontrada." }, { status: 400 });
    }
  }

  const updated = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, role: true, barbeariaId: true, barbearia: { select: { name: true } } },
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }
  const { id } = await params;
  if (id === session.user.id) {
    return NextResponse.json({ error: "Você não pode excluir sua própria conta." }, { status: 400 });
  }
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }
  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
