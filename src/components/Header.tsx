"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { registerServiceWorker, initInstallPrompt, installApp } from "@/lib/pwaUtils"
import { useAuth } from "@/lib/authStore"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Menu } from "lucide-react"

export function Header() {
  const [canInstall, setCanInstall] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
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
    setIsMobileMenuOpen(false)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <header className="bg-black border-b border-gray-800">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Link href={user?.role === 'admin' ? "/admin" : "/"} className="hover:opacity-80 transition-opacity">
            <Image
              src="/formula-pilates-logo.png"
              alt="Fórmula Pilates & Fitness"
              width={200}
              height={60}
              className="h-12 w-[200px]"
              priority
            />
          </Link>
          {user && user.role !== 'admin' && (
            <div className="hidden md:block ml-4">
              <Link href="/">
                <Button variant="ghost" className="text-white hover:text-red-400">
                  Página inicial
                </Button>
              </Link>
            </div>
          )}
        </div>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-4">
          {user?.role === 'admin' && (
            <Link href="/admin">
              <Button variant="ghost" className="text-white hover:text-red-400">
                Gerenciar Funcionários
              </Button>
            </Link>
          )}
          
          {user && user.role !== 'admin' && (
            <Link href="/report">
              <Button variant="ghost" className="text-white hover:text-red-400">
                Relatório
              </Button>
            </Link>
          )}

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

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="text-white hover:text-red-400">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[300px] bg-black border-gray-800 text-white p-6">
              <SheetHeader className="text-left space-y-2 pb-4 border-b border-gray-800">
                <SheetTitle className="text-white text-xl">Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col space-y-4 mt-8">
                {user && user.role !== 'admin' && (
                  <Link href="/" onClick={closeMobileMenu}>
                    <Button variant="ghost" className="w-full justify-start text-white hover:text-red-400">
                      Página inicial
                    </Button>
                  </Link>
                )}

                {user?.role === 'admin' && (
                  <Link href="/admin" onClick={closeMobileMenu}>
                    <Button variant="ghost" className="w-full justify-start text-white hover:text-red-400">
                      Gerenciar Funcionários
                    </Button>
                  </Link>
                )}
                
                {user && user.role !== 'admin' && (
                  <Link href="/report" onClick={closeMobileMenu}>
                    <Button variant="ghost" className="w-full justify-start text-white hover:text-red-400">
                      Relatório
                    </Button>
                  </Link>
                )}

                {isClient && canInstall && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      handleInstall()
                      closeMobileMenu()
                    }}
                    className="w-full justify-start border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                  >
                    Instalar App
                  </Button>
                )}

                {user && (
                  <div className="pt-4 border-t border-gray-800">
                    <div className="mb-4">
                      <span className="text-sm text-gray-300">
                        {user.email}
                      </span>
                    </div>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      onClick={handleLogout}
                    >
                      Sair
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
