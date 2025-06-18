"use client"

import { useState, useEffect } from "react"
import { Card } from "./ui/card"
import { useSimpleStore } from "@/lib/simpleStore"
import { Button } from "./ui/button"
import { Calendar } from "./ui/calendar"
import { Label } from "./ui/label"
import { Alert } from "./ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { formatDate, formatTime, formatCurrency, isValidDate, type WorkLog, type Experimental } from "@/lib/timeUtils"
import { generatePDF } from "@/lib/pdfUtils"

export function ReportSheet() {
  const workLogs = useSimpleStore((state) => state.workLogs)
  const experimentals = useSimpleStore((state) => state.experimentals)
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [error, setError] = useState("")
  const [filteredLogs, setFilteredLogs] = useState<WorkLog[]>([])
  const [filteredExperimentals, setFilteredExperimentals] = useState<Experimental[]>([])
  const [showReport, setShowReport] = useState(false)

  const generateReport = () => {
    if (!startDate || !endDate || !isValidDate(startDate) || !isValidDate(endDate)) {
      setError("Por favor, selecione datas válidas para o período.")
      return
    }

    if (endDate < startDate) {
      setError("A data final deve ser posterior à data inicial.")
      return
    }

    // Normalize dates to start and end of day
    const start = new Date(startDate)
    start.setHours(0, 0, 0, 0)
    
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999)

    const filtered = workLogs.filter((log) => {
      try {
        const logDate = new Date(log.date)
        logDate.setHours(0, 0, 0, 0)
        return logDate >= start && logDate <= end
      } catch {
        return false
      }
    })

    const filteredExp = experimentals.filter((exp) => {
      try {
        const expDate = new Date(exp.date)
        expDate.setHours(0, 0, 0, 0)
        return expDate >= start && expDate <= end
      } catch {
        return false
      }
    })

    setFilteredLogs(filtered)
    setFilteredExperimentals(filteredExp)
    setShowReport(true)
    setError("")
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card className="p-6 shadow-md hover:shadow-lg transition-shadow">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Gerar Relatório</h2>
        <div className="space-y-2">
          <Label className="text-gray-700 text-center block">Selecione o Período</Label>
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
        <div className="flex flex-wrap gap-2 mt-6">
          <Button onClick={generateReport} className="w-full md:w-auto">
            Gerar Relatório
          </Button>
          {(startDate || endDate) && (
            <Button 
              variant="outline"
              onClick={() => {
                setStartDate(undefined)
                setEndDate(undefined)
                setShowReport(false)
                setFilteredLogs([])
                setFilteredExperimentals([])
                setError("")
              }}
              className="w-full md:w-auto"
            >
              Limpar Filtro
            </Button>
          )}
          {showReport && (
            <Button 
              onClick={() => generatePDF(filteredLogs, filteredExperimentals, startDate!, endDate!)}
              variant="outline"
              className="w-full md:w-auto"
            >
              Baixar PDF
            </Button>
          )}
        </div>
      </Card>

      {error && (
        <Alert variant="destructive" className="border border-red-200">
          {error}
        </Alert>
      )}

      {showReport && (
        <Card className="p-6 shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-6 text-gray-800" suppressHydrationWarning>
            Relatório: {startDate && formatDate(startDate)} - {endDate && formatDate(endDate)}
          </h2>

          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-medium mb-4 text-gray-700">Horas Trabalhadas</h3>
              <div className="rounded-lg border shadow-sm overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold">Data</TableHead>
                      <TableHead className="font-semibold">Início</TableHead>
                      <TableHead className="font-semibold">Fim</TableHead>
                      <TableHead className="font-semibold">Total de Horas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id} className="hover:bg-gray-50 transition-colors">
                        <TableCell suppressHydrationWarning>{formatDate(log.date)}</TableCell>
                        <TableCell suppressHydrationWarning>{formatTime(log.startTime)}</TableCell>
                        <TableCell suppressHydrationWarning>{formatTime(log.endTime)}</TableCell>
                        <TableCell suppressHydrationWarning>{log.hours}</TableCell>
                      </TableRow>
                    ))}
                    {filteredLogs.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-gray-500 py-4">
                          Nenhum registro encontrado para o período selecionado
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              {filteredLogs.length > 0 && (
                <p className="mt-4 font-medium text-gray-700">
                  Total de Horas: {filteredLogs.reduce((acc, log) => acc + log.hours, 0)}
                </p>
              )}
            </div>

            {filteredExperimentals.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-4 text-gray-700">Experimentais</h3>
                <div className="rounded-lg border shadow-sm overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-semibold">Data</TableHead>
                        <TableHead className="font-semibold">Horário</TableHead>
                        <TableHead className="font-semibold">Paciente</TableHead>
                        <TableHead className="font-semibold">Fechou Pacote</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredExperimentals.map((exp) => (
                        <TableRow key={exp.id} className="hover:bg-gray-50 transition-colors">
                          <TableCell suppressHydrationWarning>{formatDate(exp.date)}</TableCell>
                          <TableCell suppressHydrationWarning>{formatTime(exp.time)}</TableCell>
                          <TableCell suppressHydrationWarning>{exp.patientName}</TableCell>
                          <TableCell suppressHydrationWarning>{exp.closedPackage ? "Sim" : "Não"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
