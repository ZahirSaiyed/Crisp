import * as React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Play, Pause, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

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

export function PaceProfile({ utterances, silenceDurations }: PaceProfileProps) {
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

  // Generate data points for the line graph
  const paceData = utterances.map(utterance => ({
    time: utterance.start,
    wpm: getUtteranceWPM(utterance),
    transcript: utterance.transcript
  }));

  // Find max WPM for scaling
  const maxWPM = Math.max(...paceData.map(d => d.wpm), 250);

  // Color by pace zone
  const getZoneColor = (wpm: number) => {
    if (wpm < 110) return "#ef4444"; // red-500
    if (wpm <= 180) return "#22c55e"; // green-500
    return "#3b82f6"; // blue-500
  };

  // Helper: Generate a smooth SVG path for a segment
  function getSmoothPath(points: {x: number, y: number}[]) {
    if (points.length < 2) return '';
    let d = `M ${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const p0 = points[i - 1];
      const p1 = points[i];
      const cpx = (p0.x + p1.x) / 2;
      d += ` C ${cpx},${p0.y} ${cpx},${p1.y} ${p1.x},${p1.y}`;
    }
    return d;
  }

  // Prepare colored bezier segments by zone
  const coloredPaths: { d: string, color: string, key: string }[] = [];
  if (paceData.length > 1) {
    let currentZone = getZoneColor(paceData[1].wpm);
    let segmentPoints = [
      { x: (paceData[0].time / totalDuration) * 800, y: 200 - (paceData[0].wpm / maxWPM) * 180 }
    ];
    for (let i = 1; i < paceData.length; i++) {
      const pt = paceData[i];
      const color = getZoneColor(pt.wpm);
      const x = (pt.time / totalDuration) * 800;
      const y = 200 - (pt.wpm / maxWPM) * 180;
      if (color !== currentZone && segmentPoints.length > 1) {
        coloredPaths.push({ d: getSmoothPath(segmentPoints), color: currentZone, key: `seg-${i}` });
        segmentPoints = [segmentPoints[segmentPoints.length - 1]];
        currentZone = color;
      }
      segmentPoints.push({ x, y });
    }
    if (segmentPoints.length > 1) {
      coloredPaths.push({ d: getSmoothPath(segmentPoints), color: currentZone, key: `seg-final` });
    }
  }

  const getWPMLabel = (wpm: number) => {
    if (wpm < 110) return "Slow";
    if (wpm < 150) return "Normal";
    if (wpm < 200) return "Fast";
    return "Very Fast";
  };

  const getPaceInsights = () => {
    const insights: string[] = [];
    
    // Analyze pace patterns
    const wpmValues = paceData.map(d => d.wpm);
    const maxWPMValue = Math.max(...wpmValues);
    const minWPMValue = Math.min(...wpmValues);
    
    // Add WPM range insight
    insights.push(`You fluctuated between ${minWPMValue}–${maxWPMValue} WPM. ${maxWPMValue > minWPMValue * 1.5 ? 'Try smoothing those transitions for better flow.' : 'Your pace was quite consistent!'}`);

    // Find best stretch (longest period in ideal range)
    let bestStretch = { start: 0, end: 0, duration: 0 };
    let currentStretch = { start: 0, end: 0, duration: 0 };
    
    paceData.forEach((point) => {
      if (point.wpm >= 110 && point.wpm <= 180) {
        if (currentStretch.duration === 0) {
          currentStretch.start = point.time;
        }
        currentStretch.end = point.time;
        currentStretch.duration = currentStretch.end - currentStretch.start;
        
        if (currentStretch.duration > bestStretch.duration) {
          bestStretch = { ...currentStretch };
        }
      } else {
        currentStretch = { start: 0, end: 0, duration: 0 };
      }
    });

    if (bestStretch.duration > 5) {
      insights.push(`🎯 You maintained ideal pace from ${Math.round(bestStretch.start)}s to ${Math.round(bestStretch.end)}s`);
    }

    // Add peak WPM insight
    const peakPoint = paceData.find(p => p.wpm === maxWPMValue);
    if (peakPoint && peakPoint.wpm > 180) {
      insights.push(`⚡️ Peaked at ${peakPoint.wpm} WPM around ${Math.round(peakPoint.time)}s`);
    }

    // Analyze silence patterns
    const longPauses = silenceDurations.filter(s => s.duration > 2);
    if (longPauses.length > 0) {
      insights.push(`You had ${longPauses.length} strategic pause${longPauses.length > 1 ? 's' : ''}. Great for emphasis!`);
    }

    return insights;
  };

  // Find peak point and best ideal stretch for annotation
  const wpmValues = paceData.map(d => d.wpm);
  const maxWPMValue = Math.max(...wpmValues);
  const peakPoint = paceData.find(p => p.wpm === maxWPMValue);

  // Find best ideal stretch (longest period in 110-180 WPM)
  let bestStretch = { start: 0, end: 0, duration: 0 };
  let currentStretch = { start: 0, end: 0, duration: 0 };
  paceData.forEach((point) => {
    if (point.wpm >= 110 && point.wpm <= 180) {
      if (currentStretch.duration === 0) {
        currentStretch.start = point.time;
      }
      currentStretch.end = point.time;
      currentStretch.duration = currentStretch.end - currentStretch.start;
      if (currentStretch.duration > bestStretch.duration) {
        bestStretch = { ...currentStretch };
      }
    } else {
      currentStretch = { start: 0, end: 0, duration: 0 };
    }
  });
  const hasIdealStretch = bestStretch.duration > 0;
  // Find the midpoint of the best stretch for annotation placement
  const idealMid = hasIdealStretch ? (bestStretch.start + bestStretch.end) / 2 : null;

  // Prepare insights for display
  let mainInsight = '';
  let captionInsight = '';
  if (peakPoint && peakPoint.wpm > 180) {
    mainInsight = `⚡ Peaked at ${peakPoint.wpm} WPM around ${Math.round(peakPoint.time)}s`;
  } else if (hasIdealStretch) {
    mainInsight = `🎯 Maintained ideal pace from ${Math.round(bestStretch.start)}–${Math.round(bestStretch.end)}s`;
  } else {
    mainInsight = 'No significant peaks or ideal stretches detected.';
  }
  captionInsight = `You fluctuated between ${Math.min(...wpmValues)}–${Math.max(...wpmValues)} WPM. Aim to stay closer to 150–180 WPM for better clarity.`;

  // Filtered insights for below the chart (exclude main/caption)
  const allInsights = getPaceInsights();
  const filteredInsights = allInsights.filter(
    (insight) =>
      !insight.includes('Peaked at') &&
      !insight.includes('fluctuated between') &&
      !insight.includes('Maintained ideal pace') &&
      !insight.includes('Ideal pace')
  );

  // Calculate time spent in each zone
  let slowTime = 0, idealTime = 0, fastTime = 0;
  for (let i = 1; i < paceData.length; i++) {
    const prev = paceData[i - 1];
    const curr = paceData[i];
    const dt = curr.time - prev.time;
    if (curr.wpm < 110) slowTime += dt;
    else if (curr.wpm <= 180) idealTime += dt;
    else fastTime += dt;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg">Your Speaking Flow</CardTitle>
        <div className="flex items-center space-x-2 justify-end mb-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={isPlaying ? 'Pause playback' : 'Play back with pacing overlay'}
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="h-8 w-8 hover:bg-primary/10 focus:bg-primary/20 transition-colors shadow-none hover:shadow-[0_0_0_2px_rgba(59,130,246,0.25)]"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isPlaying ? '⏸ Pause' : '▶ Play'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Reset session"
                  onClick={() => setIsPlaying(false)}
                  className="h-8 w-8 hover:bg-primary/10 focus:bg-primary/20 transition-colors shadow-none hover:shadow-[0_0_0_2px_rgba(59,130,246,0.25)]"
                >
                  <RotateCcw className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>🔄 Reset</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Main insight block */}
          <div className="mb-2">
            <div className="text-xl md:text-2xl font-bold text-foreground mb-1">{mainInsight}</div>
            <div className="text-sm text-muted-foreground font-medium leading-tight">{captionInsight}</div>
          </div>

          {/* Line graph visualization */}
          <div className="h-64 w-full relative pl-4">
            {/* Y-axis label above */}
            <div className="absolute -left-2 top-6 z-10 text-xs text-muted-foreground font-semibold select-none">WPM</div>
            <svg className="w-full h-full" viewBox="0 0 800 200">
              {/* Grid lines and Y-axis ticks */}
              {[0, 50, 100, 150, 200, 250].map((wpm) => {
                // Main gridline (150 WPM or 100 WPM)
                const isMain = wpm === 150 || wpm === 100;
                const gridColor = '#3f3f46'; // Light gray for dark mode
                const gridOpacity = isMain ? 0.32 : 0.18;
                return (
                  <g key={wpm}>
                    {/* Solid, faint gridline */}
                    <line
                      x1="40"
                      y1={200 - (wpm / maxWPM) * 180}
                      x2="800"
                      y2={200 - (wpm / maxWPM) * 180}
                      stroke={gridColor}
                      strokeWidth="1.5"
                      opacity={gridOpacity}
                    />
                    {/* Short, rounded tick mark at Y-axis */}
                    <line
                      x1="0"
                      y1={200 - (wpm / maxWPM) * 180}
                      x2="16"
                      y2={200 - (wpm / maxWPM) * 180}
                      stroke={gridColor}
                      strokeWidth="2"
                      opacity={gridOpacity}
                      strokeLinecap="round"
                    />
                    {/* Y-axis label */}
                    <text x="22" y={200 - (wpm / maxWPM) * 180 + 4} fontSize="12" fill="#6b7280" opacity="0.7" fontWeight={isMain ? 600 : 400} >
                      {wpm}
                    </text>
                  </g>
                );
              })}

              {/* Time markers */}
              {Array.from({ length: Math.ceil(totalDuration / 5) + 1 }).map((_, i) => {
                const time = i * 5;
                return (
                  <g key={time}>
                    {/* Shorten or remove the X-axis tick line to avoid overlap */}
                    <line
                      x1={(time / totalDuration) * 800}
                      y1="190"
                      x2={(time / totalDuration) * 800}
                      y2="200"
                      stroke="hsl(var(--border))"
                      strokeWidth="1"
                      opacity="0.18"
                    />
                    <text
                      x={(time / totalDuration) * 800}
                      y="205"
                      fontSize="11"
                      fill="#6b7280"
                      opacity="0.6"
                      textAnchor="middle"
                    >
                      {`${time}s`}
                    </text>
                  </g>
                );
              })}

              {/* Ideal stretch highlight (subtle underline) */}
              {hasIdealStretch && (
                <rect
                  x={(bestStretch.start / totalDuration) * 800}
                  y={200 - (180 / maxWPM) * 180 + 8}
                  width={((bestStretch.end - bestStretch.start) / totalDuration) * 800}
                  height={6}
                  fill="#22c55e"
                  opacity={0.18}
                  rx={3}
                />
              )}

              {/* Modular colored line segments (now smooth paths) */}
              {coloredPaths.map(seg => (
                <path
                  key={seg.key}
                  d={seg.d}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              ))}

              {/* Data points (neutral color for now) */}
              {paceData.map((point, index) => (
                <TooltipProvider key={index}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <circle
                        cx={(point.time / totalDuration) * 800}
                        cy={200 - (point.wpm / maxWPM) * 180}
                        r="4"
                        fill="#fff"
                        stroke="#6b7280"
                        strokeWidth="1.5"
                        className="hover:r-6 transition-all cursor-pointer"
                      />
                    </TooltipTrigger>
                    <TooltipContent className="bg-popover/95 backdrop-blur-sm border-primary/20">
                      <div className="space-y-1">
                        <p className="font-medium">{getWPMLabel(point.wpm)}</p>
                        <p className="text-xs">{point.wpm} WPM</p>
                        <p className="text-xs text-muted-foreground">{point.transcript}</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}

              {/* Inline annotation: Peak WPM */}
              {peakPoint && (
                <g>
                  <text
                    x={(peakPoint.time / totalDuration) * 800 + 8}
                    y={200 - (peakPoint.wpm / maxWPM) * 180 - 12}
                    fontSize="16"
                    fontWeight="bold"
                    fill="#facc15"
                    style={{ textShadow: '0 1px 4px #0008' }}
                  >
                    ⚡ {peakPoint.wpm} WPM
                  </text>
                </g>
              )}

              {/* Inline annotation: Ideal stretch */}
              {hasIdealStretch && idealMid !== null && (
                <g>
                  <text
                    x={(idealMid / totalDuration) * 800}
                    y={200 - (180 / maxWPM) * 180 + 32}
                    fontSize="15"
                    fontWeight="bold"
                    fill="#22c55e"
                    textAnchor="middle"
                    style={{ textShadow: '0 1px 4px #0008' }}
                  >
                    🎯 Ideal pace {Math.round(bestStretch.start)}–{Math.round(bestStretch.end)}s
                  </text>
                </g>
              )}
            </svg>
          </div>

          {/* Merged legend + segment summary */}
          <div className="flex flex-wrap gap-6 mt-1 text-base items-center justify-center">
            <span className="flex items-center gap-2">
              <span className="text-lg">🐢</span>
              <span className="font-bold text-red-500">Slow</span>
              <span className="text-xs text-muted-foreground">(&lt;110 WPM)</span>
              <span className="font-semibold text-foreground">— {Math.round(slowTime)}s</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="text-lg">🎯</span>
              <span className="font-bold text-green-500">Ideal</span>
              <span className="text-xs text-muted-foreground">(110–180 WPM)</span>
              <span className="font-semibold text-foreground">— {Math.round(idealTime)}s</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="text-lg">⚡</span>
              <span className="font-bold text-blue-500">Fast</span>
              <span className="text-xs text-muted-foreground">(&gt;180 WPM)</span>
              <span className="font-semibold text-foreground">— {Math.round(fastTime)}s</span>
            </span>
          </div>

          {/* Insights */}
          <div className="space-y-2">
            {filteredInsights.map((insight, index) => (
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