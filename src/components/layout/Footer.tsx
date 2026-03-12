import Link from "next/link";
import { Scissors } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="min-w-0 border-t border-border/60 bg-muted/30 py-6 sm:py-8">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex min-w-0 flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-semibold tracking-tight text-foreground transition-colors hover:text-primary"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary sm:h-8 sm:w-8">
                <Scissors className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2} aria-hidden />
              </span>
              <span className="truncate">FadeApp</span>
            </Link>
            <p className="mt-2 text-caption text-muted-foreground">
              Agendamento para barbearias.
            </p>
          </div>
          <div className="flex min-w-0 flex-wrap gap-4 text-caption sm:gap-6">
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
        <p className="mt-6 border-t border-border/50 pt-6 text-center text-caption text-muted-foreground">
          © {year} FadeApp. Agendamento para barbearias.
        </p>
      </div>
    </footer>
  );
}
