import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { z } from "zod";

const validRoles: Role[] = ["admin", "barbearia", "profissional", "cliente"];

const createUsuarioSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha mínimo 6 caracteres"),
  role: z.enum(["admin", "barbearia", "profissional", "cliente"]),
  barbeariaId: z.string().optional(),
  phone: z.string().optional(),
});

/**
 * Lista usuários. Apenas admin. Query: ?role= para filtrar.
 */
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }
  const { searchParams } = new URL(request.url);
  const roleParam = searchParams.get("role");
  const where =
    roleParam && validRoles.includes(roleParam as Role)
      ? { role: roleParam as Role }
      : {};
  const usuarios = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      barbeariaId: true,
      createdAt: true,
      barbearia: { select: { id: true, name: true } },
    },
  });
  return NextResponse.json(usuarios);
}

/**
 * Cria usuário. Apenas admin.
 * role barbearia/profissional exige barbeariaId válido.
 * role profissional: cria também registro em Profissional.
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }
  const body = await request.json().catch(() => ({}));
  const parsed = createUsuarioSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { name, email, password, role, barbeariaId, phone } = parsed.data;

  if ((role === "barbearia" || role === "profissional") && !barbeariaId) {
    return NextResponse.json(
      { error: "barbeariaId é obrigatório para perfil barbearia ou profissional." },
      { status: 400 }
    );
  }

  const emailLower = email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({
    where: { email: emailLower },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Já existe usuário com este email." },
      { status: 400 }
    );
  }

  if (barbeariaId) {
    const barbearia = await prisma.barbearia.findUnique({
      where: { id: barbeariaId },
    });
    if (!barbearia) {
      return NextResponse.json(
        { error: "Barbearia não encontrada." },
        { status: 400 }
      );
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: emailLower,
      password: hashedPassword,
      role,
      barbeariaId: barbeariaId || null,
      phone: phone || null,
    },
  });

  if (role === "profissional" && barbeariaId) {
    await prisma.profissional.create({
      data: {
        userId: user.id,
        barbeariaId,
      },
    });
  }

  return NextResponse.json(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      barbeariaId: user.barbeariaId,
    },
    { status: 201 }
  );
}
