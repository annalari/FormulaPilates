"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogOverlay, DialogTitle, DialogDescription, DialogClose, DialogTrigger } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { WorkLog } from "@/lib/timeUtils"
import { calculateHours, formatTime } from "@/lib/timeUtils"

interface EditWorkLogModalProps {
  isOpen: boolean
  onClose: () => void
  workLog: WorkLog | null
  onSave: (updatedLog: WorkLog) => void
}

export function EditWorkLogModal({ isOpen, onClose, workLog, onSave }: EditWorkLogModalProps) {
  const [date, setDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")

  useEffect(() => {
    if (workLog) {
      setDate(workLog.date.toISOString().substring(0, 10))
      setStartTime(formatTime(workLog.startTime))
      setEndTime(formatTime(workLog.endTime))
    }
  }, [workLog])

  const handleSave = () => {
    if (!workLog) return

    const [startHours, startMinutes] = startTime.split(":").map(Number)
    const [endHours, endMinutes] = endTime.split(":").map(Number)

    if (isNaN(startHours) || isNaN(startMinutes) || isNaN(endHours) || isNaN(endMinutes)) {
      alert("Horários inválidos. Use o formato HH:mm.")
      return
    }

    const start = new Date(date)
    start.setHours(startHours, startMinutes, 0, 0)

    const end = new Date(date)
    end.setHours(endHours, endMinutes, 0, 0)

    if (end <= start) {
      alert("O horário de fim deve ser posterior ao horário de início.")
      return
    }

    const hours = calculateHours(start, end)
    const earnings = hours * 12

    const updatedLog: WorkLog = {
      ...workLog,
      date: new Date(date),
      startTime: start,
      endTime: end,
      hours,
      earnings,
    }

    onSave(updatedLog)
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogOverlay />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Registro de Horas</DialogTitle>
          <DialogDescription>Edite os detalhes do registro de horas abaixo.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="editDate">Data</Label>
            <Input
              id="editDate"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="editStartTime">Hora de Início</Label>
            <Input
              id="editStartTime"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="editEndTime">Hora de Fim</Label>
            <Input
              id="editEndTime"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave}>Salvar</Button>
        </DialogFooter>
        <DialogClose className="sr-only" />
      </DialogContent>
    </Dialog>
  )
}
