import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default async function BarbeariaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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

  if (!barbearia) notFound();

  const horario = barbearia.horarioFuncionamento as Record<string, { inicio?: string; fim?: string }> | null;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="container mx-auto flex-1 max-w-3xl px-4 py-6">
        <div className="mb-4">
          <Button variant="link" asChild className="text-sm">
            <Link href="/barbearias">← Voltar à lista</Link>
          </Button>
        </div>

        <h1 className="text-2xl font-bold">{barbearia.name}</h1>
        <div className="mt-2 space-y-0.5 text-sm text-muted-foreground">
          {barbearia.address && <p>{barbearia.address}</p>}
          {barbearia.city && <p>{barbearia.city}</p>}
          {barbearia.phone && <p>{barbearia.phone}</p>}
        </div>

        {horario && Object.keys(horario).length > 0 && (
          <Card className="mt-4">
            <CardHeader className="py-3">
              <h2 className="text-sm font-semibold">Horário de funcionamento</h2>
            </CardHeader>
            <CardContent className="text-sm">
              <ul className="space-y-1">
                {Object.entries(horario).map(([dia, h]) => (
                  <li key={dia}>
                    {dia}: {h?.inicio ?? "—"} às {h?.fim ?? "—"}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {barbearia.profissionais.length > 0 && (
          <Card className="mt-4">
            <CardHeader className="py-3">
              <h2 className="text-sm font-semibold">Profissionais</h2>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {barbearia.profissionais.map((p) => (
                  <li key={p.id} className="flex items-center gap-2">
                    <span className="font-medium">{p.user.name ?? "Profissional"}</span>
                    {p.especialidades && (
                      <span className="text-sm text-muted-foreground">
                        — {p.especialidades}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {barbearia.servicos.length > 0 && (
          <Card className="mt-4">
            <CardHeader className="py-3">
              <h2 className="text-sm font-semibold">Serviços</h2>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {barbearia.servicos.map((s) => (
                  <li key={s.id} className="flex justify-between gap-4">
                    <span>{s.name}</span>
                    <span className="text-muted-foreground">
                      {s.duracao} min — R$ {Number(s.preco).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <div className="mt-5">
          <Button asChild size="sm" className="h-9">
            <Link href={`/barbearias/${id}/agendar`}>Agendar</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
