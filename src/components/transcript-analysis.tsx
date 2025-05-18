'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { motion } from 'framer-motion'
import { PaceProfile } from './pace-profile'
import { FillerWordHeatmap } from './filler-word-heatmap'
import { ConfidenceScore } from './confidence-score'

interface TranscriptAnalysisProps {
  transcript: string
  fillerWords: Array<{
    word: string
    start: number
    end: number
    confidence: number
  }>
  utterances: Array<{
    transcript: string
    start: number
    end: number
    confidence: number
  }>
  volumeProfile: Array<{
    start: number
    end: number
    loudness: number
  }>
  silenceDurations: Array<{
    start: number
    end: number
    duration: number
  }>
  duration: number
}

export function TranscriptAnalysis({
  transcript,
  fillerWords,
  utterances,
  volumeProfile,
  silenceDurations,
  duration
}: TranscriptAnalysisProps) {
  // Add safety check for duration
  const safeDuration = Math.max(0, duration || 0);
  
  console.log('TranscriptAnalysis received:', {
    transcript,
    fillerWords,
    utterances,
    volumeProfile,
    silenceDurations,
    duration,
    safeDuration
  });

  // Calculate metrics with safe duration
  const wordCount = transcript.split(/\s+/).length;
  const wpm = safeDuration > 0 ? Math.round((wordCount / safeDuration) * 60) : 0;
  const fillerWordCount = fillerWords.length;
  const fillerWordPercentage = wordCount > 0 ? (fillerWordCount / wordCount) : 0;

  // Calculate average transcript confidence
  const avgTranscriptConfidence = utterances.length > 0 
    ? utterances.reduce((sum, u) => sum + u.confidence, 0) / utterances.length 
    : 0.5;

  console.log('Raw Metrics:', {
    wordCount,
    duration: safeDuration,
    wpm,
    fillerWordCount,
    fillerWordPercentage: `${(fillerWordPercentage * 100).toFixed(1)}%`,
    avgTranscriptConfidence: `${(avgTranscriptConfidence * 100).toFixed(1)}%`
  });

  // --- 1. Pace & Rhythm ---
  let paceScore = 25;
  if (wpm < 110 || wpm > 180) paceScore -= 8;
  if (fillerWordPercentage > 0.1) paceScore -= 5;

  // --- 2. Filler Word Usage ---
  let fillerScore = 30;
  if (fillerWordPercentage > 0.20) fillerScore = 10;
  else if (fillerWordPercentage > 0.10) fillerScore = 18;
  else if (fillerWordPercentage > 0.05) fillerScore = 26;

  // --- 3. Clarity & Fluency ---
  let clarityScore = 25;
  if (avgTranscriptConfidence < 0.85) clarityScore -= 10;
  if (avgTranscriptConfidence < 0.75) clarityScore -= 5;

  // --- 4. Energy & Presence ---
  let energyScore = 10;
  // Using volume consistency as a proxy for energy
  const volumeConsistency = volumeProfile.length > 0
    ? 1 - (volumeProfile.reduce((sum, v) => sum + Math.abs(v.loudness - 0.5), 0) / volumeProfile.length)
    : 0.5;
  if (volumeConsistency < 0.7) energyScore -= 3;

  // --- 5. Length & Brevity ---
  let lengthScore = 10;
  if (safeDuration < 5) lengthScore -= 5;
  if (safeDuration > 45) lengthScore -= 3;

  // --- Total Score ---
  const totalScore = Math.round(paceScore + fillerScore + clarityScore + energyScore + lengthScore);

  console.log('Score Breakdown:', {
    pace: {
      base: 25,
      deductions: wpm < 110 || wpm > 180 ? 8 : 0,
      hesitant: fillerWordPercentage > 0.1 ? 5 : 0,
      final: paceScore
    },
    fillerWords: {
      base: 30,
      percentage: `${(fillerWordPercentage * 100).toFixed(1)}%`,
      final: fillerScore
    },
    clarity: {
      base: 25,
      confidence: `${(avgTranscriptConfidence * 100).toFixed(1)}%`,
      deductions: avgTranscriptConfidence < 0.85 ? 10 : avgTranscriptConfidence < 0.75 ? 5 : 0,
      final: clarityScore
    },
    energy: {
      base: 10,
      consistency: `${(volumeConsistency * 100).toFixed(1)}%`,
      deductions: volumeConsistency < 0.7 ? 3 : 0,
      final: energyScore
    },
    length: {
      base: 10,
      duration: safeDuration,
      deductions: safeDuration < 5 ? 5 : safeDuration > 45 ? 3 : 0,
      final: lengthScore
    },
    total: totalScore
  });

  // --- Performance Band ---
  let confidenceLabel = "";
  let confidenceTagline = "";
  if (totalScore >= 90) {
    confidenceLabel = "Excellent";
    confidenceTagline = "You sound like a pro. Keep it up!";
  } else if (totalScore >= 75) {
    confidenceLabel = "Strong";
    confidenceTagline = "You're clear and confident — keep refining.";
  } else if (totalScore >= 60) {
    confidenceLabel = "Developing";
    confidenceTagline = "Good foundation — work on filler and fluency.";
  } else {
    confidenceLabel = "Needs Work";
    confidenceTagline = "Let's tighten your delivery and boost confidence.";
  }

  console.log('Final Assessment:', {
    score: totalScore,
    label: confidenceLabel,
    tagline: confidenceTagline
  });

  // Generate coaching tips
  const coachingTips = [];
  if (fillerWordPercentage > 0.1) {
    coachingTips.push("Watch out for filler words — try pausing instead of filling space.");
  }
  if (wpm > 180) {
    coachingTips.push("You're speaking quickly — slow down slightly for better clarity.");
  } else if (wpm < 110) {
    coachingTips.push("Try picking up the pace a bit to sound more natural.");
  }
  if (fillerWordPercentage > 0.1) {
    coachingTips.push("You sounded hesitant — try to speak more fluidly and with intention.");
  }
  if (avgTranscriptConfidence < 0.85) {
    coachingTips.push("Some words were unclear — enunciate and speak up.");
  }
  if (safeDuration < 5) {
    coachingTips.push("Your response was very short — try to expand your thoughts.");
  }

  // Determine delivery style
  let deliveryStyle = 'Balanced';
  if (wpm > 160) deliveryStyle = 'Fast-paced';
  if (wpm < 120) deliveryStyle = 'Deliberate';
  if (fillerWordPercentage > 0.1) deliveryStyle = 'Hesitant';

  // Determine clarity
  let clarity = 'Clear';
  if (fillerWordPercentage > 0.15) clarity = 'Needs Work';
  if (fillerWordPercentage > 0.25) clarity = 'Unclear';

  return (
    <div className="space-y-6">
      <ConfidenceScore 
        score={totalScore} 
        label={confidenceLabel} 
        tagline={confidenceTagline}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <div className="flex justify-between">
                <span>Total Words</span>
                <span className="font-medium">{wordCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Duration</span>
                <span className="font-medium">{safeDuration.toFixed(1)}s</span>
              </div>
              <div className="flex justify-between">
                <span>Words per Minute</span>
                <span className="font-medium">{wpm}</span>
              </div>
              <div className="flex justify-between">
                <span>Speaking Pace</span>
                <Badge variant={wpm > 160 ? 'destructive' : wpm < 120 ? 'secondary' : 'default'}>
                  {deliveryStyle}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Filler Words</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <div className="flex justify-between">
                <span>Count</span>
                <span className="font-medium">{fillerWordCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Percentage</span>
                <span className="font-medium">{Math.round(fillerWordPercentage * 100)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Clarity</span>
                <Badge variant={clarity === 'Clear' ? 'default' : clarity === 'Needs Work' ? 'secondary' : 'destructive'}>
                  {clarity}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <PaceProfile
        utterances={utterances}
        silenceDurations={silenceDurations}
        volumeProfile={volumeProfile}
      />

      <FillerWordHeatmap
        fillerWords={fillerWords}
        duration={safeDuration}
      />

      <Card>
        <CardHeader>
          <CardTitle>Coaching</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Delivery Style</h4>
              <p className="text-sm text-muted-foreground">
                {deliveryStyle === 'Fast-paced' && 'Your pace is quite quick. Consider slowing down to emphasize key points.'}
                {deliveryStyle === 'Deliberate' && 'Your pace is measured and deliberate. This works well for complex topics.'}
                {deliveryStyle === 'Hesitant' && 'You use many filler words. Practice pausing instead of using filler words.'}
                {deliveryStyle === 'Balanced' && 'Your speaking pace is well-balanced and engaging.'}
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Tips</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                {coachingTips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span>•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transcript</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-base leading-relaxed">
            {utterances.map((utterance, index) => (
              <div key={index} className="mb-4">
                {utterance.transcript.split(' ').map((word, wordIndex) => {
                  const isFillerWord = fillerWords.some(
                    fw => fw.word.toLowerCase() === word.toLowerCase().replace(/[.,!?]/g, '')
                  );
                  return (
                    <span
                      key={wordIndex}
                      className={`${
                        isFillerWord
                          ? 'bg-red-100 text-red-900 px-1 rounded font-medium'
                          : ''
                      }`}
                    >
                      {word}{' '}
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Filler Words</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {fillerWords.length > 0 ? (
              fillerWords.map((filler, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="secondary" className="bg-red-100 text-red-900 hover:bg-red-200">
                          {filler.word}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Time: {filler.start.toFixed(1)}s</p>
                        <p>Confidence: {Math.round(filler.confidence * 100)}%</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </motion.div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No filler words detected in your speech!</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 