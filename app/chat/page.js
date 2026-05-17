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

const Cursor = dynamic(() => import('@/components/Cursor'), { ssr: false });

const ALL_MODELS = [
  { id:'deepseek-chat',label:'DeepSeek V3',provider:'deepseek',speed:'fast',tier:'free',bestFor:['general','study']},
  { id:'deepseek-reasoner',label:'DeepSeek R1',provider:'deepseek',speed:'medium',tier:'free',bestFor:['deep']},
  { id:'llama-3.1-8b-instant',label:'Llama 3.1 8B',provider:'groq',speed:'fast',tier:'free',bestFor:['general']},
  { id:'llama-3.3-70b-versatile',label:'Llama 3.3 70B',provider:'groq',speed:'medium',tier:'free',bestFor:['study','research']},
  { id:'gemma2-9b-it',label:'Gemma 2 9B',provider:'groq',speed:'fast',tier:'free',bestFor:['general']},
  { id:'mixtral-8x7b-32768',label:'Mixtral 8x7B',provider:'groq',speed:'fast',tier:'free',bestFor:['general']},
  { id:'deepseek/deepseek-r1:free',label:'DeepSeek R1 (OR)',provider:'openrouter',speed:'medium',tier:'free',bestFor:['deep']},
  { id:'deepseek/deepseek-v3:free',label:'DeepSeek V3 (OR)',provider:'openrouter',speed:'fast',tier:'free',bestFor:['general']},
  { id:'google/gemma-2-9b-it:free',label:'Gemma 2 9B (OR)',provider:'openrouter',speed:'fast',tier:'free',bestFor:['general']},
  { id:'meta-llama/llama-3.1-8b-instruct:free',label:'Llama 3.1 8B (OR)',provider:'openrouter',speed:'fast',tier:'free',bestFor:['general']},
  { id:'mistralai/mistral-7b-instruct:free',label:'Mistral 7B (OR)',provider:'openrouter',speed:'fast',tier:'free',bestFor:['general']},
  { id:'microsoft/phi-3-mini-128k-instruct:free',label:'Phi-3 Mini (OR)',provider:'openrouter',speed:'fast',tier:'free',bestFor:['study']},
  { id:'meta-llama/Llama-3-8b-chat-hf',label:'Llama 3 8B',provider:'together',speed:'fast',tier:'free',bestFor:['general']},
  { id:'mistralai/Mistral-7B-Instruct-v0.2',label:'Mistral 7B',provider:'together',speed:'fast',tier:'free',bestFor:['general']},
  { id:'gemini-1.5-flash',label:'Gemini 1.5 Flash',provider:'google',speed:'fast',tier:'free',bestFor:['general','research']},
  { id:'gemini-2.0-flash-exp',label:'Gemini 2.0 Flash',provider:'google',speed:'fast',tier:'free',bestFor:['research']},
  { id:'meta/llama-3.1-8b-instruct',label:'Llama 3.1 8B (NIM)',provider:'nvidia',speed:'fast',tier:'free',bestFor:['general']},
  { id:'deepseek/deepseek-r1',label:'DeepSeek R1 (NIM)',provider:'nvidia',speed:'medium',tier:'free',bestFor:['deep']},
  { id:'gpt-4o-mini',label:'GPT-4o Mini',provider:'openai',speed:'fast',tier:'paid',bestFor:['general']},
  { id:'gpt-4o',label:'GPT-4o',provider:'openai',speed:'medium',tier:'paid',bestFor:['deep','research']},
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
  const [availableProviders, setAvailableProviders] = useState(['deepseek','groq','openrouter','google','together','nvidia']);

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

  // Fetch usage on mount
  useEffect(() => {
    fetch('/api/usage').then(r => r.json()).then(d => {
      if (d.count !== undefined) setUsage({ count: d.count, limit: d.limit });
    }).catch(() => {});
    // Load threads from DB
    fetch('/api/threads').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setThreads(data);
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
        setMessages([]);
        setStreamingText('');
        setRagContext('');
        setAttachments([]);
        return newThread.id;
      }
    } catch (e) { console.error('Create thread failed:', e); }
    // Fallback to client-side only
    const fallbackId = crypto.randomUUID();
    const fallback = { id: fallbackId, title: 'New conversation', mode, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    setThreads(prev => [fallback, ...prev]);
    setActiveThreadId(fallbackId);
    setMessages([]);
    setStreamingText('');
    setRagContext('');
    setAttachments([]);
    return fallbackId;
  }, [mode]);

  const deleteThread = useCallback((id) => {
    setThreads(prev => prev.filter(t => t.id !== id));
    if (activeThreadId === id) { setActiveThreadId(null); setMessages([]); }
    fetch('/api/threads', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ threadId: id }) }).catch(() => {});
  }, [activeThreadId]);

  const selectThread = useCallback(async (id) => {
    setActiveThreadId(id);
    const thread = threads.find(t => t.id === id);
    if (thread?.mode) setMode(thread.mode);
    setStreamingText('');
    // Load messages from DB
    try {
      const res = await fetch(`/api/messages?threadId=${id}`);
      const data = await res.json();
      if (Array.isArray(data)) setMessages(data);
      else setMessages([]);
    } catch { setMessages([]); }
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

    // Build messages array for API
    const apiMessages = [...messages, { role: 'user', content }].map(m => ({
      role: m.role,
      content: m.content,
    }));

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
      if (vadRef.current) { vadRef.current.destroy(); vadRef.current = null; }
      speechSynthesis?.cancel();
      setIsDuplex(false);
      setVoiceState('idle');
      return;
    }

    // Turn on — init VAD
    try {
      const { MicVAD } = await import('@ricky0123/vad-web');
      vadRef.current = await MicVAD.new({
        positiveSpeechThreshold: 0.5,
        negativeSpeechThreshold: 0.35,
        redemptionFrames: 10,
        minSpeechFrames: 5,
        preSpeechPadFrames: 5,

        onSpeechStart() {
          if (isAssistantSpeakingRef.current) {
            // Smart interrupt logic
            const buf = fullResponseBufRef.current;
            const lastEnd = lastSentenceEndRef.current;
            const inProgress = buf.slice(lastEnd);
            const wordsSince = inProgress.trim().split(/\s+/).length;
            if (wordsSince <= 4) {
              // Few words into sentence — cut immediately
              speechSynthesis?.cancel();
              if (currentLLMReaderRef.current) { currentLLMReaderRef.current.cancel().catch(() => {}); currentLLMReaderRef.current = null; }
              isAssistantSpeakingRef.current = false;
            } else {
              // Check if sentence end is close
              const nextPunct = inProgress.search(/[.!?।]/);
              if (nextPunct > 0 && nextPunct < 80) {
                // Let current TTS utterance finish, then stop
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
        },

        async onSpeechEnd(audioFloat32) {
          setVoiceState('thinking');
          // Convert Float32 to WAV
          const wavBlob = float32ToWav(audioFloat32, 16000);
          const form = new FormData();
          form.append('file', wavBlob, 'speech.wav');
          try {
            const res = await fetch('/api/stt', { method: 'POST', body: form });
            const { text } = await res.json();
            if (text?.trim() && text.trim().length >= 2) {
              sendMessage(text);
            } else {
              setVoiceState('listening');
            }
          } catch {
            setVoiceState('listening');
          }
        },

        onVADMisfire() {
          if (!isAssistantSpeakingRef.current) setVoiceState('listening');
        },
      });
      vadRef.current.start();
      setIsDuplex(true);
      setVoiceState('listening');
    } catch (e) {
      console.error('VAD init failed:', e);
      showToast('Voice activation failed. Check microphone permissions.');
    }
  }, [isDuplex, sendMessage, showToast]);

  // Cleanup VAD on unmount
  useEffect(() => {
    return () => { if (vadRef.current) vadRef.current.destroy(); };
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
        />
        <div className="chat-area">
          <ChatFeed messages={messages} mode={mode} streamingText={streamingText} />
          <InputBar
            onSend={sendMessage}
            onFileSelect={handleFileSelect}
            attachments={attachments}
            onRemoveAttachment={(i) => setAttachments(prev => prev.filter((_, j) => j !== i))}
            isDuplex={isDuplex}
            isLoading={isLoading}
            onPTTStart={handlePTTStart}
            onPTTEnd={handlePTTEnd}
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
