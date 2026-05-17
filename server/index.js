import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { transcribe } from './providers/stt.js';
import { streamChat, getAllProviderStatus } from './providers/router.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve client
app.use(express.static(path.join(__dirname, '..', 'client')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '..', 'client', 'index.html')));

// POST /api/stt — Speech to Text
app.post('/api/stt', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No audio file' });
    const text = await transcribe(req.file.buffer, req.file.originalname);
    res.json({ text });
  } catch (err) {
    console.error('[STT Error]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/chat — LLM streaming (SSE)
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, mode } = req.body;
    if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: 'messages required' });
    await streamChat(messages, mode || 'general', res);
  } catch (err) {
    console.error('[Chat Error]', err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  }
});

// GET /api/status — Provider status (no keys exposed)
app.get('/api/status', (req, res) => {
  res.json({ providers: getAllProviderStatus() });
});

// Start
app.listen(PORT, () => {
  printStartupStatus();
});

function printStartupStatus() {
  const providers = [
    { name: 'Groq (STT)',    key: process.env.GROQ_API_KEY },
    { name: 'DeepSeek',      key: process.env.DEEPSEEK_API_KEY },
    { name: 'OpenRouter',    key: process.env.OPENROUTER_API_KEY },
    { name: 'Together AI',   key: process.env.TOGETHER_API_KEY },
    { name: 'Google Gemini', key: process.env.GOOGLE_API_KEY },
    { name: 'NVIDIA NIM',    key: process.env.NVIDIA_API_KEY },
    { name: 'OpenAI',        key: process.env.OPENAI_API_KEY },
    { name: 'Sarvam AI',     key: process.env.SARVAM_API_KEY },
  ];
  console.log('');
  console.log('╔══════════════════════════════════════╗');
  console.log('║         JARVIS — Server Ready        ║');
  console.log('╠══════════════════════════════════════╣');
  console.log(`║  http://localhost:${PORT}               ║`);
  console.log('╠══════════════════════════════════════╣');
  console.log('║  Provider Status:                    ║');
  providers.forEach(p => {
    const status = p.key ? '✅ Active  ' : '○  Not set ';
    console.log(`║  ${status} ${p.name.padEnd(18)} ║`);
  });
  const active = providers.filter(p => p.key).length;
  console.log('╠══════════════════════════════════════╣');
  if (active === 0) {
    console.log('║  ❌  No API keys found in .env!      ║');
  } else {
    console.log(`║  ${active} provider(s) configured.           ║`);
  }
  console.log('╚══════════════════════════════════════╝');
  console.log('');
}
