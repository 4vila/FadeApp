import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBarbeariaAccess } from "@/lib/auth-barbearia";
import { z } from "zod";

const createServicoSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  duracao: z.number().int().positive(),
  preco: z.number().nonnegative(),
  photo: z.union([z.string().url(), z.literal("")]).optional().nullable().transform((v) => (v === "" ? null : v)),
  profissionalIds: z.array(z.string()).optional(),
});

export async function GET() {
  const access = await requireBarbeariaAccess();
  if ("error" in access) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }
  const list = await prisma.servico.findMany({
    where: { barbeariaId: access.barbeariaId },
    include: {
      profissionais: {
        include: { profissional: { include: { user: { select: { name: true } } } } },
      },
    },
  });
  return NextResponse.json(list);
}

export async function POST(request: Request) {
  const access = await requireBarbeariaAccess();
  if ("error" in access) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }
  const body = await request.json().catch(() => ({}));
  const parsed = createServicoSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    const msg = first?.message ? `${first.path.join(".")}: ${first.message}` : "Dados inválidos.";
    return NextResponse.json({ error: msg, details: parsed.error.flatten() }, { status: 400 });
  }
  const { profissionalIds, ...data } = parsed.data;
  try {
    const servico = await prisma.servico.create({
      data: {
        ...data,
        barbeariaId: access.barbeariaId,
      },
    });
    if (profissionalIds?.length) {
      await prisma.profissionalServico.createMany({
        data: profissionalIds.map((profissionalId) => ({
          profissionalId,
          servicoId: servico.id,
        })),
        skipDuplicates: true,
      });
    }
    const withProfs = await prisma.servico.findUnique({
      where: { id: servico.id },
      include: { profissionais: true },
    });
    return NextResponse.json(withProfs ?? servico, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro ao salvar serviço.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
