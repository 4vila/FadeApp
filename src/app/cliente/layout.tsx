import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function ClienteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/cliente/dashboard");
  if (session.user.role !== "cliente") redirect("/login?error=Unauthorized");
  return <>{children}</>;
}
