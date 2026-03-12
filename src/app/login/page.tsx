import Link from "next/link";
import { Scissors } from "lucide-react";
import { FormLogin } from "@/components/forms/FormLogin";
import { Button } from "@/components/ui/button";

type LoginPageProps = { searchParams: Promise<{ error?: string; msg?: string }> };

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const authError = params?.error;
  const successMsg = params?.msg;

  const configErrorMsg =
    authError === "Configuration"
      ? "Erro de configuração do servidor. Verifique se AUTH_SECRET (ou NEXTAUTH_SECRET) está definido no .env e reinicie o servidor."
      : authError === "AccessDenied"
        ? "Acesso negado."
        : authError
          ? "Ocorreu um erro na autenticação. Tente novamente."
          : null;

  return (
    <div className="relative flex min-h-screen min-w-0 flex-col items-center justify-center gap-4 bg-background p-4 sm:gap-6">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15"
        style={{ backgroundImage: "url(https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200&q=80)" }}
      />
      <div className="absolute inset-0 bg-background/80" />
      <div className="relative z-10 flex w-full min-w-0 max-w-sm flex-col items-center gap-4 sm:gap-6">
        <div className="w-full min-w-0 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-semibold tracking-tight text-foreground transition-colors hover:text-primary sm:gap-2.5"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary sm:h-10 sm:w-10">
              <Scissors className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2} aria-hidden />
            </span>
            <span className="truncate">FadeApp</span>
          </Link>
          <p className="mt-2 text-caption text-muted-foreground">Entre na sua conta</p>
        </div>
        {configErrorMsg && (
          <div
            className="w-full rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-center text-caption text-destructive"
            role="alert"
          >
            {configErrorMsg}
          </div>
        )}
        {successMsg && (
          <div
            className="w-full rounded-xl border border-green-500/50 bg-green-500/10 px-4 py-3 text-center text-caption text-green-700 dark:text-green-400"
            role="status"
          >
            {successMsg}
          </div>
        )}
        <FormLogin />
        <Button variant="link" asChild className="text-caption font-medium">
          <Link href="/">Voltar ao início</Link>
        </Button>
      </div>
    </div>
  );
}
