'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

interface CompanyThemeProps {
  primary?: string
  accent?: string
  children: React.ReactNode
}

export function CompanyThemeProvider({ primary, accent, children }: CompanyThemeProps) {
  React.useEffect(() => {
    const root = document.documentElement
    if (primary) {
      root.style.setProperty('--primary', primary)
    }
    if (accent) {
      root.style.setProperty('--accent', accent)
    }
    
    return () => {
      root.style.removeProperty('--primary')
      root.style.removeProperty('--accent')
    }
  }, [primary, accent])

  return <>{children}</>
}
