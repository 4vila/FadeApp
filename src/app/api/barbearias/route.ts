import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Fallback quando colunas ativo/plano ainda não existem (migration não rodou). */
async function listarBarbeariasFallback(nome?: string, cidade?: string) {
  const conditions: string[] = [];
  const values: string[] = [];
  let i = 0;
  if (nome) {
    i++;
    conditions.push(`name ILIKE $${i}`);
    values.push(`%${nome}%`);
  }
  if (cidade) {
    i++;
    conditions.push(`city ILIKE $${i}`);
    values.push(`%${cidade}%`);
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const barbearias = await prisma.$queryRawUnsafe<
    { id: string; name: string; address: string | null; city: string | null; phone: string | null; logo: string | null }[]
  >(
    `SELECT id, name, address, city, phone, logo FROM "Barbearia" ${where} ORDER BY name ASC`,
    ...values
  );
  return barbearias;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const nome = searchParams.get("nome")?.trim();
    const cidade = searchParams.get("cidade")?.trim();

    const where: {
      name?: { contains: string; mode: "insensitive" };
      city?: { contains: string; mode: "insensitive" };
      ativo?: boolean;
      OR?: { planoVencidoEm: null | { gt: Date } }[];
    } = {
      ativo: true,
      OR: [{ planoVencidoEm: null }, { planoVencidoEm: { gt: new Date() } }],
    };
    if (nome) where.name = { contains: nome, mode: "insensitive" };
    if (cidade) where.city = { contains: cidade, mode: "insensitive" };

    let barbearias: { id: string; name: string; address: string | null; city: string | null; phone: string | null; logo: string | null }[];
    try {
      barbearias = await prisma.barbearia.findMany({
        where,
        select: {
          id: true,
          name: true,
          address: true,
          city: true,
          phone: true,
          logo: true,
        },
        orderBy: { name: "asc" },
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("column") && (msg.includes("does not exist") || msg.includes("não existe"))) {
        barbearias = await listarBarbeariasFallback(nome || undefined, cidade || undefined);
      } else {
        throw e;
      }
    }

    return NextResponse.json(barbearias);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Erro ao listar barbearias." },
      { status: 500 }
    );
  }
}
