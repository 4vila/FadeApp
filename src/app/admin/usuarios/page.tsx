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
  const [roleFilter, setRoleFilter] = useState<string>("");

  useEffect(() => {
    const url = roleFilter
      ? `/api/admin/usuarios?role=${encodeURIComponent(roleFilter)}`
      : "/api/admin/usuarios";
    fetch(url)
      .then((r) => r.json())
      .then((data) => setList(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [roleFilter]);

  const roleLabels: Record<string, string> = {
    admin: "Administrador",
    barbearia: "Barbearia",
    profissional: "Profissional",
    cliente: "Cliente",
  };

  if (loading) return <p className="text-muted-foreground">Carregando...</p>;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Usuários</h1>
        <Button asChild>
          <Link href="/admin/usuarios/novo" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo usuário
          </Link>
        </Button>
      </div>
      <p className="text-muted-foreground mt-1">
        Gerencie os usuários da plataforma.
      </p>

      <div className="mt-4 flex items-center gap-2">
        <label htmlFor="role" className="text-sm text-muted-foreground">
          Filtrar por perfil:
        </label>
        <select
          id="role"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
        >
          <option value="">Todos</option>
          <option value="admin">Administrador</option>
          <option value="barbearia">Barbearia</option>
          <option value="profissional">Profissional</option>
          <option value="cliente">Cliente</option>
        </select>
      </div>

      <div className="mt-6 space-y-3">
        {list.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Nenhum usuário encontrado.
            </CardContent>
          </Card>
        ) : (
          list.map((u) => (
            <Card key={u.id}>
              <CardContent className="py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{u.name ?? "—"}</p>
                      <p className="text-sm text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium capitalize">
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
        )}
      </div>
    </div>
  );
}
