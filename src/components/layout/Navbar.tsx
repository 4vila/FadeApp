"use client";

import Link from "next/link";
import { Scissors } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
      <nav className="container mx-auto flex h-12 max-w-4xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg text-primary hover:text-primary/90">
          <Scissors className="h-5 w-5" strokeWidth={2} aria-hidden />
          FadeApp
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/barbearias" className="text-sm text-muted-foreground hover:text-foreground">
            Barbearias
          </Link>
          <Link href="/contato" className="text-sm text-muted-foreground hover:text-foreground">
            Contato
          </Link>
          {status === "loading" ? (
            <span className="text-sm text-muted-foreground">...</span>
          ) : session ? (
            <>
              {session.user.role === "cliente" && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/cliente/dashboard">Minha área</Link>
                </Button>
              )}
              {session.user.role === "profissional" && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/profissional/dashboard">Minha agenda</Link>
                </Button>
              )}
              {session.user.role === "admin" && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin">Painel</Link>
                </Button>
              )}
              {session.user.role === "barbearia" && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/barbearia/dashboard">Painel</Link>
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => signOut()}>
                Sair
              </Button>
            </>
          ) : (
            <Button variant="default" size="sm" asChild>
              <Link href="/login">Entrar</Link>
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
}
