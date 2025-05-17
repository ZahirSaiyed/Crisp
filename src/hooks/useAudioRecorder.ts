'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

type Status = 'idle' | 'recording' | 'paused' | 'stopped' | 'error'

export function useAudioRecorder() {
  const [status, setStatus] = useState<Status>('idle')
  const [mediaBlobUrl, setMediaBlobUrl] = useState<string | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [transcript, setTranscript] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<number | null>(null)

  // Check browser compatibility
  useEffect(() => {
    if (typeof window === 'undefined') return

    if (!window.MediaRecorder) {
      setError('Your browser does not support audio recording. Please use a modern browser.')
      setStatus('error')
      return
    }

    if (!window.MediaRecorder.isTypeSupported('audio/webm')) {
      setError('Your browser does not support the required audio format. Please use a modern browser.')
      setStatus('error')
      return
    }
  }, [])

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (mediaBlobUrl) {
        URL.revokeObjectURL(mediaBlobUrl)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
      }
      if (timerRef.current) {
        window.clearInterval(timerRef.current)
      }
    }
  }, [mediaBlobUrl])

  const reset = useCallback(() => {
    // Clean up existing resources
    if (mediaBlobUrl) {
      URL.revokeObjectURL(mediaBlobUrl)
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
    }
    if (timerRef.current) {
      window.clearInterval(timerRef.current)
    }

    // Reset state
    setStatus('idle')
    setMediaBlobUrl(null)
    setAudioBlob(null)
    setError(null)
    setElapsedTime(0)
    setTranscript(null)
    chunksRef.current = []
    mediaRecorderRef.current = null
    streamRef.current = null
  }, [mediaBlobUrl])

  const setupRecorder = async () => {
    try {
      // Check if we're in a secure context
      if (typeof window !== 'undefined' && !window.isSecureContext) {
        throw new Error('Recording requires a secure context (HTTPS)')
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      })
      streamRef.current = stream

      // Find supported MIME type
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4'
      ]
      
      const mimeType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type)) || ''
      
      if (!mimeType) {
        throw new Error('No supported audio MIME types found')
      }

      const recorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000
      })

      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      recorder.onstop = async () => {
        try {
          const audioBlob = new Blob(chunksRef.current, { type: mimeType })
          setAudioBlob(audioBlob)
          const url = URL.createObjectURL(audioBlob)
          setMediaBlobUrl(url)
          chunksRef.current = []
          setStatus('stopped')
          if (timerRef.current) {
            window.clearInterval(timerRef.current)
          }

          // Send audio for transcription
          try {
            const formData = new FormData()
            formData.append('audio', audioBlob)

            const response = await fetch('/api/transcribe', {
              method: 'POST',
              body: formData,
            })

            if (!response.ok) {
              throw new Error('Failed to transcribe audio')
            }

            const data = await response.json()
            setTranscript(data.transcript)
          } catch (err) {
            console.error('Transcription error:', err)
            setError('Failed to transcribe audio')
          }
        } catch (error) {
          console.error('Error processing recording:', error)
          setError('Failed to process recording')
          setStatus('error')
        }
      }

      recorder.onerror = (event) => {
        console.error('MediaRecorder error:', event)
        setError('Recording failed')
        setStatus('error')
      }

      setStatus('idle')
    } catch (error) {
      console.error('Error initializing recorder:', error)
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          setError('Microphone access was denied. Please allow microphone access to record.')
        } else if (error.name === 'NotFoundError') {
          setError('No microphone found. Please connect a microphone and try again.')
        } else if (error.name === 'NotReadableError') {
          setError('Your microphone is busy or not working properly. Please check your microphone settings.')
        } else {
          setError(error.message || 'Failed to initialize recording')
        }
      } else {
        setError('Failed to initialize recording')
      }
      setStatus('error')
    }
  }

  const startRecording = useCallback(async () => {
    if (!mediaRecorderRef.current) {
      await setupRecorder()
    }
    
    if (mediaRecorderRef.current) {
      try {
        if (mediaRecorderRef.current.state === 'inactive') {
          chunksRef.current = []
          mediaRecorderRef.current.start(1000)
          setStatus('recording')
          setElapsedTime(0)
          timerRef.current = window.setInterval(() => {
            setElapsedTime(prev => prev + 1)
          }, 1000)
        } else if (mediaRecorderRef.current.state === 'paused') {
          mediaRecorderRef.current.resume()
          setStatus('recording')
          timerRef.current = window.setInterval(() => {
            setElapsedTime(prev => prev + 1)
          }, 1000)
        }
      } catch (error) {
        console.error('Error starting recording:', error)
        setError('Failed to start recording')
        setStatus('error')
      }
    }
  }, [])

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      try {
        mediaRecorderRef.current.pause()
        setStatus('paused')
        if (timerRef.current) {
          window.clearInterval(timerRef.current)
        }
      } catch (error) {
        console.error('Error pausing recording:', error)
        setError('Failed to pause recording')
        setStatus('error')
      }
    }
  }, [])

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'paused') {
      try {
        mediaRecorderRef.current.resume()
        setStatus('recording')
        timerRef.current = window.setInterval(() => {
          setElapsedTime(prev => prev + 1)
        }, 1000)
      } catch (error) {
        console.error('Error resuming recording:', error)
        setError('Failed to resume recording')
        setStatus('error')
      }
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      try {
        if (mediaRecorderRef.current.state === 'recording' || mediaRecorderRef.current.state === 'paused') {
          mediaRecorderRef.current.stop()
          if (timerRef.current) {
            window.clearInterval(timerRef.current)
          }
        }
      } catch (error) {
        console.error('Error stopping recording:', error)
        setError('Failed to stop recording')
        setStatus('error')
      }
    }
  }, [])

  return {
    status,
    mediaBlobUrl,
    audioBlob,
    error,
    elapsedTime,
    transcript,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    reset,
  }
} 