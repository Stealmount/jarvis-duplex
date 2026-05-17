import fetch from 'node-fetch';
import FormData from 'form-data';

const GROQ_STT_URL = 'https://api.groq.com/openai/v1/audio/transcriptions';
const GROQ_STT_MODEL = 'whisper-large-v3-turbo';

export async function transcribe(fileBuffer, filename = 'speech.wav') {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not set — required for STT');

  const form = new FormData();
  form.append('file', fileBuffer, { filename, contentType: 'audio/wav' });
  form.append('model', GROQ_STT_MODEL);
  form.append('response_format', 'json');

  const response = await fetch(GROQ_STT_URL, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, ...form.getHeaders() },
    body: form,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Whisper STT failed: ${response.status} ${errText.slice(0, 200)}`);
  }

  const data = await response.json();
  return (data.text || '').trim();
}
