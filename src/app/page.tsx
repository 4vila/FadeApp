import Link from "next/link";
import { Scissors } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { HeroSlider } from "@/components/landing/HeroSlider";
import { AnimateOnScroll } from "@/components/landing/AnimateOnScroll";

const BENEFICIOS_BG =
  "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=1200&q=80";
const CTA_BG =
  "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=1200&q=80";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        {/* Hero com slider de imagens */}
        <section className="relative h-[420px] min-h-[320px] md:h-[480px]">
          <HeroSlider />
          <div className="relative z-[1] flex h-full flex-col items-center justify-center px-4 text-center">
            <h1 className="flex items-center justify-center gap-3 text-4xl font-bold tracking-tight text-white drop-shadow-lg md:text-5xl">
              <Scissors className="h-10 w-10 text-white md:h-12 md:w-12" strokeWidth={2} aria-hidden />
              <span className="tracking-wide">FadeApp</span>
            </h1>
            <p className="mt-1 text-lg font-medium text-white/95">
              Agendamento para barbearias
            </p>
            <p className="mt-3 max-w-xl text-sm text-white/90">
              Conecte sua barbearia aos clientes. Agende horários em um só lugar.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                <Link href="/contato">Quero para minha barbearia</Link>
              </Button>
              <Button
                asChild
                variant="secondary"
                size="lg"
                className="border border-white/30 bg-white/10 text-white hover:bg-white/20"
              >
                <Link href="/barbearias">Agendar agora</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Benefícios com imagem de fundo */}
        <section className="relative py-12 md:py-14">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
            style={{ backgroundImage: `url(${BENEFICIOS_BG})` }}
          />
          <div className="absolute inset-0 bg-background/90" />
          <div className="container relative z-10 mx-auto max-w-4xl px-4">
            <h2 className="text-center text-xl font-bold text-primary md:text-2xl">
              Benefícios
            </h2>
            <div className="mx-auto mt-6 grid gap-5 sm:grid-cols-3">
              <AnimateOnScroll delay={0}>
                <div className="rounded-lg border border-border bg-card/95 p-5 backdrop-blur transition-shadow hover:shadow-md">
                  <div className="h-0.5 w-10 rounded-full bg-primary" />
                  <h3 className="mt-3 font-semibold text-primary">Para barbearias</h3>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground list-none pl-0">
                    <li className="flex gap-2"><span className="text-primary">–</span> Acabe com as agendas de papel e dobre sua ocupação.</li>
                    <li className="flex gap-2"><span className="text-primary">–</span> Controle horários, profissionais e serviços em um só lugar. Tenha relatórios claros e veja seu faturamento crescer.</li>
                  </ul>
                </div>
              </AnimateOnScroll>
              <AnimateOnScroll delay={100}>
                <div className="rounded-lg border border-border bg-card/95 p-5 backdrop-blur transition-shadow hover:shadow-md">
                  <div className="h-0.5 w-10 rounded-full bg-accent" />
                  <h3 className="mt-3 font-semibold text-accent">Para profissionais</h3>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground list-none pl-0">
                    <li className="flex gap-2"><span className="text-accent">–</span> Trabalhe com tranquilidade e organize seu dia.</li>
                    <li className="flex gap-2"><span className="text-accent">–</span> Saiba exatamente quando vai atender, marque folgas sem conflitos e registre seus atendimentos. Mais foco no que importa: seu cliente.</li>
                  </ul>
                </div>
              </AnimateOnScroll>
              <AnimateOnScroll delay={200}>
                <div className="rounded-lg border border-border bg-card/95 p-5 backdrop-blur transition-shadow hover:shadow-md">
                  <div className="h-0.5 w-10 rounded-full bg-primary" />
                  <h3 className="mt-3 font-semibold text-primary">Para clientes</h3>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground list-none pl-0">
                    <li className="flex gap-2"><span className="text-primary">–</span> Nunca mais perca seu horário ou fique esperando.</li>
                    <li className="flex gap-2"><span className="text-primary">–</span> Encontre a barbearia perfeita, veja horários disponíveis e agende em segundos. Chegue, sente e seja atendido.</li>
                  </ul>
                </div>
              </AnimateOnScroll>
            </div>
          </div>
        </section>

        {/* CTA com imagem de fundo */}
        <section className="relative py-12 md:py-14">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25"
            style={{ backgroundImage: `url(${CTA_BG})` }}
          />
          <div className="absolute inset-0 bg-background/85" />
          <div className="container relative z-10 mx-auto max-w-2xl px-4 text-center">
            <h2 className="text-xl font-bold text-primary md:text-2xl">
              Pronto para começar?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Agende em uma barbearia perto de você ou cadastre a sua.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link href="/barbearias">Buscar barbearias</Link>
              </Button>
              <Button variant="outline" asChild className="border-accent text-accent hover:bg-accent/10">
                <Link href="/contato">Falar com a gente</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Rodapé da landing */}
        <section className="border-t border-border py-8">
          <div className="container mx-auto max-w-2xl px-4 text-center">
            <p className="text-sm text-muted-foreground">
              Dúvidas?{" "}
              <Link
                href="/contato"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Entre em contato pelo WhatsApp
              </Link>
              .
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
