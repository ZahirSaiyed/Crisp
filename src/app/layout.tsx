import * as React from 'react'
import { Providers } from '@/components/providers'
import { Header } from '@/components/header'
import './globals.css'
import { Toaster } from 'sonner'

export const metadata = {
  title: 'Crisp - Sharpen Your Voice',
  description: 'Make powerful communication a daily habit. Practice, get feedback, and improve your speaking clarity.',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  icons: {
    icon: '/logo.svg',
    apple: '/logo.svg',
  },
  openGraph: {
    title: 'Crisp - Sharpen Your Voice',
    description: 'Make powerful communication a daily habit. Practice, get feedback, and improve your speaking clarity.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Crisp - Sharpen Your Voice',
    description: 'Make powerful communication a daily habit. Practice, get feedback, and improve your speaking clarity.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/svg+xml" href="/logo.svg" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
          </div>
        </Providers>
        <Toaster />
      </body>
    </html>
  )
}
