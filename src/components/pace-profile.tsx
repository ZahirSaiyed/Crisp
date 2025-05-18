import * as React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Volume2, Volume1, VolumeX, Play, Pause, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface PaceProfileProps {
  utterances: {
    transcript: string;
    start: number;
    end: number;
    confidence: number;
  }[];
  silenceDurations: {
    start: number;
    end: number;
    duration: number;
  }[];
  volumeProfile: {
    start: number;
    end: number;
    loudness: number;
  }[];
}

export function PaceProfile({ utterances, silenceDurations, volumeProfile }: PaceProfileProps) {
  const [isPlaying, setIsPlaying] = React.useState(false)
  const totalDuration = Math.max(
    ...utterances.map(u => u.end),
    ...silenceDurations.map(s => s.end)
  );

  // Calculate WPM for each utterance
  const getUtteranceWPM = (utterance: typeof utterances[0]) => {
    const words = utterance.transcript.split(/\s+/).length;
    const duration = utterance.end - utterance.start;
    return Math.round((words / duration) * 60);
  };

  const getPaceZone = (wpm: number) => {
    if (wpm < 110) return 'slow';
    if (wpm > 180) return 'fast';
    return 'ideal';
  };

  const getPaceColor = (wpm: number) => {
    const zone = getPaceZone(wpm);
    return {
      slow: 'bg-chart-2/20 hover:bg-chart-2/30',
      ideal: 'bg-chart-1/20 hover:bg-chart-1/30',
      fast: 'bg-chart-3/20 hover:bg-chart-3/30'
    }[zone];
  };

  const getPaceLabel = (wpm: number) => {
    const zone = getPaceZone(wpm);
    return {
      slow: '🐢 Slow',
      ideal: '🎯 Ideal',
      fast: '⚡ Fast'
    }[zone];
  };

  const getVolumeIcon = (loudness: number) => {
    if (loudness > 0.7) return <Volume2 className="h-4 w-4 text-chart-1" />;
    if (loudness > 0.3) return <Volume1 className="h-4 w-4 text-chart-2" />;
    return <VolumeX className="h-4 w-4 text-chart-3" />;
  };

  const getPaceInsights = () => {
    const insights: string[] = [];
    
    // Analyze pace patterns
    const wpmValues = utterances.map(getUtteranceWPM);
    const avgWPM = wpmValues.reduce((sum, wpm) => sum + wpm, 0) / wpmValues.length;
    
    if (avgWPM < 110) {
      insights.push('Your overall pace is quite measured. Consider picking up the tempo slightly for more engagement.');
    } else if (avgWPM > 180) {
      insights.push('You\'re speaking quickly. Try slowing down to emphasize key points and improve clarity.');
    }

    // Analyze silence patterns
    const longPauses = silenceDurations.filter(s => s.duration > 2);
    if (longPauses.length > 0) {
      insights.push(`You had ${longPauses.length} strategic pause${longPauses.length > 1 ? 's' : ''}. Great for emphasis!`);
    }

    // Analyze volume consistency
    const volumeVariance = volumeProfile.reduce((sum, v) => sum + Math.pow(v.loudness - 0.5, 2), 0) / volumeProfile.length;
    if (volumeVariance > 0.2) {
      insights.push('Your volume varied significantly. Try maintaining a more consistent speaking level.');
    }

    return insights;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg">Pace Profile</CardTitle>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsPlaying(!isPlaying)}
            className="h-8 w-8"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsPlaying(false)}
            className="h-8 w-8"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Tempo zones */}
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-chart-2" />
              <span>🐢 Slow (&lt;110 WPM)</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-chart-1" />
              <span>🎯 Ideal (110-180 WPM)</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-chart-3" />
              <span>⚡ Fast (&gt;180 WPM)</span>
            </span>
          </div>

          {/* Timeline visualization */}
          <div className="relative h-32 bg-muted/50 rounded-lg overflow-hidden backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-b from-background/50 to-transparent pointer-events-none" />
            {utterances.map((utterance, index) => {
              const wpm = getUtteranceWPM(utterance);
              return (
                <TooltipProvider key={index}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className={cn(
                          "absolute h-full transition-all duration-200",
                          getPaceColor(wpm)
                        )}
                        style={{
                          left: `${(utterance.start / totalDuration) * 100}%`,
                          width: `${((utterance.end - utterance.start) / totalDuration) * 100}%`,
                        }}
                      >
                        <div className="absolute inset-0 flex items-center justify-center">
                          {getVolumeIcon(volumeProfile.find(v => 
                            v.start >= utterance.start && v.end <= utterance.end
                          )?.loudness || 0.5)}
                        </div>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-popover/95 backdrop-blur-sm border-primary/20">
                      <div className="space-y-1">
                        <p className="font-medium">{getPaceLabel(wpm)}</p>
                        <p className="text-xs">{wpm} WPM</p>
                        <p className="text-xs text-muted-foreground">{utterance.transcript}</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
            {silenceDurations.map((silence, index) => (
              <motion.div
                key={`silence-${index}`}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                className="absolute h-full bg-muted-foreground/5"
                style={{
                  left: `${(silence.start / totalDuration) * 100}%`,
                  width: `${((silence.end - silence.start) / totalDuration) * 100}%`,
                }}
              />
            ))}
          </div>

          {/* Time markers */}
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0s</span>
            <span>{Math.round(totalDuration)}s</span>
          </div>

          {/* Insights */}
          <div className="space-y-2">
            {getPaceInsights().map((insight, index) => (
              <motion.p
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
                className="text-sm text-muted-foreground"
              >
                {insight}
              </motion.p>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 