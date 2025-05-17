'use client'

import * as React from 'react'
import { useAudioRecorder } from '@/hooks/useAudioRecorder'

export interface RecordingContextType {
  status: 'idle' | 'recording' | 'paused' | 'stopped' | 'error'
  mediaBlobUrl: string | null
  error: string | null
  transcript: string | null
  elapsedTime: number
  startRecording: () => Promise<void>
  stopRecording: () => void
  pauseRecording: () => void
  resumeRecording: () => void
  reset: () => void
}

const RecordingContext = React.createContext<RecordingContextType | undefined>(undefined)

export function RecordingProvider({ children }: { children: React.ReactNode }) {
  const {
    status,
    mediaBlobUrl,
    error,
    transcript,
    elapsedTime,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    reset,
  } = useAudioRecorder()

  const value = React.useMemo(
    () => ({
      status,
      mediaBlobUrl,
      error,
      transcript,
      elapsedTime,
      startRecording,
      stopRecording,
      pauseRecording,
      resumeRecording,
      reset,
    }),
    [
      status,
      mediaBlobUrl,
      error,
      transcript,
      elapsedTime,
      startRecording,
      stopRecording,
      pauseRecording,
      resumeRecording,
      reset,
    ]
  )

  return (
    <RecordingContext.Provider value={value}>
      {children}
    </RecordingContext.Provider>
  )
}

export function useRecording() {
  const context = React.useContext(RecordingContext)
  if (context === undefined) {
    throw new Error('useRecording must be used within a RecordingProvider')
  }
  return context
} 