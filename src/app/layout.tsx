import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dudu Ribeiro Tênis",
  description: "Gestão de alunos, aulas e financeiro",
};

const NAV_ITEMS = [
  { href: "/", label: "Agenda" },
  { href: "/alunos", label: "Alunos" },
  { href: "/financeiro", label: "Financeiro" },
];

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--card)]/95 backdrop-blur">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
            <Link href="/" className="font-semibold text-[var(--primary-dark)]">
              🎾 Dudu Ribeiro
            </Link>
            <nav className="flex gap-1">
              {NAV_ITEMS.map((item) => (
                <Link key={item.href} href={item.href} className="btn-ghost">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-5">{children}</main>
        <footer className="border-t border-[var(--border)] py-4 text-center text-xs text-[var(--muted)]">
          Sistema de gestão de aulas — Dudu Ribeiro
        </footer>
      </body>
    </html>
  );
}
