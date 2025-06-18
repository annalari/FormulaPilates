import { jsPDF } from 'jspdf'
import { WorkLog, Experimental, formatDate, formatTime, formatCurrency } from './timeUtils'

export const generatePDF = (
  workLogs: WorkLog[],
  experimentals: Experimental[],
  startDate: Date | null,
  endDate: Date | null
): void => {
  if (!startDate || !endDate || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    console.error('Invalid date range for PDF generation')
    return
  }
  const doc = new jsPDF()
  
  // Title
  doc.setFontSize(20)
  doc.text('Relatório de Horas', 20, 20)
  
  // Period
  doc.setFontSize(12)
  doc.text(`Período: ${formatDate(startDate)} - ${formatDate(endDate)}`, 20, 30)
  
  // Work Hours
  doc.setFontSize(16)
  doc.text('Horas Trabalhadas', 20, 45)
  
  let yPos = 55
  const totalHours = workLogs.reduce((acc, log) => acc + log.hours, 0)
  
  workLogs.forEach((log) => {
    doc.setFontSize(10)
    doc.text(`${formatDate(log.date)} - ${formatTime(log.startTime)} até ${formatTime(log.endTime)} - ${log.hours}h`, 20, yPos)
    yPos += 7
  })
  
  doc.setFontSize(12)
  doc.text(`Total de Horas: ${totalHours}`, 20, yPos + 10)
  
  // Experimental Sessions
  if (experimentals.length > 0) {
    yPos += 30
    doc.setFontSize(16)
    doc.text('Sessões Experimentais', 20, yPos)
    
    yPos += 10
    experimentals.forEach((exp) => {
      doc.setFontSize(10)
      doc.text(`${formatDate(exp.date)} - ${formatTime(exp.time)} - ${exp.patientName} - Pacote: ${exp.closedPackage ? 'Sim' : 'Não'}`, 20, yPos)
      yPos += 7
    })
  }
  
  // Save the PDF
  doc.save(`relatorio-${formatDate(startDate)}-${formatDate(endDate)}.pdf`)
}

export const calculateEarningsForPeriod = (
  workLogs: WorkLog[],
  startDate: Date | null,
  endDate: Date | null
): number => {
  if (!startDate || !endDate || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return 0
  }

  // Set time to start and end of day for proper comparison
  const start = new Date(startDate)
  start.setHours(0, 0, 0, 0)
  
  const end = new Date(endDate)
  end.setHours(23, 59, 59, 999)

  return workLogs
    .filter(log => {
      const logDate = new Date(log.date)
      logDate.setHours(0, 0, 0, 0) // Normalize time for date comparison
      return logDate >= start && logDate <= end
    })
    .reduce((total, log) => total + log.earnings, 0)
}
