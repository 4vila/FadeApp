"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Store, User } from "lucide-react";

export default function NovaBarbeariaPage() {
  const router = useRouter();
  const [step, setStep] = useState<"barbearia" | "dono">("barbearia");
  const [barbeariaId, setBarbeariaId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");

  const [donoName, setDonoName] = useState("");
  const [donoEmail, setDonoEmail] = useState("");
  const [donoPassword, setDonoPassword] = useState("");
  const [donoLoading, setDonoLoading] = useState(false);
  const [donoError, setDonoError] = useState<string | null>(null);

  async function handleCreateBarbearia(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/barbearia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          address: address.trim() || undefined,
          city: city.trim() || undefined,
          phone: phone.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Erro ao criar barbearia.");
        return;
      }
      setBarbeariaId(data.id);
      setStep("dono");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateDono(e: React.FormEvent) {
    e.preventDefault();
    if (!barbeariaId) return;
    setDonoError(null);
    setDonoLoading(true);
    try {
      const res = await fetch("/api/admin/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: donoName.trim(),
          email: donoEmail.trim().toLowerCase(),
          password: donoPassword,
          role: "barbearia",
          barbeariaId,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setDonoError(data.error ?? "Erro ao criar usuário dono.");
        return;
      }
      router.push("/admin/barbearias");
      router.refresh();
    } finally {
      setDonoLoading(false);
    }
  }

  function skipDono() {
    router.push("/admin/barbearias");
    router.refresh();
  }

  return (
    <div>
      <Link
        href="/admin/barbearias"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Link>
      <h1 className="text-2xl font-bold">Nova barbearia</h1>
      <p className="text-muted-foreground mt-1">
        {step === "barbearia"
          ? "Preencha os dados da barbearia."
          : "Opcional: crie um usuário dono para acessar o painel."}
      </p>

      {step === "barbearia" && (
        <Card className="mt-6 max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Dados da barbearia
            </CardTitle>
            <CardDescription>Nome, endereço e contato.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateBarbearia} className="space-y-4">
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
                  placeholder="Ex: Barbearia do João"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Rua, número"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Cidade"
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
              <Button type="submit" disabled={loading}>
                {loading ? "Criando..." : "Criar barbearia"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {step === "dono" && (
        <Card className="mt-6 max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Usuário dono
            </CardTitle>
            <CardDescription>
              Crie um usuário com perfil &quot;barbearia&quot; para esta barbearia poder acessar o painel.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleCreateDono} className="space-y-4">
              {donoError && (
                <p className="text-sm text-destructive rounded-md bg-destructive/15 px-2 py-1.5" role="alert">
                  {donoError}
                </p>
              )}
              <div className="space-y-2">
                <Label htmlFor="donoName">Nome *</Label>
                <Input
                  id="donoName"
                  value={donoName}
                  onChange={(e) => setDonoName(e.target.value)}
                  placeholder="Nome do dono"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="donoEmail">Email *</Label>
                <Input
                  id="donoEmail"
                  type="email"
                  value={donoEmail}
                  onChange={(e) => setDonoEmail(e.target.value)}
                  placeholder="dono@email.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="donoPassword">Senha *</Label>
                <Input
                  id="donoPassword"
                  type="password"
                  value={donoPassword}
                  onChange={(e) => setDonoPassword(e.target.value)}
                  placeholder="Mín. 6 caracteres"
                  minLength={6}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={donoLoading}>
                  {donoLoading ? "Criando..." : "Criar dono e concluir"}
                </Button>
                <Button type="button" variant="outline" onClick={skipDono}>
                  Pular (sem dono)
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
