'use client'

import * as React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { useRecording } from '@/contexts/recording-context'
import { toast } from 'sonner'
import { Mic, RefreshCw } from 'lucide-react'

interface TranscriptViewProps {
  onNewPrompt: () => void
}

export function TranscriptView({ onNewPrompt }: TranscriptViewProps) {
  const { mediaBlobUrl } = useRecording()
  const [transcript, setTranscript] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleAnalyze = async () => {
    if (!mediaBlobUrl) {
      toast.error('No audio recording found')
      return
    }

    setIsLoading(true)
    setError(null)

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
        if (data.error === 'EMPTY_RECORDING') {
          throw new Error('EMPTY_RECORDING')
        }
        throw new Error(data.error || 'Failed to transcribe audio')
      }

      setTranscript(data.transcript)
    } catch (error) {
      console.error('Transcription error:', error)
      if (error instanceof Error && error.message === 'EMPTY_RECORDING') {
        setError('EMPTY_RECORDING')
      } else {
        setError(error instanceof Error ? error.message : 'Failed to transcribe audio')
        toast.error('Failed to transcribe audio')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ) : error === 'EMPTY_RECORDING' ? (
        <div className="text-center space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-muted p-4">
              <Mic className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">No Speech Detected</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                We couldn&apos;t detect any speech in your recording. Try speaking a bit louder or checking your microphone.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleAnalyze}
              className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
            <button
              onClick={onNewPrompt}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Try a different prompt
            </button>
          </div>
        </div>
      ) : error ? (
        <div className="text-center space-y-4">
          <p className="text-destructive">{error}</p>
          <button
            onClick={handleAnalyze}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Try again
          </button>
        </div>
      ) : transcript ? (
        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-4">
            <p className="text-lg leading-relaxed">{transcript}</p>
          </div>
          <div className="flex justify-center">
            <button
              onClick={onNewPrompt}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Record another response
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">
            Click analyze to see your transcript
          </p>
          <button
            onClick={handleAnalyze}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Analyze Recording
          </button>
        </div>
      )}
    </div>
  )
} 