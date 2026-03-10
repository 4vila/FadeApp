import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";

export default async function ProfissionalDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/profissional/dashboard");
  if (session.user.role !== "profissional") redirect("/login?error=Unauthorized");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-muted/30 px-4 py-3">
        <div className="container flex items-center justify-between">
          <Link href="/profissional/dashboard" className="font-semibold">
            Minha agenda
          </Link>
          <Link href="/" className="text-sm hover:underline">
            Voltar ao site
          </Link>
        </div>
      </header>
      <main className="container flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
