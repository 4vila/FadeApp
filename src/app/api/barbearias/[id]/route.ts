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
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        phone: true,
        logo: true,
        photos: true,
        horarioFuncionamento: true,
        profissionais: {
          select: {
            id: true,
            especialidades: true,
            user: { select: { name: true, image: true } },
          },
        },
        servicos: {
          select: { id: true, name: true, description: true, duracao: true, preco: true },
        },
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
