import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const roleRoutes: Record<string, string[]> = {
  cliente: ["/cliente"],
  profissional: ["/profissional"],
  barbearia: ["/barbearia"],
  admin: ["/barbearia", "/admin"],
};

function pathMatchesRole(pathname: string, role: string): boolean {
  const prefixes = roleRoutes[role];
  if (!prefixes) return false;
  return prefixes.some((prefix) => pathname.startsWith(prefix));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const secret = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET;
  const secureCookie = request.nextUrl.protocol === "https:";

  if (pathname.startsWith("/cliente")) {
    const token = await getToken({ req: request, secret, secureCookie });
    if (!token?.email) {
      const url = new URL("/login", request.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    if (token.role !== "cliente") {
      return NextResponse.redirect(new URL("/login?error=Unauthorized", request.url));
    }
  }

  if (pathname.startsWith("/profissional")) {
    const token = await getToken({ req: request, secret, secureCookie });
    if (!token?.email) {
      const url = new URL("/login", request.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    if (token.role !== "profissional") {
      return NextResponse.redirect(new URL("/login?error=Unauthorized", request.url));
    }
  }

  if (pathname.startsWith("/barbearia")) {
    const token = await getToken({ req: request, secret, secureCookie });
    if (!token?.email) {
      const url = new URL("/login", request.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    if (token.role !== "barbearia" && token.role !== "admin") {
      return NextResponse.redirect(new URL("/login?error=Unauthorized", request.url));
    }
  }

  if (pathname.startsWith("/admin")) {
    const token = await getToken({ req: request, secret, secureCookie });
    if (!token?.email) {
      const url = new URL("/login", request.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    if (token.role !== "admin") {
      return NextResponse.redirect(new URL("/login?error=Unauthorized", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/cliente/:path*", "/profissional/:path*", "/barbearia/:path*", "/admin/:path*"],
};
