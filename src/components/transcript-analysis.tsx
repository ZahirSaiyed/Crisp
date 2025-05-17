'use client'

import * as React from 'react'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { analyzeTranscript, highlightFillerWords, FILLER_WORDS } from '@/lib/transcript-analysis'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Lightbulb } from 'lucide-react'

interface TranscriptAnalysisProps {
  transcript: string
  duration: number
}

export function TranscriptAnalysis({ transcript, duration }: TranscriptAnalysisProps) {
  const metrics = React.useMemo(() => analyzeTranscript(transcript, duration), [transcript, duration])
  const highlightedTranscript = React.useMemo(() => highlightFillerWords(transcript), [transcript])

  return (
    <div className="space-y-8">
      {/* Metrics Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="p-4 rounded-lg border bg-card"
        >
          <div className="text-sm font-medium text-muted-foreground">Total Words</div>
          <div className="text-2xl font-bold">{metrics.wordCount}</div>
        </motion.div>
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2, delay: 0.1 }}
          className="p-4 rounded-lg border bg-card"
        >
          <div className="text-sm font-medium text-muted-foreground">Duration</div>
          <div className="text-2xl font-bold">{Math.round(duration)}s</div>
        </motion.div>
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2, delay: 0.2 }}
          className="p-4 rounded-lg border bg-card"
        >
          <div className="text-sm font-medium text-muted-foreground">Words per Minute</div>
          <div className="text-2xl font-bold">{metrics.wpm}</div>
        </motion.div>
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2, delay: 0.3 }}
          className="p-4 rounded-lg border bg-card"
        >
          <div className="text-sm font-medium text-muted-foreground">Speaking Pace</div>
          <div className="text-2xl font-bold">
            {metrics.pace === 'slow' ? 'Too Measured' :
             metrics.pace === 'ideal' ? 'Clear & Controlled' :
             'Rushed Delivery'}
          </div>
        </motion.div>
      </div>

      {/* Coaching Section */}
      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="flex items-center gap-2 text-muted-foreground"
        >
          <Lightbulb className="h-4 w-4" />
          <h2 className="text-lg font-medium">Insights from this Take</h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="h-full"
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg">Delivery Style</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {metrics.deliveryStyle.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
            className="h-full"
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg">Clarity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {metrics.clarity.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Transcript Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.7 }}
        className="space-y-4"
      >
        <h3 className="text-lg font-medium">Transcript</h3>
        <div 
          className="p-4 rounded-lg border bg-card prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: highlightedTranscript }}
        />
      </motion.div>

      {/* Filler Words Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.8 }}
        className="space-y-4"
      >
        <h3 className="text-lg font-medium">Filler Words</h3>
        <div className="flex flex-wrap gap-2">
          <TooltipProvider>
            {Object.entries(metrics.fillerCount).map(([word, count]) => (
              count > 0 && (
                <Tooltip key={word}>
                  <TooltipTrigger>
                    <Badge variant="secondary" className="text-sm">
                      {word}: {count}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{FILLER_WORDS[word as keyof typeof FILLER_WORDS]}</p>
                  </TooltipContent>
                </Tooltip>
              )
            ))}
          </TooltipProvider>
        </div>
      </motion.div>
    </div>
  )
} 