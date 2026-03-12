"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, User } from "lucide-react";

export default function PerfilPage() {
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (session?.user?.name) setName(session.user.name);
    if (session?.user && "phone" in session.user) setPhone((session.user as { phone?: string }).phone ?? "");
  }, [session]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/usuario", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone }),
    });
    setSaving(false);
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-heading-1 text-foreground">Meu perfil</h1>
      <p className="mt-2 text-caption text-muted-foreground">Edite seus dados.</p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 rounded-2xl border border-border/80 bg-card/50 p-6 shadow-[var(--shadow-card)]"
      >
        <div className="space-y-5">
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
            className="h-11 w-full rounded-xl font-semibold sm:w-auto sm:min-w-[140px]"
          >
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </div>
  );
}
