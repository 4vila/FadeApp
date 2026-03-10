"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

type Agendamento = {
  id: string;
  dataHora: string;
  status: string;
  cliente: { name: string | null; email: string };
  servico: { name: string; duracao: number };
};

export default function ProfissionalDashboardPage() {
  const [list, setList] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataInicio, setDataInicio] = useState(() => new Date().toISOString().slice(0, 10));

  useEffect(() => {
    const from = dataInicio;
    const d = new Date(dataInicio);
    d.setDate(d.getDate() + 6);
    const to = d.toISOString().slice(0, 10);
    fetch(`/api/profissional/agenda?from=${from}&to=${to}`)
      .then((r) => r.json())
      .then((data) => setList(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [dataInicio]);

  const hoje = new Date().toISOString().slice(0, 10);
  const agendamentosHoje = list.filter(
    (a) => a.dataHora.slice(0, 10) === hoje && a.status === "confirmado"
  );

  if (loading) return <p>Carregando...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold">Minha agenda</h1>
      <p className="text-muted-foreground">Agendamentos da semana.</p>

      <div className="mt-4">
        <label className="text-sm text-muted-foreground">A partir de </label>
        <input
          type="date"
          value={dataInicio}
          onChange={(e) => setDataInicio(e.target.value)}
          className="ml-2 rounded border px-2 py-1"
        />
      </div>

      <div className="mt-6">
        <h2 className="font-semibold">Hoje</h2>
        {agendamentosHoje.length === 0 ? (
          <p className="mt-2 text-muted-foreground">Nenhum agendamento para hoje.</p>
        ) : (
          <div className="mt-2 space-y-4">
            {agendamentosHoje.map((a) => (
              <Card key={a.id}>
                <CardContent className="pt-4">
                  <p className="font-medium">
                    {new Date(a.dataHora).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    — {a.servico.name} ({a.servico.duracao} min)
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {a.cliente.name ?? a.cliente.email}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="font-semibold">Próximos da semana</h2>
        {list.filter((a) => a.dataHora.slice(0, 10) !== hoje || a.status !== "confirmado").length === 0 ? (
          <p className="mt-2 text-muted-foreground">Nenhum outro agendamento.</p>
        ) : (
          <div className="mt-2 space-y-2">
            {list
              .filter((a) => a.status === "confirmado")
              .slice(0, 20)
              .map((a) => (
                <Card key={a.id}>
                  <CardContent className="pt-4">
                    <p className="text-sm">
                      {new Date(a.dataHora).toLocaleString("pt-BR")} — {a.servico.name} —{" "}
                      {a.cliente.name ?? a.cliente.email}
                    </p>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
