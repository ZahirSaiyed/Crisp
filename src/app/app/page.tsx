'use client'

import * as React from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { PromptCard } from '@/components/prompt-card'
import { getRandomPrompt, Prompt } from '@/lib/prompts'
import { RecordingProvider } from '@/contexts/recording-context'

export default function AppPage() {
  const [currentPrompt, setCurrentPrompt] = React.useState<Prompt>(() => getRandomPrompt())

  const handleNewPrompt = () => {
    setCurrentPrompt(getRandomPrompt(currentPrompt.id))
  }

  return (
    <RecordingProvider>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Landing
          </Link>
        </div>
        
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
          <PromptCard
            prompt={currentPrompt}
            onNewPrompt={handleNewPrompt}
          />
        </div>
      </div>
    </RecordingProvider>
  )
} 