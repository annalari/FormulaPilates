"use client"

import { useState, useEffect, useMemo } from "react"
import dynamic from "next/dynamic"
import { HoursLogForm } from "@/components/HoursLogForm"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useSimpleStore } from "@/lib/simpleStore"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { formatCurrency, formatDate } from "@/lib/timeUtils"
import { calculateEarningsForPeriod } from "@/lib/pdfUtils"

const DateDisplay = dynamic(() => import("@/components/DateDisplay").then(mod => ({ default: mod.DateDisplay })), {
  ssr: false,
  loading: () => <p className="text-gray-600 mt-1">&nbsp;</p>
})

const PeriodDisplay = dynamic(() => import("@/components/PeriodDisplay").then(mod => ({ default: mod.PeriodDisplay })), {
  ssr: false,
  loading: () => <p className="text-sm text-gray-600 mb-1">&nbsp;</p>
})

export default function Home() {
  const workLogs = useSimpleStore((state) => state.workLogs)
  const clearAllData = useSimpleStore((state) => state.clearAllData)
  const [showEarningsCalculator, setShowEarningsCalculator] = useState(false)
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [periodEarnings, setPeriodEarnings] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const todayEarnings = useMemo(() => {
    if (!mounted) return 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayEnd = new Date(today)
    todayEnd.setHours(23, 59, 59, 999)
    
    return calculateEarningsForPeriod(workLogs, today, todayEnd)
  }, [workLogs, mounted])

  const calculatePeriodEarnings = () => {
    if (!startDate || !endDate) return
    const earnings = calculateEarningsForPeriod(workLogs, startDate, endDate)
    setPeriodEarnings(earnings)
  }

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Registro Diário</h2>
            <p className="text-gray-600 mt-1">&nbsp;</p>
          </div>
        </div>
        <Card className="p-6 bg-gradient-to-r from-orange-50 to-pink-50">
          <h3 className="text-lg font-medium mb-2">Ganhos de Hoje</h3>
          <p className="text-3xl font-bold text-gray-900">R$ 0,00</p>
        </Card>
        <div className="animate-pulse">
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Registro Diário</h2>
          <DateDisplay />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Button 
            variant="outline" 
            onClick={() => setShowEarningsCalculator(!showEarningsCalculator)}
          >
            Calcular Ganhos
          </Button>
          <Button asChild variant="outline">
            <Link href="/report">Ver Relatório</Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                Limpar Dados
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Limpar todos os dados?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. Isso removerá permanentemente todos os seus registros.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={clearAllData}>
                  Continuar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Card className="p-6 bg-gradient-to-r from-orange-50 to-pink-50">
        <h3 className="text-lg font-medium mb-2">Ganhos de Hoje</h3>
        <p className="text-3xl font-bold text-gray-900">{formatCurrency(todayEarnings)}</p>
      </Card>

      {showEarningsCalculator && (
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Calcular Ganhos por Período</h3>
          <div className="space-y-2">
            <Label className="text-center block">Selecione o Período</Label>
            <div className="rounded-lg border shadow-sm p-3 bg-white flex justify-center">
              <Calendar
                mode="range"
                selected={{
                  from: startDate,
                  to: endDate
                }}
                onSelect={(range) => {
                  setStartDate(range?.from)
                  setEndDate(range?.to)
                }}
                numberOfMonths={1}
                className="rounded-md"
                modifiers={{
                  today: new Date()
                }}
                modifiersStyles={{
                  today: {
                    fontWeight: "bold",
                    backgroundColor: "#ffcdd2"
                  }
                }}
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button 
              onClick={calculatePeriodEarnings} 
              disabled={!startDate || !endDate}
            >
              Calcular
            </Button>
            {(startDate || endDate) && (
              <Button 
                variant="outline"
                onClick={() => {
                  setStartDate(undefined)
                  setEndDate(undefined)
                  setPeriodEarnings(null)
                }}
              >
                Limpar Filtro
              </Button>
            )}
          </div>
          {periodEarnings !== null && startDate && endDate && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <PeriodDisplay startDate={startDate} endDate={endDate} />
              <p className="text-lg">
                Total no período: <span className="font-bold">{formatCurrency(periodEarnings)}</span>
              </p>
            </div>
          )}
        </Card>
      )}

      <HoursLogForm />
    </div>
  )
}
