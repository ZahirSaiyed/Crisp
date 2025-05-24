import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface FillerWordHeatmapProps {
  fillerWords: Array<{
    word: string;
    start: number;
    end: number;
  }>;
  duration: number;
}

export function FillerWordHeatmap({ fillerWords, duration }: FillerWordHeatmapProps) {
  // --- Data Preparation: Bucket filler words by 5s intervals ---
  const BUCKET_SIZE = 5;
  const safeDuration = Number.isFinite(duration) ? Math.max(0, duration) : 0;
  const bucketCount = Math.ceil(safeDuration / BUCKET_SIZE);
  const buckets = Array.from({ length: bucketCount }, (_, i) => ({
    start: i * BUCKET_SIZE,
    end: (i + 1) * BUCKET_SIZE,
    count: 0,
  }));
  fillerWords.forEach(fw => {
    const bucketIdx = Math.floor(fw.start / BUCKET_SIZE);
    if (bucketIdx >= 0 && bucketIdx < buckets.length) {
      buckets[bucketIdx].count++;
    }
  });
  const maxCount = Math.max(...buckets.map(b => b.count), 2);

  // --- Chart Layout ---
  const chartWidth = 800;
  const chartHeight = 200;
  const leftMargin = 40;
  const bottomMargin = 32;
  const barWidth = ((chartWidth - leftMargin) / bucketCount) * 0.55;

  // --- Insights ---
  // Find peak bucket
  const peakBucket = buckets.reduce((max, b) => (b.count > max.count ? b : max), buckets[0]);
  const mainInsight = peakBucket.count > 0
    ? `😅 Most fillers: ${peakBucket.count} in 5s at ${peakBucket.start}–${peakBucket.end}s`
    : '✨ No filler word clusters detected!';
  const caption = 'Try to keep filler words below 2 per 5 seconds for clarity.';

  // --- Bar color logic ---
  function getBarColor(count: number) {
    if (count === 0) return '#22c55e'; // green-500
    if (count <= 2) return '#facc15'; // yellow-400
    return '#ef4444'; // red-500
  }
  function getBarEmoji(count: number) {
    if (count === 0) return '✨';
    if (count <= 2) return '😌';
    return '😅';
  }

  // Helper: get unique filler words in a bucket
  function getBucketFillerTypes(bucket: { start: number; end: number }) {
    const types = new Set();
    fillerWords.forEach(fw => {
      if (fw.start >= bucket.start && fw.start < bucket.end) {
        types.add(fw.word.toLowerCase());
      }
    });
    return Array.from(types);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filler Word Flow</CardTitle>
        <div className="mb-2">
          <div className="text-xl md:text-2xl font-bold text-foreground mb-1">{mainInsight}</div>
          <div className="text-sm text-muted-foreground font-medium leading-tight">{caption}</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full relative pl-4 mt-6">
          {/* Y-axis title, vertical and non-clipping */}
          <svg width="24" height={chartHeight} className="absolute left-0 top-0 z-10 select-none pointer-events-none" style={{overflow: 'visible'}}>
            <text
              x="8"
              y={chartHeight / 2}
              fontSize="13"
              fill="#a1a1aa"
              opacity="0.7"
              fontWeight="600"
              textAnchor="middle"
              transform={`rotate(-90 8 ${chartHeight / 2})`}
            >
              Filler Words
            </text>
          </svg>
          <svg className="w-full h-full" viewBox={`0 0 ${chartWidth} ${chartHeight + bottomMargin}`}>
            {/* Grid lines and Y-axis ticks */}
            {[0, 1, 2, 3, 4, 5].map((count) => {
              const y = chartHeight - (count / maxCount) * (chartHeight - 20);
              const isMain = count === 2;
              const gridColor = '#3f3f46';
              const gridOpacity = isMain ? 0.32 : 0.18;
              return (
                <g key={count}>
                  {/* Solid, faint gridline */}
                  <line
                    x1={leftMargin}
                    y1={y}
                    x2={chartWidth}
                    y2={y}
                    stroke={gridColor}
                    strokeWidth="1.5"
                    opacity={gridOpacity}
                  />
                  {/* Short, rounded tick mark at Y-axis */}
                  <line
                    x1={0}
                    y1={y}
                    x2={leftMargin - 4}
                    y2={y}
                    stroke={gridColor}
                    strokeWidth="2"
                    opacity={gridOpacity}
                    strokeLinecap="round"
                  />
                  {/* Y-axis label */}
                  <text x={leftMargin - 8} y={y + 4} fontSize="12" fill="#a1a1aa" opacity="0.7" fontWeight={isMain ? 600 : 400} textAnchor="end">
                    {count}
                  </text>
                </g>
              );
            })}
            {/* Bars with tooltips and hover effect */}
            {buckets.map((bucket, i) => {
              const barHeight = bucket.count > 0 ? (bucket.count / maxCount) * (chartHeight - 20) : 0;
              const isPeak = bucket === peakBucket && bucket.count > 0;
              const barX = leftMargin + i * ((chartWidth - leftMargin) / bucketCount) + ((chartWidth - leftMargin) / bucketCount - barWidth) / 2;
              const barColor = getBarColor(bucket.count);
              const barOpacity = bucket.count === 0 ? 0.25 : 0.85;
              return (
                <g key={i}>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <rect
                          x={barX}
                          y={chartHeight - barHeight}
                          width={barWidth}
                          height={barHeight}
                          rx={4}
                          fill={barColor}
                          opacity={barOpacity}
                          className="cursor-pointer"
                        />
                      </TooltipTrigger>
                      <TooltipContent side="top" align="center">
                        <div className="text-sm font-semibold">
                          {getBarEmoji(bucket.count)} {bucket.count} filler word{bucket.count !== 1 ? 's' : ''}
                        </div>
                        <div className="text-xs text-muted-foreground mb-1">
                          {bucket.start}–{bucket.end}s
                        </div>
                        {getBucketFillerTypes(bucket).length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            <span className="font-medium">Types:</span> {getBucketFillerTypes(bucket).join(', ')}
                          </div>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  {/* Inline annotation: Peak */}
                  {isPeak && (
                    <text
                      x={barX + barWidth / 2}
                      y={chartHeight - barHeight - 18}
                      fontSize="15"
                      fontWeight="bold"
                      fill={barColor}
                      textAnchor="middle"
                      style={{ textShadow: '0 1px 4px #0008' }}
                    >
                      😅 {bucket.count} fillers
                    </text>
                  )}
                  {/* Inline annotation: No fillers */}
                  {bucket.count === 0 && (
                    <text
                      x={barX + barWidth / 2}
                      y={chartHeight - 10}
                      fontSize="13"
                      fontWeight="500"
                      fill="#22c55e"
                      opacity="0.7"
                      textAnchor="middle"
                    >
                      ✨ No fillers!
                    </text>
                  )}
                </g>
              );
            })}
            {/* X-axis time labels */}
            {buckets.map((bucket, i) => (
              <g key={i}>
                <text
                  x={leftMargin + i * ((chartWidth - leftMargin) / bucketCount) + barWidth / 2 + 4}
                  y={chartHeight + 20}
                  fontSize="11"
                  fill="#a1a1aa"
                  opacity="0.7"
                  textAnchor="middle"
                >
                  {`${bucket.start}–${bucket.end}s`}
                </text>
              </g>
            ))}
          </svg>
        </div>
        {/* Color legend only */}
        <div className="flex flex-wrap gap-6 mt-2 text-xs items-center justify-center">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-[#22c55e] inline-block" /> ✨ None
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-[#facc15] inline-block" /> 😌 Light (1–2)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-[#ef4444] inline-block" /> 😅 Heavy (3+)
          </span>
        </div>
        {/* Coaching line */}
        <div className="mt-3 text-sm text-muted-foreground text-center font-medium">
          Strong recovery! Consider starting with a pause or deep breath to stay in control from the first word.
        </div>
      </CardContent>
    </Card>
  );
} 