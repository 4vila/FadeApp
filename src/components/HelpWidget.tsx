"use client";

import * as React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { MessageCircle, X, Home, Mail, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP ?? "5571999493628";
const WHATSAPP_MSG = encodeURIComponent("Olá! Preciso de ajuda com o FadeApp.");

const FAQS = [
  { q: "Como agendar um horário?", a: "Acesse Barbearias, escolha uma e clique em Agendar. Faça login se necessário." },
  {
    q: "Como cancelar ou remarcar?",
    a: "Cliente: em Minha área, abra o agendamento e use Cancelar. Para outro horário, cancele e agende de novo em Barbearias. Barbearia: no painel, em Agendamentos, use Editar ou Cancelar.",
  },
  { q: "Onde vejo meus agendamentos?", a: "Cliente: Minha área. Profissional: Minha agenda. Dono: Painel > Agendamentos." },
  { q: "Esqueci minha senha", a: "Entre em contato pelo WhatsApp (botão abaixo) para redefinir sua senha." },
];

export function HelpWidget() {
  const { data: session } = useSession();
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const filteredFaqs = search.trim()
    ? FAQS.filter((f) => f.q.toLowerCase().includes(search.toLowerCase()))
    : FAQS;

  const linkAgendamentos =
    session?.user?.role === "cliente"
      ? "/cliente/dashboard"
      : session?.user?.role === "profissional"
        ? "/profissional/dashboard"
        : session?.user?.role === "barbearia" || session?.user?.role === "admin"
          ? "/barbearia/dashboard/agendamentos"
          : "/login";

  return (
    <>
      {/* Overlay quando aberto */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30"
          aria-hidden
          onClick={() => setOpen(false)}
        />
      )}

      {/* Painel de ajuda */}
      <div
        role="dialog"
        aria-label="Ajuda e dúvidas"
        aria-modal="true"
        className={cn(
          "fixed bottom-20 right-4 z-50 w-[calc(100vw-2rem)] max-w-sm rounded-xl border border-border bg-card shadow-xl transition-all duration-200 sm:bottom-24 sm:right-6",
          open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"
        )}
      >
        {open && (
          <div className="flex max-h-[70vh] flex-col overflow-hidden rounded-xl">
            <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-3">
              <div>
                <p className="font-semibold">
                  Olá{session?.user?.name ? `, ${session.user.name}` : ""} 👋
                </p>
                <p className="text-sm text-muted-foreground">Como podemos ajudar?</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => setOpen(false)}
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Atalhos</p>
                <div className="grid gap-1.5">
                  <Link
                    href="/barbearias"
                    className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-sm hover:bg-muted/50"
                    onClick={() => setOpen(false)}
                  >
                    Agendar horário
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                  <Link
                    href={linkAgendamentos}
                    className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-sm hover:bg-muted/50"
                    onClick={() => setOpen(false)}
                  >
                    {session?.user ? "Ver ou cancelar meus agendamentos" : "Fazer login (ver agendamentos)"}
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Qual é a sua dúvida?</p>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <ul className="space-y-1.5">
                  {filteredFaqs.map((faq) => (
                    <li
                      key={faq.q}
                      className="rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm"
                    >
                      <p className="font-medium text-foreground">{faq.q}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{faq.a}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <Button asChild className="w-full" size="sm">
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Falar com suporte no WhatsApp
                </a>
              </Button>
            </div>

            <div className="flex border-t border-border bg-muted/30 px-4 py-2 gap-2">
              <Link
                href="/"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => setOpen(false)}
              >
                <Home className="h-3.5 w-3.5" />
                Início
              </Link>
              <Link
                href="/contato"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => setOpen(false)}
              >
                <Mail className="h-3.5 w-3.5" />
                Contato
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Botão flutuante */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:bottom-6 sm:right-6"
        aria-label={open ? "Fechar ajuda" : "Abrir ajuda"}
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    </>
  );
}
