import Link from "next/link";
import { Scissors } from "lucide-react";
import { FormLogin } from "@/components/forms/FormLogin";
import { Button } from "@/components/ui/button";

type LoginPageProps = { searchParams: Promise<{ error?: string }> };

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const authError = params?.error;

  const configErrorMsg =
    authError === "Configuration"
      ? "Erro de configuração do servidor. Verifique se AUTH_SECRET (ou NEXTAUTH_SECRET) está definido no .env e reinicie o servidor."
      : authError === "AccessDenied"
        ? "Acesso negado."
        : authError
          ? "Ocorreu um erro na autenticação. Tente novamente."
          : null;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-4">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{ backgroundImage: "url(https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200&q=80)" }}
      />
      <div className="absolute inset-0 bg-background/70" />
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold text-primary hover:text-primary/90">
            <Scissors className="h-6 w-6" strokeWidth={2} aria-hidden />
            FadeApp
          </Link>
          <p className="mt-0.5 text-xs text-muted-foreground">Entre na sua conta</p>
        </div>
        {configErrorMsg && (
          <div
            className="w-full max-w-sm rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-center text-sm text-destructive"
            role="alert"
          >
            {configErrorMsg}
          </div>
        )}
        <FormLogin />
        <p className="text-xs text-muted-foreground">
          Não tem conta?{" "}
          <Link href="/cadastro" className="font-medium text-primary underline-offset-4 hover:underline">Cadastre-se</Link>
        </p>
        <Button variant="link" asChild className="text-xs">
          <Link href="/">Voltar ao início</Link>
        </Button>
      </div>
    </div>
  );
}
