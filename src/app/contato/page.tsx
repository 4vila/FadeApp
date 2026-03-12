import Link from "next/link";
import { MessageCircle, Phone } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP ?? "5571999493628";
const WHATSAPP_MSG = encodeURIComponent(
  "Olá! Gostaria de mais informações sobre o FadeApp."
);

export default function ContatoPage() {
  return (
    <div className="flex min-h-screen min-w-0 flex-col">
      <Navbar />
      <div className="container mx-auto min-w-0 flex-1 max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="mb-8 text-center sm:mb-10 sm:text-left">
          <h1 className="text-heading-1 flex flex-wrap items-center justify-center gap-2 text-foreground sm:gap-3 sm:justify-start">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary sm:h-12 sm:w-12">
              <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden />
            </span>
            Contato
          </h1>
          <p className="mt-3 text-body text-muted-foreground">
            Fale conosco pelo WhatsApp. Respondemos o mais rápido possível.
          </p>
        </div>

        <div className="min-w-0 rounded-2xl border border-border/80 bg-card/95 p-4 shadow-[var(--shadow-card)] transition-all duration-300 hover:shadow-[var(--shadow-card-hover)] hover:border-primary/20 focus-within:ring-2 focus-within:ring-primary/20 sm:p-6">
          <div className="mb-4 flex items-center gap-3 text-primary">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
              <Phone className="h-5 w-5" aria-hidden />
            </span>
            <h2 className="text-heading-3">WhatsApp</h2>
          </div>
          <p className="mb-6 text-caption text-muted-foreground">
            Abra o WhatsApp e envie uma mensagem pré-preenchida. Estamos prontos para ajudar.
          </p>
          <Button
            asChild
            size="lg"
            className="h-12 rounded-xl font-semibold shadow-sm transition-transform active:scale-[0.98]"
          >
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Abrir WhatsApp
            </a>
          </Button>
        </div>

        <div className="mt-10 text-center">
          <Button variant="link" asChild className="text-caption font-medium">
            <Link href="/">Voltar ao início</Link>
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
