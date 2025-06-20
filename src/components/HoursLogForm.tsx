"use client"

import { useState } from "react"
import { Card } from "./ui/card"
import { useSimpleStore } from "@/lib/simpleStore"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Switch } from "./ui/switch"
import { Label } from "./ui/label"
import { Separator } from "./ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogOverlay, DialogTitle, DialogDescription, DialogClose } from "./ui/dialog"
import { Calendar } from "./ui/calendar"
import { toast } from "sonner"
import { calculateHours, formatCurrency, formatTime, type WorkLog, type Experimental } from "@/lib/timeUtils"
import { EditWorkLogModal } from "./EditWorkLogModal"
import { useAuth } from "@/lib/authStore"

interface HoursLogFormProps {
  selectedDay?: Date
  onDateChange?: (date: Date) => void
  startDate?: Date
  endDate?: Date
  onDateRangeChange?: (startDate: Date | undefined, endDate: Date | undefined) => void
}

export function HoursLogForm({ 
  selectedDay = new Date(), 
  onDateChange, 
  startDate, 
  endDate, 
  onDateRangeChange 
}: HoursLogFormProps) {
  const [date, setDate] = useState(() => {
    const today = new Date()
    return today.toISOString().substring(0, 10) // yyyy-mm-dd
  })
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [experimentalTime, setExperimentalTime] = useState("")
  const [patientName, setPatientName] = useState("")
  const [closedPackage, setClosedPackage] = useState(false)
  const [editingLog, setEditingLog] = useState<WorkLog | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [filterStartDate, setFilterStartDate] = useState<Date | undefined>(startDate)
  const [filterEndDate, setFilterEndDate] = useState<Date | undefined>(endDate)

  const workLogs = useSimpleStore((state) => state.workLogs)
  const experimentals = useSimpleStore((state) => state.experimentals)
  const addWorkLog = useSimpleStore((state) => state.addWorkLog)
  const updateWorkLog = useSimpleStore((state) => state.updateWorkLog)
  const deleteWorkLog = useSimpleStore((state) => state.deleteWorkLog)
  const addExperimental = useSimpleStore((state) => state.addExperimental)
  const user = useAuth((state) => state.user)

  const resetForm = () => {
    setDate(new Date().toISOString().substring(0, 10))
    setStartTime("")
    setEndTime("")
    setEditingLog(null)
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

  const handleLogHours = () => {
    if (!startTime || !endTime || !date) {
      showToast("error", "Por favor, preencha a data e os horários de início e fim.")
      return
    }

    const [startHours, startMinutes] = startTime.split(':').map(Number)
    const [endHours, endMinutes] = endTime.split(':').map(Number)

    if (isNaN(startHours) || isNaN(startMinutes) || isNaN(endHours) || isNaN(endMinutes)) {
      showToast("error", "Horários inválidos. Use o formato HH:mm.")
      return
    }

    const start = new Date(date)
    start.setHours(startHours, startMinutes, 0, 0)

    const end = new Date(date)
    end.setHours(endHours, endMinutes, 0, 0)

    if (end <= start) {
      showToast("error", "O horário de fim deve ser posterior ao horário de início.")
      return
    }

    const hours = calculateHours(start, end)
    const earnings = hours * 12

    const newLog: WorkLog = {
      id: editingLog?.id || Date.now().toString(),
      userId: user?.id || '',
      date: new Date(date),
      startTime: start,
      endTime: end,
      hours,
      earnings,
    }

    try {
      if (editingLog) {
        updateWorkLog(newLog)
        showToast("success", "Registro atualizado com sucesso!")
      } else {
        addWorkLog(newLog)
        showToast("success", "Horas registradas com sucesso!")
      }
      resetForm()
    } catch (error) {
      showToast("error", "Erro ao salvar os dados. Tente novamente.")
    }
  }

  const handleEdit = (log: WorkLog) => {
    setEditingLog(log)
    setIsEditModalOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este registro?")) {
      deleteWorkLog(id)
      showToast("success", "Registro excluído com sucesso!")
      if (editingLog?.id === id) {
        resetForm()
        setIsEditModalOpen(false)
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

  const handleFilterSave = () => {
    if (onDateRangeChange) {
      onDateRangeChange(filterStartDate, filterEndDate)
    }
    setIsFilterModalOpen(false)
    if (filterStartDate && filterEndDate) {
      showToast("success", "Filtro de período aplicado com sucesso!")
    } else if (filterStartDate || filterEndDate) {
      showToast("success", "Filtro aplicado com sucesso!")
    } else {
      showToast("success", "Filtro removido!")
    }
  }

  const clearFilter = () => {
    setFilterStartDate(undefined)
    setFilterEndDate(undefined)
    if (onDateRangeChange) {
      onDateRangeChange(undefined, undefined)
    }
    setIsFilterModalOpen(false)
    showToast("success", "Filtro removido!")
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card className="p-6 shadow-md hover:shadow-lg transition-shadow">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">{editingLog ? "Editar Registro de Horas" : "Registro de Horas"}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
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
          {editingLog ? "Atualizar Registro" : "Registrar Horas"}
        </Button>
        {editingLog && (
          <Button onClick={() => { resetForm(); setIsEditModalOpen(false) }} variant="outline" className="mt-2 w-full md:w-auto">
            Cancelar
          </Button>
        )}
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {startDate && endDate 
                ? `Registros do Período - ${startDate.toLocaleDateString('pt-PT')} a ${endDate.toLocaleDateString('pt-PT')}`
                : startDate 
                ? `Registros a partir de ${startDate.toLocaleDateString('pt-PT')}`
                : endDate
                ? `Registros até ${endDate.toLocaleDateString('pt-PT')}`
                : `Registros do Dia - ${selectedDay.toLocaleDateString('pt-PT')}`
              }
            </h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsFilterModalOpen(true)}
            >
              Filtrar
            </Button>
          </div>
          <div className="space-y-4">
            {workLogs.filter(log => {
              // First filter by current user
              if (log.userId !== user?.id) {
                return false
              }
              
              const logDate = new Date(log.date)
              
              // If we have date range filtering
              if (startDate || endDate) {
                if (startDate && endDate) {
                  return logDate >= startDate && logDate <= endDate
                } else if (startDate) {
                  return logDate >= startDate
                } else if (endDate) {
                  return logDate <= endDate
                }
              }
              
              // Default single day filtering
              return logDate.toDateString() === selectedDay.toDateString()
            }).map((log) => (
              <div key={log.id} className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors flex justify-between items-center">
                <div>
                  <p suppressHydrationWarning>Data: {log.date.toISOString().substring(0, 10)}</p>
                  <p suppressHydrationWarning>Início: {formatTime(log.startTime)}</p>
                  <p suppressHydrationWarning>Fim: {formatTime(log.endTime)}</p>
                  <p suppressHydrationWarning>Total de Horas: {log.hours}</p>
                  <p suppressHydrationWarning>Valor: {formatCurrency(log.earnings)}</p>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(log)}>Editar</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(log.id)}>Excluir</Button>
                </div>
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

      <EditWorkLogModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        workLog={editingLog}
        onSave={(updatedLog) => {
          updateWorkLog(updatedLog)
          setIsEditModalOpen(false)
          showToast("success", "Registro atualizado com sucesso!")
          resetForm()
        }}
      />

      <Dialog open={isFilterModalOpen} onOpenChange={setIsFilterModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Filtrar por Período</DialogTitle>
            <DialogDescription>
              Selecione um período para visualizar os registros. Você pode escolher apenas uma data de início, apenas uma data de fim, ou ambas para definir um período completo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border shadow-sm p-3 bg-white flex justify-center">
              <Calendar
                mode="range"
                selected={{
                  from: filterStartDate,
                  to: filterEndDate
                }}
                onSelect={(range) => {
                  setFilterStartDate(range?.from)
                  setFilterEndDate(range?.to)
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
            {(filterStartDate || filterEndDate) && (
              <div className="p-3 bg-gray-50 rounded-lg text-sm">
                <p className="font-medium">Período selecionado:</p>
                {filterStartDate && filterEndDate ? (
                  <p>De {filterStartDate.toLocaleDateString('pt-PT')} até {filterEndDate.toLocaleDateString('pt-PT')}</p>
                ) : filterStartDate ? (
                  <p>A partir de {filterStartDate.toLocaleDateString('pt-PT')}</p>
                ) : filterEndDate ? (
                  <p>Até {filterEndDate.toLocaleDateString('pt-PT')}</p>
                ) : null}
              </div>
            )}
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setIsFilterModalOpen(false)}>
              Cancelar
            </Button>
            {(filterStartDate || filterEndDate) && (
              <Button variant="outline" onClick={clearFilter}>
                Limpar Filtro
              </Button>
            )}
            <Button onClick={handleFilterSave}>
              Aplicar Filtro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
