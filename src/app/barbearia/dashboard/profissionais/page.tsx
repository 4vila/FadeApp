"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type Profissional = {
  id: string;
  especialidades: string | null;
  user: { id: string; name: string | null; email: string };
};

export default function ProfissionaisPage() {
  const [list, setList] = useState<Profissional[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/barbearia/profissionais")
      .then((r) => r.json())
      .then((data) => setList(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Carregando...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold">Profissionais</h1>
      <p className="text-muted-foreground">Gerencie os profissionais da barbearia.</p>
      <div className="mt-6 space-y-4">
        {list.map((p) => (
          <Card key={p.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <p className="font-medium">{p.user.name ?? "—"}</p>
                <p className="text-sm text-muted-foreground">{p.user.email}</p>
                {p.especialidades && (
                  <p className="text-sm text-muted-foreground">{p.especialidades}</p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  if (!confirm("Remover este profissional?")) return;
                  await fetch(`/api/barbearia/profissionais/${p.id}`, { method: "DELETE" });
                  setList((prev) => prev.filter((x) => x.id !== p.id));
                }}
              >
                Remover
              </Button>
            </CardHeader>
          </Card>
        ))}
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        Para adicionar profissional, use a API POST /api/barbearia/profissionais (nome, email, senha, especialidades) ou implemente um formulário aqui.
      </p>
    </div>
  );
}
