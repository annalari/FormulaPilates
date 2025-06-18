"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { registerServiceWorker, initInstallPrompt, installApp } from "@/lib/pwaUtils"
import { Button } from "@/components/ui/button"

export function Header() {
  const [canInstall, setCanInstall] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Set client flag to ensure we're on the client side
    setIsClient(true)
    
    // Initialize PWA functionality
    registerServiceWorker()
    initInstallPrompt()

    // Check if the app can be installed (only on client side)
    if (typeof window !== 'undefined') {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      setCanInstall(!isStandalone)
    }
  }, [])

  const handleInstall = async () => {
    const installed = await installApp()
    if (installed) {
      setCanInstall(false)
    }
  }

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/">
          <h1 className="text-2xl font-semibold bg-gradient-to-r from-black to-red-600 bg-clip-text text-transparent hover:from-black hover:to-red-700 transition-all cursor-pointer">
            Fórmula Pilates
          </h1>
        </Link>
        {isClient && canInstall && (
          <Button 
            variant="outline" 
            onClick={handleInstall}
            className="text-sm"
          >
            Instalar App
          </Button>
        )}
      </div>
    </header>
  )
}
