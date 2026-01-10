"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { usePathname } from "next/navigation"
import { Sidebar, Header, MobileNav, MobileSidebar } from "@/components/layout"
import { QuickTransactionModal } from "@/components/quick-transaction"
import { ImportDocumentModal } from "@/components/import"
import { OnboardingModal } from "@/components/onboarding"
import { SkipLinks } from "@/components/shared/skip-links"
import { Breadcrumbs } from "@/components/shared/breadcrumbs"
import { useStore } from "@/hooks/use-store"
import { useSWRData } from "@/hooks/use-swr-data"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, setSidebarOpen, isAddTransactionOpen, setAddTransactionOpen, addTransactionType, isImportDocumentOpen, setImportDocumentOpen, isLoading } = useStore()
  const pathname = usePathname()
  const prevPathRef = useRef(pathname)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Load data from API with SWR caching
  const { error, reload, isLoading: dataLoading } = useSWRData()

  // State para controlar modal de onboarding
  const [showOnboarding, setShowOnboarding] = useState(false)

  // Handle page transitions
  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      setIsTransitioning(true)
      const timer = setTimeout(() => setIsTransitioning(false), 150)
      prevPathRef.current = pathname
      return () => clearTimeout(timer)
    }
  }, [pathname])

  // Verificar se usuário precisa de onboarding
  useEffect(() => {
    if (!isLoading && user && user.isOnboarded === false) {
      setShowOnboarding(true)
    }
  }, [isLoading, user])

  // Callback quando onboarding é completado
  const handleOnboardingComplete = useCallback(() => {
    setShowOnboarding(false)
    // Recarregar dados para refletir as mudanças do onboarding
    reload()
  }, [reload])

  // Show loading state (use SWR loading OR store loading)
  // Only show full loading on initial load, not on subsequent fetches
  const showFullLoading = (isLoading || dataLoading) && !user

  if (showFullLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center animate-in fade-in duration-200">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-4 border-muted" />
            <div className="absolute inset-0 h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
          <p className="text-muted-foreground animate-pulse">Carregando...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center p-8">
          <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold">Erro ao carregar dados</h2>
          <p className="text-muted-foreground max-w-md">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Skip Links para acessibilidade */}
      <SkipLinks />

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <nav id="main-navigation" aria-label="Navegação principal">
          <Sidebar />
        </nav>
      </div>

      {/* Mobile Sidebar with overlay */}
      <MobileSidebar />

      {/* Main content area */}
      <div className="lg:pl-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main
          id="main-content"
          className={`py-8 px-4 sm:px-6 lg:px-8 pb-24 lg:pb-8 transition-opacity duration-150 ease-out ${
            isTransitioning ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <Breadcrumbs />
          {children}
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <MobileNav />

      {/* Quick Transaction Modal - triggered by center button in MobileNav */}
      <QuickTransactionModal
        open={isAddTransactionOpen}
        onOpenChange={setAddTransactionOpen}
        type={addTransactionType}
      />

      {/* Import Document Modal - triggered by "Importar" option in MobileNav */}
      <ImportDocumentModal
        open={isImportDocumentOpen}
        onOpenChange={setImportDocumentOpen}
      />

      {/* Onboarding Modal - shown on first access */}
      {user && (
        <OnboardingModal
          open={showOnboarding}
          userId={user.id}
          initialName={user.name}
          initialEmail={user.email}
          onComplete={handleOnboardingComplete}
        />
      )}
    </div>
  )
}
