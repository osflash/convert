'use client'

import React from 'react'

import { ThemeProvider } from 'next-themes'
interface ProviderProps {
  children: React.ReactNode
}

export const Provider: React.FC<ProviderProps> = ({ children }) => {
  return (
    <>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <>{children}</>
      </ThemeProvider>
    </>
  )
}
