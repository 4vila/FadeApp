"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Plus, Pencil, Trash2 } from "lucide-react";

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
  const [editing, setEditing] = useState<Usuario | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editRole, setEditRole] = useState("");
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  function openEdit(u: Usuario) {
    setEditing(u);
    setEditName(u.name ?? "");
    setEditEmail(u.email);
    setEditPassword("");
    setEditRole(u.role);
    setEditError(null);
  }

  async function handleSaveEdit() {
    if (!editing) return;
    setSaving(true);
    setEditError(null);
    try {
      const body: Record<string, unknown> = {
        name: editName.trim(),
        email: editEmail.trim().toLowerCase(),
        role: editRole,
      };
      if (editPassword.trim().length >= 6) body.password = editPassword.trim();
      const res = await fetch(`/api/admin/usuarios/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setEditError(data.error ?? "Erro ao salvar.");
        return;
      }
      setEditing(null);
      loadList();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(u: Usuario) {
    if (!confirm(`Excluir o usuário "${u.name ?? u.email}"? Esta ação não pode ser desfeita.`)) return;
    setDeletingId(u.id);
    try {
      const res = await fetch(`/api/admin/usuarios/${u.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error ?? "Erro ao excluir.");
        return;
      }
      loadList();
    } finally {
      setDeletingId(null);
    }
  }

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
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => openEdit(u)}
                      aria-label="Editar"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => handleDelete(u)}
                      disabled={deletingId === u.id}
                      aria-label="Excluir"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : null}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => !saving && setEditing(null)}>
          <Card className="w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold mb-4">Editar usuário</h2>
              {editError && (
                <p className="text-sm text-destructive mb-3 rounded-md bg-destructive/10 px-2 py-1.5">{editError}</p>
              )}
              <div className="space-y-3">
                <div>
                  <Label htmlFor="edit-name">Nome</Label>
                  <Input
                    id="edit-name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-password">Nova senha (deixe em branco para não alterar)</Label>
                  <Input
                    id="edit-password"
                    type="password"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-role">Perfil</Label>
                  <select
                    id="edit-role"
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="admin">Administrador</option>
                    <option value="barbearia">Barbearia</option>
                    <option value="profissional">Profissional</option>
                    <option value="cliente">Cliente</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setEditing(null)} disabled={saving}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveEdit} disabled={saving}>
                  {saving ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
