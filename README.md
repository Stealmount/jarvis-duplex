# JARVIS — Your Personal Indian Voice AI 

Full-duplex voice AI companion. Hinglish. Therapy. Deep reasoning. Study mode.
Runs on your machine. All API keys stay private on your server.

---

## ⚡ Quickstart (2 minutes)

### Windows
```powershell
PowerShell -ExecutionPolicy Bypass -File setup.ps1
```

### Mac / Linux
```bash
chmod +x setup.sh && bash setup.sh
```

The script will:
1. Try Docker — if not found, offers to install it (winget / brew / get.docker.com)
2. If Docker fails → automatically falls back to Node.js
3. Opens `.env` for you to paste API keys
4. Launches JARVIS at `http://localhost:3000`

---

## 🔑 API Keys — Where to Get Them (All Free)

| Provider | Link | What It Does | Required? |
|---|---|---|---|
| **Groq** | [console.groq.com](https://console.groq.com) | Speech-to-text (Whisper) | ✅ Yes |
| **DeepSeek** | [platform.deepseek.com](https://platform.deepseek.com) | Best LLM, free tier | Recommended |
| **OpenRouter** | [openrouter.ai/keys](https://openrouter.ai/keys) | 50+ free models | Recommended |
| Google Gemini | [aistudio.google.com](https://aistudio.google.com/app/apikey) | Gemini Flash | Optional |
| Together AI | [api.together.xyz](https://api.together.xyz/settings/api-keys) | Llama models | Optional |
| NVIDIA NIM | [build.nvidia.com](https://build.nvidia.com) | Llama 405B | Optional |
| Sarvam AI | [app.sarvam.ai](https://app.sarvam.ai) | Indian voice TTS | Optional |
| OpenAI | [platform.openai.com](https://platform.openai.com/api-keys) | GPT-4o-mini | Optional (paid) |

**Minimum setup:** Just `GROQ_API_KEY` + one LLM key (DeepSeek or OpenRouter recommended).

---

## 🐳 Manual Docker

```bash
cp .env.example .env   # fill in your keys
docker compose up -d --build
# open http://localhost:3000
```

## 🟢 Manual Node.js (no Docker)

```bash
cp .env.example .env   # fill in your keys
npm install
npm run dev
# open http://localhost:3000
```

---

## 🗣 How to Use

- **Just speak** — Chrome mic picks up your voice automatically
- **Or type** — text input at the bottom, like Claude's interface
- **Switch modes** by clicking cards or saying keywords:
  - Say *"I'm feeling stressed"* → **Therapy** mode
  - Say *"explain this concept"* → **Study** mode
  - Say *"analyze deeply"* → **Deep Think** mode (uses DeepSeek-R1)
- **Upload a PDF** → JARVIS answers questions from it (RAG)
- **Interrupt anytime** — speak while JARVIS talks, it stops instantly

## 🛑 Stop

Docker: `docker compose down` · Node.js: `Ctrl+C`
