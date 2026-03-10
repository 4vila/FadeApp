"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
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
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";

export function FormCadastro() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: RegisterInput) {
    setError(null);
    const res = await fetch("/api/cadastro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        password: data.password,
      }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(json.error ?? "Erro ao criar conta.");
      return;
    }
    router.push("/login?registered=1");
    router.refresh();
  }

  return (
    <Card className="w-full max-w-sm border-border bg-card/95 shadow-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Criar conta</CardTitle>
        <CardDescription className="text-sm">Cadastro de cliente.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-3">
          {error && (
            <p className="rounded-md bg-destructive/15 px-2 py-1.5 text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-sm">Nome</Label>
            <Input id="name" type="text" placeholder="Seu nome" className="h-9" {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm">Email</Label>
            <Input id="email" type="email" placeholder="seu@email.com" className="h-9" {...register("email")} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm">Senha</Label>
            <Input id="password" type="password" placeholder="Mín. 6 caracteres" className="h-9" {...register("password")} />
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-sm">Confirmar senha</Label>
            <Input id="confirmPassword" type="password" placeholder="Repita a senha" className="h-9" {...register("confirmPassword")} />
            {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
          </div>
        </CardContent>
        <CardFooter className="pt-0">
          <Button type="submit" disabled={isSubmitting} className="h-9 w-full">
            {isSubmitting ? "Cadastrando..." : "Cadastrar"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
