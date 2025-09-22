'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'

export function Header() {
  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-lg">
            Shopping List
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            <Link 
              href="/debug" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Debug
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
