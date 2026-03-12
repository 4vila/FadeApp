import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

type BarbeariaRow = {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  ativo?: boolean;
  planoVencidoEm?: string | null;
  planoTipo?: string | null;
  _count: { profissionais: number; agendamentos: number };
  users: { id: string; name: string | null; email: string }[];
};

/** Fallback quando colunas ativo/plano ainda não existem. */
async function listarBarbeariasAdminFallback(): Promise<BarbeariaRow[]> {
  const rows = await prisma.$queryRawUnsafe<
    { id: string; name: string; address: string | null; city: string | null; phone: string | null }[]
  >(`SELECT id, name, address, city, phone FROM "Barbearia" ORDER BY name ASC`);
  const ids = rows.map((r) => r.id);
  const [profCounts, agendCounts, users] = await Promise.all([
    prisma.profissional.groupBy({ by: ["barbeariaId"], _count: { id: true }, where: { barbeariaId: { in: ids } } }),
    prisma.agendamento.groupBy({ by: ["barbeariaId"], _count: { id: true }, where: { barbeariaId: { in: ids } } }),
    prisma.user.findMany({
      where: { role: "barbearia", barbeariaId: { in: ids } },
      select: { id: true, name: true, email: true, barbeariaId: true },
    }),
  ]);
  const profMap = new Map(profCounts.map((c) => [c.barbeariaId, c._count.id]));
  const agendMap = new Map(agendCounts.map((c) => [c.barbeariaId, c._count.id]));
  const usersByBarb = new Map<string, { id: string; name: string | null; email: string }[]>();
  for (const u of users) {
    if (u.barbeariaId) {
      const list = usersByBarb.get(u.barbeariaId) ?? [];
      list.push({ id: u.id, name: u.name, email: u.email });
      usersByBarb.set(u.barbeariaId, list);
    }
  }
  return rows.map((r) => ({
    ...r,
    ativo: true,
    planoVencidoEm: null,
    planoTipo: null,
    _count: { profissionais: profMap.get(r.id) ?? 0, agendamentos: agendMap.get(r.id) ?? 0 },
    users: usersByBarb.get(r.id) ?? [],
  }));
}

/**
 * Lista todas as barbearias. Apenas admin.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }
  try {
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
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("column") && (msg.includes("does not exist") || msg.includes("não existe"))) {
      try {
        const barbearias = await listarBarbeariasAdminFallback();
        return NextResponse.json(barbearias);
      } catch (fallbackErr) {
        console.error(fallbackErr);
        return NextResponse.json(
          {
            error:
              "Banco de dados desatualizado. Execute no servidor: npx prisma migrate deploy",
          },
          { status: 503 }
        );
      }
    }
    console.error(e);
    return NextResponse.json(
      { error: "Erro ao listar barbearias." },
      { status: 500 }
    );
  }
}
