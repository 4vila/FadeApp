"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

type Agendamento = {
  id: string;
  dataHora: string;
  status: string;
  cliente: { name: string | null; email: string };
  profissional: { user: { name: string | null } };
  servico: { name: string };
};

export default function AgendamentosPage() {
  const [list, setList] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/barbearia/agendamentos")
      .then((r) => r.json())
      .then((data) => setList(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Carregando...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold">Agendamentos</h1>
      <p className="text-muted-foreground">Lista de agendamentos da barbearia.</p>
      <div className="mt-6 space-y-4">
        {list.length === 0 ? (
          <p className="text-muted-foreground">Nenhum agendamento.</p>
        ) : (
          list.map((a) => (
            <Card key={a.id}>
              <CardContent className="pt-4">
                <p className="font-medium">
                  {new Date(a.dataHora).toLocaleString("pt-BR")} — {a.servico.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  Cliente: {a.cliente.name ?? a.cliente.email} | Profissional:{" "}
                  {a.profissional.user.name ?? "—"}
                </p>
                <p className="text-sm">Status: {a.status}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
