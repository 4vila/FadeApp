import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function TrocarSenhaObrigatoriaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "cliente") redirect("/login");
  const mustChange = session.user.mustChangePassword;
  if (!mustChange) redirect("/cliente/dashboard");
  return <>{children}</>;
}
