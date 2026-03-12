import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { HelpWidget } from "@/components/HelpWidget";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FadeApp — Agendamento para barbearias",
  description: "Agende seu horário na barbearia. Gestão e agendamento para barbearias e clientes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${plusJakarta.variable} ${geistMono.variable} min-w-0 font-sans antialiased bg-background text-foreground`}>
        <SessionProvider>
          {children}
          <HelpWidget />
        </SessionProvider>
      </body>
    </html>
  );
}
