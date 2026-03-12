import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional().nullable(),
  image: z.string().optional().nullable().or(z.literal("")),
  senhaAtual: z.string().optional(),
  novaSenha: z.string().min(6, "Nova senha deve ter no mínimo 6 caracteres").optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, phone: true, image: true, role: true, mustChangePassword: true },
  });
  if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  return NextResponse.json(user);
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Dados inválidos";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const data: { name?: string; phone?: string | null; image?: string | null; password?: string; mustChangePassword?: boolean } = {};
  if (parsed.data.name !== undefined) data.name = parsed.data.name;
  if (parsed.data.phone !== undefined) data.phone = parsed.data.phone === "" ? null : parsed.data.phone ?? null;
  if (parsed.data.image !== undefined) data.image = parsed.data.image === "" ? null : parsed.data.image ?? null;

  if (parsed.data.novaSenha) {
    if (!parsed.data.senhaAtual) {
      return NextResponse.json({ error: "Informe a senha atual para alterar." }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { password: true } });
    if (!user?.password) {
      return NextResponse.json({ error: "Conta sem senha definida." }, { status: 400 });
    }
    const ok = await bcrypt.compare(parsed.data.senhaAtual, user.password);
    if (!ok) {
      return NextResponse.json({ error: "Senha atual incorreta." }, { status: 400 });
    }
    data.password = await bcrypt.hash(parsed.data.novaSenha, 10);
    data.mustChangePassword = false;
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data,
  });
  return NextResponse.json({
    id: updated.id,
    name: updated.name,
    phone: updated.phone,
    image: updated.image,
    mustChangePassword: updated.mustChangePassword,
  });
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  await prisma.user.delete({ where: { id: session.user.id } });
  return NextResponse.json({ ok: true });
}
