'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Mic, Pause, Square, Play } from 'lucide-react'
import { useRecording } from '@/contexts/recording-context'
import { cn } from '@/lib/utils'

export function RecordingButton() {
  const { 
    startRecording, 
    stopRecording, 
    pauseRecording,
    resumeRecording,
    status, 
    elapsedTime, 
    error 
  } = useRecording()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const isRecording = status === 'recording'
  const isPaused = status === 'paused'
  const hasError = status === 'error'

  const handleClick = () => {
    if (!isRecording && !isPaused) {
      startRecording()
    } else if (isPaused) {
      resumeRecording()
    } else {
      pauseRecording()
    }
  }

  const handleStop = () => {
    stopRecording()
  }

  if (!mounted) {
    return null
  }

  if (hasError) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-medium text-destructive">
            {error || 'An error occurred'}
          </h3>
          <p className="text-sm text-muted-foreground">
            Please refresh the page and try again
          </p>
        </div>
      </div>
    )
  }

  if (status === 'recording' || status === 'paused') {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="text-2xl font-mono">
          {formatTime(elapsedTime)}
        </div>
        <div className="flex gap-2">
          {status === 'recording' ? (
            <Button
              variant="outline"
              size="lg"
              onClick={pauseRecording}
              className="gap-2"
            >
              <Pause className="h-4 w-4" />
              Pause
            </Button>
          ) : (
            <Button
              variant="outline"
              size="lg"
              onClick={resumeRecording}
              className="gap-2"
            >
              <Play className="h-4 w-4" />
              Resume
            </Button>
          )}
          <Button
            variant="destructive"
            size="lg"
            onClick={stopRecording}
            className="gap-2"
          >
            <Square className="h-4 w-4" />
            Stop
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Button
      variant="default"
      size="lg"
      onClick={startRecording}
      className="gap-2"
    >
      <Mic className="h-4 w-4" />
      Start Recording
    </Button>
  )
} 