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

function diasRestantes(planoVencidoEm: string | null): number | null {
  if (!planoVencidoEm) return null;
  const fim = new Date(planoVencidoEm);
  const hoje = new Date();
  if (fim < hoje) return null;
  const diff = fim.getTime() - hoje.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function AdminBarbeariasPage() {
  const [list, setList] = useState<Barbearia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  function loadList() {
    setError(null);
    return fetch("/api/admin/barbearias")
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok) {
          setError(typeof data?.error === "string" ? data.error : "Erro ao carregar barbearias.");
          setList([]);
          return;
        }
        setList(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setError("Erro ao carregar barbearias. Verifique a conexão e tente novamente.");
        setList([]);
      });
  }

  useEffect(() => {
    loadList().finally(() => setLoading(false));
  }, []);

  function showSaved() {
    setSavedMessage("Salvo!");
    setTimeout(() => setSavedMessage(null), 2500);
  }

  async function setAtivo(id: string, ativo: boolean) {
    setUpdatingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/barbearias/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ativo }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        await loadList();
        showSaved();
      } else {
        setError(typeof data?.error === "string" ? data.error : "Erro ao atualizar.");
      }
    } finally {
      setUpdatingId(null);
    }
  }

  async function aplicarPlano(id: string, plano: string) {
    setUpdatingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/barbearias/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plano }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        await loadList();
        showSaved();
      } else {
        setError(typeof data?.error === "string" ? data.error : "Erro ao aplicar plano.");
      }
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 animate-pulse rounded bg-muted" />
            <div className="mt-1 h-4 w-72 animate-pulse rounded bg-muted" />
          </div>
        </div>
        <div className="mt-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-5 w-40 animate-pulse rounded bg-muted" />
                <div className="mt-1 h-4 w-56 animate-pulse rounded bg-muted" />
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="flex gap-2">
                  <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
                  <div className="h-6 w-24 animate-pulse rounded-full bg-muted" />
                </div>
                <div className="h-9 w-32 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Barbearias</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie as barbearias da plataforma.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {savedMessage && (
            <span className="rounded-md bg-green-500/20 px-3 py-1 text-sm font-medium text-green-700 dark:text-green-400">
              {savedMessage}
            </span>
          )}
          <Button asChild>
            <Link href="/admin/barbearias/nova" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nova barbearia
            </Link>
          </Button>
        </div>
      </div>

      {error && (
        <Card className="mt-6 border-destructive/50 bg-destructive/5">
          <CardContent className="py-4">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => { setLoading(true); loadList().finally(() => setLoading(false)); }}>
              Tentar de novo
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="mt-6 space-y-4">
        {!error && list.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="py-8 text-center text-muted-foreground">
              Nenhuma barbearia cadastrada.{" "}
              <Link href="/admin/barbearias/nova" className="text-primary hover:underline">
                Criar primeira barbearia
              </Link>
            </CardContent>
          </Card>
        ) : !error ? (
          list.map((b) => {
            const vencido = planoVencido(b.planoVencidoEm);
            const dias = diasRestantes(b.planoVencidoEm);
            const updating = updatingId === b.id;
            return (
              <Card key={b.id} className="shadow-sm border-border/80">
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <Store className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{b.name}</p>
                        {b.city && (
                          <p className="text-sm text-muted-foreground">{b.city}</p>
                        )}
                        {b.phone && (
                          <p className="text-sm text-muted-foreground">{b.phone}</p>
                        )}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild className="shrink-0">
                      <Link href="/barbearia/dashboard">Ver painel</Link>
                    </Button>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        b.ativo ? "bg-green-500/20 text-green-700 dark:text-green-400" : "bg-red-500/20 text-red-700 dark:text-red-400"
                      }`}
                    >
                      <ToggleLeft className="h-3.5 w-3.5" />
                      {b.ativo ? "Ativa" : "Inativa"}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        vencido ? "bg-amber-500/20 text-amber-700 dark:text-amber-400" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      {b.planoVencidoEm
                        ? vencido
                          ? "Plano vencido"
                          : dias != null
                            ? `Faltam ${dias} dia${dias !== 1 ? "s" : ""}`
                            : `Válido até ${formatarData(b.planoVencidoEm)}`
                        : "Sem plano"}
                      {b.planoTipo && !b.planoVencidoEm ? ` (${b.planoTipo})` : b.planoTipo && vencido ? ` (${b.planoTipo})` : ""}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
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
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground pt-2 border-t">
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
        ) : null}
      </div>
    </div>
  );
}
