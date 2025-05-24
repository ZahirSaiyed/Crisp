'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Play, Pause, RotateCcw } from 'lucide-react'
import { TranscriptAnalysis } from './transcript-analysis'
import { useRecording } from '@/contexts/recording-context'

interface AudioPreviewProps {
  onNewPrompt: () => void
}

export function AudioPreview({ onNewPrompt }: AudioPreviewProps) {
  const { mediaBlobUrl, audioBlob, transcript, fillerWords, utterances, volumeProfile, silenceDurations, duration, isAnalyzing, analysisError } = useRecording()
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [currentTime, setCurrentTime] = React.useState(0)
  const audioRef = React.useRef<HTMLAudioElement>(null)

  React.useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener('timeupdate', () => {
        setCurrentTime(audioRef.current?.currentTime || 0)
      })
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false)
        setCurrentTime(0)
      })
    }
  }, [])

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const resetPlayback = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      setCurrentTime(0)
      setIsPlaying(false)
    }
  }

  if (!audioBlob) {
    return null
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Audio Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <audio ref={audioRef} src={mediaBlobUrl || undefined} />
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={togglePlayback}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={resetPlayback}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <div className="flex-1">
                <div className="h-2 bg-secondary rounded-full">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <span>{currentTime.toFixed(1)}s</span>
                  <span>{duration.toFixed(1)}s</span>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={onNewPrompt}
              >
                New Prompt
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isAnalyzing ? (
        <Card>
          <CardContent className="py-6">
            <div className="text-center text-muted-foreground">
              Analyzing your recording...
            </div>
          </CardContent>
        </Card>
      ) : analysisError ? (
        <Card>
          <CardContent className="py-6">
            <div className="text-center text-destructive">
              {analysisError}
            </div>
          </CardContent>
        </Card>
      ) : transcript ? (
        <TranscriptAnalysis
          transcript={transcript}
          fillerWords={fillerWords}
          utterances={utterances}
          volumeProfile={volumeProfile}
          silenceDurations={silenceDurations}
          duration={duration}
        />
      ) : null}
    </div>
  )
} 