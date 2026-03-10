import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

/**
 * Lista todas as barbearias. Apenas admin.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }
  const barbearias = await prisma.barbearia.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { profissionais: true, agendamentos: true },
      },
      users: {
        where: { role: "barbearia" },
        select: { id: true, name: true, email: true },
      },
    },
  });
  return NextResponse.json(barbearias);
}
