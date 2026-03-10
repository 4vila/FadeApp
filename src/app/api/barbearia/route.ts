import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

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
  const barbearia = await prisma.barbearia.create({
    data: parsed.data,
  });
  return NextResponse.json(barbearia, { status: 201 });
}
