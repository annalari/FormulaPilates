"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
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
    <header className="bg-black border-b border-gray-800">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <Image
            src="/formula-pilates-logo.png"
            alt="Fórmula Pilates & Fitness"
            width={200}
            height={60}
            className="h-12 w-auto"
            priority
          />
        </Link>
        {isClient && canInstall && (
          <Button 
            variant="outline" 
            onClick={handleInstall}
            className="text-sm border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
          >
            Instalar App
          </Button>
        )}
      </div>
    </header>
  )
}
