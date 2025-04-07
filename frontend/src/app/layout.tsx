import '@/styles/tailwind.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

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
    <html lang="en" className={`${inter.variable} font-sans text-zinc-950 antialiased lg:bg-zinc-100 dark:bg-zinc-900 dark:text-white dark:lg:bg-zinc-950`}>
      <body className="flex h-screen">
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </body>
    </html>
  )
}
