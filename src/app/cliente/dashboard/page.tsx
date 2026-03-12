"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, User } from "lucide-react";

type Agendamento = {
  id: string;
  dataHora: string;
  status: string;
  barbearia: { name: string };
  servico: { name: string; duracao: number; preco: unknown };
  profissional: { user: { name: string | null } };
};

export default function ClienteDashboardPage() {
  const [list, setList] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/agendamentos?cliente=true")
      .then((r) => r.json())
      .then((data) => setList(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  async function cancelar(id: string) {
    if (!confirm("Cancelar este agendamento?")) return;
    const res = await fetch(`/api/agendamentos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancelar" }),
    });
    if (res.ok) setList((prev) => prev.filter((a) => a.id !== id));
    else {
      const json = await res.json().catch(() => ({}));
      alert(json.error ?? "Erro ao cancelar");
    }
  }

  const agora = new Date();
  const proximos = list.filter((a) => new Date(a.dataHora) >= agora && a.status === "confirmado");
  const passados = list.filter((a) => new Date(a.dataHora) < agora || a.status !== "confirmado");

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="mt-4 text-caption text-muted-foreground">Carregando agendamentos...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-heading-1 text-foreground">Meus agendamentos</h1>
      <p className="mt-2 text-caption text-muted-foreground">Próximos e histórico.</p>

      <section className="mt-8">
        <h2 className="text-heading-3 text-foreground">Próximos</h2>
        {proximos.length === 0 ? (
          <p className="mt-3 text-caption text-muted-foreground">Nenhum agendamento futuro.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {proximos.map((a) => (
              <Card
                key={a.id}
                className="overflow-hidden rounded-2xl border border-border/80 shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-card-hover)]"
              >
                <CardContent className="p-5">
                  <p className="flex items-center gap-2 font-semibold text-foreground">
                    <Calendar className="h-4 w-4 text-primary" aria-hidden />
                    {new Date(a.dataHora).toLocaleString("pt-BR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </p>
                  <p className="mt-1 text-caption text-muted-foreground">
                    {a.servico.name} · {a.barbearia.name}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <User className="h-3.5 w-3.5" aria-hidden />
                    {a.profissional.user.name ?? "—"}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl"
                      onClick={() => cancelar(a.id)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-heading-3 text-foreground">Histórico</h2>
        {passados.length === 0 ? (
          <p className="mt-3 text-caption text-muted-foreground">Nenhum agendamento anterior.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {passados.slice(0, 10).map((a) => (
              <Card
                key={a.id}
                className="rounded-2xl border border-border/60 bg-muted/20"
              >
                <CardContent className="p-4">
                  <p className="text-caption text-foreground">
                    {new Date(a.dataHora).toLocaleString("pt-BR")} — {a.servico.name} — {a.status}
                  </p>
                  <p className="mt-0.5 text-small text-muted-foreground">{a.barbearia.name}</p>
                </CardContent>
              </Card>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-10 flex justify-center">
        <Button
          asChild
          size="lg"
          className="h-12 rounded-xl font-semibold shadow-sm"
        >
          <Link href="/barbearias">Agendar novo</Link>
        </Button>
      </div>
    </div>
  );
}
