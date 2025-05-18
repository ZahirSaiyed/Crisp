export const FILLER_WORDS = {
  'um': 'A hesitation sound',
  'uh': 'A hesitation sound',
  'like': 'Used as a filler or approximation',
  'you know': 'Used to check understanding',
  'so': 'Used as a transition',
  'basically': 'Used to simplify or summarize',
  'actually': 'Used to correct or emphasize',
} as const;

export type FillerWordCount = Record<keyof typeof FILLER_WORDS, number>;

export interface TranscriptMetrics {
  wordCount: number;
  duration: number;
  wpm: number;
  pace: 'slow' | 'ideal' | 'fast';
  fillerCount: FillerWordCount;
  deliveryStyle: {
    label: string;
    description: string;
  };
  clarity: {
    label: string;
    description: string;
  };
  confidenceScore: number;
  confidenceLabel: string;
  utterances: {
    transcript: string;
    start: number;
    end: number;
    confidence: number;
  }[];
  fillerWords: {
    word: string;
    start: number;
    end: number;
    confidence: number;
  }[];
  volumeProfile: {
    start: number;
    end: number;
    loudness: number;
  }[];
  silenceDurations: {
    start: number;
    end: number;
    duration: number;
  }[];
}

export function analyzeTranscript(
  transcript: string, 
  duration: number,
  deepgramData?: {
    utterances: { transcript: string; start: number; end: number; confidence: number }[];
    fillerWords: { word: string; start: number; end: number; confidence: number }[];
    volumeProfile?: { start: number; end: number; loudness: number }[];
    silenceDurations?: { start: number; end: number; duration: number }[];
  }
): TranscriptMetrics {
  // Initialize filler word counts
  const fillerCount = Object.keys(FILLER_WORDS).reduce((acc, word) => {
    acc[word as keyof typeof FILLER_WORDS] = 0;
    return acc;
  }, {} as FillerWordCount);

  // Count words and filler words
  const words = transcript.toLowerCase().split(/\s+/);
  const wordCount = words.length;

  // Count filler words (including multi-word phrases)
  Object.keys(FILLER_WORDS).forEach(filler => {
    const regex = new RegExp(`\\b${filler}\\b`, 'gi');
    const matches = transcript.match(regex);
    if (matches) {
      fillerCount[filler as keyof typeof FILLER_WORDS] = matches.length;
    }
  });

  // Calculate WPM
  const wpm = Math.round((wordCount / duration) * 60);

  // Determine pace
  let pace: 'slow' | 'ideal' | 'fast';
  if (wpm < 110) {
    pace = 'slow';
  } else if (wpm <= 160) {
    pace = 'ideal';
  } else {
    pace = 'fast';
  }

  // Calculate total filler words
  const totalFillers = Object.values(fillerCount).reduce((sum, count) => sum + count, 0);

  // Calculate confidence score (0-100)
  const confidenceScore = (() => {
    let score = 0;
    
    // WPM contribution (30 points)
    if (wpm >= 110 && wpm <= 160) score += 30;
    else if (wpm >= 90 && wpm <= 180) score += 20;
    else if (wpm >= 70 && wpm <= 200) score += 10;
    
    // Filler words contribution (30 points)
    if (totalFillers <= 2) score += 30;
    else if (totalFillers <= 6) score += 20;
    else if (totalFillers <= 10) score += 10;
    
    // Utterance confidence contribution (20 points)
    if (deepgramData?.utterances) {
      const avgConfidence = deepgramData.utterances.reduce((sum, u) => sum + u.confidence, 0) / deepgramData.utterances.length;
      score += Math.round(avgConfidence * 20);
    }
    
    // Volume consistency contribution (20 points)
    if (deepgramData?.volumeProfile) {
      const volumeVariance = calculateVolumeVariance(deepgramData.volumeProfile);
      if (volumeVariance < 0.1) score += 20;
      else if (volumeVariance < 0.2) score += 15;
      else if (volumeVariance < 0.3) score += 10;
    }
    
    return Math.min(100, score);
  })();

  // Determine confidence label
  const confidenceLabel = (() => {
    if (confidenceScore >= 90) return '🔥 Commanding';
    if (confidenceScore >= 70) return '✨ Clear';
    if (confidenceScore >= 50) return '🧠 Could Be Sharper';
    return '😬 Uncertain';
  })();

  // Determine delivery style based on pace
  const deliveryStyle = {
    slow: {
      label: 'Too Measured',
      description: 'Your pace was too measured — it might make you sound overly cautious. Try speaking a bit more naturally, as if you\'re explaining something to a colleague.'
    },
    ideal: {
      label: 'Clear & Controlled',
      description: 'Your pace is spot-on for most conversations. This is the range where clarity and confidence shine.'
    },
    fast: {
      label: 'Rushed Delivery',
      description: 'You\'re speaking quickly — which can show excitement, but might make it harder for others to follow. Practice pausing briefly between ideas.'
    }
  }[pace];

  // Determine clarity based on filler words
  const clarity = (() => {
    if (totalFillers <= 2) {
      return {
        label: 'Minimal Distractions',
        description: 'Your speech was clean and to the point. Great control.'
      };
    } else if (totalFillers <= 6) {
      return {
        label: 'Some Verbal Tics',
        description: 'You used a few filler words. Try becoming more comfortable with pauses instead of filling space.'
      };
    } else {
      return {
        label: 'High Filler Usage',
        description: 'Frequent filler words can distract from your message. Try slowing down and being intentional with silence.'
      };
    }
  })();

  return {
    wordCount,
    duration,
    wpm,
    pace,
    fillerCount,
    deliveryStyle,
    clarity,
    confidenceScore,
    confidenceLabel,
    utterances: deepgramData?.utterances || [],
    fillerWords: deepgramData?.fillerWords || [],
    volumeProfile: deepgramData?.volumeProfile || [],
    silenceDurations: deepgramData?.silenceDurations || [],
  };
}

function calculateVolumeVariance(volumeProfile: { loudness: number }[]): number {
  if (volumeProfile.length === 0) return 0;
  
  const mean = volumeProfile.reduce((sum, v) => sum + v.loudness, 0) / volumeProfile.length;
  const variance = volumeProfile.reduce((sum, v) => sum + Math.pow(v.loudness - mean, 2), 0) / volumeProfile.length;
  
  return variance;
}

export function highlightFillerWords(transcript: string): string {
  let highlightedText = transcript;
  
  // Sort filler words by length (longest first) to avoid partial matches
  const sortedFillers = Object.keys(FILLER_WORDS).sort((a, b) => b.length - a.length);
  
  sortedFillers.forEach(filler => {
    const regex = new RegExp(`\\b${filler}\\b`, 'gi');
    highlightedText = highlightedText.replace(regex, `<span class="text-red-500 font-bold">$&</span>`);
  });

  return highlightedText;
} 