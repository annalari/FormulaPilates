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
  const loadFromStorage = useSimpleStore((state) => state.loadFromStorage)
  const user = useAuth((state) => state.user)
  const isAuthenticated = useAuth((state) => state.isAuthenticated)
  const initializeAuth = useAuth((state) => state.initializeAuth)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setHasMounted(true)
    // Initialize stores
    loadFromStorage()
    initializeAuth()
  }, [loadFromStorage, initializeAuth])

  useEffect(() => {
    if (!hasMounted) return

    // Handle authentication redirects
    const isLoginPage = pathname === '/login'
    const isChangePasswordPage = pathname === '/change-password'
    const isPublicPath = isLoginPage || isChangePasswordPage

    if (!isAuthenticated && !isPublicPath) {
      router.push('/login')
    } else if (isAuthenticated && isLoginPage) {
      router.push('/')
    } else if (user?.isFirstLogin && !isChangePasswordPage) {
      router.push('/change-password')
    }
  }, [isAuthenticated, user, pathname, router, hasMounted])

  if (!hasMounted) {
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
