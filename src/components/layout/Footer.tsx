import Link from "next/link";
import { Scissors } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/60 bg-muted/30 py-8">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-semibold tracking-tight text-foreground transition-colors hover:text-primary"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Scissors className="h-4 w-4" strokeWidth={2} aria-hidden />
              </span>
              FadeApp
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              Agendamento para barbearias.
            </p>
          </div>
          <div className="flex flex-wrap gap-6 text-sm">
            <Link
              href="/barbearias"
              className="font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Barbearias
            </Link>
            <Link
              href="/contato"
              className="font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Contato
            </Link>
            <Link
              href="/login"
              className="font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Entrar
            </Link>
          </div>
        </div>
        <p className="mt-6 border-t border-border/50 pt-6 text-center text-sm text-muted-foreground">
          © {year} FadeApp. Agendamento para barbearias.
        </p>
      </div>
    </footer>
  );
}
