"use client"

import { WifiOff, RefreshCw } from "lucide-react"

export default function OfflinePage() {
  const handleReload = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
          <WifiOff className="w-10 h-10 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-semibold mb-2">Sem conexão</h1>
        <p className="text-muted-foreground mb-6">
          Parece que você está offline. Verifique sua conexão com a internet e
          tente novamente.
        </p>
        <button
          onClick={handleReload}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Tentar novamente
        </button>
      </div>
    </div>
  )
}
