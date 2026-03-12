"use client";

import Link from "next/link";
import { Scissors } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full min-w-0 border-b border-border/50 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <nav className="container mx-auto flex h-14 min-h-14 max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-2 sm:h-16 sm:px-6 sm:py-0">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 font-semibold tracking-tight text-foreground transition-colors hover:text-primary sm:gap-2.5"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary sm:h-9 sm:w-9">
            <Scissors className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2} aria-hidden />
          </span>
          <span className="text-base sm:text-lg">FadeApp</span>
        </Link>
        <div className="flex min-w-0 flex-wrap items-center justify-end gap-3 sm:gap-6">
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
            <>
              <Link
                href="/cadastro"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Cadastre-se
              </Link>
              <Button variant="default" size="sm" asChild className="rounded-xl font-medium shadow-sm">
                <Link href="/login">Entrar</Link>
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
