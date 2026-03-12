"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, CalendarX, Pencil, Check, X } from "lucide-react";

type Agendamento = {
  id: string;
  dataHora: string;
  status: string;
  cliente: { id?: string; name: string | null; email: string };
  profissional: { id: string; user: { name: string | null } };
  servico: { id: string; name: string };
};

type Profissional = { id: string; user: { name: string | null }; especialidades: string | null };
type Servico = { id: string; name: string; duracao: number; preco: unknown };

export default function AgendamentosPage() {
  const [list, setList] = useState<Agendamento[]>([]);
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clienteEmail, setClienteEmail] = useState("");
  const [profissionalId, setProfissionalId] = useState("");
  const [servicoId, setServicoId] = useState("");
  const [dataHora, setDataHora] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDataHora, setEditDataHora] = useState("");
  const [editStatus, setEditStatus] = useState<string>("confirmado");

  function loadList() {
    fetch("/api/barbearia/agendamentos")
      .then((r) => r.json())
      .then((data) => setList(Array.isArray(data) ? data : []))
      .catch(() => setList([]));
  }

  useEffect(() => {
    Promise.all([
      fetch("/api/barbearia/agendamentos").then((r) => r.json()),
      fetch("/api/barbearia/profissionais").then((r) => r.json()),
      fetch("/api/barbearia/servicos").then((r) => r.json()),
    ])
      .then(([ag, profs, servs]) => {
        setList(Array.isArray(ag) ? ag : []);
        setProfissionais(Array.isArray(profs) ? profs : []);
        setServicos(Array.isArray(servs) ? servs : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/barbearia/agendamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clienteEmail: clienteEmail.trim().toLowerCase(),
          profissionalId,
          servicoId,
          dataHora: new Date(dataHora).toISOString(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Erro ao criar agendamento.");
        return;
      }
      setClienteEmail("");
      setProfissionalId("");
      setServicoId("");
      setDataHora("");
      setShowForm(false);
      loadList();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancel(id: string) {
    if (!confirm("Cancelar este agendamento?")) return;
    const res = await fetch(`/api/barbearia/agendamentos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelado" }),
    });
    if (res.ok) loadList();
  }

  async function handleSaveEdit(id: string) {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/barbearia/agendamentos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dataHora: editDataHora ? new Date(editDataHora).toISOString() : undefined,
          status: editStatus,
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

  function startEdit(a: Agendamento) {
    setEditingId(a.id);
    setEditDataHora(a.dataHora.slice(0, 16));
    setEditStatus(a.status);
  }

  if (loading) return <p>Carregando...</p>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Agendamentos</h1>
          <p className="text-muted-foreground">Crie, edite ou cancele horários.</p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {showForm ? "Cancelar" : "Novo agendamento"}
        </Button>
      </div>

      {showForm && (
        <Card className="mt-6 max-w-md shadow-lg">
          <CardContent className="pt-4">
            <p className="font-medium mb-3">Novo agendamento</p>
            <form onSubmit={handleCreate} className="space-y-4">
              {error && (
                <p className="text-sm text-destructive rounded-md bg-destructive/15 px-2 py-1.5" role="alert">
                  {error}
                </p>
              )}
              <div className="space-y-2">
                <Label htmlFor="clienteEmail">E-mail do cliente *</Label>
                <Input
                  id="clienteEmail"
                  type="email"
                  value={clienteEmail}
                  onChange={(e) => setClienteEmail(e.target.value)}
                  placeholder="cliente@email.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Profissional *</Label>
                <select
                  value={profissionalId}
                  onChange={(e) => setProfissionalId(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="">Selecione</option>
                  {profissionais.map((p) => (
                    <option key={p.id} value={p.id}>{p.user.name ?? p.id}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Serviço *</Label>
                <select
                  value={servicoId}
                  onChange={(e) => setServicoId(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="">Selecione</option>
                  {servicos.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataHora">Data e hora *</Label>
                <Input
                  id="dataHora"
                  type="datetime-local"
                  value={dataHora}
                  onChange={(e) => setDataHora(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Criando..." : "Criar agendamento"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="mt-6 space-y-4">
        {list.length === 0 && !showForm ? (
          <p className="text-muted-foreground">Nenhum agendamento.</p>
        ) : (
          list.map((a) => (
            <Card key={a.id}>
              <CardContent className="pt-4">
                {editingId === a.id ? (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs">Data e hora</Label>
                      <Input
                        type="datetime-local"
                        value={editDataHora}
                        onChange={(e) => setEditDataHora(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Status</Label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="confirmado">Confirmado</option>
                        <option value="cancelado">Cancelado</option>
                        <option value="realizado">Realizado</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleSaveEdit(a.id)} disabled={submitting}>
                        <Check className="h-4 w-4 mr-1" /> Salvar
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                        <X className="h-4 w-4 mr-1" /> Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="font-medium">
                      {new Date(a.dataHora).toLocaleString("pt-BR")} — {a.servico.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Cliente: {a.cliente.name ?? a.cliente.email} | Profissional: {a.profissional.user.name ?? "—"}
                    </p>
                    <p className="text-sm">
                      Status: <span className={a.status === "cancelado" ? "text-destructive" : a.status === "realizado" ? "text-green-600" : ""}>{a.status}</span>
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => startEdit(a)}>
                        <Pencil className="h-4 w-4 mr-1" /> Editar
                      </Button>
                      {a.status === "confirmado" && (
                        <Button size="sm" variant="outline" onClick={() => handleCancel(a.id)}>
                          <CalendarX className="h-4 w-4 mr-1" /> Cancelar agendamento
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
