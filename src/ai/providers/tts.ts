import googleTTS from 'google-tts-api';

interface VoiceAudioOptions {
  lang?: string;
  slow?: boolean;
  speed?: number;
  interChunkDelayMs?: number;
}

const MAX_TTS_CHUNK = 180;

function splitTextIntoChunks(text: string, maxLength: number): string[] {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (!cleaned) return [];

  const chunks: string[] = [];
  let remaining = cleaned;

  while (remaining.length > maxLength) {
    const punctuationSplit = Math.max(
      remaining.lastIndexOf('. ', maxLength),
      remaining.lastIndexOf('! ', maxLength),
      remaining.lastIndexOf('? ', maxLength),
      remaining.lastIndexOf(', ', maxLength)
    );
    let splitAt = punctuationSplit > 0 ? punctuationSplit + 1 : remaining.lastIndexOf(' ', maxLength);
    if (splitAt <= 0) splitAt = maxLength;
    chunks.push(remaining.slice(0, splitAt).trim());
    remaining = remaining.slice(splitAt).trim();
  }

  if (remaining.length > 0) {
    chunks.push(remaining);
  }

  return chunks;
}

function normalizeSpeed(inputSpeed?: number): number {
  if (typeof inputSpeed !== 'number' || Number.isNaN(inputSpeed)) return 1;
  return Math.max(0.5, Math.min(1.5, inputSpeed));
}

export function mapSpeedToSlow(speed?: number): boolean {
  const normalized = normalizeSpeed(speed);
  return normalized < 0.85;
}

export async function* generateVoiceAudioChunks(
  text: string,
  options: VoiceAudioOptions = {}
): AsyncGenerator<Buffer> {
  const lang = options.lang || 'en';
  const slow =
    typeof options.slow === 'boolean' ? options.slow : mapSpeedToSlow(options.speed);
  const interChunkDelayMs = options.interChunkDelayMs ?? 80;

  const chunks = splitTextIntoChunks(text, MAX_TTS_CHUNK);
  if (chunks.length === 0) {
    throw new Error('Text is empty after normalization');
  }

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const url = googleTTS.getAudioUrl(chunk, {
      lang,
      slow,
      host: 'https://translate.google.com',
    });

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`TTS fetch failed with status ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    yield Buffer.from(arrayBuffer);

    if (i < chunks.length - 1 && interChunkDelayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, interChunkDelayMs));
    }
  }
}

export async function generateVoiceAudioBuffer(
  text: string,
  options: VoiceAudioOptions = {}
): Promise<Buffer> {
  const audioBuffers: Buffer[] = [];

  for await (const audioChunk of generateVoiceAudioChunks(text, options)) {
    audioBuffers.push(audioChunk);
  }

  return Buffer.concat(audioBuffers);
}
