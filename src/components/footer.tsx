'use client'

import * as React from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'

// Official X (Twitter) SVG icon, transparent background
function XLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 1200 1227" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g clipPath="url(#clip0_429_11075)">
        <path d="M714.206 527.323L1127.41 60.5H1027.41L672.206 470.323L393.206 60.5H72.2056L507.206 693.5L72.2056 1166.5H172.206L552.206 729.5L846.206 1166.5H1167.21L714.206 527.323ZM601.206 668.5L557.206 609.5L202.206 140.5H353.206L646.206 552.5L690.206 611.5L1057.21 1086.5H906.206L601.206 668.5Z" fill="currentColor"/>
      </g>
      <defs>
        <clipPath id="clip0_429_11075">
          <rect width="1200" height="1227" />
        </clipPath>
      </defs>
    </svg>
  )
}

export function Footer() {
  const { theme, setTheme } = useTheme()

  return (
    <footer className="w-full border-t bg-background">
      <div className="container flex h-14 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">
            About
          </Link>
          <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
            Privacy
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://x.com/CrispLeader"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground flex items-center justify-center"
            aria-label="X (formerly Twitter)"
          >
            <XLogo className="h-5 w-5" />
            <span className="sr-only">X</span>
          </a>
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="relative flex items-center justify-center text-muted-foreground hover:text-foreground h-8 w-8"
            aria-label="Toggle theme"
          >
            <span className="relative flex items-center justify-center h-5 w-5">
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </span>
          </button>
        </div>
      </div>
    </footer>
  )
} 