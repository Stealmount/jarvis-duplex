'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import TopNav from '@/components/TopNav';
import Sidebar from '@/components/Sidebar';
import ChatFeed from '@/components/ChatFeed';
import InputBar from '@/components/InputBar';
import ModeSelector from '@/components/ModeSelector';
import ModelPicker from '@/components/ModelPicker';
import VoiceOrb from '@/components/VoiceOrb';
import { splitIntoSentences, getPauseAfterSentence, getThinkingPause } from '@/lib/tts-pacing';
import { stopDuplex } from '@/lib/duplex';
import { getLocalThreads, setLocalThreads, saveMessageToLocal, deleteLocalThread, setLocalCurrentThreadId } from '@/lib/storage';
import { buildContextWindow } from '@/lib/context';
import { initElevenLabsDuplex, getElevenLabsInstance, destroyElevenLabsDuplex } from '@/lib/elevenlabs-duplex';

const Cursor = dynamic(() => import('@/components/Cursor'), { ssr: false });

// Full model catalog — synced with lib/providers/router.js
const ALL_MODELS = [
  // Cerebras
  { id:'llama3.1-70b',label:'Llama 3.1 70B',provider:'cerebras',speed:'fast',tier:'free',specialty:'General · Ultra-fast',bestFor:['general','therapy'],capabilities:['text'],description:'World\'s fastest free LLM inference.'},
  { id:'llama3.1-8b',label:'Llama 3.1 8B',provider:'cerebras',speed:'fast',tier:'free',specialty:'General · Lightning fast',bestFor:['general'],capabilities:['text'],description:'Extremely fast responses.'},
  // SambaNova
  { id:'Meta-Llama-3.1-405B-Instruct',label:'Llama 3.1 405B',provider:'sambanova',speed:'medium',tier:'free',specialty:'Reasoning · Deep analysis',bestFor:['deep','study'],capabilities:['text'],description:'Largest open model.'},
  { id:'Meta-Llama-3.1-70B-Instruct',label:'Llama 3.1 70B (SN)',provider:'sambanova',speed:'fast',tier:'free',specialty:'General · Balanced',bestFor:['general'],capabilities:['text'],description:'Strong general model.'},
  // Groq
  { id:'llama-3.1-8b-instant',label:'Llama 3.1 8B Instant',provider:'groq',speed:'fast',tier:'free',specialty:'General · Instant replies',bestFor:['general'],capabilities:['text'],description:'Ideal for voice.'},
  { id:'llama-3.3-70b-versatile',label:'Llama 3.3 70B',provider:'groq',speed:'medium',tier:'free',specialty:'Study · Research',bestFor:['study','research'],capabilities:['text'],description:'Versatile and capable.'},
  { id:'gemma2-9b-it',label:'Gemma 2 9B',provider:'groq',speed:'fast',tier:'free',specialty:'General · Concise',bestFor:['general'],capabilities:['text'],description:'Fast on Groq.'},
  { id:'mixtral-8x7b-32768',label:'Mixtral 8x7B',provider:'groq',speed:'fast',tier:'free',specialty:'General · Long context',bestFor:['general'],capabilities:['text'],description:'MoE model.'},
  // OpenRouter
  { id:'deepseek/deepseek-r1:free',label:'DeepSeek R1',provider:'openrouter',speed:'medium',tier:'free',specialty:'Reasoning · Math · Code',bestFor:['deep','study'],capabilities:['text'],description:'Reasoning model.'},
  { id:'deepseek/deepseek-v3:free',label:'DeepSeek V3',provider:'openrouter',speed:'fast',tier:'free',specialty:'Code · General',bestFor:['general','deep'],capabilities:['text'],description:'Coding excellence.'},
  { id:'google/gemma-2-9b-it:free',label:'Gemma 2 9B (OR)',provider:'openrouter',speed:'fast',tier:'free',specialty:'General · Concise',bestFor:['general'],capabilities:['text'],description:'Google via OR.'},
  { id:'mistralai/mistral-7b-instruct:free',label:'Mistral 7B',provider:'openrouter',speed:'fast',tier:'free',specialty:'General · Instruction following',bestFor:['general'],capabilities:['text'],description:'Reliable.'},
  { id:'microsoft/phi-3-mini-128k-instruct:free',label:'Phi-3 Mini 128K',provider:'openrouter',speed:'fast',tier:'free',specialty:'Long context · Code',bestFor:['study'],capabilities:['text'],description:'128K context.'},
  { id:'qwen/qwen-2.5-72b-instruct:free',label:'Qwen 2.5 72B',provider:'openrouter',speed:'medium',tier:'free',specialty:'Code · Multilingual',bestFor:['deep','study'],capabilities:['text'],description:'Code + multilingual.'},
  // Kimi
  { id:'moonshot-v1-8k',label:'Kimi 8K',provider:'kimi',speed:'fast',tier:'free',specialty:'General · Code',bestFor:['general'],capabilities:['text'],description:'Kimi model.'},
  { id:'moonshot-v1-32k',label:'Kimi 32K',provider:'kimi',speed:'medium',tier:'free',specialty:'Long context · Code · Documents',bestFor:['study','research'],capabilities:['text'],description:'32K context.'},
  { id:'moonshot-v1-128k',label:'Kimi 128K',provider:'kimi',speed:'medium',tier:'free',specialty:'Ultra-long context · Research',bestFor:['research'],capabilities:['text'],description:'128K context.'},
  // MiniMax
  { id:'abab6.5s-chat',label:'MiniMax 6.5s',provider:'minimax',speed:'fast',tier:'free',specialty:'Reasoning · Long context',bestFor:['deep','study'],capabilities:['text'],description:'Strong reasoning.'},
  { id:'abab5.5-chat',label:'MiniMax 5.5',provider:'minimax',speed:'fast',tier:'free',specialty:'General · Fast',bestFor:['general'],capabilities:['text'],description:'Lighter model.'},
  // Google
  { id:'gemini-1.5-flash',label:'Gemini 1.5 Flash',provider:'google',speed:'fast',tier:'free',specialty:'General · Vision · Code',bestFor:['general','research'],capabilities:['text','image_input','pdf'],description:'Google fastest.'},
  { id:'gemini-2.0-flash-exp',label:'Gemini 2.0 Flash',provider:'google',speed:'fast',tier:'free',specialty:'Research · Multimodal',bestFor:['research'],capabilities:['text','image_input','pdf'],description:'Latest flash.'},
  // Mistral
  { id:'mistral-small-latest',label:'Mistral Small',provider:'mistral',speed:'fast',tier:'free',specialty:'General · Efficient',bestFor:['general'],capabilities:['text'],description:'Production grade.'},
  { id:'open-mistral-7b',label:'Mistral 7B',provider:'mistral',speed:'fast',tier:'free',specialty:'General · Open source',bestFor:['general'],capabilities:['text'],description:'Original Mistral.'},
  { id:'codestral-latest',label:'Codestral',provider:'mistral',speed:'fast',tier:'free',specialty:'Code · 80+ languages',bestFor:['deep'],capabilities:['text'],description:'Dedicated coding.'},
  // Cohere
  { id:'command-r',label:'Command R',provider:'cohere',speed:'fast',tier:'free',specialty:'RAG · Research · Retrieval',bestFor:['general','study'],capabilities:['text'],description:'RAG optimized.'},
  { id:'command-r-plus',label:'Command R+',provider:'cohere',speed:'medium',tier:'free',specialty:'Reasoning · Analysis',bestFor:['deep','study'],capabilities:['text'],description:'Most capable.'},
  // Cloudflare
  { id:'@cf/meta/llama-3.1-8b-instruct',label:'Llama 3.1 8B (CF)',provider:'cloudflare',speed:'fast',tier:'free',specialty:'General · Edge inference',bestFor:['general'],capabilities:['text'],description:'Edge network.'},
  { id:'@cf/mistral/mistral-7b-instruct-v0.1',label:'Mistral 7B (CF)',provider:'cloudflare',speed:'fast',tier:'free',specialty:'General · Edge inference',bestFor:['general'],capabilities:['text'],description:'Edge Mistral.'},
  // NVIDIA
  { id:'meta/llama-3.1-405b-instruct',label:'Llama 3.1 405B (NIM)',provider:'nvidia',speed:'medium',tier:'free',specialty:'Deep reasoning · Complex tasks',bestFor:['deep','study'],capabilities:['text'],description:'405B on NVIDIA.'},
  { id:'deepseek/deepseek-r1',label:'DeepSeek R1 (NIM)',provider:'nvidia',speed:'medium',tier:'free',specialty:'Math · Code · Reasoning',bestFor:['deep'],capabilities:['text'],description:'Chain-of-thought.'},
  // HuggingFace
  { id:'mistralai/Mistral-7B-Instruct-v0.3',label:'Mistral 7B (HF)',provider:'huggingface',speed:'slow',tier:'free',specialty:'General · Open source',bestFor:['general'],capabilities:['text'],description:'Always available.'},
  { id:'google/gemma-7b-it',label:'Gemma 7B (HF)',provider:'huggingface',speed:'slow',tier:'free',specialty:'General',bestFor:['general'],capabilities:['text'],description:'Google Gemma on HF.'},
  // Sarvam
  { id:'sarvam-2b-v0.5',label:'Sarvam 2B',provider:'sarvam',speed:'fast',tier:'free',specialty:'Hindi · Hinglish · Indian languages',bestFor:['general'],capabilities:['text'],description:'India\'s own LLM.'},
  // Together
  { id:'meta-llama/Llama-3-8b-chat-hf',label:'Llama 3 8B',provider:'together',speed:'fast',tier:'free',specialty:'General · Chat',bestFor:['general'],capabilities:['text'],description:'Llama 3 on Together.'},
  // Fireworks
  { id:'accounts/fireworks/models/llama-v3p1-8b-instruct',label:'Llama 3.1 8B (FW)',provider:'fireworks',speed:'fast',tier:'free',specialty:'General · Fast inference',bestFor:['general'],capabilities:['text'],description:'Optimized inference.'},
  // OpenAI (paid)
  { id:'gpt-4o-mini',label:'GPT-4o Mini',provider:'openai',speed:'fast',tier:'paid',specialty:'General · All-round',bestFor:['general'],capabilities:['text','image_input','pdf'],description:'Efficient paid model.'},
  { id:'gpt-4o',label:'GPT-4o',provider:'openai',speed:'medium',tier:'paid',specialty:'Deep reasoning · Research',bestFor:['deep','research'],capabilities:['text','image_input','pdf','audio_input'],description:'Most capable OpenAI.'},
  // xAI / Grok
  { id:'grok-3-mini-fast',label:'Grok 3 Mini Fast',provider:'xai',speed:'fast',tier:'paid',specialty:'General · Fast reasoning',bestFor:['general'],capabilities:['text'],description:'xAI fastest Grok.'},
  { id:'grok-3-mini',label:'Grok 3 Mini',provider:'xai',speed:'fast',tier:'paid',specialty:'Reasoning · Code',bestFor:['general','deep'],capabilities:['text'],description:'Strong reasoning and code.'},
  { id:'grok-3',label:'Grok 3',provider:'xai',speed:'medium',tier:'paid',specialty:'Deep reasoning · Research',bestFor:['deep','research'],capabilities:['text','image_input'],description:'Most capable xAI model.'},
  // AIML API
  { id:'moonshot-v1-8k',label:'Kimi 8K (AIML)',provider:'aimlapi',speed:'fast',tier:'free',specialty:'General · Code',bestFor:['general'],capabilities:['text'],description:'Kimi via AIML gateway.'},
];

