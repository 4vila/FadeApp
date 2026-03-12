"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, User } from "lucide-react";

type Barbearia = { id: string; name: string };

export default function NovoUsuarioPage() {
  const router = useRouter();
  const [barbearias, setBarbearias] = useState<Barbearia[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<string>("cliente");
  const [barbeariaId, setBarbeariaId] = useState<string>("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    fetch("/api/admin/barbearias")
      .then((r) => r.json())
      .then((data) => setBarbearias(Array.isArray(data) ? data : []))
      .catch(() => setBarbearias([]));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
        phone: phone.trim() || undefined,
      };
      if (role === "barbearia" || role === "profissional") {
        if (!barbeariaId) {
          setError("Selecione uma barbearia para este perfil.");
          setLoading(false);
          return;
        }
        body.barbeariaId = barbeariaId;
      }
      const res = await fetch("/api/admin/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Erro ao criar usuário.");
        return;
      }
      router.push("/admin/usuarios");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const needsBarbearia = role === "barbearia" || role === "profissional";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href="/admin/usuarios"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Link>
      <h1 className="text-2xl font-bold">Novo usuário</h1>
      <p className="text-muted-foreground mt-1">
        Crie um usuário manualmente (admin, dono de barbearia, profissional ou cliente).
      </p>

      <Card className="mt-6 max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Dados do usuário
          </CardTitle>
          <CardDescription>
            Nome, email, senha e perfil. Barbearia/profissional exigem barbearia vinculada.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="Nome completo"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@exemplo.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha *</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mín. 6 caracteres"
                minLength={6}
                required
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
            <div className="space-y-2">
              <Label htmlFor="role">Perfil *</Label>
              <select
                id="role"
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  if (e.target.value !== "barbearia" && e.target.value !== "profissional") {
                    setBarbeariaId("");
                  }
                }}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="cliente">Cliente</option>
                <option value="barbearia">Barbearia (dono)</option>
                <option value="profissional">Profissional</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            {needsBarbearia && (
              <div className="space-y-2">
                <Label htmlFor="barbeariaId">Barbearia *</Label>
                <select
                  id="barbeariaId"
                  value={barbeariaId}
                  onChange={(e) => setBarbeariaId(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required={needsBarbearia}
                >
                  <option value="">Selecione</option>
                  {barbearias.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <Button type="submit" disabled={loading}>
              {loading ? "Criando..." : "Criar usuário"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
