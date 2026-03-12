"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, UserX, Calendar } from "lucide-react";

type Agendamento = {
  id: string;
  dataHora: string;
  status: string;
  observacao?: string | null;
  cliente: { name: string | null; email: string };
  servico: { name: string; duracao: number };
};

function loadAgenda(dataInicio: string) {
  const from = dataInicio;
  const d = new Date(dataInicio);
  d.setDate(d.getDate() + 6);
  const to = d.toISOString().slice(0, 10);
  return fetch(`/api/profissional/agenda?from=${from}&to=${to}`).then((r) => r.json());
}

export default function ProfissionalDashboardPage() {
  const [list, setList] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataInicio, setDataInicio] = useState(() => new Date().toISOString().slice(0, 10));
  const [acionandoId, setAcionandoId] = useState<string | null>(null);

  function refresh() {
    return loadAgenda(dataInicio).then((data) => setList(Array.isArray(data) ? data : []));
  }

  useEffect(() => {
    setLoading(true);
    loadAgenda(dataInicio)
      .then((data) => setList(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [dataInicio]);

  async function marcarAcao(id: string, action: "checkin" | "nao_compareceu") {
    setAcionandoId(id);
    try {
      const res = await fetch(`/api/profissional/agendamentos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        await refresh();
      } else {
        alert(data.error ?? "Não foi possível atualizar.");
      }
    } finally {
      setAcionandoId(null);
    }
  }

  const hoje = new Date().toISOString().slice(0, 10);
  const agendamentosHoje = list.filter((a) => a.dataHora.slice(0, 10) === hoje);
  const confirmadosHoje = agendamentosHoje.filter((a) => a.status === "confirmado");
  const outrosConfirmados = list
    .filter((a) => a.status === "confirmado" && a.dataHora.slice(0, 10) !== hoje)
    .slice(0, 30);

  const statusLabel: Record<string, string> = {
    confirmado: "Agendado",
    realizado: "Realizado (check-in)",
    cancelado: "Cancelado",
  };

  if (loading) return <p className="text-muted-foreground">Carregando...</p>;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-heading-1">Minha agenda</h1>
        <p className="mt-1 text-caption text-muted-foreground">
          Veja seus agendamentos, faça check-in quando o cliente chegar ou marque não comparecimento.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="text-sm text-muted-foreground">Período a partir de</label>
        <input
          type="date"
          value={dataInicio}
          onChange={(e) => setDataInicio(e.target.value)}
          className="rounded-xl border border-input bg-background px-3 py-2 text-sm"
        />
      </div>

      <div>
        <h2 className="text-heading-3 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Hoje
        </h2>
        {agendamentosHoje.length === 0 ? (
          <p className="mt-2 text-caption text-muted-foreground">Nenhum agendamento para hoje.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {agendamentosHoje.map((a) => (
              <Card key={a.id} className="overflow-hidden rounded-2xl border border-border/80 shadow-[var(--shadow-card)]">
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">
                        {new Date(a.dataHora).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        — {a.servico.name} ({a.servico.duracao} min)
                      </p>
                      <p className="text-caption text-muted-foreground">
                        {a.cliente.name ?? a.cliente.email}
                      </p>
                      <span
                        className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium
                          ${a.status === "confirmado" ? "bg-amber-500/20 text-amber-700 dark:text-amber-400" : ""}
                          ${a.status === "realizado" ? "bg-green-500/20 text-green-700 dark:text-green-400" : ""}
                          ${a.status === "cancelado" ? "bg-muted text-muted-foreground" : ""}`}
                      >
                        {a.status === "cancelado" && a.observacao ? a.observacao : statusLabel[a.status] ?? a.status}
                      </span>
                    </div>
                    {a.status === "confirmado" && (
                      <div className="flex shrink-0 flex-wrap gap-2">
                        <Button
                          size="sm"
                          className="rounded-xl gap-1.5"
                          disabled={acionandoId === a.id}
                          onClick={() => marcarAcao(a.id, "checkin")}
                        >
                          <CheckCircle className="h-4 w-4" />
                          {acionandoId === a.id ? "..." : "Check-in"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-xl gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          disabled={acionandoId === a.id}
                          onClick={() => {
                            if (confirm("Marcar que o cliente não compareceu?")) marcarAcao(a.id, "nao_compareceu");
                          }}
                        >
                          <UserX className="h-4 w-4" />
                          Não compareceu
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-heading-3">Próximos agendamentos</h2>
        {outrosConfirmados.length === 0 ? (
          <p className="mt-2 text-caption text-muted-foreground">Nenhum outro agendamento confirmado no período.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {outrosConfirmados.map((a) => (
              <Card key={a.id} className="rounded-xl border border-border/80">
                <CardContent className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <p className="text-sm">
                    {new Date(a.dataHora).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    — {a.servico.name} — {a.cliente.name ?? a.cliente.email}
                  </p>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {statusLabel[a.status] ?? a.status}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