export default function ChatPage() {
  const router = useRouter();

  // Auth state
  const [userInfo, setUserInfo] = useState(null);
  const [voiceGender, setVoiceGender] = useState('female');

  // Core state
  const [threads, setThreads] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [mode, setMode] = useState('general');
  const [autoMode, setAutoMode] = useState(true);
  const [selectedModelId, setSelectedModelId] = useState(null);
  const [availableProviders, setAvailableProviders] = useState(['cerebras','sambanova','groq','openrouter','google','mistral','cohere','nvidia','cloudflare','sarvam','huggingface','together','fireworks','kimi','minimax','deepseek','openai','xai','aimlapi']);

  // UI state
  const [streamingText, setStreamingText] = useState('');
  const [streamingModel, setStreamingModel] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [voiceState, setVoiceState] = useState('idle');
  const [isDuplex, setIsDuplex] = useState(false);
  const [usage, setUsage] = useState({ count: 0, limit: 50 });
  const [attachments, setAttachments] = useState([]);
  const [ragContext, setRagContext] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);

  // Check auth on mount
  useEffect(() => {
    const stored = localStorage.getItem('jarvis_user');
    if (!stored) { router.push('/'); return; }
    try { setUserInfo(JSON.parse(stored)); } catch { router.push('/'); }
    const savedGender = localStorage.getItem('jarvis_voice_gender');
    if (savedGender) setVoiceGender(savedGender);
  }, [router]);

  const isDeveloper = userInfo?.role === 'developer';

  // Voice refs
  const vadRef = useRef(null);
  const isAssistantSpeakingRef = useRef(false);
  const currentLLMReaderRef = useRef(null);
  const pttTimerRef = useRef(null);
  const pttRecordingRef = useRef(false);
  const pttStreamRef = useRef(null);
  const pttRecorderRef = useRef(null);
  const pttChunksRef = useRef([]);
  const fullResponseBufRef = useRef('');
  const lastSentenceEndRef = useRef(0);

  // Fetch usage on mount + dual-layer thread loading
  useEffect(() => {
    fetch('/api/usage').then(r => r.json()).then(d => {
      if (d.count !== undefined) setUsage({ count: d.count, limit: d.limit });
    }).catch(() => {});

    // 1. Load from localStorage immediately (zero flash)
    const localData = getLocalThreads();
    const localThreadArray = Object.entries(localData)
      .filter(([, v]) => v && v.meta)
      .map(([id, v]) => ({ id, ...v.meta }))
      .sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0));
    if (localThreadArray.length > 0) setThreads(localThreadArray);

    // 2. Fetch from DB in background, merge
    fetch('/api/threads').then(r => r.json()).then(data => {
      if (Array.isArray(data) && data.length > 0) {
        setThreads(data);
        // Update localStorage with DB data
        const newLocal = { ...localData };
        data.forEach(t => {
          if (!newLocal[t.id]) newLocal[t.id] = { messages: [], meta: t, synced: true };
          else { newLocal[t.id].meta = t; newLocal[t.id].synced = true; }
        });
        setLocalThreads(newLocal);
      }
    }).catch(() => {});
  }, []);

  // Entrance animation
  useEffect(() => {
    const items = ['.top-nav','.sidebar','.right-panel','.chat-feed','.input-bar-wrapper'];
    items.forEach((sel, i) => {
      const el = document.querySelector(sel);
      if (!el) return;
      el.style.opacity = '0';
      el.style.transform = 'translateY(12px)';
      setTimeout(() => {
        el.style.transition = 'opacity 600ms cubic-bezier(0.16,1,0.3,1), transform 600ms cubic-bezier(0.16,1,0.3,1)';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, i * 100 + 100);
    });
  }, []);

  // Show toast
  const showToast = useCallback((msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  }, []);

  // ── Thread Management ──
  const createThread = useCallback(async () => {
    // Create in DB
    try {
      const res = await fetch('/api/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New conversation', mode }),
      });
      const newThread = await res.json();
      if (newThread.id) {
        setThreads(prev => [newThread, ...prev]);
        setActiveThreadId(newThread.id);
        setLocalCurrentThreadId(newThread.id);
        setMessages([]);
        setStreamingText('');
        setRagContext('');
        setAttachments([]);
        // Cache in localStorage
        const local = getLocalThreads();
        local[newThread.id] = { messages: [], meta: newThread, synced: true };
        setLocalThreads(local);
        return newThread.id;
      }
    } catch (e) { console.error('Create thread failed:', e); }
    // Fallback to client-side only
    const fallbackId = crypto.randomUUID();
    const fallback = { id: fallbackId, title: 'New conversation', mode, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    setThreads(prev => [fallback, ...prev]);
    setActiveThreadId(fallbackId);
    setLocalCurrentThreadId(fallbackId);
    setMessages([]);
    setStreamingText('');
    setRagContext('');
    setAttachments([]);
    // Cache in localStorage
    const local = getLocalThreads();
    local[fallbackId] = { messages: [], meta: fallback, synced: false };
    setLocalThreads(local);
    return fallbackId;
  }, [mode]);

  const deleteThread = useCallback((id) => {
    setThreads(prev => prev.filter(t => t.id !== id));
    if (activeThreadId === id) { setActiveThreadId(null); setMessages([]); }
    deleteLocalThread(id);
    fetch('/api/threads', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ threadId: id }) }).catch(() => {});
  }, [activeThreadId]);

  const selectThread = useCallback(async (id) => {
    setActiveThreadId(id);
    setLocalCurrentThreadId(id);
    const thread = threads.find(t => t.id === id);
    if (thread?.mode) setMode(thread.mode);
    setStreamingText('');

    // 1. Load from localStorage instantly (zero flash)
    const localData = getLocalThreads();
    if (localData[id]?.messages?.length > 0) {
      setMessages(localData[id].messages.map((m, i) => ({ id: m.id || `local-${i}`, ...m })));
    } else {
      setMessages([]);
    }

    // 2. Backfill from DB in background
    try {
      const res = await fetch(`/api/messages?threadId=${id}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setMessages(data);
        // Update localStorage cache
        const updated = getLocalThreads();
        if (!updated[id]) updated[id] = { messages: [], meta: {} };
        updated[id].messages = data.slice(-100);
        setLocalThreads(updated);
      }
    } catch {}
  }, [threads]);

  // ── SSE Stream Parser ──
  const parseSSEStream = useCallback(async (response, onToken, onDone) => {
    const reader = response.body.getReader();
    currentLLMReaderRef.current = reader;
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const payload = line.slice(6).trim();
          if (payload === '[DONE]') { onDone(); return; }
          try {
            const parsed = JSON.parse(payload);
            const token = parsed.choices?.[0]?.delta?.content || '';
            if (token) onToken(token);
          } catch {}
        }
      }
    } catch (e) {
      if (e.name !== 'AbortError') console.error('Stream error:', e);
    }
    onDone();
  }, []);

  // ── TTS with Indian neutral accent voice selection ──
  const getIndianVoice = useCallback((gender) => {
    const voices = speechSynthesis?.getVoices() || [];
    const genderKey = gender || voiceGender || 'female';
    // Priority: Indian English voices
    const indianVoices = voices.filter(v =>
      v.lang.startsWith('en') && (v.name.toLowerCase().includes('india') || v.lang.includes('IN'))
    );
    // Try to match gender preference
    const genderHints = genderKey === 'male'
      ? ['male', 'ravi', 'raj', 'amit', 'man', 'guy']
      : ['female', 'woman', 'girl', 'aditi', 'priya', 'neerja', 'lekha'];
    const genderMatch = indianVoices.find(v =>
      genderHints.some(h => v.name.toLowerCase().includes(h))
    );
    if (genderMatch) return genderMatch;
    if (indianVoices.length > 0) return indianVoices[0];
    // Fallback: any English voice matching gender hints
    const engVoices = voices.filter(v => v.lang.startsWith('en'));
    const engGender = engVoices.find(v =>
      genderHints.some(h => v.name.toLowerCase().includes(h))
    );
    if (engGender) return engGender;
    return engVoices[0] || voices[0] || null;
  }, [voiceGender]);

  const speakSentence = useCallback((text) => {
    return new Promise(resolve => {
      // Try ElevenLabs duplex first (if available)
      const elInstance = getElevenLabsInstance();
      if (elInstance) {
        try {
          elInstance.sendText(text);
          resolve(); // ElevenLabs handles playback asynchronously
          return;
        } catch { /* fall through to browser TTS */ }
      }

      // Fallback: browser SpeechSynthesis
      if (typeof window === 'undefined' || !window.speechSynthesis) { resolve(); return; }
      const utt = new SpeechSynthesisUtterance(text);
      utt.rate = 1.05;
      utt.pitch = voiceGender === 'male' ? 0.9 : 1.1;
      const voice = getIndianVoice(voiceGender);
      if (voice) utt.voice = voice;
      utt.onend = resolve;
      utt.onerror = resolve;
      speechSynthesis.speak(utt);
    });
  }, [voiceGender, getIndianVoice]);

  // ── Send Message ──
  const sendMessage = useCallback(async (content) => {
    if (!content.trim() && attachments.length === 0) return;
    // Developer mode bypasses all limits
    if (!isDeveloper && usage.count >= usage.limit) {
      showToast(`⚡ Daily limit reached (${usage.limit}/${usage.limit}). Resets at midnight!`);
      return;
    }

    let threadId = activeThreadId;
    if (!threadId) threadId = await createThread();

    // Build user message
    const userMsg = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      created_at: new Date().toISOString(),
      attachments: [...attachments],
    };
    setMessages(prev => [...prev, userMsg]);
    setAttachments([]);
    setIsLoading(true);
    setVoiceState('thinking');
    // Cache user message in localStorage
    saveMessageToLocal(threadId, { role: 'user', content, created_at: userMsg.created_at });

    // Build messages array for API with context window compression
    const allMsgs = [...messages, { role: 'user', content }].map(m => ({
      role: m.role,
      content: m.content,
    }));
    // Apply rolling context window — last 20 verbatim, older messages summarized
    const localData = getLocalThreads();
    const threadSummary = localData[threadId]?.meta?.summary || null;
    const apiMessages = buildContextWindow(allMsgs, threadSummary);

    // Auto-title thread from first message
    if (messages.length === 0) {
      const title = content.slice(0, 50) + (content.length > 50 ? '...' : '');
      setThreads(prev => prev.map(t => t.id === threadId ? { ...t, title } : t));
    }

    // Auto-search for research mode
    let searchContext = ragContext || '';
    if (mode === 'research') {
      try {
        const searchRes = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: content }),
        });
        const searchData = await searchRes.json();
        if (searchData.source === 'tavily' && searchData.results?.length) {
          const searchText = searchData.results.map(r => `[${r.title}](${r.url}): ${r.content}`).join('\n\n');
          searchContext += `\n\n--- WEB SEARCH RESULTS ---\n${searchData.answer || ''}\n\n${searchText}\n--- END SEARCH ---`;
        }
      } catch (e) { console.error('Search failed:', e); }
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          mode,
          modelId: autoMode ? null : selectedModelId,
          threadId,
          ragContext: searchContext || null,
        }),
      });

      if (res.status === 429) {
        showToast(`⚡ Daily limit reached (${usage.limit}/${usage.limit}). Resets at midnight!`);
        setIsLoading(false);
        setVoiceState(isDuplex ? 'listening' : 'idle');
        return;
      }

      if (!res.ok) {
        const err = await res.json();
        showToast(`Error: ${err.error || 'Request failed'}`);
        setIsLoading(false);
        setVoiceState(isDuplex ? 'listening' : 'idle');
        return;
      }

      const modelUsed = res.headers.get('X-Model-Used') || '';
      const providerUsed = res.headers.get('X-Provider-Used') || '';
      setStreamingModel(modelUsed);
      setVoiceState('speaking');
      isAssistantSpeakingRef.current = true;
      fullResponseBufRef.current = '';
      lastSentenceEndRef.current = 0;

      let fullText = '';
      let sentenceBuffer = '';

      await parseSSEStream(
        res,
        (token) => {
          fullText += token;
          fullResponseBufRef.current = fullText;
          setStreamingText(fullText);

          // Sentence-level TTS
          sentenceBuffer += token;
          const sentenceEnd = sentenceBuffer.search(/[.!?।\n]/);
          if (sentenceEnd > 0) {
            const toSpeak = sentenceBuffer.slice(0, sentenceEnd + 1).trim();
            sentenceBuffer = sentenceBuffer.slice(sentenceEnd + 1);
            lastSentenceEndRef.current = fullText.length - sentenceBuffer.length;
            if (toSpeak.length > 2 && isDuplex) speakSentence(toSpeak);
          }
        },
        () => {
          // Speak remaining buffer
          if (sentenceBuffer.trim().length > 2 && isDuplex) speakSentence(sentenceBuffer.trim());

          // Finalize message
          const assistantMsg = {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: fullText,
            model: modelUsed,
            provider: providerUsed,
            mode,
            created_at: new Date().toISOString(),
          };
          setMessages(prev => [...prev, assistantMsg]);
          setStreamingText('');
          setStreamingModel('');
          setIsLoading(false);
          isAssistantSpeakingRef.current = false;
          fullResponseBufRef.current = '';
          lastSentenceEndRef.current = 0;
          setVoiceState(isDuplex ? 'listening' : 'idle');
          setUsage(prev => ({ ...prev, count: prev.count + 1 }));

          // Cache assistant message in localStorage
          saveMessageToLocal(threadId, { role: 'assistant', content: fullText, model: modelUsed, provider: providerUsed, mode, created_at: assistantMsg.created_at });

          // Save assistant message to DB (async)
          if (threadId && fullText) {
            fetch('/api/chat/save', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ threadId, content: fullText, model: modelUsed, mode }),
            }).catch(() => {});
          }
        }
      );
    } catch (err) {
      console.error('Send error:', err);
      showToast('Failed to send message');
      setIsLoading(false);
      setVoiceState(isDuplex ? 'listening' : 'idle');
    }
  }, [activeThreadId, messages, mode, autoMode, selectedModelId, ragContext, isDuplex, usage, attachments, createThread, showToast, parseSSEStream, speakSentence]);

  // ── File Handling ──
  const handleFileSelect = useCallback(async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    if (activeThreadId) formData.append('threadId', activeThreadId);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok) {
        setAttachments(prev => [...prev, { fileName: data.fileName, fileType: data.fileType, path: data.path }]);

        // Handle client-side text extraction
        if (data.extractedText === '__CLIENT_EXTRACT__' && file.type === 'application/pdf') {
          try {
            const pdfjsLib = await import('pdfjs-dist');
            pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js`;
            const buf = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
            let text = '';
            for (let i = 1; i <= Math.min(pdf.numPages, 50); i++) {
              const page = await pdf.getPage(i);
              const content = await page.getTextContent();
              text += content.items.map(item => item.str).join(' ') + '\n';
            }
            setRagContext(prev => prev + '\n' + text.slice(0, 100000));
          } catch (e) { console.error('PDF extraction failed:', e); }
        } else if (data.extractedText === '__CLIENT_EXTRACT_DOCX__') {
          try {
            const mammoth = await import('mammoth');
            const buf = await file.arrayBuffer();
            const result = await mammoth.extractRawText({ arrayBuffer: buf });
            setRagContext(prev => prev + '\n' + result.value.slice(0, 100000));
          } catch (e) { console.error('DOCX extraction failed:', e); }
        } else if (data.extractedText && !data.extractedText.startsWith('__')) {
          setRagContext(prev => prev + '\n' + data.extractedText);
        }
        showToast(`📎 ${data.fileName} attached`);
      } else {
        showToast(`Upload failed: ${data.error}`);
      }
    } catch (e) {
      showToast('Upload failed');
    }
  }, [activeThreadId, showToast]);

  // ── PTT (Push-to-Talk) ──
  const handlePTTStart = useCallback(() => {
    const micBtn = document.getElementById('mic-btn');
    if (micBtn) micBtn.classList.add('ptt-charging');

    pttTimerRef.current = setTimeout(async () => {
      pttRecordingRef.current = true;
      if (micBtn) { micBtn.classList.remove('ptt-charging'); micBtn.classList.add('ptt-recording'); }
      pttChunksRef.current = [];
      try {
        pttStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
        pttRecorderRef.current = new MediaRecorder(pttStreamRef.current);
        pttRecorderRef.current.ondataavailable = e => pttChunksRef.current.push(e.data);
        pttRecorderRef.current.start();
        setVoiceState('listening');
      } catch (e) {
        showToast('Microphone access denied');
        pttRecordingRef.current = false;
        if (micBtn) micBtn.classList.remove('ptt-recording');
      }
    }, 2000);
  }, [showToast]);

  const handlePTTEnd = useCallback(() => {
    clearTimeout(pttTimerRef.current);
    const micBtn = document.getElementById('mic-btn');
    if (micBtn) micBtn.classList.remove('ptt-charging', 'ptt-recording');

    if (!pttRecordingRef.current) return;
    pttRecordingRef.current = false;

    if (pttRecorderRef.current && pttRecorderRef.current.state !== 'inactive') {
      pttRecorderRef.current.stop();
      pttRecorderRef.current.onstop = async () => {
        const blob = new Blob(pttChunksRef.current, { type: 'audio/webm' });
        if (pttStreamRef.current) pttStreamRef.current.getTracks().forEach(t => t.stop());

        setVoiceState('thinking');
        const form = new FormData();
        form.append('file', blob, 'ptt.webm');
        try {
          const res = await fetch('/api/stt', { method: 'POST', body: form });
          const { text } = await res.json();
          if (text?.trim()) sendMessage(text);
          else setVoiceState('idle');
        } catch {
          showToast('Transcription failed');
          setVoiceState('idle');
        }
      };
    }
  }, [sendMessage, showToast]);

  // ── Full Duplex VAD ──
  const toggleDuplex = useCallback(async () => {
    if (isDuplex) {
      // Turn off
      stopDuplex();
      destroyElevenLabsDuplex();
      if (vadRef.current) { vadRef.current.destroy(); vadRef.current = null; }
      speechSynthesis?.cancel();
      setIsDuplex(false);
      setVoiceState('idle');
      return;
    }

    // Turn on — try ElevenLabs duplex first, fallback to browser TTS
    setIsDuplex(true);
    setVoiceState('listening');

    // Attempt ElevenLabs WebSocket connection (async, non-blocking)
    try {
      const tokenRes = await fetch('/api/tts/token');
      if (tokenRes.ok) {
        const { key, voices } = await tokenRes.json();
        if (key) {
          const voiceId = voiceGender === 'male' ? voices?.male : voices?.female;
          const el = await initElevenLabsDuplex(key, voiceGender);
          if (el) {
            console.log('[JARVIS] ElevenLabs duplex connected');
            el.onEnd = () => {
              if (!isAssistantSpeakingRef.current) setVoiceState('listening');
            };
          }
        }
      }
    } catch (e) {
      console.log('[JARVIS] ElevenLabs unavailable, using browser TTS:', e.message);
    }
  }, [isDuplex, voiceGender]);

  // Duplex state change handler (from DuplexToggle)
  const handleDuplexStateChange = useCallback((state, data) => {
    if (state === 'speech_start') {
      if (isAssistantSpeakingRef.current) {
        // Smart interrupt logic
        const buf = fullResponseBufRef.current;
        const lastEnd = lastSentenceEndRef.current;
        const inProgress = buf.slice(lastEnd);
        const wordsSince = inProgress.trim().split(/\s+/).length;
        if (wordsSince <= 4) {
          speechSynthesis?.cancel();
          if (currentLLMReaderRef.current) { currentLLMReaderRef.current.cancel().catch(() => {}); currentLLMReaderRef.current = null; }
          isAssistantSpeakingRef.current = false;
        } else {
          const nextPunct = inProgress.search(/[.!?।]/);
          if (nextPunct > 0 && nextPunct < 80) {
            setTimeout(() => {
              speechSynthesis?.cancel();
              if (currentLLMReaderRef.current) { currentLLMReaderRef.current.cancel().catch(() => {}); currentLLMReaderRef.current = null; }
              isAssistantSpeakingRef.current = false;
            }, 800);
          } else {
            speechSynthesis?.cancel();
            if (currentLLMReaderRef.current) { currentLLMReaderRef.current.cancel().catch(() => {}); currentLLMReaderRef.current = null; }
            isAssistantSpeakingRef.current = false;
          }
        }
      }
      setVoiceState('listening');
    } else if (state === 'speech_end') {
      setVoiceState('thinking');
      if (typeof data === 'string') {
        // Fallback STT — data is text
        if (data.trim().length >= 2) sendMessage(data);
        else setVoiceState('listening');
      } else if (data) {
        // VAD — data is Float32Array
        const wavBlob = float32ToWav(data, 16000);
        const form = new FormData();
        form.append('file', wavBlob, 'speech.wav');
        fetch('/api/stt', { method: 'POST', body: form })
          .then(r => r.json())
          .then(({ text }) => {
            if (text?.trim() && text.trim().length >= 2) sendMessage(text);
            else setVoiceState('listening');
          })
          .catch(() => setVoiceState('listening'));
      }
    }
  }, [sendMessage]);

  // Cleanup VAD + ElevenLabs on unmount
  useEffect(() => {
    return () => {
      if (vadRef.current) vadRef.current.destroy();
      stopDuplex();
      destroyElevenLabsDuplex();
    };
  }, []);



  const handleVoiceGenderChange = useCallback((gender) => {
    setVoiceGender(gender);
    localStorage.setItem('jarvis_voice_gender', gender);
  }, []);

  return (
    <>
      <Cursor />
      <TopNav
        status={voiceState}
        usage={usage}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onTogglePanel={() => setPanelOpen(!panelOpen)}
        userInfo={userInfo}
        streamingModel={streamingModel}
      />
      <div className="app-layout">
        {(sidebarOpen || panelOpen) && (
          <div className={`drawer-overlay show`} onClick={() => { setSidebarOpen(false); setPanelOpen(false); }} />
        )}
        <Sidebar
          threads={threads}
          activeThreadId={activeThreadId}
          onSelectThread={selectThread}
          onNewThread={createThread}
          onDeleteThread={deleteThread}
          isDuplex={isDuplex}
          onToggleDuplex={toggleDuplex}
          isOpen={sidebarOpen}
          voiceGender={voiceGender}
          onVoiceGenderChange={handleVoiceGenderChange}
          onDuplexStateChange={handleDuplexStateChange}
        />
        <div className="chat-area">
          <ChatFeed messages={messages} mode={mode} streamingText={streamingText} streamingModel={streamingModel} isThinking={isLoading && !streamingText} />
          <InputBar
            onSend={sendMessage}
            onFileSelect={handleFileSelect}
            attachments={attachments}
            onRemoveAttachment={(i) => setAttachments(prev => prev.filter((_, j) => j !== i))}
            isDuplex={isDuplex}
            isLoading={isLoading}
            onPTTStart={handlePTTStart}
            onPTTEnd={handlePTTEnd}
            currentModelCapabilities={(() => {
              const m = selectedModelId ? ALL_MODELS.find(m => m.id === selectedModelId) : null;
              return m?.capabilities || ['text'];
            })()}
            onShowToast={showToast}
          />
        </div>
        <aside className={`right-panel ${panelOpen ? 'open' : ''}`}>
          {isDuplex && <VoiceOrb state={voiceState} isDuplex={isDuplex} />}
          <ModeSelector activeMode={mode} onSelectMode={(m) => { setMode(m); if (activeThreadId) setThreads(prev => prev.map(t => t.id === activeThreadId ? { ...t, mode: m } : t)); }} />
          <ModelPicker
            models={ALL_MODELS}
            activeModelId={selectedModelId}
            autoMode={autoMode}
            onSelectModel={(id) => { setSelectedModelId(id); setAutoMode(false); }}
            onToggleAuto={() => { setAutoMode(true); setSelectedModelId(null); }}
            availableProviders={availableProviders}
          />
        </aside>
      </div>
      <div className={`toast ${toastMsg ? 'show' : ''}`}>{toastMsg}</div>
    </>
  );
}

// Helper: Float32 PCM to WAV Blob
function float32ToWav(float32, sampleRate = 16000) {
  const length = float32.length;
  const buffer = new ArrayBuffer(44 + length * 2);
  const view = new DataView(buffer);

  function writeString(offset, str) {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  }

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, length * 2, true);

  for (let i = 0; i < length; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]));
    view.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }

  return new Blob([buffer], { type: 'audio/wav' });
}
