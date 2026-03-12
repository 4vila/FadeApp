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
    <div className="flex min-h-screen min-w-0 flex-col">
      <Navbar />
      <main className="min-w-0 flex-1">
        {/* Hero */}
        <section className="border-b border-border/50 bg-gradient-to-b from-muted/40 to-transparent px-4 py-10 sm:px-6 sm:py-14 md:py-20">
          <div className="container mx-auto max-w-5xl">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-sm sm:mb-5 sm:h-16 sm:w-16">
                <Scissors className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={2} aria-hidden />
              </div>
              <h1 className="text-heading-1 text-foreground">
                Barbearias
              </h1>
              <p className="mt-3 max-w-xl text-body text-muted-foreground">
                Encontre a barbearia ideal e agende seu horário com facilidade.
              </p>
            </div>
          </div>
        </section>

        {/* Filtros */}
        <section className="sticky top-14 z-40 min-w-0 border-b border-border/50 bg-background/90 px-4 py-4 backdrop-blur-md sm:top-16 sm:px-6">
          <div className="container mx-auto max-w-5xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
              <div className="flex-1 space-y-2">
                <Label htmlFor="nome" className="text-caption font-medium text-muted-foreground">
                  Nome
                </Label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                  <Input
                    id="nome"
                    placeholder="Buscar por nome da barbearia"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="h-11 rounded-xl pl-10 sm:max-w-sm"
                  />
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="cidade" className="text-caption font-medium text-muted-foreground">
                  Cidade
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                  <Input
                    id="cidade"
                    placeholder="Filtrar por cidade"
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    className="h-11 rounded-xl pl-10 sm:max-w-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Lista */}
        <section className="container mx-auto min-w-0 max-w-5xl px-4 py-8 sm:py-10 sm:px-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" aria-hidden />
              <p className="mt-5 text-caption font-medium text-muted-foreground">Carregando barbearias...</p>
              <p className="mt-1 text-small text-muted-foreground">Aguarde um momento</p>
            </div>
          ) : barbearias.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-20 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted/80 text-muted-foreground">
                <Scissors className="h-10 w-10" strokeWidth={1.5} aria-hidden />
              </div>
              <h2 className="text-heading-3 mt-6 text-foreground">Nenhuma barbearia encontrada</h2>
              <p className="mt-3 max-w-sm text-caption text-muted-foreground">
                Tente ajustar o nome ou a cidade nos filtros acima, ou volte mais tarde.
              </p>
              <Button variant="outline" size="lg" className="mt-8 rounded-xl" asChild>
                <Link href="/">Voltar ao início</Link>
              </Button>
            </div>
          ) : (
            <>
              <p className="mb-6 text-caption text-muted-foreground">
                {barbearias.length} {barbearias.length === 1 ? "barbearia" : "barbearias"} encontrada
                {barbearias.length !== 1 ? "s" : ""}
              </p>
              <div className="grid min-w-0 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
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
              <div className="mt-12 flex justify-center">
                <Button variant="ghost" size="sm" asChild className="rounded-xl font-medium">
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
