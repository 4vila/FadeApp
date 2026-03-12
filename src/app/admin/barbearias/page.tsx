"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Store, Plus, Users, Calendar, ToggleLeft, Loader2 } from "lucide-react";

const PLANOS = [
  { value: "30", label: "30 dias" },
  { value: "60", label: "60 dias" },
  { value: "90", label: "90 dias" },
  { value: "anual", label: "Anual" },
] as const;

type Barbearia = {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  ativo: boolean;
  planoVencidoEm: string | null;
  planoTipo: string | null;
  _count: { profissionais: number; agendamentos: number };
  users: { id: string; name: string | null; email: string }[];
};

function formatarData(s: string | null) {
  if (!s) return "—";
  const d = new Date(s);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function planoVencido(planoVencidoEm: string | null) {
  if (!planoVencidoEm) return false;
  return new Date(planoVencidoEm) < new Date();
}

export default function AdminBarbeariasPage() {
  const [list, setList] = useState<Barbearia[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  function loadList() {
    return fetch("/api/admin/barbearias")
      .then((r) => r.json())
      .then((data) => setList(Array.isArray(data) ? data : []));
  }

  useEffect(() => {
    loadList().finally(() => setLoading(false));
  }, []);

  async function setAtivo(id: string, ativo: boolean) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/barbearias/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ativo }),
      });
      if (res.ok) loadList();
    } finally {
      setUpdatingId(null);
    }
  }

  async function aplicarPlano(id: string, plano: string) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/barbearias/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plano }),
      });
      if (res.ok) loadList();
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) return <p className="text-muted-foreground">Carregando...</p>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Barbearias</h1>
        <Button asChild>
          <Link href="/admin/barbearias/nova" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nova barbearia
          </Link>
        </Button>
      </div>
      <p className="text-muted-foreground mt-1">
        Gerencie as barbearias da plataforma.
      </p>

      <div className="mt-6 space-y-4">
        {list.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Nenhuma barbearia cadastrada.{" "}
              <Link href="/admin/barbearias/nova" className="text-primary hover:underline">
                Criar primeira barbearia
              </Link>
            </CardContent>
          </Card>
        ) : (
          list.map((b) => {
            const vencido = planoVencido(b.planoVencidoEm);
            const updating = updatingId === b.id;
            return (
              <Card key={b.id}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div className="flex items-center gap-2">
                    <Store className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{b.name}</p>
                      {b.city && (
                        <p className="text-sm text-muted-foreground">{b.city}</p>
                      )}
                      {b.phone && (
                        <p className="text-sm text-muted-foreground">{b.phone}</p>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/barbearia/dashboard">Ver painel</Link>
                  </Button>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${
                        b.ativo ? "bg-green-500/20 text-green-600 dark:text-green-400" : "bg-red-500/20 text-red-600 dark:text-red-400"
                      }`}
                    >
                      <ToggleLeft className="h-4 w-4" />
                      {b.ativo ? "Ativa" : "Inativa"}
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {b.planoVencidoEm
                        ? vencido
                          ? "Plano vencido"
                          : `Válido até ${formatarData(b.planoVencidoEm)}`
                        : "Sem plano definido"}
                    </span>
                    {b.planoTipo && (
                      <span className="text-muted-foreground">({b.planoTipo})</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={b.ativo ? "outline" : "default"}
                      size="sm"
                      disabled={updating}
                      onClick={() => setAtivo(b.id, !b.ativo)}
                      className="gap-2"
                    >
                      {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      {b.ativo ? "Desativar" : "Ativar"}
                    </Button>
                    {PLANOS.map((p) => (
                      <Button
                        key={p.value}
                        variant="outline"
                        size="sm"
                        disabled={updating}
                        onClick={() => aplicarPlano(b.id, p.value)}
                      >
                        {p.label}
                      </Button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {b._count.profissionais} profissional(is)
                    </span>
                    <span>{b._count.agendamentos} agendamento(s)</span>
                  </div>
                  {b.users.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Dono: {b.users[0].name ?? "—"} ({b.users[0].email})
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
