"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Plus } from "lucide-react";

type Usuario = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  barbeariaId: string | null;
  createdAt: string;
  barbearia: { id: string; name: string } | null;
};

export default function AdminUsuariosPage() {
  const [list, setList] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>("");

  function loadList() {
    setError(null);
    const url = roleFilter
      ? `/api/admin/usuarios?role=${encodeURIComponent(roleFilter)}`
      : "/api/admin/usuarios";
    return fetch(url)
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok) {
          setError(typeof data?.error === "string" ? data.error : "Erro ao carregar usuários.");
          setList([]);
          return;
        }
        setList(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setError("Erro ao carregar usuários. Verifique a conexão e tente novamente.");
        setList([]);
      });
  }

  useEffect(() => {
    loadList().finally(() => setLoading(false));
  }, [roleFilter]);

  const roleLabels: Record<string, string> = {
    admin: "Administrador",
    barbearia: "Barbearia",
    profissional: "Profissional",
    cliente: "Cliente",
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-8 w-40 animate-pulse rounded bg-muted" />
          <div className="h-4 w-48 animate-pulse rounded bg-muted" />
        </div>
        <div className="mt-6 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="shadow-sm">
              <CardContent className="py-4">
                <div className="flex justify-between gap-2">
                  <div className="h-5 w-32 animate-pulse rounded bg-muted" />
                  <div className="h-5 w-24 animate-pulse rounded-full bg-muted" />
                </div>
                <div className="mt-1 h-4 w-48 animate-pulse rounded bg-muted" />
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
          <h1 className="text-2xl font-bold">Usuários</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os usuários da plataforma.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="role" className="text-sm text-muted-foreground">
            Filtrar por perfil:
          </label>
          <select
            id="role"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Todos</option>
            <option value="admin">Administrador</option>
            <option value="barbearia">Barbearia</option>
            <option value="profissional">Profissional</option>
            <option value="cliente">Cliente</option>
          </select>
          <Button asChild>
            <Link href="/admin/usuarios/novo" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Novo usuário
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

      <div className="mt-6 space-y-3">
        {!error && list.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="py-8 text-center text-muted-foreground">
              Nenhum usuário encontrado.
            </CardContent>
          </Card>
        ) : !error ? (
          list.map((u) => (
            <Card key={u.id} className="shadow-sm border-border/80">
              <CardContent className="py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{u.name ?? "—"}</p>
                      <p className="text-sm text-muted-foreground truncate">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
                      {roleLabels[u.role] ?? u.role}
                    </span>
                    {u.barbearia && (
                      <span className="text-xs text-muted-foreground">
                        {u.barbearia.name}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : null}
      </div>
    </div>
  );
}
