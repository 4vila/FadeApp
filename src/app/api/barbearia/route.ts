import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { randomUUID } from "crypto";

const createBarbeariaSchema = z.object({
  name: z.string().min(1),
  address: z.string().optional(),
  city: z.string().optional(),
  phone: z.string().optional(),
});

/**
 * Apenas admin pode criar barbearia.
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Apenas administrador pode criar barbearia." }, { status: 403 });
  }
  const body = await request.json().catch(() => ({}));
  const parsed = createBarbeariaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 400 });
  }
  const { name, address, city, phone } = parsed.data;
  try {
    const barbearia = await prisma.barbearia.create({
      data: { name, address, city, phone },
    });
    return NextResponse.json(barbearia, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("column") && (msg.includes("does not exist") || msg.includes("não existe"))) {
      try {
        const id = randomUUID();
        await prisma.$executeRawUnsafe(
          `INSERT INTO "Barbearia" (id, name, address, city, phone, "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
          id,
          name,
          address ?? null,
          city ?? null,
          phone ?? null
        );
        const [row] = await prisma.$queryRawUnsafe<
          { id: string; name: string; address: string | null; city: string | null; phone: string | null; createdAt: Date; updatedAt: Date }[]
        >(`SELECT id, name, address, city, phone, "createdAt", "updatedAt" FROM "Barbearia" WHERE id = $1`, id);
        if (row) return NextResponse.json(row, { status: 201 });
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
      { error: msg || "Erro ao criar barbearia." },
      { status: 500 }
    );
  }
}
