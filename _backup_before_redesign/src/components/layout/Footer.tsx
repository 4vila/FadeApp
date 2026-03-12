import Link from "next/link";
import { Scissors } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted/50 py-5">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 font-semibold text-primary hover:text-primary/90">
              <Scissors className="h-4 w-4" strokeWidth={2} aria-hidden />
              FadeApp
            </Link>
            <p className="mt-0.5 text-xs text-muted-foreground">Agendamento para barbearias.</p>
          </div>
          <div className="flex flex-wrap gap-4 text-xs">
            <Link href="/barbearias" className="text-muted-foreground hover:text-foreground">Barbearias</Link>
            <Link href="/contato" className="text-muted-foreground hover:text-foreground">Contato</Link>
            <Link href="/login" className="text-muted-foreground hover:text-foreground">Entrar</Link>
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">© {year} FadeApp. Agendamento para barbearias.</p>
      </div>
    </footer>
  );
}
