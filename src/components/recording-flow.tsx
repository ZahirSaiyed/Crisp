'use client'

import * as React from 'react'
import { useRecording } from '@/contexts/recording-context'
import { RecordingButton } from './recording-button'
import { AudioPreview } from './audio-preview'
import { Prompt } from '@/lib/prompts'
import { Button } from '@/components/ui/button'

interface RecordingFlowProps {
  prompt: Prompt
  onNewPrompt: () => void
}

export function RecordingFlow({ prompt, onNewPrompt }: RecordingFlowProps) {
  const { status, mediaBlobUrl, reset } = useRecording()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const handleNewPrompt = () => {
    reset()
    onNewPrompt()
  }

  if (!mounted) {
    return null
  }

  if (status === 'stopped' && mediaBlobUrl) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <AudioPreview onNewPrompt={handleNewPrompt} />
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">{prompt.emoji}</span>
        <span className="text-sm font-medium text-muted-foreground">
          {prompt.category === 'self' ? 'Self Reflection' :
           prompt.category === 'opinion' ? 'Hot Take' :
           prompt.category === 'creativity' ? 'Creative Challenge' :
           prompt.category === 'story' ? 'Story Time' :
           'Product Thinking'}
        </span>
      </div>
      <p className="text-2xl font-medium leading-relaxed mb-6">
        {prompt.text}
      </p>
      <div className="flex flex-row gap-4 justify-center">
        <RecordingButton />
        {(status === 'idle' || status === 'stopped') && (
          <Button variant="outline" onClick={handleNewPrompt}>
            New Prompt
          </Button>
        )}
      </div>
    </div>
  )
} 