"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

type Servico = { id: string; name: string; duracao: number; preco: unknown };
type Profissional = { id: string; user: { name: string | null }; especialidades: string | null };

const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function SeletorData({
  value,
  onChange,
  minDate,
}: {
  value: string;
  onChange: (yyyyMmDd: string) => void;
  minDate: Date;
}) {
  const [mesAtual, setMesAtual] = useState(() => {
    if (value) {
      const [y, m] = value.split("-").map(Number);
      return new Date(y, (m ?? 1) - 1, 1);
    }
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const dias = useMemo(() => {
    const ano = mesAtual.getFullYear();
    const mes = mesAtual.getMonth();
    const primeiro = new Date(ano, mes, 1);
    const ultimo = new Date(ano, mes + 1, 0);
    const inicioVazio = primeiro.getDay();
    const list: (Date | null)[] = [];
    for (let i = 0; i < inicioVazio; i++) list.push(null);
    for (let d = 1; d <= ultimo.getDate(); d++) list.push(new Date(ano, mes, d));
    return list;
  }, [mesAtual]);

  const hoje = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }, []);

  const minTime = minDate.getTime();

  function toYyyyMmDd(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  const anterior = () => setMesAtual((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  const proximo = () => setMesAtual((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));

  return (
    <div className="rounded-xl border border-border/80 bg-background p-4">
      <div className="mb-3 flex items-center justify-between">
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={anterior} aria-label="Mês anterior">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium">
          {MESES[mesAtual.getMonth()]} {mesAtual.getFullYear()}
        </span>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={proximo} aria-label="Próximo mês">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {DIAS.map((d) => (
          <div key={d} className="text-xs font-medium text-muted-foreground py-1">
            {d}
          </div>
        ))}
        {dias.map((d, i) => {
          if (!d) return <div key={`e-${i}`} />;
          const t = d.getTime();
          const disabled = t < minTime;
          const isToday = t === hoje;
          const isSelected = value === toYyyyMmDd(d);
          return (
            <button
              key={d.toISOString()}
              type="button"
              disabled={disabled}
              onClick={() => !disabled && onChange(toYyyyMmDd(d))}
              className={`h-9 w-full rounded-md text-sm transition-colors
                ${disabled ? "cursor-not-allowed text-muted-foreground/50" : "hover:bg-muted"}
                ${isToday ? "ring-1 ring-primary" : ""}
                ${isSelected ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}`}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex items-center gap-2 text-caption text-muted-foreground">
        <CalendarIcon className="h-4 w-4" />
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min={toYyyyMmDd(minDate)}
          className="flex-1 rounded-md border border-input bg-background px-2 py-1.5 text-sm"
          aria-label="Data (também pode digitar)"
        />
      </div>
    </div>
  );
}

export function FluxoAgendamento({
  barbeariaId,
  servicos,
  profissionais,
}: {
  barbeariaId: string;
  servicos: Servico[];
  profissionais: Profissional[];
}) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [servicoId, setServicoId] = useState<string | null>(null);
  const [profissionalId, setProfissionalId] = useState<string | null>(null);
  const [data, setData] = useState("");
  const [slot, setSlot] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const profId = profissionalId ?? (profissionais[0]?.id ?? null);

  async function carregarSlots() {
    if (!servicoId || !profId || !data) return;
    setLoadingSlots(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/agendamentos/slots?barbeariaId=${barbeariaId}&profissionalId=${profId}&servicoId=${servicoId}&data=${data}`
      );
      const json = await res.json();
      setSlots(Array.isArray(json.slots) ? json.slots : []);
    } catch {
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }

  async function confirmar() {
    if (!servicoId || !profId || !data || !slot) return;
    setSubmitting(true);
    setError(null);
    const dataHora = new Date(`${data}T${slot}:00`);
    try {
      const res = await fetch("/api/agendamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          barbeariaId,
          profissionalId: profId,
          servicoId,
          dataHora: dataHora.toISOString(),
        }),
      });
      const text = await res.text();
      let json: { error?: string } = {};
      try {
        json = text ? JSON.parse(text) : {};
      } catch {
        json = {};
      }
      if (!res.ok) {
        setError(
          json.error ??
            (res.status === 401
              ? "Faça login para agendar."
              : res.status === 409
                ? "Horário não disponível."
                : "Erro ao confirmar. Tente novamente.")
        );
        setSubmitting(false);
        return;
      }
      router.push("/cliente/dashboard");
      router.refresh();
    } catch {
      setError("Erro ao confirmar agendamento. Verifique sua conexão e tente novamente.");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto mt-8 max-w-lg">
      {error && (
        <div className="mb-6 rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-caption text-destructive">
          {error}
        </div>
      )}

      {step === 1 && (
        <Card className="overflow-hidden rounded-2xl border border-border/80 shadow-[var(--shadow-card)]">
          <CardHeader>
            <h2 className="text-heading-3">1. Escolha o serviço</h2>
          </CardHeader>
          <CardContent className="space-y-2">
            {servicos.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => { setServicoId(s.id); setStep(2); }}
                className="flex w-full justify-between rounded-xl border border-border/80 p-4 text-left transition-colors hover:bg-muted/50"
              >
                <span>{s.name}</span>
                <span className="text-muted-foreground">
                  {s.duracao} min — R$ {Number(s.preco).toFixed(2)}
                </span>
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {step === 2 && servicoId && (
        <Card className="overflow-hidden rounded-2xl border border-border/80 shadow-[var(--shadow-card)]">
          <CardHeader>
            <h2 className="text-heading-3">2. Escolha o profissional</h2>
          </CardHeader>
          <CardContent className="space-y-2">
            {profissionais.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => { setProfissionalId(p.id); setStep(3); }}
                className="flex w-full justify-between rounded-xl border border-border/80 p-4 text-left transition-colors hover:bg-muted/50"
              >
                <span>{p.user.name ?? "Profissional"}</span>
                {p.especialidades && (
                  <span className="text-sm text-muted-foreground">{p.especialidades}</span>
                )}
              </button>
            ))}
            {profissionais.length === 0 && (
              <p className="text-muted-foreground">Nenhum profissional cadastrado.</p>
            )}
          </CardContent>
          <CardContent>
            <Button variant="outline" className="rounded-xl" onClick={() => setStep(1)}>Voltar</Button>
          </CardContent>
        </Card>
      )}

      {step === 3 && servicoId && (
        <Card className="overflow-hidden rounded-2xl border border-border/80 shadow-[var(--shadow-card)]">
          <CardHeader>
            <h2 className="text-heading-3">3. Escolha a data</h2>
            <p className="text-caption text-muted-foreground">Clique no dia no calendário ou use o campo abaixo para digitar.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <SeletorData
              value={data}
              onChange={setData}
              minDate={(() => {
                const d = new Date();
                d.setHours(0, 0, 0, 0);
                return d;
              })()}
            />
            <div className="flex gap-2">
              <Button onClick={() => setStep(2)} variant="outline" className="rounded-xl">Voltar</Button>
              <Button
                disabled={!data}
                className="rounded-xl font-semibold"
                onClick={() => { carregarSlots(); setStep(4); }}
              >
                Ver horários
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 4 && servicoId && (
        <Card className="overflow-hidden rounded-2xl border border-border/80 shadow-[var(--shadow-card)]">
          <CardHeader>
            <h2 className="text-heading-3">4. Escolha o horário</h2>
          </CardHeader>
          <CardContent className="space-y-6">
            {loadingSlots ? (
              <p className="text-caption text-muted-foreground">Carregando horários...</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {slots.map((s) => (
                  <Button
                    key={s}
                    variant={slot === s ? "default" : "outline"}
                    size="sm"
                    className="rounded-xl"
                    onClick={() => setSlot(s)}
                  >
                    {s}
                  </Button>
                ))}
                {slots.length === 0 && !loadingSlots && (
                  <p className="text-caption text-muted-foreground">Nenhum horário disponível nesta data.</p>
                )}
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="rounded-xl" onClick={() => setStep(3)}>Voltar</Button>
              <Button
                disabled={!slot || submitting}
                className="rounded-xl font-semibold"
                onClick={confirmar}
              >
                {submitting ? "Confirmando..." : "Confirmar agendamento"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
