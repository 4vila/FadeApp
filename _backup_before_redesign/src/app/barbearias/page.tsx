"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BarbeariaCard } from "@/components/barbearia/BarbeariaCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Scissors, Search, MapPin, Loader2 } from "lucide-react";

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
      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-border/60 bg-gradient-to-b from-muted/30 to-transparent px-4 py-10 sm:py-14 md:py-16">
          <div className="container mx-auto max-w-5xl">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <Scissors className="h-7 w-7" strokeWidth={2} aria-hidden />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-4xl">
                Barbearias
              </h1>
              <p className="mt-2 max-w-xl text-base text-muted-foreground sm:text-lg">
                Encontre a barbearia ideal e agende seu horário com facilidade.
              </p>
            </div>
          </div>
        </section>

        {/* Filtros */}
        <section className="sticky top-12 z-40 border-b border-border/60 bg-background/95 px-4 py-4 backdrop-blur sm:top-12">
          <div className="container mx-auto max-w-5xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="nome" className="text-muted-foreground">
                  Nome
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                  <Input
                    id="nome"
                    placeholder="Buscar por nome da barbearia"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="h-10 pl-9 sm:max-w-sm"
                  />
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="cidade" className="text-muted-foreground">
                  Cidade
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                  <Input
                    id="cidade"
                    placeholder="Filtrar por cidade"
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    className="h-10 pl-9 sm:max-w-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Lista */}
        <section className="container mx-auto max-w-5xl px-4 py-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden />
              <p className="mt-4 text-sm font-medium text-muted-foreground">Carregando barbearias...</p>
              <p className="mt-1 text-xs text-muted-foreground">Aguarde um momento</p>
            </div>
          ) : barbearias.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <Scissors className="h-8 w-8" strokeWidth={1.5} aria-hidden />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-foreground">Nenhuma barbearia encontrada</h2>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Tente ajustar o nome ou a cidade nos filtros acima, ou volte mais tarde.
              </p>
              <Button variant="outline" size="sm" className="mt-6" asChild>
                <Link href="/">Voltar ao início</Link>
              </Button>
            </div>
          ) : (
            <>
              <p className="mb-6 text-sm text-muted-foreground">
                {barbearias.length} {barbearias.length === 1 ? "barbearia" : "barbearias"} encontrada
                {barbearias.length !== 1 ? "s" : ""}
              </p>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {barbearias.map((b) => (
                  <BarbeariaCard
                    key={b.id}
                    id={b.id}
                    name={b.name}
                    address={b.address}
                    city={b.city}
                    phone={b.phone}
                    logo={b.logo}
                  />
                ))}
              </div>
              <div className="mt-10 flex justify-center">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/">Voltar ao início</Link>
                </Button>
              </div>
            </>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
