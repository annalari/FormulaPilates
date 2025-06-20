"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/authStore"
import { toast } from "sonner"

export default function FuncionarioPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [userData, setUserData] = useState<any>(null)
  const [workLogs, setWorkLogs] = useState<any[]>([])
  const [monthlyEarnings, setMonthlyEarnings] = useState(0)
  
  const params = useParams()
  const router = useRouter()
  const user = useAuth((state) => state.user)
  const getUserWorkLogs = useAuth((state) => state.getUserWorkLogs)
  const calculateUserMonthlyEarnings = useAuth((state) => state.calculateUserMonthlyEarnings)
  const getAllUsers = useAuth((state) => state.getAllUsers)

  useEffect(() => {
    // If user is not admin, redirect to home
    if (!user || user.role !== 'admin') {
      router.push("/")
      return
    }

    const loadUserData = async () => {
      try {
        setIsLoading(true)
        const users = await getAllUsers()
        const userData = users.find(u => u.id === params.id)
        if (!userData) {
          toast.error("Funcionário não encontrado")
          router.push("/admin")
          return
        }
        setUserData(userData)

        // Load work logs
        const logs = await getUserWorkLogs(params.id as string)
        setWorkLogs(logs)

        // Calculate monthly earnings
        const earnings = await calculateUserMonthlyEarnings(params.id as string)
        setMonthlyEarnings(earnings)
      } catch (error: any) {
        toast.error(error.message || "Erro ao carregar dados do funcionário")
        router.push("/admin")
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [user, router, params.id, getAllUsers, getUserWorkLogs, calculateUserMonthlyEarnings])

  if (!user || user.role !== 'admin' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados...</p>
        </div>
      </div>
    )
  }

  if (!userData) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Dashboard do Funcionário
        </h1>
        <Button
          variant="outline"
          onClick={() => router.push("/admin")}
        >
          Voltar
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-lg font-medium mb-4">Informações do Funcionário</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500">Email</label>
              <p className="font-medium">{userData.email}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">ID</label>
              <p className="font-medium">{userData.id}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Status</label>
              <p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  userData.isFirstLogin 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {userData.isFirstLogin ? 'Pendente' : 'Ativo'}
                </span>
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-medium mb-4">Ganhos</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500">Ganhos do Mês Atual</label>
              <p className="text-3xl font-bold text-gray-900">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'EUR' }).format(monthlyEarnings)}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Total de Horas Registradas</label>
              <p className="font-medium">{workLogs.length} registros</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="mt-6 p-6">
        <h2 className="text-lg font-medium mb-4">Últimos Registros</h2>
        {workLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Horário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ganhos
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {workLogs.map((log: any) => (
                  <tr key={log.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(log.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(log.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - 
                      {new Date(log.endTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'EUR' }).format(log.earnings)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            Nenhum registro encontrado
          </p>
        )}
      </Card>
    </div>
  )
}
