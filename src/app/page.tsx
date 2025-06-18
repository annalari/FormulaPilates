"use client"

import { useState, useEffect } from "react"
import { HoursLogForm } from "@/components/HoursLogForm"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useAppStore } from "@/lib/store"
import { formatCurrency, formatDate } from "@/lib/timeUtils"
import { calculateEarningsForPeriod } from "@/lib/pdfUtils"

export default function Home() {
  const { workLogs, isHydrated } = useAppStore()
  const [showEarningsCalculator, setShowEarningsCalculator] = useState(false)
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [periodEarnings, setPeriodEarnings] = useState<number | null>(null)
  const [currentDate, setCurrentDate] = useState<string>("")
  const [todayEarnings, setTodayEarnings] = useState(0)

  useEffect(() => {
    // Set current date on client side to avoid hydration mismatch
    setCurrentDate(formatDate(new Date()))
    
    // Calculate today's earnings
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayEnd = new Date(today)
    todayEnd.setHours(23, 59, 59, 999)
    
    setTodayEarnings(calculateEarningsForPeriod(workLogs, today, todayEnd))
  }, [workLogs])

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
      </div>
    )
  }

  const calculatePeriodEarnings = () => {
    if (!startDate || !endDate) return
    const earnings = calculateEarningsForPeriod(workLogs, startDate, endDate)
    setPeriodEarnings(earnings)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Registro Diário</h2>
          <p className="text-gray-600 mt-1">{currentDate}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowEarningsCalculator(!showEarningsCalculator)}
          >
            Calcular Ganhos
          </Button>
          <Button asChild variant="outline">
            <Link href="/report">Ver Relatório</Link>
          </Button>
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
              <p className="text-sm text-gray-600 mb-1">
                Período: {formatDate(startDate)} até {formatDate(endDate)}
              </p>
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
