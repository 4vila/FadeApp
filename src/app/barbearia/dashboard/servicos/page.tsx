"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Servico = {
  id: string;
  name: string;
  description: string | null;
  duracao: number;
  preco: unknown;
};

export default function ServicosPage() {
  const [list, setList] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/barbearia/servicos")
      .then((r) => r.json())
      .then((data) => setList(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Carregando...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold">Serviços</h1>
      <p className="text-muted-foreground">Serviços oferecidos pela barbearia.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {list.map((s) => (
          <Card key={s.id}>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <p className="font-medium">{s.name}</p>
                {s.description && (
                  <p className="text-sm text-muted-foreground">{s.description}</p>
                )}
                <p className="text-sm">
                  {s.duracao} min — R$ {Number(s.preco).toFixed(2)}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  if (!confirm("Remover este serviço?")) return;
                  await fetch(`/api/barbearia/servicos/${s.id}`, { method: "DELETE" });
                  setList((prev) => prev.filter((x) => x.id !== s.id));
                }}
              >
                Remover
              </Button>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
