import Link from "next/link";
import { Scissors } from "lucide-react";
import { FormCadastro } from "@/components/forms/FormCadastro";
import { Button } from "@/components/ui/button";

export default function CadastroPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-4">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{ backgroundImage: "url(https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=1200&q=80)" }}
      />
      <div className="absolute inset-0 bg-background/70" />
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold text-primary hover:text-primary/90">
            <Scissors className="h-6 w-6" strokeWidth={2} aria-hidden />
            FadeApp
          </Link>
          <p className="mt-0.5 text-xs text-muted-foreground">Crie sua conta</p>
        </div>
        <FormCadastro />
        <p className="text-xs text-muted-foreground">
          Já tem conta?{" "}
          <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">Entrar</Link>
        </p>
        <Button variant="link" asChild className="text-xs">
          <Link href="/">Voltar ao início</Link>
        </Button>
      </div>
    </div>
  );
}
