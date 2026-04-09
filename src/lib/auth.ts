import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

/**
 * Config como função assíncrona: `setEnvDefaults` corre em cada pedido, não só ao importar
 * o módulo. Assim AUTH_SECRET / NEXTAUTH_SECRET lidos na Vercel em runtime não ficam
 * substituídos por `undefined` no bundle do build.
 */
export const { handlers, signIn, signOut, auth } = NextAuth(async () => ({
  trustHost: true,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = String(credentials.email).toLowerCase().trim();
        const password = String(credentials.password);
        const user = await prisma.user.findUnique({
          where: { email },
        });
        if (!user?.password) return null;
        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: String(user.role),
          barbeariaId: user.barbeariaId ?? undefined,
          mustChangePassword: user.mustChangePassword ?? false,
        };
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.id = user.id;
        token.role = user.role;
        token.barbeariaId = user.barbeariaId;
        token.mustChangePassword = user.mustChangePassword;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.sub ?? token.id) as string;
        session.user.role = (token.role as string) ?? "cliente";
        session.user.barbeariaId = (token.barbeariaId as string | null) ?? null;
        session.user.mustChangePassword = token.mustChangePassword === true;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
}));
