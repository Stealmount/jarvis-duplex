import { getSessionOrGuest } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

const SUPPORTED = {
  'application/pdf': 'pdf',
  'image/jpeg': 'image', 'image/png': 'image', 'image/webp': 'image', 'image/gif': 'image',
  'audio/mpeg': 'audio', 'audio/wav': 'audio', 'audio/webm': 'audio', 'audio/ogg': 'audio',
  'video/mp4': 'video', 'video/webm': 'video',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'text/plain': 'text', 'text/csv': 'text', 'text/markdown': 'text',
};

export async function POST(req) {
  await getSessionOrGuest();

  const supabase = getSupabaseAdmin();
  const formData = await req.formData();
  const file = formData.get('file');
  const threadId = formData.get('threadId');

  if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });

  const fileType = SUPPORTED[file.type];
  if (!fileType) return NextResponse.json({ error: `Unsupported file type: ${file.type}` }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const fileName = file.name || `upload_${Date.now()}`;

  // Upload to Supabase Storage if configured
  let path = '';
  if (supabase) {
    const storagePath = `${threadId || 'general'}/${Date.now()}_${fileName}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('jarvis-files').upload(storagePath, buffer, { contentType: file.type });
    if (uploadError) {
      console.error('Storage upload error:', uploadError);
    } else {
      path = uploadData?.path || storagePath;
    }
  }

  // Extract text based on type
  let extractedText = '';
  if (fileType === 'pdf') {
    extractedText = '__CLIENT_EXTRACT__'; // PDF.js on client
  } else if (fileType === 'docx') {
    extractedText = '__CLIENT_EXTRACT_DOCX__'; // mammoth on client
  } else if (fileType === 'text') {
    extractedText = buffer.toString('utf-8').slice(0, 100000);
  } else if (fileType === 'audio') {
    // Transcribe via Groq Whisper
    if (process.env.GROQ_API_KEY) {
      try {
        const fd = new FormData();
        fd.append('file', new Blob([buffer], { type: file.type }), fileName);
        fd.append('model', 'whisper-large-v3');
        const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` },
          body: fd,
        });
        if (res.ok) {
          const data = await res.json();
          extractedText = data.text || '';
        }
      } catch (e) { console.error('Audio transcription failed:', e); }
    }
  }

  return NextResponse.json({ fileName, fileType, path, extractedText });
}
