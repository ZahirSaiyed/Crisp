import { NextResponse } from 'next/server'
import { createClient } from '@deepgram/sdk'

interface DeepgramError extends Error {
  response?: {
    data?: unknown;
  };
}

interface DeepgramWord {
  word: string;
  start: number;
  end: number;
  confidence: number;
  filler_word?: boolean;
  volume?: number;
}

interface DeepgramUtterance {
  transcript: string;
  start: number;
  end: number;
  confidence: number;
}

interface DeepgramAlternative {
  transcript: string;
  words: DeepgramWord[];
  utterances?: DeepgramUtterance[];
}

interface DeepgramChannel {
  alternatives: DeepgramAlternative[];
}

interface DeepgramResult {
  channels: DeepgramChannel[];
  utterances?: DeepgramUtterance[];
}

interface DeepgramResponse {
  result?: {
    results?: DeepgramResult;
    metadata?: {
      duration: number;
    };
  };
}

const deepgram = createClient(process.env.DEEPGRAM_API_KEY || '')

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const audioFile = formData.get('audio') as File

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      )
    }

    const audioBuffer = await audioFile.arrayBuffer()
    const buffer = Buffer.from(audioBuffer)

    const response = await deepgram.listen.prerecorded.transcribeFile(
      buffer,
      {
        mimetype: audioFile.type,
        smart_format: true,
        model: 'nova-2',
        language: 'en-US',
        punctuate: true,
        utterances: true,
        diarize: false,
        filler_words: true,
        profanity_filter: false,
        summarize: false,
        detect_topics: false,
        detect_language: false,
        detect_entities: false,
        detect_sentiment: false,
        detect_tones: false,
        detect_emotions: false,
        detect_speakers: false,
        detect_audio_quality: true,
        detect_volume: true,
        detect_silence: true,
        vad_turnoff: 500,
      }
    ) as DeepgramResponse

    console.log('Raw Deepgram response:', JSON.stringify(response, null, 2))

    if (!response || !response.result?.results) {
      console.error('No results in response:', response)
      return NextResponse.json(
        { error: 'Failed to transcribe audio' },
        { status: 500 }
      )
    }

    const { transcript, words } = response.result.results.channels[0].alternatives[0]
    const utterances = response.result.results.utterances || []

    console.log('Extracted data:', {
      hasTranscript: !!transcript,
      transcriptLength: transcript?.length,
      wordsCount: words?.length,
      hasUtterances: !!utterances,
      utterancesCount: utterances?.length,
      sampleWord: words?.[0],
      sampleUtterance: utterances?.[0]
    })

    if (!transcript || !transcript.trim()) {
      console.error('No transcript in response:', response)
      return NextResponse.json(
        { error: 'EMPTY_RECORDING' },
        { status: 400 }
      )
    }

    // Process filler words and create a more detailed response
    const fillerWords = words.filter((word: DeepgramWord) => {
      // Check if Deepgram marked it as a filler word
      if (word.filler_word) return true;
      
      // Additional common filler words and sounds to check
      const commonFillerWords = [
        'um', 'umm', 'uh', 'uhh', 'er', 'err', 'ah', 'ahh',
        'like', 'you know', 'sort of', 'kind of',
        'basically', 'actually', 'literally', 'honestly',
        'just', 'really', 'very', 'so', 'well', 'right',
        'okay', 'ok', 'anyway', 'anyways', 'i mean',
        'you see', 'i guess', 'i think', 'i feel like'
      ];
      
      const wordText = word.word.toLowerCase().replace(/[.,!?]/g, '');
      return commonFillerWords.includes(wordText);
    }).map((word: DeepgramWord) => ({
      word: word.word,
      start: word.start,
      end: word.end,
      confidence: word.confidence
    }));

    // Process volume profile
    const volumeProfile = words.map((word: DeepgramWord) => ({
      start: word.start,
      end: word.end,
      loudness: word.volume || 0.5 // Default to 0.5 if no volume data
    }))

    // Process silence durations
    const silenceDurations = []
    for (let i = 0; i < words.length - 1; i++) {
      const currentWord = words[i]
      const nextWord = words[i + 1]
      const silenceDuration = nextWord.start - currentWord.end
      
      if (silenceDuration > 0.3) { // Only include significant pauses
        silenceDurations.push({
          start: currentWord.end,
          end: nextWord.start,
          duration: silenceDuration
        })
      }
    }

    const responseData = { 
      transcript: transcript.trim(),
      fillerWords,
      utterances: utterances.map((u: DeepgramUtterance) => ({
        transcript: u.transcript,
        start: u.start,
        end: u.end,
        confidence: u.confidence
      })),
      volumeProfile,
      silenceDurations,
      duration: response.result?.metadata?.duration || 0
    }

    console.log('Sending response:', {
      transcriptLength: responseData.transcript.length,
      fillerWordsCount: responseData.fillerWords.length,
      utterancesCount: responseData.utterances.length,
      volumeProfileCount: responseData.volumeProfile.length,
      silenceDurationsCount: responseData.silenceDurations.length,
      duration: responseData.duration
    })

    return NextResponse.json(responseData)
  } catch (error: unknown) {
    const deepgramError = error as DeepgramError
    console.error('Transcription error details:', {
      name: deepgramError?.name,
      message: deepgramError?.message,
      stack: deepgramError?.stack,
      response: deepgramError?.response?.data
    })
    return NextResponse.json(
      { error: deepgramError?.message || 'Failed to transcribe audio' },
      { status: 500 }
    )
  }
} 