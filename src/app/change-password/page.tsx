"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/authStore"
import { toast } from "sonner"

export default function ChangePasswordPage() {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const user = useAuth((state) => state.user)
  const updatePassword = useAuth((state) => state.updatePassword)

  useEffect(() => {
    // If user is not in first login or not authenticated, redirect to home
    if (!user?.isFirstLogin) {
      router.push("/")
    }
  }, [user, router])

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem")
      return
    }

    if (newPassword.length < 8) {
      toast.error("A senha deve ter pelo menos 8 caracteres")
      return
    }

    setIsLoading(true)
    
    try {
      await updatePassword(newPassword)
      toast.success("Senha alterada com sucesso!")
      router.push("/")
    } catch (error) {
      toast.error("Erro ao alterar a senha. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!user?.isFirstLogin) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center space-y-6">
          <Image
            src="/formula-pilates-logo.png"
            alt="Formula Pilates Logo"
            width={200}
            height={80}
            className="mb-4"
          />
          
          <h1 className="text-2xl font-semibold text-gray-900">
            Alterar Senha
          </h1>
          
          <p className="text-gray-600 text-center">
            Por favor, altere sua senha temporária para continuar.
          </p>
          
          <form onSubmit={handleChangePassword} className="w-full space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova Senha</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
                className="w-full"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Alterando..." : "Alterar Senha"}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  )
}
