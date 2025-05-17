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
}

export function analyzeTranscript(transcript: string, duration: number): TranscriptMetrics {
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

  // Determine delivery style based on pace
  const deliveryStyle = {
    slow: {
      label: 'Too Measured',
      description: 'You may be coming across as hesitant. Try speaking a bit more naturally, as if you\'re explaining something to a colleague.'
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
  };
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