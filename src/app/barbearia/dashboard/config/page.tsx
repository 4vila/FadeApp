"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhotoUpload } from "@/components/ui/photo-upload";
import { User } from "lucide-react";

export default function ConfigPage() {
  const router = useRouter();
  const [horas, setHoras] = useState(2);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fotoDono, setFotoDono] = useState<string | null>(null);
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmSenha, setConfirmSenha] = useState("");
  const [msgSenha, setMsgSenha] = useState<string | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    fetch("/api/usuario")
      .then((r) => r.json())
      .then((data) => {
        if (data?.image != null) setFotoDono(data.image);
      })
      .catch(() => {});
  }, []);

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

  async function handleTrocarSenha(e: React.FormEvent) {
    e.preventDefault();
    setMsgSenha(null);
    if (novaSenha.length < 6) {
      setMsgSenha("Nova senha deve ter no mínimo 6 caracteres.");
      return;
    }
    if (novaSenha !== confirmSenha) {
      setMsgSenha("Nova senha e confirmação não conferem.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/usuario", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senhaAtual, novaSenha }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setSenhaAtual("");
        setNovaSenha("");
        setConfirmSenha("");
        setMsgSenha("Senha alterada com sucesso.");
      } else {
        setMsgSenha(data.error ?? "Erro ao alterar senha.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleExcluirConta() {
    if (!confirm("Tem certeza que deseja excluir sua conta? A barbearia e todos os dados serão removidos. Esta ação não pode ser desfeita.")) return;
    setExcluindo(true);
    try {
      const res = await fetch("/api/usuario", { method: "DELETE" });
      if (res.ok) {
        await signOut({ redirect: false });
        router.push("/");
        window.location.href = "/";
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? "Erro ao excluir conta.");
      }
    } finally {
      setExcluindo(false);
    }
  }

  if (loading) return <p>Carregando...</p>;

  async function salvarFoto() {
    setSaving(true);
    try {
      await fetch("/api/usuario", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: fotoDono || null }),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-10">
      <h1 className="text-2xl font-bold">Configurações</h1>
      <p className="text-muted-foreground">Regras de cancelamento e opções da sua conta.</p>

      <div className="rounded-xl border border-border/80 bg-card/50 p-6 shadow-sm">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <User className="h-5 w-5" />
          Sua foto (dono da barbearia)
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">Foto do seu perfil de usuário. Opcional.</p>
        <div className="mt-4">
          <PhotoUpload value={fotoDono} onChange={setFotoDono} label="" rounded="full" />
        </div>
        <Button type="button" onClick={salvarFoto} disabled={saving} className="mt-3 rounded-xl">
          {saving ? "Salvando..." : "Salvar foto"}
        </Button>
      </div>

      <div className="rounded-xl border border-border/80 bg-card/50 p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Cancelamento</h2>
        <div className="mt-4 max-w-sm space-y-4">
          <div>
            <Label htmlFor="horas">Cancelamento permitido até (horas antes)</Label>
            <Input
              id="horas"
              type="number"
              min={0}
              value={horas}
              onChange={(e) => setHoras(Number(e.target.value) || 0)}
              className="mt-1"
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

      <div className="rounded-xl border border-border/80 bg-card/50 p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Trocar senha</h2>
        <form onSubmit={handleTrocarSenha} className="mt-4 max-w-sm space-y-3">
          <div>
            <Label htmlFor="cfg-senha-atual">Senha atual</Label>
            <Input id="cfg-senha-atual" type="password" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="cfg-nova-senha">Nova senha</Label>
            <Input id="cfg-nova-senha" type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} placeholder="Mín. 6 caracteres" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="cfg-confirm-senha">Confirmar nova senha</Label>
            <Input id="cfg-confirm-senha" type="password" value={confirmSenha} onChange={(e) => setConfirmSenha(e.target.value)} className="mt-1" />
          </div>
          {msgSenha && <p className={`text-sm ${msgSenha.includes("sucesso") ? "text-green-600" : "text-destructive"}`}>{msgSenha}</p>}
          <Button type="submit" disabled={saving} variant="secondary">Alterar senha</Button>
        </form>
      </div>

      <div className="rounded-xl border border-border/80 border-destructive/30 bg-card/50 p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Excluir conta</h2>
        <p className="mt-1 text-sm text-muted-foreground">Remover sua conta e dados. Irreversível.</p>
        <Button type="button" variant="destructive" className="mt-4" disabled={excluindo} onClick={handleExcluirConta}>
          {excluindo ? "Excluindo..." : "Excluir minha conta"}
        </Button>
      </div>
    </div>
  );
}
