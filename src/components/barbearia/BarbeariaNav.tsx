"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function BarbeariaNav() {
  const pathname = usePathname();
  const base = "/barbearia/dashboard";

  const isActive = (path: string) =>
    path === base ? pathname === base : pathname.startsWith(path);

  const linkClass = (path: string) =>
    `block rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted hover:underline ${
      isActive(path) ? "bg-muted font-medium" : ""
    }`;

  return (
    <>
      <nav className="mt-4 flex flex-col gap-2">
        <Link href={base} className={linkClass(base)}>
          Resumo
        </Link>
        <Link href={`${base}/profissionais`} className={linkClass(`${base}/profissionais`)}>
          Profissionais
        </Link>
        <Link href={`${base}/servicos`} className={linkClass(`${base}/servicos`)}>
          Serviços
        </Link>
        <Link href={`${base}/agendamentos`} className={linkClass(`${base}/agendamentos`)}>
          Agendamentos
        </Link>
        <Link href={`${base}/relatorios`} className={linkClass(`${base}/relatorios`)}>
          Relatórios
        </Link>
        <Link href={`${base}/config`} className={linkClass(`${base}/config`)}>
          Configurações
        </Link>
      </nav>
      <Link href="/" className="mt-6 block text-sm text-muted-foreground hover:underline">
        Voltar ao site
      </Link>
    </>
  );
}
