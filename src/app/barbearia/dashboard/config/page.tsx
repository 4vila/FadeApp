"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ConfigPage() {
  const [horas, setHoras] = useState(2);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/barbearia/regras-cancelamento")
      .then((r) => r.json())
      .then((data) => {
        if (data?.horasAntecedenciaMinima != null) {
          setHoras(data.horasAntecedenciaMinima);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    await fetch("/api/barbearia/regras-cancelamento", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ horasAntecedenciaMinima: horas }),
    });
    setSaving(false);
  }

  if (loading) return <p>Carregando...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold">Configurações</h1>
      <p className="text-muted-foreground">Regras de cancelamento e outras opções.</p>
      <div className="mt-6 max-w-sm space-y-4">
        <div>
          <Label htmlFor="horas">Cancelamento permitido até (horas antes)</Label>
          <Input
            id="horas"
            type="number"
            min={0}
            value={horas}
            onChange={(e) => setHoras(Number(e.target.value) || 0)}
          />
          <p className="mt-1 text-sm text-muted-foreground">
            O cliente só pode cancelar com pelo menos esta antecedência.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </div>
  );
}
