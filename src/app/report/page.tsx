import { ReportSheet } from "@/components/ReportSheet"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ReportPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Relatório Mensal</h2>
        <Button asChild variant="outline">
          <Link href="/">Voltar ao Registro</Link>
        </Button>
      </div>
      <ReportSheet />
    </div>
  )
}
