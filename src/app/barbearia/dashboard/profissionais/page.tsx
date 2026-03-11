"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, UserMinus, Pencil, Check, X } from "lucide-react";

type Profissional = {
  id: string;
  especialidades: string | null;
  photo: string | null;
  user: { id: string; name: string | null; email: string };
};

export default function ProfissionaisPage() {
  const [list, setList] = useState<Profissional[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [especialidades, setEspecialidades] = useState("");
  const [phone, setPhone] = useState("");
  const [photo, setPhoto] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editEspecialidades, setEditEspecialidades] = useState("");
  const [editPhoto, setEditPhoto] = useState("");

  function loadList() {
    fetch("/api/barbearia/profissionais")
      .then((r) => r.json())
      .then((data) => setList(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadList();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/barbearia/profissionais", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          especialidades: especialidades.trim() || undefined,
          phone: phone.trim() || undefined,
          photo: photo.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Erro ao criar profissional.");
        return;
      }
      setName("");
      setEmail("");
      setPassword("");
      setEspecialidades("");
      setPhone("");
      setPhoto("");
      setShowForm(false);
      loadList();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSaveEdit(id: string) {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/barbearia/profissionais/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          especialidades: editEspecialidades.trim() || null,
          photo: editPhoto.trim() || null,
        }),
      });
      if (res.ok) {
        setEditingId(null);
        loadList();
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p>Carregando...</p>;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Profissionais</h1>
          <p className="text-muted-foreground">Gerencie os profissionais da barbearia.</p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {showForm ? "Cancelar" : "Novo profissional"}
        </Button>
      </div>

      {showForm && (
        <Card className="mt-6 max-w-md">
          <CardHeader>
            <p className="font-medium">Adicionar profissional</p>
            <p className="text-sm text-muted-foreground">Nome, e-mail e senha para acesso ao painel.</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="space-y-4">
              {error && (
                <p className="text-sm text-destructive rounded-md bg-destructive/15 px-2 py-1.5" role="alert">
                  {error}
                </p>
              )}
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome completo"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha *</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mín. 6 caracteres"
                  minLength={6}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="especialidades">Especialidades</Label>
                <Input
                  id="especialidades"
                  value={especialidades}
                  onChange={(e) => setEspecialidades(e.target.value)}
                  placeholder="Ex: Corte, barba"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="photo">Foto (URL)</Label>
                <Input
                  id="photo"
                  type="url"
                  value={photo}
                  onChange={(e) => setPhoto(e.target.value)}
                  placeholder="https://exemplo.com/foto.jpg"
                />
              </div>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Adicionando..." : "Adicionar profissional"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="mt-6 space-y-4">
        {list.length === 0 && !showForm ? (
          <p className="text-muted-foreground">Nenhum profissional cadastrado. Clique em &quot;Novo profissional&quot; para adicionar.</p>
        ) : (
          list.map((p) => (
            <Card key={p.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="flex gap-4 items-center min-w-0">
                  {p.photo ? (
                    <img src={p.photo} alt="" className="h-16 w-16 rounded-full object-cover shrink-0 bg-muted" />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-muted shrink-0 flex items-center justify-center text-muted-foreground text-2xl font-medium">
                      {(p.user.name ?? "?")[0]}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium">{p.user.name ?? "—"}</p>
                    <p className="text-sm text-muted-foreground">{p.user.email}</p>
                    {p.especialidades && (
                      <p className="text-sm text-muted-foreground">{p.especialidades}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingId(p.id);
                      setEditEspecialidades(p.especialidades ?? "");
                      setEditPhoto(p.photo ?? "");
                    }}
                  >
                    <Pencil className="h-4 w-4 mr-1" /> Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      if (!confirm("Remover este profissional?")) return;
                      await fetch(`/api/barbearia/profissionais/${p.id}`, { method: "DELETE" });
                      setList((prev) => prev.filter((x) => x.id !== p.id));
                    }}
                  >
                    <UserMinus className="h-4 w-4 mr-1" /> Remover
                  </Button>
                </div>
              </CardHeader>
              {editingId === p.id && (
                <CardContent className="pt-0 border-t space-y-3">
                  <div className="space-y-2">
                    <Label>Especialidades</Label>
                    <Input
                      value={editEspecialidades}
                      onChange={(e) => setEditEspecialidades(e.target.value)}
                      placeholder="Ex: Corte, barba"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Foto (URL)</Label>
                    <Input
                      type="url"
                      value={editPhoto}
                      onChange={(e) => setEditPhoto(e.target.value)}
                      placeholder="https://exemplo.com/foto.jpg"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleSaveEdit(p.id)} disabled={submitting}>
                      <Check className="h-4 w-4 mr-1" /> Salvar
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                      <X className="h-4 w-4 mr-1" /> Cancelar
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
