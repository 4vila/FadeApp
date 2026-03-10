"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type Servico = { id: string; name: string; duracao: number; preco: unknown };
type Profissional = { id: string; user: { name: string | null }; especialidades: string | null };

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
        body: JSON.stringify({
          barbeariaId,
          profissionalId: profId,
          servicoId,
          dataHora: dataHora.toISOString(),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "Erro ao confirmar.");
        setSubmitting(false);
        return;
      }
      router.push("/cliente/dashboard");
      router.refresh();
    } catch {
      setError("Erro ao confirmar agendamento.");
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-6 max-w-lg">
      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      {step === 1 && (
        <Card>
          <CardHeader>
            <h2 className="font-semibold">1. Escolha o serviço</h2>
          </CardHeader>
          <CardContent className="space-y-2">
            {servicos.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => { setServicoId(s.id); setStep(2); }}
                className="flex w-full justify-between rounded border p-3 text-left hover:bg-muted/50"
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
        <Card>
          <CardHeader>
            <h2 className="font-semibold">2. Escolha o profissional</h2>
          </CardHeader>
          <CardContent className="space-y-2">
            {profissionais.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => { setProfissionalId(p.id); setStep(3); }}
                className="flex w-full justify-between rounded border p-3 text-left hover:bg-muted/50"
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
            <Button variant="outline" onClick={() => setStep(1)}>Voltar</Button>
          </CardContent>
        </Card>
      )}

      {step === 3 && servicoId && (
        <Card>
          <CardHeader>
            <h2 className="font-semibold">3. Escolha a data</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              min={new Date().toISOString().slice(0, 10)}
              className="w-full rounded border px-3 py-2"
            />
            <Button onClick={() => setStep(2)} variant="outline">Voltar</Button>
            <Button
              disabled={!data}
              onClick={() => { carregarSlots(); setStep(4); }}
            >
              Ver horários
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 4 && servicoId && (
        <Card>
          <CardHeader>
            <h2 className="font-semibold">4. Escolha o horário</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingSlots ? (
              <p>Carregando horários...</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {slots.map((s) => (
                  <Button
                    key={s}
                    variant={slot === s ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSlot(s)}
                  >
                    {s}
                  </Button>
                ))}
                {slots.length === 0 && !loadingSlots && (
                  <p className="text-muted-foreground">Nenhum horário disponível nesta data.</p>
                )}
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(3)}>Voltar</Button>
              <Button
                disabled={!slot || submitting}
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
