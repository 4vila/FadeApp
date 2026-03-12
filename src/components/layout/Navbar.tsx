"use client";

import Link from "next/link";
import { Scissors } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <nav className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-semibold tracking-tight text-foreground transition-colors hover:text-primary"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Scissors className="h-5 w-5" strokeWidth={2} aria-hidden />
          </span>
          <span className="text-lg">FadeApp</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/barbearias"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Barbearias
          </Link>
          <Link
            href="/contato"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Contato
          </Link>
          {status === "loading" ? (
            <span className="text-sm text-muted-foreground">...</span>
          ) : session ? (
            <>
              {session.user.role === "cliente" && (
                <Button variant="ghost" size="sm" asChild className="font-medium">
                  <Link href="/cliente/dashboard">Minha área</Link>
                </Button>
              )}
              {session.user.role === "profissional" && (
                <Button variant="ghost" size="sm" asChild className="font-medium">
                  <Link href="/profissional/dashboard">Minha agenda</Link>
                </Button>
              )}
              {session.user.role === "admin" && (
                <Button variant="ghost" size="sm" asChild className="font-medium">
                  <Link href="/admin">Painel</Link>
                </Button>
              )}
              {session.user.role === "barbearia" && (
                <Button variant="ghost" size="sm" asChild className="font-medium">
                  <Link href="/barbearia/dashboard">Painel</Link>
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => signOut()} className="rounded-xl">
                Sair
              </Button>
            </>
          ) : (
            <Button variant="default" size="sm" asChild className="rounded-xl font-medium shadow-sm">
              <Link href="/login">Entrar</Link>
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
}
