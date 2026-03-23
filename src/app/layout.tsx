import type { Metadata } from 'next'
import './globals.css'
import SiteHeader from '@/components/layout/site-header'
import SiteFooter from '@/components/layout/site-footer'

export const metadata: Metadata = {
  title: 'Valo Marketplace',
  description: 'Marketplace premium de numismática',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-[#fcfbf7] text-slate-950 antialiased">
        <div className="relative flex min-h-screen flex-col">
          <SiteHeader />
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </div>
      </body>
    </html>
  )
}