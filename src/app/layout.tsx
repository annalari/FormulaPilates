import { Inter } from "next/font/google"
import { Header } from "@/components/Header"
import { metadata } from "./metadata"
import { viewport } from "./viewport"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export { metadata, viewport }

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
