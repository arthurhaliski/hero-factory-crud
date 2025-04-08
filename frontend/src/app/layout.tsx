import '@/styles/tailwind.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import clsx from 'clsx'
import { Toaster as SonnerToaster } from "@/components/ui/sonner"

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Hero Factory',
  description: 'Hero Factory Application',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={clsx('h-full scroll-smooth bg-white antialiased dark:bg-zinc-900', inter.variable)}>
      <body className={clsx('flex h-full flex-col', inter.className)}>
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
        <SonnerToaster />
      </body>
    </html>
  )
}
