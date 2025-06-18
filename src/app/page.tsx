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
  const { workLogs } = useAppStore()
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <Label>Data Inicial</Label>
              <div className="rounded-lg border shadow-sm p-3 bg-white">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  className="rounded-md"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Data Final</Label>
              <div className="rounded-lg border shadow-sm p-3 bg-white">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  className="rounded-md"
                />
              </div>
            </div>
          </div>
          <Button 
            onClick={calculatePeriodEarnings} 
            className="mt-4"
            disabled={!startDate || !endDate}
          >
            Calcular
          </Button>
          {periodEarnings !== null && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
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
