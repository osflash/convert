'use client'

import React from 'react'

import { ThemeProvider } from 'next-themes'

import { FFmpegProvider } from '~/providers/FFmpeg'
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
        <FFmpegProvider>
          <>{children}</>
        </FFmpegProvider>
      </ThemeProvider>
    </>
  )
}
