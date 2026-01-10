"use client"

import Link from "next/link"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-center h-16 px-4 border-b border-card-border">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-title font-bold">
            Fam<span className="text-primary">Finance</span>
          </span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 text-center">
        <p className="text-caption text-secondary">
          &copy; {new Date().getFullYear()} FamFinance. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  )
}
