"use client"

import { useEffect, useState } from "react"
import { useSimpleStore } from "@/lib/simpleStore"

interface ClientWrapperProps {
  children: React.ReactNode
}

export function ClientWrapper({ children }: ClientWrapperProps) {
  const [hasMounted, setHasMounted] = useState(false)
  const isHydrated = useSimpleStore((state) => state.isHydrated)
  const loadFromStorage = useSimpleStore((state) => state.loadFromStorage)

  useEffect(() => {
    setHasMounted(true)
    // Load data from localStorage after mounting
    loadFromStorage()
  }, [loadFromStorage])

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
