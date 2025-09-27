import './globals.css'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from '@/components/theme-provider'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Image Processing Tools',
  description: 'Tools for processing and manipulating images',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="h-full flex flex-col antialiased">
        <ThemeProvider defaultTheme="light" attribute="class">
          <header className="border-b">
            <div className="container mx-auto px-4">
              <div className="flex h-16 items-center justify-between">
                <Link href="/" className="text-xl font-bold">
                  Image Tools
                </Link>
                <nav className="flex items-center gap-4">
                  <Link href="/png-processor">
                    <Button variant="ghost">PNG Processor</Button>
                  </Link>
                </nav>
              </div>
            </div>
          </header>
          <main className="flex-1">
            {children}
          </main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
