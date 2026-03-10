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
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="container mx-auto flex-1 max-w-2xl px-4 py-10 sm:py-12">
        <div className="mb-8 text-center sm:text-left">
          <h1 className="flex items-center justify-center gap-2 text-2xl font-bold text-foreground sm:justify-start md:text-3xl">
            <MessageCircle className="h-7 w-7 text-primary md:h-8 md:w-8" aria-hidden />
            Contato
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Fale conosco pelo WhatsApp. Respondemos o mais rápido possível.
          </p>
        </div>

        <div
          className="rounded-xl border border-border bg-card/95 p-5 shadow-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-md hover:ring-2 hover:ring-primary/20 focus-visible:ring-2 focus-visible:ring-primary/20"
        >
          <div className="mb-3 flex items-center gap-2 text-primary">
            <Phone className="h-5 w-5" aria-hidden />
            <h2 className="font-semibold">WhatsApp</h2>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            Abra o WhatsApp e envie uma mensagem pré-preenchida. Estamos prontos para ajudar.
          </p>
          <Button
            asChild
            size="lg"
            className="h-10 transition-transform active:scale-[0.98]"
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

        <div className="mt-8 text-center">
          <Button variant="link" asChild className="text-sm">
            <Link href="/">Voltar ao início</Link>
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
