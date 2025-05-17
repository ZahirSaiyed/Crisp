'use client'

import * as React from 'react'
import { useRecording } from '@/contexts/recording-context'
import { Button } from '@/components/ui/button'
import { TranscriptAnalysis } from './transcript-analysis'
import { Mic } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { FILLER_WORDS } from '@/lib/transcript-analysis'

interface AudioPreviewProps {
  onNewPrompt: () => void
}

export function AudioPreview({ onNewPrompt }: AudioPreviewProps) {
  const { mediaBlobUrl, transcript, error, reset } = useRecording()
  const [duration, setDuration] = useState(0)
  const [lastMetrics, setLastMetrics] = useState<{ wpm: number; fillers: number } | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const audioRef = React.useRef<HTMLAudioElement>(null)

  // Get duration directly from the audio blob
  React.useEffect(() => {
    if (!mediaBlobUrl) return
    const getDuration = async () => {
      try {
        const audioContext = new (window.AudioContext || ((window as unknown) as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
        const response = await fetch(mediaBlobUrl)
        const arrayBuffer = await response.arrayBuffer()
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
        setDuration(audioBuffer.duration)
        audioContext.close()
      } catch (error) {
        console.error('Error getting audio duration:', error)
      }
    }
    getDuration()
  }, [mediaBlobUrl])

  const handleAnalyze = async () => {
    if (!mediaBlobUrl) {
      toast.error('No audio recording found')
      return
    }

    setIsAnalyzing(true)

    try {
      const audioResponse = await fetch(mediaBlobUrl)
      const audioBlob = await audioResponse.blob()
      
      const formData = new FormData()
      formData.append('audio', audioBlob)

      const transcribeResponse = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      })

      const data = await transcribeResponse.json()

      if (!transcribeResponse.ok) {
        throw new Error(data.error || 'Failed to transcribe audio')
      }

      // Store current metrics before resetting
      const words = data.transcript.split(/\s+/).length
      const wpm = Math.round((words / duration) * 60)
      const fillerCount = Object.values(FILLER_WORDS).reduce((sum, word) => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi')
        const matches = data.transcript.match(regex)
        return sum + (matches ? matches.length : 0)
      }, 0)
      setLastMetrics({ wpm, fillers: fillerCount })

      // Reset recording state for next take
      reset()
      
      // Show success message with improvement tip
      toast.success('Ready for your next take!', {
        description: lastMetrics ? 
          `Last take: ${lastMetrics.wpm} WPM, ${lastMetrics.fillers} filler words. Try to ${wpm > lastMetrics.wpm ? 'slow down' : 'pick up the pace'} a bit.` :
          'Focus on clear delivery and natural pauses.'
      })

    } catch (error) {
      console.error('Transcription error:', error)
      toast.error('Failed to transcribe audio')
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Show 'No Audio Detected' only if error is EMPTY_RECORDING
  if (error === 'EMPTY_RECORDING') {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="rounded-full bg-muted p-4">
          <Mic className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-medium">No Audio Detected</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            We couldn&apos;t detect any audio. Please try recording again or check your microphone.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onNewPrompt}>
            Try Another Prompt
          </Button>
        </div>
      </div>
    )
  }

  // Show other errors
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="rounded-full bg-destructive/10 p-4">
          <Mic className="h-8 w-8 text-destructive" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-medium text-destructive">Something went wrong</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            {error}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onNewPrompt}>
            Try Another Prompt
          </Button>
        </div>
      </div>
    )
  }

  // Show main UI if transcript is available
  if (!mediaBlobUrl || !transcript || !transcript.trim()) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="rounded-full bg-muted p-4">
          <Mic className="h-8 w-8 text-muted-foreground animate-pulse" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-medium">Processing your recording</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            We&apos;re analyzing your speech patterns and preparing feedback...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-4">
        <audio
          ref={audioRef}
          src={mediaBlobUrl}
          controls
          className="w-full max-w-md"
        />
      </div>

      <TranscriptAnalysis
        transcript={transcript}
        duration={duration}
      />

      <div className="border-t border-border my-8" />

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-4"
      >
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Want to practice again or switch it up? Every take builds muscle.
        </p>
        {lastMetrics && (
          <p className="text-xs text-muted-foreground/70">
            Last take: {lastMetrics.wpm} WPM, {lastMetrics.fillers} filler words — let&apos;s tighten it up?
          </p>
        )}
        <div className="flex gap-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              variant="default" 
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="bg-primary hover:bg-primary/90"
            >
              {isAnalyzing ? 'Analyzing...' : 'Practice This Prompt Again'}
            </Button>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              variant="ghost" 
              onClick={onNewPrompt}
              className="hover:bg-secondary hover:text-secondary-foreground"
            >
              New Prompt
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
} 