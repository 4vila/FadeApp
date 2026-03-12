import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBarbeariaAccess } from "@/lib/auth-barbearia";
import bcrypt from "bcryptjs";
import { z } from "zod";

const createClienteSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha temporária deve ter no mínimo 6 caracteres"),
});

/**
 * Lista clientes cadastrados por esta barbearia (barbeariaId no User).
 */
export async function GET() {
  const access = await requireBarbeariaAccess();
  if ("error" in access) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }
  const clientes = await prisma.user.findMany({
    where: { role: "cliente", barbeariaId: access.barbeariaId },
    select: { id: true, name: true, email: true, createdAt: true, mustChangePassword: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(clientes);
}

/**
 * Cadastra um novo cliente (senha temporária; na primeira vez que logar, será obrigado a trocar).
 */
export async function POST(request: Request) {
  const access = await requireBarbeariaAccess();
  if ("error" in access) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }
  const body = await request.json().catch(() => ({}));
  const parsed = createClienteSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Dados inválidos";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  const emailLower = parsed.data.email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({
    where: { email: emailLower },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Já existe uma conta com este email. O cliente pode fazer login ou usar outra opção." },
      { status: 400 }
    );
  }
  const hashedPassword = await bcrypt.hash(parsed.data.password, 10);
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name.trim(),
      email: emailLower,
      password: hashedPassword,
      role: "cliente",
      barbeariaId: access.barbeariaId,
      mustChangePassword: true,
    },
  });
  return NextResponse.json(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      mustChangePassword: true,
    },
    { status: 201 }
  );
}
