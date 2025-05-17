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
  };
}

// Initialize Deepgram client
const deepgram = createClient(process.env.DEEPGRAM_API_KEY || '')

export async function POST(req: Request) {
  try {
    // Get the audio blob from the request
    const formData = await req.formData()
    const audioFile = formData.get('audio') as Blob

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      )
    }

    // // Check if the audio file is empty or too small
    // if (audioFile.size < 1000) { // Less than 1KB is likely empty
    //   return NextResponse.json(
    //     { error: 'EMPTY_RECORDING' },
    //     { status: 400 }
    //   )
    // }

    console.log('Audio file type:', audioFile.type)
    console.log('Audio file size:', audioFile.size)

    // Convert blob to buffer
    const buffer = Buffer.from(await audioFile.arrayBuffer())
    console.log('Buffer size:', buffer.length)

    // Send to Deepgram using the new v4 API format
    const response = await deepgram.listen.prerecorded.transcribeFile(
      buffer,
      {
        mimetype: audioFile.type,
        smart_format: true,
        model: 'nova-2',
        language: 'en-US',
        punctuate: true,
        filler_words: true,
        utterances: true
      }
    ) as DeepgramResponse

    console.log('Deepgram response:', JSON.stringify(response, null, 2))

    // Extract transcript and additional information
    const result = response.result?.results?.channels[0]?.alternatives[0]
    const transcript = result?.transcript
    const words = result?.words || []
    const utterances = response.result?.results?.utterances || []

    console.log('Extracted transcript:', JSON.stringify(transcript))
    console.log('Words with filler markers:', JSON.stringify(words))
    console.log('Utterances:', JSON.stringify(utterances))

    if (!transcript || !transcript.trim()) {
      console.error('No transcript in response:', response)
      return NextResponse.json(
        { error: 'EMPTY_RECORDING' },
        { status: 400 }
      )
    }

    // Process filler words and create a more detailed response
    const fillerWords = words.filter(word => word.filler_word).map(word => ({
      word: word.word,
      start: word.start,
      end: word.end,
      confidence: word.confidence
    }))

    return NextResponse.json({ 
      transcript: transcript.trim(),
      fillerWords,
      utterances: utterances.map(u => ({
        transcript: u.transcript,
        start: u.start,
        end: u.end,
        confidence: u.confidence
      }))
    })
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