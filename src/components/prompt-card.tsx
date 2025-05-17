'use client'

import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Prompt } from '@/lib/prompts'
import { RecordingFlow } from './recording-flow'
import { useRecording } from '@/contexts/recording-context'
import { motion, AnimatePresence } from 'framer-motion'

interface PromptCardProps {
  prompt: Prompt
  onNewPrompt: () => void
}

export function PromptCard({ prompt, onNewPrompt }: PromptCardProps) {
  const [mounted, setMounted] = React.useState(false)
  const { reset } = useRecording()
  const [direction, setDirection] = React.useState<'left' | 'right'>('right')

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const handleNewPrompt = () => {
    const newDirection = Math.random() > 0.5 ? 'left' : 'right'
    setDirection(newDirection)
    reset()
    onNewPrompt()
  }

  if (!mounted) {
    return null
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={prompt.id}
        initial={{ 
          opacity: 0, 
          x: direction === 'right' ? 100 : -100,
          rotate: direction === 'right' ? 5 : -5 
        }}
        animate={{ 
          opacity: 1, 
          x: 0, 
          rotate: 0 
        }}
        exit={{ 
          opacity: 0, 
          x: direction === 'right' ? -100 : 100,
          rotate: direction === 'right' ? -5 : 5 
        }}
        transition={{ 
          type: "spring",
          stiffness: 300,
          damping: 30
        }}
        className="w-full max-w-2xl mx-auto"
      >
        <Card>
          <CardContent className="pt-6">
            <RecordingFlow prompt={prompt} onNewPrompt={handleNewPrompt} />
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
} 