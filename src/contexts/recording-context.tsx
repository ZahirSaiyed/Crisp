'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'

interface FillerWord {
  word: string
  start: number
  end: number
  confidence: number
}

interface Utterance {
  transcript: string
  start: number
  end: number
  confidence: number
}

interface VolumeProfile {
  start: number
  end: number
  loudness: number
}

interface SilenceDuration {
  start: number
  end: number
  duration: number
}

interface RecordingContextType {
  mediaBlobUrl: string | null
  audioBlob: Blob | null
  transcript: string | null
  fillerWords: FillerWord[]
  utterances: Utterance[]
  volumeProfile: VolumeProfile[]
  silenceDurations: SilenceDuration[]
  duration: number
  error: string | null
  isAnalyzing: boolean
  analysisError: string | null
  status: 'idle' | 'recording' | 'paused' | 'stopped' | 'error'
  elapsedTime: number
  startRecording: () => Promise<void>
  stopRecording: () => Promise<void>
  reset: () => void
}

const RecordingContext = createContext<RecordingContextType | undefined>(undefined)

export function RecordingProvider({ children }: { children: React.ReactNode }) {
  const [mediaBlobUrl, setMediaBlobUrl] = useState<string | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [transcript, setTranscript] = useState<string | null>(null)
  const [fillerWords, setFillerWords] = useState<FillerWord[]>([])
  const [utterances, setUtterances] = useState<Utterance[]>([])
  const [volumeProfile, setVolumeProfile] = useState<VolumeProfile[]>([])
  const [silenceDurations, setSilenceDurations] = useState<SilenceDuration[]>([])
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [status, setStatus] = useState<'idle' | 'recording' | 'paused' | 'stopped' | 'error'>('idle')
  const [elapsedTime, setElapsedTime] = useState(0)
  const timerRef = React.useRef<number | null>(null)

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks: Blob[] = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data)
        }
      }

      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setMediaBlobUrl(url)
        setAudioBlob(blob)
        setStatus('stopped')

        // Get audio duration
        const audio = new Audio(url)
        const duration = await new Promise<number>((resolve) => {
          audio.addEventListener('loadedmetadata', () => {
            resolve(audio.duration)
          })
        })
        setDuration(duration)

        // Analyze the recording
        setIsAnalyzing(true)
        setAnalysisError(null)

        const formData = new FormData()
        formData.append('audio', blob)

        try {
          const response = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData,
          })

          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'Failed to transcribe audio')
          }

          const data = await response.json()
          console.log('API Response received:', {
            hasTranscript: !!data.transcript,
            transcriptLength: data.transcript?.length,
            fillerWordsCount: data.fillerWords?.length,
            utterancesCount: data.utterances?.length,
            volumeProfileCount: data.volumeProfile?.length,
            silenceDurationsCount: data.silenceDurations?.length,
            duration: data.duration
          })
          
          if (!data.transcript) {
            console.error('No transcript in API response')
            throw new Error('No transcript received from API')
          }

          setTranscript(data.transcript)
          setFillerWords(data.fillerWords || [])
          setUtterances(data.utterances || [])
          setVolumeProfile(data.volumeProfile || [])
          setSilenceDurations(data.silenceDurations || [])
          setDuration(data.duration || 0)

          console.log('State updated:', {
            hasTranscript: !!data.transcript,
            fillerWordsCount: data.fillerWords?.length,
            utterancesCount: data.utterances?.length,
            duration: data.duration
          })
        } catch (err) {
          setAnalysisError(err instanceof Error ? err.message : 'Failed to analyze recording')
        } finally {
          setIsAnalyzing(false)
        }
      }

      recorder.start()
      setMediaRecorder(recorder)
      setError(null)
      setStatus('recording')
      setElapsedTime(0)
      timerRef.current = window.setInterval(() => {
        setElapsedTime(prev => prev + 1)
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start recording')
      setStatus('error')
    }
  }, [])

  const stopRecording = useCallback(async () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop()
      mediaRecorder.stream.getTracks().forEach(track => track.stop())
      if (timerRef.current) {
        window.clearInterval(timerRef.current)
      }
    }
  }, [mediaRecorder])

  const reset = useCallback(() => {
    setMediaBlobUrl(null)
    setAudioBlob(null)
    setTranscript(null)
    setFillerWords([])
    setUtterances([])
    setVolumeProfile([])
    setSilenceDurations([])
    setDuration(0)
    setError(null)
    setIsAnalyzing(false)
    setAnalysisError(null)
    setStatus('idle')
    setElapsedTime(0)
    if (timerRef.current) {
      window.clearInterval(timerRef.current)
    }
  }, [])

  return (
    <RecordingContext.Provider
      value={{
        mediaBlobUrl,
        audioBlob,
        transcript,
        fillerWords,
        utterances,
        volumeProfile,
        silenceDurations,
        duration,
        error,
        isAnalyzing,
        analysisError,
        status,
        elapsedTime,
        startRecording,
        stopRecording,
        reset,
      }}
    >
      {children}
    </RecordingContext.Provider>
  )
}

export function useRecording() {
  const context = useContext(RecordingContext)
  if (context === undefined) {
    throw new Error('useRecording must be used within a RecordingProvider')
  }
  return context
} 