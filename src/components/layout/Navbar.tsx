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
                <Link href="/cliente/dashboard">
                  <Button variant="ghost" size="sm">Minha área</Button>
                </Link>
              )}
              {session.user.role === "profissional" && (
                <Link href="/profissional/dashboard">
                  <Button variant="ghost" size="sm">Minha agenda</Button>
                </Link>
              )}
              {(session.user.role === "barbearia" || session.user.role === "admin") && (
                <Link href="/barbearia/dashboard">
                  <Button variant="ghost" size="sm">Painel</Button>
                </Link>
              )}
              <Button variant="outline" size="sm" onClick={() => signOut()}>
                Sair
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button variant="default" size="sm">Entrar</Button>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
