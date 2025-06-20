"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useSimpleStore } from "@/lib/simpleStore"
import { useAuth } from "@/lib/authStore"

interface ClientWrapperProps {
  children: React.ReactNode
}

export function ClientWrapper({ children }: ClientWrapperProps) {
  const [hasMounted, setHasMounted] = useState(false)
  const isHydrated = useSimpleStore((state) => state.isHydrated)
  const loadFromStorage = useSimpleStore((state) => state.loadFromStorage)
  const user = useAuth((state) => state.user)
  const isAuthenticated = useAuth((state) => state.isAuthenticated)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setHasMounted(true)
    // Load data from localStorage after mounting
    loadFromStorage()
  }, [loadFromStorage])

  useEffect(() => {
    if (!hasMounted) return

    // Handle authentication redirects
    const isLoginPage = pathname === '/login'
    const isChangePasswordPage = pathname === '/change-password'
    const isPublicPath = isLoginPage || isChangePasswordPage

    if (!isAuthenticated && !isPublicPath) {
      router.push('/login')
    } else if (isAuthenticated && isLoginPage) {
      // Redirect admin to /admin, regular users to /
      if (user?.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/')
      }
    } else if (user?.isFirstLogin && !isChangePasswordPage) {
      router.push('/change-password')
    }
  }, [isAuthenticated, user, pathname, router, hasMounted])

  if (!hasMounted || !isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
