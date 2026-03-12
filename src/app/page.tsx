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
        {/* Hero com slider */}
        <section className="relative min-h-[28rem] sm:min-h-[36rem] md:min-h-[40rem]">
          <HeroSlider />
          <div className="relative z-[1] flex min-h-[28rem] flex-col items-center justify-center px-4 py-12 text-center sm:min-h-[36rem] sm:py-16 md:min-h-[40rem] md:py-20">
            <h1 className="text-display flex flex-wrap items-center justify-center gap-2 font-bold tracking-tight text-white drop-shadow-lg sm:gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm sm:h-14 sm:w-14 md:h-16 md:w-16">
                <Scissors className="h-6 w-6 text-white sm:h-8 sm:w-8 md:h-9 md:w-9" strokeWidth={2} aria-hidden />
              </span>
              <span>FadeApp</span>
            </h1>
            <p className="mt-3 text-base font-medium tracking-tight text-white/95 sm:mt-4 sm:text-lg md:text-xl">
              Agendamento para barbearias
            </p>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/90 sm:mt-3 sm:text-base">
              Conecte sua barbearia aos clientes. Agende horários em um só lugar.
            </p>
            <div className="mt-6 flex w-full max-w-md flex-wrap justify-center gap-3 px-2 sm:mt-8 sm:max-w-none sm:gap-4">
              <Link
                href="/contato"
                className="inline-flex h-10 min-w-0 flex-1 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] sm:h-11 sm:flex-none sm:px-6"
              >
                Quero para minha barbearia
              </Link>
              <Link
                href="/barbearias"
                className="inline-flex h-10 min-w-0 flex-1 items-center justify-center rounded-xl border-2 border-white/30 bg-white/10 px-4 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:border-white/40 active:scale-[0.98] sm:h-11 sm:flex-none sm:px-6"
              >
                Agendar agora
              </Link>
            </div>
          </div>
        </section>

        {/* Benefícios */}
        <section className="relative py-12 sm:py-16 md:py-24">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25"
            style={{ backgroundImage: `url(${BENEFICIOS_BG})` }}
          />
          <div className="absolute inset-0 bg-background/92" />
          <div className="container relative z-10 mx-auto max-w-5xl px-4 sm:px-6">
            <h2 className="text-heading-1 text-center text-primary">
              Benefícios
            </h2>
            <div className="mx-auto mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              <AnimateOnScroll delay={0}>
                <div className="rounded-2xl border border-border/80 bg-card/95 p-6 shadow-[var(--shadow-card)] backdrop-blur transition-all duration-300 hover:shadow-[var(--shadow-card-hover)] hover:border-primary/20">
                  <div className="h-1 w-12 rounded-full bg-primary" />
                  <h3 className="text-heading-3 mt-4 text-primary">Para barbearias</h3>
                  <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-muted-foreground list-none pl-0">
                    <li className="flex gap-2"><span className="text-primary">–</span> Acabe com as agendas de papel e dobre sua ocupação.</li>
                    <li className="flex gap-2"><span className="text-primary">–</span> Controle horários, profissionais e serviços em um só lugar. Tenha relatórios claros e veja seu faturamento crescer.</li>
                  </ul>
                </div>
              </AnimateOnScroll>
              <AnimateOnScroll delay={100}>
                <div className="rounded-2xl border border-border/80 bg-card/95 p-6 shadow-[var(--shadow-card)] backdrop-blur transition-all duration-300 hover:shadow-[var(--shadow-card-hover)] hover:border-accent/30">
                  <div className="h-1 w-12 rounded-full bg-accent" />
                  <h3 className="text-heading-3 mt-4 text-accent">Para profissionais</h3>
                  <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-muted-foreground list-none pl-0">
                    <li className="flex gap-2"><span className="text-accent">–</span> Trabalhe com tranquilidade e organize seu dia.</li>
                    <li className="flex gap-2"><span className="text-accent">–</span> Saiba exatamente quando vai atender, marque folgas sem conflitos e registre seus atendimentos. Mais foco no que importa: seu cliente.</li>
                  </ul>
                </div>
              </AnimateOnScroll>
              <AnimateOnScroll delay={200}>
                <div className="rounded-2xl border border-border/80 bg-card/95 p-6 shadow-[var(--shadow-card)] backdrop-blur transition-all duration-300 hover:shadow-[var(--shadow-card-hover)] hover:border-primary/20">
                  <div className="h-1 w-12 rounded-full bg-primary" />
                  <h3 className="text-heading-3 mt-4 text-primary">Para clientes</h3>
                  <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-muted-foreground list-none pl-0">
                    <li className="flex gap-2"><span className="text-primary">–</span> Nunca mais perca seu horário ou fique esperando.</li>
                    <li className="flex gap-2"><span className="text-primary">–</span> Encontre a barbearia perfeita, veja horários disponíveis e agende em segundos. Chegue, sente e seja atendido.</li>
                  </ul>
                </div>
              </AnimateOnScroll>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative py-12 sm:py-16 md:py-24">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
            style={{ backgroundImage: `url(${CTA_BG})` }}
          />
          <div className="absolute inset-0 bg-background/90" />
          <div className="container relative z-10 mx-auto max-w-2xl px-4 text-center sm:px-6">
            <h2 className="text-heading-1 text-primary">
              Pronto para começar?
            </h2>
            <p className="mt-3 text-caption text-muted-foreground">
              Agende em uma barbearia perto de você ou cadastre a sua.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="h-11 rounded-xl font-semibold">
                <Link href="/barbearias">Buscar barbearias</Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="h-11 rounded-xl border-2 border-accent/50 font-semibold text-accent hover:bg-accent/10"
              >
                <Link href="/contato">Falar com a gente</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Rodapé da landing */}
        <section className="border-t border-border/60 py-10">
          <div className="container mx-auto max-w-2xl px-4 text-center">
            <p className="text-caption text-muted-foreground">
              Dúvidas?{" "}
              <Link
                href="/contato"
                className="font-semibold text-primary underline-offset-4 hover:underline"
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
