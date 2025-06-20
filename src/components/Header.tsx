"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { registerServiceWorker, initInstallPrompt, installApp } from "@/lib/pwaUtils"
import { useAuth } from "@/lib/authStore"
import { Button } from "@/components/ui/button"

export function Header() {
  const [canInstall, setCanInstall] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const user = useAuth((state) => state.user)
  const logout = useAuth((state) => state.logout)
  const router = useRouter()

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

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <header className="bg-black border-b border-gray-800">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-4">
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
          <Link href="/">
            <Button variant="ghost" className="text-white hover:text-red-400">
              Página inicial
            </Button>
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          {user?.role === 'admin' && (
            <Link href="/admin">
              <Button variant="ghost" className="text-white hover:text-red-400">
                Gerenciar Usuários
              </Button>
            </Link>
          )}
          
          <Link href="/report">
            <Button variant="ghost" className="text-white hover:text-red-400">
              Relatório
            </Button>
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

          {user && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-300">
                {user.email}
              </span>
              <Button 
                variant="ghost" 
                className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                onClick={handleLogout}
              >
                Sair
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
