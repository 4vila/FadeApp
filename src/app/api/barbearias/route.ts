import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const nome = searchParams.get("nome")?.trim();
    const cidade = searchParams.get("cidade")?.trim();

    const where: { name?: { contains: string; mode: "insensitive" }; city?: { contains: string; mode: "insensitive" } } = {};
    if (nome) where.name = { contains: nome, mode: "insensitive" };
    if (cidade) where.city = { contains: cidade, mode: "insensitive" };

    const barbearias = await prisma.barbearia.findMany({
      where: Object.keys(where).length ? where : undefined,
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

    return NextResponse.json(barbearias);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Erro ao listar barbearias." },
      { status: 500 }
    );
  }
}
