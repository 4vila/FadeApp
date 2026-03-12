"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";

export function FormLogin() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(data: LoginInput) {
    setError(null);
    const result = await signIn("credentials", {
      email: data.email.trim().toLowerCase(),
      password: data.password,
      redirect: false,
    });
    if (result?.error) {
      setError(
        result.error === "Configuration"
          ? "Erro de configuração do servidor. Defina AUTH_SECRET no .env e reinicie."
          : "Email ou senha incorretos."
      );
      return;
    }
    const destination = callbackUrl && callbackUrl !== "/" ? callbackUrl : "/";
    window.location.href = destination;
  }

  return (
    <Card className="w-full max-w-sm rounded-2xl border border-border/80 bg-card/95 shadow-[var(--shadow-card-hover)]">
      <CardHeader className="pb-4">
        <CardTitle className="text-heading-3">Entrar</CardTitle>
        <CardDescription className="text-caption">Email e senha.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4 pb-2">
          {error && (
            <p
              className="rounded-xl bg-destructive/15 px-3 py-2.5 text-caption text-destructive"
              role="alert"
            >
              {error}
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-caption font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              className="h-11 rounded-xl"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-small text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-caption font-medium">
              Senha
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="h-11 rounded-xl"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-small text-destructive">{errors.password.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="pt-6">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-11 w-full rounded-xl font-semibold"
          >
            {isSubmitting ? "Entrando..." : "Entrar"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
