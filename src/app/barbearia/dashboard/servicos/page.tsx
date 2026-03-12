"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { PhotoUpload } from "@/components/ui/photo-upload";

type Servico = {
  id: string;
  name: string;
  description: string | null;
  duracao: number;
  preco: unknown;
  photo: string | null;
  profissionais?: { profissionalId: string }[];
};

type Profissional = { id: string; user: { name: string | null; email: string }; especialidades: string | null };

export default function ServicosPage() {
  const [list, setList] = useState<Servico[]>([]);
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [duracao, setDuracao] = useState("");
  const [preco, setPreco] = useState("");
  const [photo, setPhoto] = useState("");
  const [profissionalIds, setProfissionalIds] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDuracao, setEditDuracao] = useState("");
  const [editPreco, setEditPreco] = useState("");
  const [editPhoto, setEditPhoto] = useState("");
  const [editProfissionalIds, setEditProfissionalIds] = useState<string[]>([]);

  function loadList() {
    fetch("/api/barbearia/servicos")
      .then((r) => r.json())
      .then((data) => setList(Array.isArray(data) ? data : []))
      .catch(() => setList([]));
  }

  useEffect(() => {
    Promise.all([
      fetch("/api/barbearia/servicos").then((r) => r.json()),
      fetch("/api/barbearia/profissionais").then((r) => r.json()),
    ])
      .then(([servicos, profs]) => {
        setList(Array.isArray(servicos) ? servicos : []);
        setProfissionais(Array.isArray(profs) ? profs : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const dur = parseInt(duracao, 10);
    const pr = parseFloat(preco.replace(",", "."));
    if (isNaN(dur) || dur < 1 || isNaN(pr) || pr < 0) {
      setError("Duração (minutos) e preço devem ser números válidos.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/barbearia/servicos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          duracao: dur,
          preco: pr,
          photo: photo.trim() || undefined,
          profissionalIds: profissionalIds.length ? profissionalIds : undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data.error ?? "Erro ao criar serviço.";
        const details = data.details as { fieldErrors?: Record<string, string[]> } | undefined;
        const extra = details?.fieldErrors ? " " + Object.values(details.fieldErrors).flat().join(" ") : "";
        setError(msg + extra);
        return;
      }
      setName("");
      setDescription("");
      setDuracao("");
      setPreco("");
      setPhoto("");
      setProfissionalIds([]);
      setShowForm(false);
      loadList();
    } finally {
      setSubmitting(false);
    }
  }

  function toggleProfissional(id: string) {
    setProfissionalIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function toggleEditProfissional(id: string) {
    setEditProfissionalIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleSaveEdit(id: string) {
    setError(null);
    const dur = parseInt(editDuracao, 10);
    const pr = parseFloat(editPreco.replace(",", "."));
    if (isNaN(dur) || dur < 1 || isNaN(pr) || pr < 0) {
      setError("Duração e preço devem ser números válidos.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/barbearia/servicos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          description: editDescription.trim() || undefined,
          duracao: dur,
          preco: pr,
          photo: editPhoto.trim() || null,
          profissionalIds: editProfissionalIds,
        }),
      });
      if (res.ok) {
        setEditingId(null);
        loadList();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Erro ao salvar.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p>Carregando...</p>;

  return (
    <div className="max-w-3xl mx-auto space-y-6 px-2">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Serviços</h1>
          <p className="text-muted-foreground">Serviços oferecidos pela barbearia.</p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {showForm ? "Cancelar" : "Novo serviço"}
        </Button>
      </div>

      {showForm && (
        <Card className="mt-6 max-w-md mx-auto shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/5">
          <CardHeader>
            <p className="font-medium">Adicionar serviço</p>
            <p className="text-sm text-muted-foreground">Nome, duração e preço.</p>
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
                  placeholder="Ex: Corte masculino"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descrição opcional"
                />
              </div>
              <div className="flex gap-4">
                <div className="space-y-2 flex-1">
                  <Label htmlFor="duracao">Duração (min) *</Label>
                  <Input
                    id="duracao"
                    type="number"
                    min={1}
                    value={duracao}
                    onChange={(e) => setDuracao(e.target.value)}
                    placeholder="30"
                    required
                  />
                </div>
                <div className="space-y-2 flex-1">
                  <Label htmlFor="preco">Preço (R$) *</Label>
                  <Input
                    id="preco"
                    type="text"
                    inputMode="decimal"
                    value={preco}
                    onChange={(e) => setPreco(e.target.value)}
                    placeholder="0,00"
                    required
                  />
                </div>
              </div>
              <PhotoUpload value={photo || null} onChange={(url) => setPhoto(url ?? "")} label="Foto" rounded="lg" />
              {profissionais.length > 0 && (
                <div className="space-y-2">
                  <Label>Profissionais que realizam</Label>
                  <div className="flex flex-wrap gap-2">
                    {profissionais.map((p) => (
                      <label
                        key={p.id}
                        className="flex items-center gap-2 rounded-md border border-input px-3 py-2 text-sm cursor-pointer hover:bg-muted/50"
                      >
                        <input
                          type="checkbox"
                          checked={profissionalIds.includes(p.id)}
                          onChange={() => toggleProfissional(p.id)}
                          className="rounded"
                        />
                        {p.user.name ?? p.user.email}
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <Button type="submit" disabled={submitting}>
                {submitting ? "Adicionando..." : "Adicionar serviço"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {list.length === 0 && !showForm ? (
          <p className="text-muted-foreground col-span-2">Nenhum serviço cadastrado. Clique em &quot;Novo serviço&quot; para adicionar.</p>
        ) : (
          list.map((s) => (
            <Card key={s.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="flex gap-4 min-w-0 flex-1">
                  {s.photo ? (
                    <img src={s.photo} alt="" className="h-20 w-20 rounded-lg object-cover shrink-0 bg-muted" />
                  ) : (
                    <div className="h-20 w-20 rounded-lg bg-muted shrink-0 flex items-center justify-center text-muted-foreground text-2xl font-medium">
                      {s.name[0]}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium">{s.name}</p>
                    {s.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{s.description}</p>
                    )}
                    <p className="text-sm mt-1">
                      {s.duracao} min — R$ {Number(s.preco).toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingId(s.id);
                      setEditName(s.name);
                      setEditDescription(s.description ?? "");
                      setEditDuracao(String(s.duracao));
                      setEditPreco(Number(s.preco).toFixed(2));
                      setEditPhoto(s.photo ?? "");
                      setEditProfissionalIds((s.profissionais ?? []).map((p) => p.profissionalId));
                    }}
                  >
                    <Pencil className="h-4 w-4 mr-1" /> Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      if (!confirm("Remover este serviço?")) return;
                      await fetch(`/api/barbearia/servicos/${s.id}`, { method: "DELETE" });
                      setList((prev) => prev.filter((x) => x.id !== s.id));
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Remover
                  </Button>
                </div>
              </CardHeader>
              {editingId === s.id && (
                <CardContent className="pt-0 border-t space-y-3">
                  {error && (
                    <p className="text-sm text-destructive rounded-md bg-destructive/15 px-2 py-1.5" role="alert">{error}</p>
                  )}
                  <div className="space-y-2">
                    <Label>Nome</Label>
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
                  </div>
                  <div className="flex gap-4">
                    <div className="space-y-2 flex-1">
                      <Label>Duração (min)</Label>
                      <Input type="number" min={1} value={editDuracao} onChange={(e) => setEditDuracao(e.target.value)} />
                    </div>
                    <div className="space-y-2 flex-1">
                      <Label>Preço (R$)</Label>
                      <Input value={editPreco} onChange={(e) => setEditPreco(e.target.value)} inputMode="decimal" />
                    </div>
                  </div>
                  <PhotoUpload value={editPhoto || null} onChange={(url) => setEditPhoto(url ?? "")} label="Foto" rounded="lg" />
                  {profissionais.length > 0 && (
                    <div className="space-y-2">
                      <Label>Profissionais que realizam</Label>
                      <div className="flex flex-wrap gap-2">
                        {profissionais.map((p) => (
                          <label key={p.id} className="flex items-center gap-2 rounded-md border border-input px-3 py-2 text-sm cursor-pointer hover:bg-muted/50">
                            <input type="checkbox" checked={editProfissionalIds.includes(p.id)} onChange={() => toggleEditProfissional(p.id)} className="rounded" />
                            {p.user.name ?? p.user.email}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleSaveEdit(s.id)} disabled={submitting}>
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
