"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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

  if (loading) return <p>Carregando...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold">Meus agendamentos</h1>
      <p className="text-muted-foreground">Próximos e histórico.</p>

      <div className="mt-6">
        <h2 className="font-semibold">Próximos</h2>
        {proximos.length === 0 ? (
          <p className="mt-2 text-muted-foreground">Nenhum agendamento futuro.</p>
        ) : (
          <div className="mt-2 space-y-4">
            {proximos.map((a) => (
              <Card key={a.id}>
                <CardContent className="pt-4">
                  <p className="font-medium">
                    {new Date(a.dataHora).toLocaleString("pt-BR")} — {a.servico.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {a.barbearia.name} | {a.profissional.user.name ?? "—"}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => cancelar(a.id)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="font-semibold">Histórico</h2>
        {passados.length === 0 ? (
          <p className="mt-2 text-muted-foreground">Nenhum agendamento anterior.</p>
        ) : (
          <div className="mt-2 space-y-4">
            {passados.slice(0, 10).map((a) => (
              <Card key={a.id}>
                <CardContent className="pt-4">
                  <p className="text-sm">
                    {new Date(a.dataHora).toLocaleString("pt-BR")} — {a.servico.name} — {a.status}
                  </p>
                  <p className="text-sm text-muted-foreground">{a.barbearia.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8">
        <Button asChild>
          <Link href="/barbearias">Agendar novo</Link>
        </Button>
      </div>
    </div>
  );
}
