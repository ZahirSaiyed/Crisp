import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Play, Pause, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FillerWordHeatmapProps {
  fillerWords: Array<{
    word: string;
    start: number;
    end: number;
  }>;
  duration: number;
}

interface Bucket {
  count: number;
  start: number;
  end: number;
}

export function FillerWordHeatmap({ fillerWords, duration }: FillerWordHeatmapProps) {
  const [isPlaying, setIsPlaying] = React.useState(false)
  const BUCKET_SIZE = 5; // 5 second buckets for more granular analysis
  
  // Add safety checks for duration
  const safeDuration = Number.isFinite(duration) ? Math.max(0, duration) : 0;

  const getBucketCounts = () => {
    if (!fillerWords.length || !Number.isFinite(safeDuration)) {
      return new Array(Math.ceil(safeDuration / BUCKET_SIZE)).fill(0);
    }
    
    try {
      const counts = new Array(Math.ceil(safeDuration / BUCKET_SIZE)).fill(0);
      fillerWords.forEach(filler => {
        const bucketIndex = Math.floor(filler.start / BUCKET_SIZE);
        if (bucketIndex >= 0 && bucketIndex < counts.length) {
          counts[bucketIndex]++;
        }
      });
      return counts;
    } catch (error) {
      console.error('Error calculating bucket counts:', error);
      return [0];
    }
  };

  const buckets: Bucket[] = Array.from({ length: Math.ceil(safeDuration / BUCKET_SIZE) }, (_, i) => ({
    count: getBucketCounts()[i] || 0,
    start: i * BUCKET_SIZE,
    end: (i + 1) * BUCKET_SIZE
  }));

  const getHeatColor = (count: number) => {
    if (count === 0) return 'bg-muted-foreground/5';
    if (count === 1) return 'bg-chart-2/20 hover:bg-chart-2/30';
    if (count === 2) return 'bg-chart-1/20 hover:bg-chart-1/30';
    return 'bg-chart-3/20 hover:bg-chart-3/30';
  };

  const getHeatLabel = (count: number) => {
    if (count === 0) return 'No filler words';
    if (count === 1) return 'Light usage';
    if (count === 2) return 'Moderate usage';
    return 'Heavy usage';
  };

  const getHeatEmoji = (count: number) => {
    if (count === 0) return '✨';
    if (count === 1) return '😊';
    if (count === 2) return '🤔';
    return '😅';
  };

  const getInsights = () => {
    const bucketCounts = getBucketCounts();
    const insights: string[] = [];
    
    // Early filler words
    const earlyFillers = bucketCounts.slice(0, 2).reduce((sum, count) => sum + count, 0);
    if (earlyFillers > 2) {
      insights.push('You used several filler words in the first 10 seconds. Try taking a deep breath before starting.');
    }
    
    // Dense sections
    const denseSections = bucketCounts.filter(count => count > 2).length;
    if (denseSections > 0) {
      insights.push(`You had ${denseSections} section${denseSections > 1 ? 's' : ''} with many filler words. These might be good spots to practice more.`);
    }
    
    // Overall pattern
    const totalFillers = bucketCounts.reduce((sum, count) => sum + count, 0);
    if (totalFillers > 0) {
      const avgFillersPerMinute = (totalFillers / duration) * 60;
      if (avgFillersPerMinute > 10) {
        insights.push('Your filler word rate is high. Try pausing instead of using filler words.');
      } else if (avgFillersPerMinute < 3) {
        insights.push('Great job keeping filler words to a minimum!');
      }
    }

    // Pattern analysis
    const hasClusters = bucketCounts.some((count, i) => 
      count > 0 && bucketCounts[i + 1] > 0
    );
    if (hasClusters) {
      insights.push('You tend to use filler words in clusters. Try to be more mindful of your speech patterns.');
    }
    
    return insights;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg">Filler Word Heatmap</CardTitle>
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
          {/* Heatmap visualization */}
          <div className="relative h-32 bg-muted/50 rounded-lg overflow-hidden backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-b from-background/50 to-transparent pointer-events-none" />
            {buckets.map((bucket: Bucket, index: number) => (
              <TooltipProvider key={index}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={cn(
                        "absolute h-full transition-all duration-200",
                        getHeatColor(bucket.count)
                      )}
                      style={{
                        left: `${(bucket.start / safeDuration) * 100}%`,
                        width: `${(bucket.end - bucket.start) / safeDuration * 100}%`,
                      }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg opacity-50">{getHeatEmoji(bucket.count)}</span>
                      </div>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-popover/95 backdrop-blur-sm border-primary/20">
                    <div className="space-y-1">
                      <p className="font-medium">{getHeatLabel(bucket.count)}</p>
                      <p className="text-xs">
                        {bucket.count} filler word{bucket.count !== 1 ? 's' : ''}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {Math.round(bucket.start)}s - {Math.round(bucket.end)}s
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>

          {/* Time markers */}
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0s</span>
            <span>{Math.round(safeDuration)}s</span>
          </div>

          {/* Heatmap legend */}
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-muted-foreground/5" />
              <span>✨ None</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-chart-2/20" />
              <span>😊 Light</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-chart-1/20" />
              <span>🤔 Moderate</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-chart-3/20" />
              <span>😅 Heavy</span>
            </span>
          </div>

          {/* Insights */}
          <div className="space-y-2 mt-4">
            {getInsights().map((insight, index) => (
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

          {/* Action items */}
          {fillerWords.length > 0 && (
            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-2">Next Steps</h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span>•</span>
                  <span>Practice pausing instead of using filler words</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span>•</span>
                  <span>Record yourself again and aim for fewer filler words</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span>•</span>
                  <span>Focus on the sections with the most filler words</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 