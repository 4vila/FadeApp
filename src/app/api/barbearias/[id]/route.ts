import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const barbearia = await prisma.barbearia.findUnique({
      where: { id },
      include: {
        profissionais: {
          include: {
            user: { select: { name: true, image: true } },
          },
        },
        servicos: true,
      },
    });

    if (!barbearia) {
      return NextResponse.json({ error: "Barbearia não encontrada." }, { status: 404 });
    }

    return NextResponse.json(barbearia);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Erro ao buscar barbearia." },
      { status: 500 }
    );
  }
}
