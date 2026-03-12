import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FluxoAgendamento } from "./FluxoAgendamento";

export default async function AgendarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/barbearias/${(await params).id}/agendar`)}`);
  }
  if (session.user.role !== "cliente") {
    redirect("/barbearias");
  }

  const { id: barbeariaId } = await params;
  const barbearia = await prisma.barbearia.findUnique({
    where: { id: barbeariaId },
    select: {
      id: true,
      name: true,
      servicos: {
        select: { id: true, name: true, description: true, duracao: true, preco: true },
      },
      profissionais: {
        select: {
          id: true,
          especialidades: true,
          user: { select: { name: true } },
        },
      },
    },
  });

  if (!barbearia) redirect("/barbearias");

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="container flex-1 px-4 py-8">
        <Button variant="link" asChild>
          <Link href={`/barbearias/${barbeariaId}`}>← Voltar</Link>
        </Button>
        <h1 className="mt-4 text-2xl font-bold">Agendar — {barbearia.name}</h1>
        <FluxoAgendamento
          barbeariaId={barbeariaId}
          servicos={barbearia.servicos}
          profissionais={barbearia.profissionais}
        />
      </main>
      <Footer />
    </div>
  );
}
