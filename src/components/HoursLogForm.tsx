"use client"

import { useState } from "react"
import { Card } from "./ui/card"
import { useSimpleStore } from "@/lib/simpleStore"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Switch } from "./ui/switch"
import { Label } from "./ui/label"
import { Separator } from "./ui/separator"
import { toast } from "sonner"
import { calculateHours, formatCurrency, formatTime, type WorkLog, type Experimental } from "@/lib/timeUtils"

export function HoursLogForm() {
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [experimentalTime, setExperimentalTime] = useState("")
  const [patientName, setPatientName] = useState("")
  const [closedPackage, setClosedPackage] = useState(false)
  const workLogs = useSimpleStore((state) => state.workLogs)
  const experimentals = useSimpleStore((state) => state.experimentals)
  const addWorkLog = useSimpleStore((state) => state.addWorkLog)
  const addExperimental = useSimpleStore((state) => state.addExperimental)

  const handleLogHours = () => {
    if (!startTime || !endTime) {
      showToast("error", "Por favor, preencha os horários de início e fim.")
      return
    }

    const now = new Date()
    const [startHours, startMinutes] = startTime.split(':').map(Number)
    const [endHours, endMinutes] = endTime.split(':').map(Number)
    
    if (isNaN(startHours) || isNaN(startMinutes) || isNaN(endHours) || isNaN(endMinutes)) {
      showToast("error", "Horários inválidos. Use o formato HH:mm.")
      return
    }
    
    const start = new Date(now)
    start.setHours(startHours, startMinutes, 0, 0)
    
    const end = new Date(now)
    end.setHours(endHours, endMinutes, 0, 0)

    if (end <= start) {
      showToast("error", "O horário de fim deve ser posterior ao horário de início.")
      return
    }

    const hours = calculateHours(start, end)
    const earnings = hours * 12

    const newLog: WorkLog = {
      id: Date.now().toString(),
      date: new Date(),
      startTime: start,
      endTime: end,
      hours,
      earnings,
    }

    try {
      addWorkLog(newLog)
      setStartTime("")
      setEndTime("")
      showToast("success", "Horas registradas com sucesso!")
    } catch (error) {
      showToast("error", "Erro ao salvar os dados. Tente novamente.")
    }
  }

  const showToast = (type: "success" | "error", message: string) => {
    try {
      if (type === "success") {
        toast.success(message)
      } else {
        toast.error(message)
      }
    } catch (error) {
      if (type === "error") {
        alert(message)
      }
    }
  }

  const handleAddExperimental = () => {
    if (!experimentalTime || !patientName) {
      showToast("error", "Por favor, preencha o horário e nome do paciente para o Experimental.")
      return
    }

    const [hours, minutes] = experimentalTime.split(':').map(Number)
    
    if (isNaN(hours) || isNaN(minutes)) {
      showToast("error", "Horário inválido. Use o formato HH:mm.")
      return
    }
    
    const time = new Date()
    time.setHours(hours, minutes, 0, 0)

    const newExperimental: Experimental = {
      id: Date.now().toString(),
      date: new Date(),
      time,
      patientName,
      closedPackage,
    }

    try {
      addExperimental(newExperimental)
      setExperimentalTime("")
      setPatientName("")
      setClosedPackage(false)
      showToast("success", "Experimental adicionado com sucesso!")
    } catch (error) {
      showToast("error", "Erro ao salvar os dados. Tente novamente.")
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card className="p-6 shadow-md hover:shadow-lg transition-shadow">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Registro de Horas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startTime">Hora de Início</Label>
            <Input
              id="startTime"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endTime">Hora de Fim</Label>
            <Input
              id="endTime"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>
        <Button onClick={handleLogHours} className="mt-4 w-full md:w-auto">
          Registrar Horas
        </Button>
      </Card>

      <Card className="p-6 shadow-md hover:shadow-lg transition-shadow">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Experimentais</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="experimentalTime">Horário</Label>
              <Input
                id="experimentalTime"
                type="time"
                value={experimentalTime}
                onChange={(e) => setExperimentalTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="patientName">Nome do Paciente</Label>
              <Input
                id="patientName"
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="closedPackage"
              checked={closedPackage}
              onCheckedChange={setClosedPackage}
            />
            <Label htmlFor="closedPackage">Fechou pacote?</Label>
          </div>
          <Button onClick={handleAddExperimental} className="w-full md:w-auto">
            Adicionar Experimental
          </Button>
        </div>
      </Card>

      {workLogs.length > 0 && (
        <Card className="p-6 shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Registros do Dia</h2>
          <div className="space-y-4">
            {workLogs.map((log) => (
              <div key={log.id} className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <p suppressHydrationWarning>Início: {formatTime(log.startTime)}</p>
                <p suppressHydrationWarning>Fim: {formatTime(log.endTime)}</p>
                <p suppressHydrationWarning>Total de Horas: {log.hours}</p>
                <p suppressHydrationWarning>Valor: {formatCurrency(log.earnings)}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {experimentals.length > 0 && (
        <Card className="p-6 shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Experimentais do Dia</h2>
          <div className="space-y-4">
            {experimentals.map((exp) => (
              <div key={exp.id} className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <p suppressHydrationWarning>Horário: {formatTime(exp.time)}</p>
                <p suppressHydrationWarning>Paciente: {exp.patientName}</p>
                <p suppressHydrationWarning>Fechou pacote: {exp.closedPackage ? "Sim" : "Não"}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
