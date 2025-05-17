import { NextResponse } from 'next/server'
import { createClient } from '@deepgram/sdk'

interface DeepgramError extends Error {
  response?: {
    data?: unknown;
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
      }
    )

    console.log('Deepgram response:', JSON.stringify(response, null, 2))

    // Extract transcript using the correct property path
    const transcript = response.result?.results?.channels[0]?.alternatives[0]?.transcript
    console.log('Extracted transcript:', JSON.stringify(transcript));

    if (!transcript || !transcript.trim()) {
      console.error('No transcript in response:', response)
      return NextResponse.json(
        { error: 'EMPTY_RECORDING' },
        { status: 400 }
      )
    }

    return NextResponse.json({ transcript: transcript.trim() })
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