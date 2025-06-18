"use client"

import { formatDate } from "@/lib/timeUtils"

interface PeriodDisplayProps {
  startDate: Date
  endDate: Date
}

export function PeriodDisplay({ startDate, endDate }: PeriodDisplayProps) {
  return (
    <p className="text-sm text-gray-600 mb-1">
      Período: {formatDate(startDate)} até {formatDate(endDate)}
    </p>
  )
}
