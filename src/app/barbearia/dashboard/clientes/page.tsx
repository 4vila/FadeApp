"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Users } from "lucide-react";

type Cliente = {
  id: string;
  name: string | null;
  email: string;
  createdAt: string;
  mustChangePassword?: boolean;
};

export default function BarbeariaClientesPage() {
  const [list, setList] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  function loadList() {
    fetch("/api/barbearia/clientes")
      .then((r) => r.json())
      .then((data) => setList(Array.isArray(data) ? data : []))
      .catch(() => setList([]));
  }

  useEffect(() => {
    loadList();
    setLoading(false);
  }, []);

  async function handleCadastrar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    if (password.length < 6) {
      setErro("A senha temporária deve ter no mínimo 6 caracteres.");
      return;
    }
    setEnviando(true);
    try {
      const res = await fetch("/api/barbearia/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErro(data.error ?? "Erro ao cadastrar cliente.");
        return;
      }
      setName("");
      setEmail("");
      setPassword("");
      setShowForm(false);
      loadList();
    } finally {
      setEnviando(false);
    }
  }

  if (loading) return <p className="text-muted-foreground">Carregando...</p>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-heading-1">Clientes</h1>
        <p className="mt-1 text-caption text-muted-foreground">
          Cadastre um cliente que chegou na barbearia. Ele receberá o email e a senha temporária para fazer o primeiro
          login; depois será obrigado a trocar a senha.
        </p>
      </div>

      <Card className="rounded-2xl border border-border/80 shadow-[var(--shadow-card)]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Cadastrar cliente
            </CardTitle>
            <CardDescription>Gere um acesso para o cliente usar o app e agendar.</CardDescription>
          </div>
          <Button
            variant={showForm ? "outline" : "default"}
            className="rounded-xl"
            onClick={() => {
              setShowForm((v) => !v);
              setErro(null);
            }}
          >
            {showForm ? "Cancelar" : "Novo cliente"}
          </Button>
        </CardHeader>
        {showForm && (
          <CardContent className="pt-0">
            <form onSubmit={handleCadastrar} className="space-y-4 max-w-md">
              {erro && (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
                  {erro}
                </p>
              )}
              <div className="space-y-2">
                <Label htmlFor="cli-name">Nome</Label>
                <Input
                  id="cli-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome do cliente"
                  className="h-11 rounded-xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cli-email">Email</Label>
                <Input
                  id="cli-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  className="h-11 rounded-xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cli-password">Senha temporária</Label>
                <Input
                  id="cli-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres (passe ao cliente)"
                  className="h-11 rounded-xl"
                  required
                  minLength={6}
                />
                <p className="text-xs text-muted-foreground">
                  Informe esta senha ao cliente. No primeiro login ele precisará trocá-la.
                </p>
              </div>
              <Button type="submit" disabled={enviando} className="rounded-xl">
                {enviando ? "Cadastrando..." : "Cadastrar cliente"}
              </Button>
            </form>
          </CardContent>
        )}
      </Card>

      <div>
        <h2 className="text-heading-3 flex items-center gap-2 mb-3">
          <Users className="h-5 w-5" />
          Clientes cadastrados por você
        </h2>
        {list.length === 0 ? (
          <p className="text-caption text-muted-foreground">
            Nenhum cliente cadastrado ainda. Use o botão acima quando um cliente quiser ser cadastrado na barbearia.
          </p>
        ) : (
          <ul className="space-y-2">
            {list.map((c) => (
              <Card key={c.id} className="rounded-xl border border-border/80">
                <CardContent className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <div>
                    <p className="font-medium">{c.name ?? "—"}</p>
                    <p className="text-sm text-muted-foreground">{c.email}</p>
                  </div>
                  {c.mustChangePassword && (
                    <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-700 dark:text-amber-400">
                      Pendente trocar senha
                    </span>
                  )}
                </CardContent>
              </Card>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
