import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";

export default async function ClienteDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/cliente/dashboard");
  if (session.user.role !== "cliente") redirect("/login?error=Unauthorized");

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/90 px-4 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link
            href="/cliente/dashboard"
            className="text-lg font-semibold tracking-tight text-foreground transition-colors hover:text-primary"
          >
            Minha área
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link
              href="/cliente/dashboard"
              className="font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Agendamentos
            </Link>
            <Link
              href="/cliente/dashboard/perfil"
              className="font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Perfil
            </Link>
            <Link
              href="/"
              className="font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Voltar ao site
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}
