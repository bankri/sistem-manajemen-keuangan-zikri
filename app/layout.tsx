import React from "react"
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import './globals.css'

const _geist = Geist({ subsets: ['latin'] })
const _geistMono = Geist_Mono({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Kelola Keuangan Pribadi Anda dengan Mudah',
  description: 'Kelola keuangan pribadi Anda dengan mudah dan cerdas',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  themeColor: '#10b981',
  userScalable: false,
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id">
      <body className="font-sans antialiased bg-background text-foreground">{children}</body>
    </html>
  )
}
