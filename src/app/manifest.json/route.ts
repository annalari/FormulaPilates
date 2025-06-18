import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const headersList = headers()
  
  return new NextResponse(
    JSON.stringify({
      name: "Fórmula Pilates & Fitness",
      short_name: "Fórmula Pilates",
      description: "Aplicativo para registro de horas e experimentais - Fórmula Pilates & Fitness",
      start_url: "/",
      id: "/",
      display: "standalone",
      display_override: ["window-controls-overlay"],
      background_color: "#000000",
      theme_color: "#000000",
      icons: [
        {
          src: "/icon-192.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "any"
        },
        {
          src: "/icon-192.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "maskable"
        },
        {
          src: "/icon-512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any"
        },
        {
          src: "/icon-512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable"
        },
        {
          src: "/apple-touch-icon.png",
          sizes: "180x180",
          type: "image/png",
          purpose: "any"
        }
      ],
      orientation: "portrait",
      categories: ["productivity", "utilities", "health"],
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
