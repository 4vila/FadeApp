"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, User } from "lucide-react";
import { PhotoUpload } from "@/components/ui/photo-upload";

export default function PerfilPage() {
  const { data: session, update: updateSession } = useSession();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmSenha, setConfirmSenha] = useState("");
  const [msgSenha, setMsgSenha] = useState<string | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch("/api/usuario")
      .then((r) => r.json())
      .then((data) => {
        if (data.name != null) setName(data.name);
        if (data.phone != null) setPhone(data.phone);
        if (data.image != null) setImage(data.image);
      })
      .catch(() => {
        if (session?.user?.name) setName(session.user.name);
        if (session?.user && "phone" in session.user) setPhone((session.user as { phone?: string }).phone ?? "");
      });
  }, [session?.user?.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/usuario", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, image: image || null }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        await updateSession?.({ user: { ...session?.user, name, phone, image: image ?? undefined } });
      } else if (data.error) {
        alert(data.error);
      }
    } finally {
      setSaving(false);
    }
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
    if (!confirm("Tem certeza que deseja excluir sua conta? Todos os seus dados e agendamentos serão removidos. Esta ação não pode ser desfeita.")) return;
    setExcluindo(true);
    try {
      const res = await fetch("/api/usuario", { method: "DELETE" });
      if (res.ok) {
        await signOut({ redirect: false });
        window.location.href = "/";
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? "Erro ao excluir conta.");
      }
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-10">
      <h1 className="text-heading-1 text-foreground">Meu perfil</h1>
      <p className="mt-2 text-caption text-muted-foreground">Edite seus dados, foto e senha.</p>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-border/80 bg-card/50 p-6 shadow-[var(--shadow-card)]"
      >
        <div className="space-y-5">
          <div>
            <Label className="text-caption font-medium">Foto do perfil</Label>
            <div className="mt-2">
              <PhotoUpload value={image} onChange={setImage} label="" rounded="full" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name" className="text-caption font-medium">
              Nome
            </Label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 rounded-xl pl-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-caption font-medium">
              Telefone
            </Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(00) 00000-0000"
              className="h-11 rounded-xl"
            />
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-muted/30 px-3 py-2.5">
            <Mail className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            <p className="text-caption text-muted-foreground">
              Email: <span className="font-medium text-foreground">{session?.user?.email}</span>
            </p>
          </div>
        </div>
        <div className="mt-8">
          <Button
            type="submit"
            disabled={saving}
            className="h-11 rounded-xl font-semibold sm:min-w-[140px]"
          >
            {saving ? "Salvando..." : "Salvar dados"}
          </Button>
        </div>
      </form>

      <div className="rounded-2xl border border-border/80 bg-card/50 p-6 shadow-[var(--shadow-card)]">
        <h2 className="text-heading-3 text-foreground">Trocar senha</h2>
        <p className="mt-1 text-caption text-muted-foreground">Altere sua senha de acesso.</p>
        <form onSubmit={handleTrocarSenha} className="mt-4 space-y-3 max-w-sm">
          <div>
            <Label htmlFor="senha-atual">Senha atual</Label>
            <Input
              id="senha-atual"
              type="password"
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
              className="mt-1 h-11 rounded-xl"
            />
          </div>
          <div>
            <Label htmlFor="nova-senha">Nova senha</Label>
            <Input
              id="nova-senha"
              type="password"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="mt-1 h-11 rounded-xl"
            />
          </div>
          <div>
            <Label htmlFor="confirm-senha">Confirmar nova senha</Label>
            <Input
              id="confirm-senha"
              type="password"
              value={confirmSenha}
              onChange={(e) => setConfirmSenha(e.target.value)}
              className="mt-1 h-11 rounded-xl"
            />
          </div>
          {msgSenha && (
            <p className={`text-sm ${msgSenha.includes("sucesso") ? "text-green-600" : "text-destructive"}`}>
              {msgSenha}
            </p>
          )}
          <Button type="submit" disabled={saving} variant="secondary" className="rounded-xl">
            {saving ? "Alterando..." : "Alterar senha"}
          </Button>
        </form>
      </div>

      <div className="rounded-2xl border border-border/80 border-destructive/30 bg-card/50 p-6 shadow-[var(--shadow-card)]">
        <h2 className="text-heading-3 text-foreground">Excluir conta</h2>
        <p className="mt-1 text-caption text-muted-foreground">
          Remover sua conta e todos os dados associados. Esta ação é irreversível.
        </p>
        <Button
          type="button"
          variant="destructive"
          className="mt-4 rounded-xl"
          disabled={excluindo}
          onClick={handleExcluirConta}
        >
          {excluindo ? "Excluindo..." : "Excluir minha conta"}
        </Button>
      </div>
    </div>
  );
}
