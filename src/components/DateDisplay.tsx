"use client"

import { formatDate } from "@/lib/timeUtils"

export function DateDisplay() {
  return <p className="text-gray-600 mt-1">{formatDate(new Date())}</p>
}
