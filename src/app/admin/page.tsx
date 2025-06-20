"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/authStore"
import { toast } from "sonner"

export default function AdminPage() {
  const [newUserEmail, setNewUserEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const user = useAuth((state) => state.user)
  const createUser = useAuth((state) => state.createUser)

  useEffect(() => {
    // If user is not admin, redirect to home
    if (!user || user.role !== 'admin') {
      router.push("/")
    }
  }, [user, router])

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newUserEmail) {
      toast.error("Por favor, insira um email")
      return
    }

    setIsLoading(true)
    
    try {
      await createUser(newUserEmail)
      toast.success("Usuário criado com sucesso! Um email será enviado com a senha temporária.")
      setNewUserEmail("")
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar usuário")
    } finally {
      setIsLoading(false)
    }
  }

  if (!user || user.role !== 'admin') {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">
          Gerenciamento de Usuários
        </h1>
        
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Criar Novo Usuário
            </h2>
            
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newUserEmail">Email do Novo Usuário</Label>
                <Input
                  id="newUserEmail"
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="novo.usuario@example.com"
                  required
                  className="w-full"
                />
              </div>
              
              <Button 
                type="submit" 
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Criando..." : "Criar Usuário"}
              </Button>
            </form>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800">Informação</h3>
            <p className="mt-1 text-sm text-blue-600">
              Ao criar um novo usuário, uma senha temporária será gerada e deverá ser enviada ao email informado.
              O usuário será solicitado a alterar esta senha no primeiro acesso.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
