import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const headersList = headers()
  
  return new NextResponse(
    JSON.stringify({
      name: "Fórmula Pilates",
      short_name: "Pilates",
      description: "Aplicativo para registro de horas e experimentais",
      start_url: "/",
      id: "/",
      display: "standalone",
      display_override: ["window-controls-overlay"],
      background_color: "#ffffff",
      theme_color: "#000000",
      icons: [
        {
          src: "/icon-192.svg",
          sizes: "192x192",
          type: "image/svg+xml",
          purpose: "any maskable"
        },
        {
          src: "/icon-512.svg",
          sizes: "512x512",
          type: "image/svg+xml",
          purpose: "any maskable"
        }
      ],
      orientation: "portrait",
      categories: ["productivity", "utilities"],
      prefer_related_applications: false,
      shortcuts: [
        {
          name: "Registrar Horas",
          url: "/",
          description: "Registrar horas trabalhadas"
        },
        {
          name: "Ver Relatório",
          url: "/report",
          description: "Visualizar relatório mensal"
        }
      ],
      share_target: {
        action: "/",
        method: "POST",
        enctype: "multipart/form-data",
        params: {
          title: "title",
          text: "text",
          url: "url",
          files: [
            {
              name: "media",
              accept: ["image/*"]
            }
          ]
        }
      }
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/manifest+json',
        'Cache-Control': 'no-store',
      },
    }
  )
}
