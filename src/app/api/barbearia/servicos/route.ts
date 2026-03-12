import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBarbeariaAccess } from "@/lib/auth-barbearia";
import { z } from "zod";
import { randomUUID } from "crypto";

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
  const { name, description, duracao, preco } = data;
  const barbeariaId = access.barbeariaId;

  try {
    const servico = await prisma.servico.create({
      data: {
        name,
        description,
        duracao,
        preco,
        photo: data.photo ?? undefined,
        barbeariaId,
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
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("column") && (msg.includes("does not exist") || msg.includes("não existe"))) {
      try {
        const id = randomUUID();
        await prisma.$executeRawUnsafe(
          `INSERT INTO "Servico" (id, "barbeariaId", name, description, duracao, preco, "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
          id,
          barbeariaId,
          name,
          description ?? null,
          duracao,
          Number(preco)
        );
        if (profissionalIds?.length) {
          for (const profissionalId of profissionalIds) {
            await prisma.$executeRawUnsafe(
              `INSERT INTO "ProfissionalServico" ("profissionalId", "servicoId") VALUES ($1, $2) ON CONFLICT ("profissionalId", "servicoId") DO NOTHING`,
              profissionalId,
              id
            );
          }
        }
        const [row] = await prisma.$queryRawUnsafe<
          { id: string; name: string; description: string | null; duracao: number; preco: unknown; barbeariaId: string; createdAt: Date; updatedAt: Date }[]
        >(
          `SELECT id, name, description, duracao, preco, "barbeariaId", "createdAt", "updatedAt" FROM "Servico" WHERE id = $1`,
          id
        );
        if (row) return NextResponse.json({ ...row, photo: null, profissionais: [] }, { status: 201 });
      } catch (fallbackErr) {
        console.error(fallbackErr);
        return NextResponse.json(
          { error: "Banco desatualizado. Execute no servidor: npx prisma migrate deploy" },
          { status: 503 }
        );
      }
    }
    console.error(e);
    return NextResponse.json({ error: msg || "Erro ao salvar serviço." }, { status: 500 });
  }
}
