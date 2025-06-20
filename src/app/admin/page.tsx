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
import { Trash2, User, Plus, DollarSign, Users } from "lucide-react"
import { formatCurrency } from "@/lib/timeUtils"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export default function AdminPage() {
  const [newUserEmail, setNewUserEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [funcionarios, setFuncionarios] = useState<any[]>([])
  const [funcionariosWithEarnings, setFuncionariosWithEarnings] = useState<any[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const user = useAuth((state) => state.user)
  const createUser = useAuth((state) => state.createUser)
  const getAllUsers = useAuth((state) => state.getAllUsers)
  const deleteUser = useAuth((state) => state.deleteUser)
  const calculateUserMonthlyEarnings = useAuth((state) => state.calculateUserMonthlyEarnings)

  useEffect(() => {
    setMounted(true)
    // If user is not admin, redirect to home
    if (!user || user.role !== 'admin') {
      router.push("/")
    } else {
      loadFuncionarios()
    }
  }, [user, router])

  const loadFuncionarios = () => {
    try {
      const users = getAllUsers()
      setFuncionarios(users)
      
      // Calculate monthly earnings for each funcionario
      const usersWithEarnings = users.map(funcionario => {
        const monthlyEarnings = calculateUserMonthlyEarnings(funcionario.id)
        return {
          ...funcionario,
          monthlyEarnings
        }
      })
      
      setFuncionariosWithEarnings(usersWithEarnings)
    } catch (error) {
      console.error("Error loading users:", error)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newUserEmail) {
      toast.error("Por favor, insira um email")
      return
    }

    setIsLoading(true)
    
    try {
      await createUser(newUserEmail)
      toast.success("Funcionário criado com sucesso! Um email será enviado com a senha temporária.")
      setNewUserEmail("")
      setShowCreateForm(false)
      
      // Refresh funcionarios list
      loadFuncionarios()
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar funcionário")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    setIsDeleting(userId)
    
    try {
      await deleteUser(userId)
      toast.success(`Funcionário ${userEmail} removido com sucesso!`)
      
      // Refresh funcionarios list
      loadFuncionarios()
    } catch (error: any) {
      toast.error(error.message || "Erro ao remover funcionário")
    } finally {
      setIsDeleting(null)
    }
  }

  const totalMonthlyEarnings = funcionariosWithEarnings.reduce((total, funcionario) => {
    return total + funcionario.monthlyEarnings
  }, 0)

  const activeFuncionarios = funcionariosWithEarnings.filter(f => !f.isFirstLogin)

  if (!user || user.role !== 'admin') {
    return null
  }

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-semibold text-gray-900">
            Dashboard Administrativo
          </h1>
          
          <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
            <DialogTrigger asChild>
              <Button className="bg-red-600 hover:bg-red-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Funcionário
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Funcionário</DialogTitle>
                <DialogDescription>
                  Insira o email do novo funcionário. Uma senha temporária será gerada.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newUserEmail">Email do Funcionário</Label>
                  <Input
                    id="newUserEmail"
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="funcionario@example.com"
                    required
                  />
                </div>
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-red-600 hover:bg-red-700 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? "Criando..." : "Criar Funcionário"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-600">Total Funcionários</p>
                <p className="text-2xl font-bold text-blue-900">{funcionarios.length}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="flex items-center">
              <User className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-green-600">Funcionários Ativos</p>
                <p className="text-2xl font-bold text-green-900">{activeFuncionarios.length}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-r from-orange-50 to-red-50">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-orange-600">Total Mensal</p>
                <p className="text-2xl font-bold text-orange-900">{formatCurrency(totalMonthlyEarnings)}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Funcionarios Table/Cards */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Funcionários e Ganhos Mensais
          </h2>
          
          {funcionariosWithEarnings.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <p className="text-lg font-medium">Nenhum funcionário cadastrado</p>
              <p className="text-sm">Adicione o primeiro funcionário para começar.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Funcionário</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900">Ganhos Mensais</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {funcionariosWithEarnings.map((funcionario) => (
                      <tr key={funcionario.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{funcionario.email}</p>
                              <p className="text-sm text-gray-500">ID: {funcionario.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            funcionario.isFirstLogin 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {funcionario.isFirstLogin ? "Pendente" : "Ativo"}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="text-lg font-semibold text-gray-900">
                            {formatCurrency(funcionario.monthlyEarnings)}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                disabled={isDeleting === funcionario.id}
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                {isDeleting === funcionario.id ? "Removendo..." : "Remover"}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remover Funcionário</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja remover o funcionário <strong>{funcionario.email}</strong>?
                                  Esta ação não pode ser desfeita e todos os dados do funcionário serão perdidos.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteUser(funcionario.id, funcionario.email)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Remover
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {funcionariosWithEarnings.map((funcionario) => (
                  <div key={funcionario.id} className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-red-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{funcionario.email}</p>
                        <p className="text-sm text-gray-500">ID: {funcionario.id}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          funcionario.isFirstLogin 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {funcionario.isFirstLogin ? "Pendente" : "Ativo"}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Ganhos Mensais</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatCurrency(funcionario.monthlyEarnings)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t border-gray-200">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-red-600 hover:text-red-700"
                            disabled={isDeleting === funcionario.id}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {isDeleting === funcionario.id ? "Removendo..." : "Remover Funcionário"}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remover Funcionário</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja remover o funcionário <strong>{funcionario.email}</strong>?
                              Esta ação não pode ser desfeita e todos os dados do funcionário serão perdidos.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteUser(funcionario.id, funcionario.email)}
                              className="bg-red-600 hover:bg-red-700"
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
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
