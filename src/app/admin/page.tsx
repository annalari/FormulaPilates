"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/authStore"
import { toast } from "sonner"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

export default function AdminPage() {
  const [newUserEmail, setNewUserEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const router = useRouter()
  const user = useAuth((state) => state.user)
  const createUser = useAuth((state) => state.createUser)
  const deleteUser = useAuth((state) => state.deleteUser)
  const getAllUsers = useAuth((state) => state.getAllUsers)

  useEffect(() => {
    // If user is not admin, redirect to home
    if (!user || user.role !== 'admin') {
      router.push("/")
      return
    }

    // Load users list
    const loadUsers = async () => {
      const usersList = await getAllUsers()
      setUsers(usersList || [])
    }
    loadUsers()
  }, [user, router, getAllUsers])

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newUserEmail) {
      toast.error("Por favor, insira um email")
      return
    }

    setIsLoading(true)
    
    try {
      await createUser(newUserEmail)
      toast.success("Usuário criado com sucesso! Um email foi enviado com as instruções de acesso.")
      setNewUserEmail("")
      // Refresh users list
      const usersList = await getAllUsers()
      setUsers(usersList || [])
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar usuário")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId)
      toast.success("Usuário removido com sucesso!")
      // Refresh users list
      const usersList = await getAllUsers()
      setUsers(usersList || [])
    } catch (error: any) {
      toast.error(error.message || "Erro ao remover usuário")
    }
  }

  const handleUserClick = (userId: string) => {
    // Navigate to user's dashboard
    router.push(`/funcionario/${userId}`)
  }

  if (!user || user.role !== 'admin') {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">
          Gerenciar Funcionários
        </h1>
        
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Criar Novo Funcionário
            </h2>
            
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newUserEmail">Email do Novo Funcionário</Label>
                <Input
                  id="newUserEmail"
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="novo.funcionario@example.com"
                  required
                  className="w-full"
                />
              </div>
              
              <Button 
                type="submit" 
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Criando..." : "Criar Funcionário"}
              </Button>
            </form>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800">Como funciona</h3>
            <div className="mt-2 text-sm text-blue-600 space-y-2">
              <p>• Uma senha temporária será gerada automaticamente</p>
              <p>• Um email será enviado para o endereço informado com:</p>
              <div className="ml-4 space-y-1">
                <p>- Credenciais de acesso (email e senha temporária)</p>
                <p>- Link para acessar o sistema</p>
                <p>- Instruções para alterar a senha</p>
              </div>
              <p>• O funcionário deve alterar a senha no primeiro acesso</p>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Funcionários e Ganhos Mensais
            </h2>
            <div className="bg-white rounded-lg border">
              <div className="grid grid-cols-4 gap-4 p-4 font-medium text-sm text-gray-500 border-b">
                <div>Funcionário</div>
                <div>Status</div>
                <div>Ganhos Mensais</div>
                <div>Ações</div>
              </div>
              <div className="divide-y">
                {users.map((user) => (
                  <div key={user.id} className="grid grid-cols-4 gap-4 p-4 items-center hover:bg-gray-50">
                    <div 
                      className="flex items-center space-x-3 cursor-pointer"
                      onClick={() => handleUserClick(user.id)}
                    >
                      <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-medium">
                        {user.email[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{user.email}</div>
                        <div className="text-sm text-gray-500">ID: {user.id}</div>
                      </div>
                    </div>
                    <div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {user.isFirstLogin ? 'Pendente' : 'Ativo'}
                      </span>
                    </div>
                    <div className="text-gray-900 font-medium">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'EUR' }).format(user.monthlyEarnings || 0)}
                    </div>
                    <div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            Remover
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remover funcionário?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. O funcionário perderá acesso ao sistema e todos os seus registros serão removidos.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              Remover
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
