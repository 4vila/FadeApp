"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BarbeariaCard } from "@/components/barbearia/BarbeariaCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type BarbeariaItem = {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  logo: string | null;
};

export default function BarbeariasPage() {
  const [barbearias, setBarbearias] = useState<BarbeariaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [nome, setNome] = useState("");
  const [cidade, setCidade] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (nome) params.set("nome", nome);
    if (cidade) params.set("cidade", cidade);
    setLoading(true);
    fetch(`/api/barbearias?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setBarbearias(Array.isArray(data) ? data : []);
      })
      .catch(() => setBarbearias([]))
      .finally(() => setLoading(false));
  }, [nome, cidade]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="container mx-auto flex-1 max-w-4xl px-4 py-6">
        <h1 className="text-xl font-bold">Barbearias</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Encontre uma barbearia e agende seu horário.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              placeholder="Filtrar por nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="max-w-xs"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cidade">Cidade</Label>
            <Input
              id="cidade"
              placeholder="Filtrar por cidade"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </div>

        {loading ? (
          <p className="mt-5 text-sm text-muted-foreground">Carregando...</p>
        ) : barbearias.length === 0 ? (
          <p className="mt-5 text-sm text-muted-foreground">Nenhuma barbearia encontrada.</p>
        ) : (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {barbearias.map((b) => (
              <BarbeariaCard
                key={b.id}
                id={b.id}
                name={b.name}
                address={b.address}
                city={b.city}
                phone={b.phone}
              />
            ))}
          </div>
        )}

        <div className="mt-5">
          <Button variant="link" asChild className="text-sm">
            <Link href="/">Voltar ao início</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
