import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Retorna o ID da barbearia que o usuário logado pode gerenciar.
 * - role barbearia: usa barbeariaId da session
 * - role admin: usa o primeiro barbearia do DB (ou pode ser estendido para query param)
 */
export async function getBarbeariaIdForSession(): Promise<string | null> {
  const session = await auth();
  if (!session?.user) return null;
  if (session.user.role === "barbearia" && session.user.barbeariaId) {
    return session.user.barbeariaId;
  }
  if (session.user.role === "admin") {
    const first = await prisma.barbearia.findFirst({ select: { id: true } });
    return first?.id ?? null;
  }
  return null;
}

export async function requireBarbeariaAccess() {
  const session = await auth();
  if (!session?.user) return { error: "Não autorizado", status: 401 as const };
  if (session.user.role !== "barbearia" && session.user.role !== "admin") {
    return { error: "Acesso negado", status: 403 as const };
  }
  const barbeariaId = await getBarbeariaIdForSession();
  if (!barbeariaId) return { error: "Nenhuma barbearia encontrada", status: 404 as const };
  return { session, barbeariaId };
}
