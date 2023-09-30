'use client'

import React from 'react'

import { FileDown } from 'lucide-react'

import { loadFFmpeg } from '~/libs/ffmpeg'

import { useFFmpeg } from '~/providers/FFmpeg'

import { Button } from '~/components/ui/button'

export const FFmpeg: React.FC = () => {
  const { ffmpeg, loading, loaded, setLoaded } = useFFmpeg()

  const load = async () => {
    if (ffmpeg.loaded) {
      return setLoaded(ffmpeg.loaded)
    }

    await loadFFmpeg(ffmpeg)

    setLoaded(ffmpeg.loaded)
  }

  if (loaded) {
    return null
  }

  return (
    <div className="space-y-6">
      <Button
        type="button"
        className="w-full"
        onClick={load}
        disabled={!loading}
      >
        Carregar ffmpeg (~31 MB)
        <FileDown className="ml-2 h-4 w-4" />
      </Button>
    </div>
  )
}
