'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ParticleBackground from '@/components/ParticleBackground';
import { initDuplex, stopDuplex } from '@/lib/duplex';
import ImagineView from '@/components/ImagineView';
import ProjectsView from '@/components/ProjectsView';
import ArtifactsView from '@/components/ArtifactsView';
import JarvisLogo from '@/components/JarvisLogo';

// ─── ELEGANT SLIM SVG ICONS ───
const SearchIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const ChatsIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const ProjectsIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

const ImagineIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const ArtifactsIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const VoiceIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path d="M19 10v1a7 7 0 0 1-14 0v-1M12 19v4M8 23h8" />
  </svg>
);

const SettingsIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const SunIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </svg>
);

const MoonIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
);

const IncognitoIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" y1="2" x2="22" y2="22" />
  </svg>
);

const SendIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <line x1="12" y1="19" x2="12" y2="5" />
    <polyline points="5 12 12 5 19 12" />
  </svg>
);

const PlusIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

// ─── HIGH FIDELITY WAV ENCODER FOR DUPLEX VOICE ───
function float32ToWav(float32Array, sampleRate = 16000) {
  const buffer = new ArrayBuffer(44 + float32Array.length * 2);
  const view = new DataView(buffer);

  // Write RIFF Header descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + float32Array.length * 2, true);
  writeString(view, 8, 'WAVE');
  
  // Write format subchunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // Linear PCM
  view.setUint16(22, 1, true); // 1 channel (mono)
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // Byte rate
  view.setUint16(32, 2, true); // Block align
  view.setUint16(34, 16, true); // 16-bit PCM

  // Write data subchunk descriptor
  writeString(view, 36, 'data');
  view.setUint32(40, float32Array.length * 2, true);

  // Write PCM audio samples
  let offset = 44;
  for (let i = 0; i < float32Array.length; i++, offset += 2) {
    let s = Math.max(-1, Math.min(1, float32Array[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return new Blob([view], { type: 'audio/wav' });
}

function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

const MODELS = [
  { id: 'google/gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite', provider: 'Google', category: 'general', description: 'Google\'s fastest native speed model', free: true },
  { id: 'google/gemini-3-flash-preview', name: 'Gemini 3 Flash', provider: 'Google', category: 'general', description: 'Google\'s newest premium flagship preview', free: true },
  { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'Google', category: 'reasoning', description: 'Google\'s premium reasoning & coding model', free: false },
  { id: 'google/gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro (Preview)', provider: 'Google', category: 'reasoning', description: 'Google\'s absolute latest high-intelligence model', free: false },
  { id: 'groq/llama-3.3-70b-versatile', name: 'Llama 3.3 70B (Groq)', provider: 'Groq', category: 'coding', description: 'Ultra-low latency open-weights powerhouse', free: true },
  { id: 'openrouter/deepseek/deepseek-chat', name: 'DeepSeek V3 (OpenRouter)', provider: 'OpenRouter', category: 'general', description: 'DeepSeek flagship intelligence via OpenRouter', free: true },
  { id: 'openrouter/deepseek/deepseek-r1', name: 'DeepSeek R1 (OpenRouter)', provider: 'OpenRouter', category: 'reasoning', description: 'Full reasoning chain-of-thought model', free: false },
  { id: 'nvidia/deepseek/deepseek-r1', name: 'DeepSeek R1 (NVIDIA NIM)', provider: 'NVIDIA', category: 'reasoning', description: 'Nvidia-hosted elite reasoning model', free: false },
  { id: 'nvidia/nvidia/llama-3.1-nemotron-70b-instruct', name: 'Nemotron 70B (NVIDIA NIM)', provider: 'NVIDIA', category: 'general', description: 'Nvidia\'s custom fine-tuned powerhouse', free: false },
  { id: 'nvidia/meta/llama-3.3-70b-instruct', name: 'Llama 3.3 70B (NVIDIA NIM)', provider: 'NVIDIA', category: 'coding', description: 'Meta Llama 3.3 running on NIM hardware', free: false },
  { id: 'minimax/minimax-m2.5', name: 'MiniMax M2.5', provider: 'MiniMax', category: 'creative', description: 'MiniMax creative writing & dialogue specialist', free: true },
];

const CATEGORIES = [
  { key: 'all', label: 'All Models' },
  { key: 'coding', label: 'Code' },
  { key: 'reasoning', label: 'Deep Think' },
  { key: 'general', label: 'General' },
  { key: 'creative', label: 'Creative' },
];

export default function ChatPage() {
  const router = useRouter();
  
  // App core states
  const [userInfo, setUserInfo] = useState(null);
  const [isDark, setIsDark] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState('google/gemini-3.1-flash-lite');
  const [activeCategory, setActiveCategory] = useState('all');
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [incognitoEnabled, setIncognitoEnabled] = useState(false);
  const [activeMode, setActiveMode] = useState('general');
  const fileInputRef = useRef(null);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [voiceGender, setVoiceGender] = useState('female');
  const [activeTab, setActiveTab] = useState('chat');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab) {
        setActiveTab(tab);
      }
    }
  }, []);

  useEffect(() => {
    const handleOutsideClick = () => setModelMenuOpen(false);
    if (modelMenuOpen) {
      window.addEventListener('click', handleOutsideClick);
    }
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [modelMenuOpen]);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    if (tabName === 'chat') {
      window.history.pushState(null, '', '/chat');
    } else {
      window.history.pushState(null, '', `/chat?tab=${tabName}`);
    }
    if (isMobile) {
      setSidebarOpen(false);
    }
  };
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // 1. Initial configuration and validation checks
  useEffect(() => {
    const storedUser = localStorage.getItem('jarvis_user');
    if (!storedUser) {
      router.push('/');
      return;
    }
    try {
      setUserInfo(JSON.parse(storedUser));
    } catch {
      router.push('/');
      return;
    }

    // Load saved settings
    const savedTheme = localStorage.getItem('jarvis_theme') || 'dark';
    setIsDark(savedTheme === 'dark');
    document.documentElement.setAttribute('data-theme', savedTheme);

    const savedVoiceGender = localStorage.getItem('jarvis_voice_gender') || 'female';
    setVoiceGender(savedVoiceGender);

    // Retrieve conversation history
    const savedConversations = localStorage.getItem('jarvis_conversations');
    if (savedConversations) {
      try {
        setConversations(JSON.parse(savedConversations));
      } catch (e) {
        console.error('Failed to parse cached threads:', e);
      }
    }
  }, [router]);

  // Adjust responsive sidebar on smaller displays
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = inputRef.current.scrollHeight + 'px';
    }
  }, [input]);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFiles([...attachedFiles, { fileName: file.name, file }]);
    }
    e.target.value = '';
  };

  const removeFile = (index) => {
    setAttachedFiles(attachedFiles.filter((_, i) => i !== index));
  };

  const selectedModelData = MODELS.find(m => m.id === selectedModel);

  const filteredModels = activeCategory === 'all'
    ? MODELS
    : MODELS.filter(m => m.category === activeCategory);

  const handleSendRef = useRef();

  const handleSend = async (overrideText = null) => {
    const textToSend = typeof overrideText === 'string' ? overrideText : input;
    if ((!textToSend.trim() && attachedFiles.length === 0) || isLoading) return;

    if (activeTab !== 'chat') {
      setActiveTab('chat');
      window.history.pushState(null, '', '/chat');
    }

    setIsLoading(true);

    let textToAppend = '';
    if (attachedFiles.length > 0) {
      const uploadPromises = attachedFiles.map(async ({ file }) => {
        try {
          const fd = new FormData();
          fd.append('file', file);
          const res = await fetch('/api/upload', {
            method: 'POST',
            body: fd,
          });
          if (res.ok) {
            const data = await res.json();
            if (data.extractedText) {
              if (data.extractedText === '__CLIENT_EXTRACT__' || data.extractedText === '__CLIENT_EXTRACT_DOCX__') {
                return `[Attached File: ${file.name}]`;
              } else {
                return `[File Content from ${file.name}]:\n${data.extractedText}\n`;
              }
            }
          }
        } catch (err) {
          console.error('Failed to upload file:', file.name, err);
        }
        return '';
      });

      const extractedContents = await Promise.all(uploadPromises);
      textToAppend = extractedContents.filter(Boolean).join('\n');
    }

    const fullContent = textToAppend 
      ? `${textToSend.trim()}\n\n${textToAppend}`
      : textToSend.trim();

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: fullContent,
      timestamp: new Date().toISOString(),
    };

    const currentMessages = [...messages, userMsg];
    setMessages(currentMessages);
    if (!overrideText || typeof overrideText !== 'string') setInput('');
    setAttachedFiles([]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: currentMessages.map(m => ({
            role: m.role,
            content: m.content,
          })),
          model: selectedModel,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        throw new Error(data.error || 'API Key is missing');
      }

      if (!response.ok) {
        throw new Error(data.error || 'Server error');
      }

      const assistantMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content || 'Sorry, I couldn\'t process that request.',
        model: selectedModelData?.name,
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [...currentMessages, assistantMsg];
      setMessages(finalMessages);
      setIsLoading(false);

      // Speak text if voice is active
      if (voiceEnabled && typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utt = new SpeechSynthesisUtterance(assistantMsg.content.slice(0, 300));
        utt.rate = 1.05;
        utt.pitch = voiceGender === 'male' ? 0.95 : 1.1;
        speechSynthesis.speak(utt);
      }

      // Proactively cache thread if it's the first message exchange and not in incognito mode
      if (!incognitoEnabled) {
        if (messages.length === 0) {
          const newConv = {
            id: Date.now().toString(),
            title: userMsg.content.slice(0, 30) + (userMsg.content.length > 30 ? '...' : ''),
            messages: finalMessages,
            model: selectedModel,
            createdAt: new Date().toISOString(),
          };
          const updatedConvs = [newConv, ...conversations];
          setConversations(updatedConvs);
          localStorage.setItem('jarvis_conversations', JSON.stringify(updatedConvs));
        } else {
          // Update active thread context
          const activeIdx = conversations.findIndex(c => c.messages[0]?.id === messages[0]?.id);
          if (activeIdx !== -1) {
            const updatedConvs = [...conversations];
            updatedConvs[activeIdx].messages = finalMessages;
            setConversations(updatedConvs);
            localStorage.setItem('jarvis_conversations', JSON.stringify(updatedConvs));
          }
        }
      }
    } catch (error) {
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `⚠️ Error: ${error.message || 'Error connecting to the model. Check your API key.'}`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMsg]);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleSendRef.current = handleSend;
  });

  useEffect(() => {
    if (voiceEnabled) {
      initDuplex({
        onSpeechStart: () => {
          console.log('[Duplex] Speech started');
        },
        onSpeechEnd: async (audio) => {
          if (typeof audio === 'string') {
            if (audio.trim() && handleSendRef.current) handleSendRef.current(audio.trim());
          } else if (audio instanceof Float32Array) {
            try {
              const wavBlob = float32ToWav(audio, 16000);
              const fd = new FormData();
              fd.append('file', wavBlob, 'voice.wav');
              const res = await fetch('/api/upload', {
                method: 'POST',
                body: fd,
              });
              if (res.ok) {
                const data = await res.json();
                if (data.extractedText && handleSendRef.current) {
                  handleSendRef.current(data.extractedText);
                }
              }
            } catch (err) {
              console.error('Failed to process duplex audio:', err);
            }
          }
        },
        onVADMisfire: () => console.log('[Duplex] VAD misfire'),
        onError: (err) => {
          console.error('[Duplex] Error:', err);
          setVoiceEnabled(false);
        },
      });
    } else {
      stopDuplex();
    }
    return () => {
      stopDuplex();
    };
  }, [voiceEnabled]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startNewChat = () => {
    setMessages([]);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleRecentSelect = (conv) => {
    setMessages(conv.messages);
    setSelectedModel(conv.model);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleThemeChange = () => {
    const nextTheme = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('jarvis_theme', nextTheme);
  };

  const handleVoiceGenderChange = (val) => {
    setVoiceGender(val);
    localStorage.setItem('jarvis_voice_gender', val);
  };

  const goHome = () => {
    router.push('/');
  };

  const handlePromptCardClick = (title) => {
    setInput(title);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const suggestedPrompts = [
    { title: 'Help me think through a decision', subtitle: 'Decision support', icon: '🎯' },
    { title: 'Explain something complex simply', subtitle: 'Learning', icon: '📚' },
    { title: 'Review my writing', subtitle: 'Writing', icon: '✍️' },
    { title: 'Help me debug this code', subtitle: 'Coding', icon: '💻' },
    { title: 'Deep think on a problem', subtitle: 'Deep Think', icon: '🧠' },
    { title: 'Generate creative ideas', subtitle: 'Creative', icon: '✨' },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'transparent',
        color: isDark ? '#e4e4e7' : '#18181b',
        display: 'flex',
        fontFamily: 'var(--font-sans), -apple-system, BlinkMacSystemFont, sans-serif',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <div style={{ position: 'absolute', inset: 0, zIndex: -1, opacity: 0.4, pointerEvents: 'none' }}>
      </div>
      {/* ─── SIDEBAR ─── */}
      <aside
        style={{
          position: isMobile ? 'fixed' : 'relative',
          left: 0,
          top: 0,
          width: sidebarOpen ? '280px' : '0px',
          height: '100vh',
          background: isDark ? 'rgba(10,10,14,0.7)' : 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(24px)',
          borderRight: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
          zIndex: 100,
          transition: 'width 0.3s cubic-bezier(0.16,1,0.3,1), transform 0.3s cubic-bezier(0.16,1,0.3,1)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          transform: (isMobile && !sidebarOpen) ? 'translateX(-280px)' : 'translateX(0)',
        }}
      >
        <div style={{ padding: '1.25rem 1rem', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Brand - clickable to home */}
          <div
            onClick={goHome}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '8px',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <JarvisLogo size="sidebar" />
          </div>

          <button
            onClick={startNewChat}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
              background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
              color: 'inherit',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem',
              fontWeight: 500,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)';
            }}
          >
            <PlusIcon /> New Chat
          </button>

          {/* Nav Items */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            {[
              { icon: <SearchIcon />, label: 'Search', action: () => router.push('/') },
              { icon: <ChatsIcon />, label: 'Chats', action: () => handleTabChange('chat') },
              { icon: <ProjectsIcon />, label: 'Projects', action: () => handleTabChange('projects') },
              { icon: <ImagineIcon />, label: 'Imagine', action: () => handleTabChange('imagine') },
              { icon: <ArtifactsIcon />, label: 'Artifacts', action: () => handleTabChange('artifacts') },
            ].map(item => {
              const isTabActive = activeTab === (item.label === 'Chats' ? 'chat' : item.label.toLowerCase());
              return (
                <div
                  key={item.label}
                  onClick={item.action}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.6rem 0.75rem',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '0.92rem',
                    background: isTabActive ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)') : 'transparent',
                    color: isTabActive ? (isDark ? '#ffffff' : '#000000') : (isDark ? '#a1a1aa' : '#52525b'),
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    if (!isTabActive) {
                      e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
                      e.currentTarget.style.color = isDark ? '#ffffff' : '#000000';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isTabActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = isDark ? '#a1a1aa' : '#52525b';
                    }
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.icon}</span>
                  {item.label}
                </div>
              );
            })}
          </nav>

          {/* Recent Conversations */}
          {conversations.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '1rem' }}>
              <div style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: isDark ? '#52525b' : '#a1a1aa',
                paddingLeft: '0.75rem',
                fontWeight: 600,
              }}>
                Recent Chats
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', maxHeight: '200px', overflowY: 'auto' }}>
                {conversations.map(conv => (
                  <div
                    key={conv.id}
                    onClick={() => handleRecentSelect(conv)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      color: isDark ? '#a1a1aa' : '#52525b',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
                      e.currentTarget.style.color = isDark ? '#ffffff' : '#000000';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = isDark ? '#a1a1aa' : '#52525b';
                    }}
                  >
                    <span style={{ color: '#3b82f6', fontSize: '0.5rem', flexShrink: 0 }}>●</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{conv.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div style={{
          padding: '0.85rem 1rem',
          borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
          display: 'flex',
          gap: '0.5rem',
        }}>
          <button
            onClick={() => setSettingsOpen(true)}
            style={{
              flex: 1,
              padding: '0.6rem',
              borderRadius: '10px',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              background: 'transparent',
              color: 'inherit',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
            }}
          >
            <SettingsIcon /> Settings
          </button>
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            style={{
              flex: 1,
              padding: '0.6rem',
              borderRadius: '10px',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              background: voiceEnabled ? 'rgba(59,130,246,0.15)' : 'transparent',
              color: voiceEnabled ? '#60a5fa' : 'inherit',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
            }}
          >
            <VoiceIcon /> Voice
          </button>
          <button
            onClick={handleThemeChange}
            style={{
              flex: 1,
              padding: '0.6rem',
              borderRadius: '10px',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              background: 'transparent',
              color: 'inherit',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
            }}
          >
            {isDark ? <><SunIcon /> Light</> : <><MoonIcon /> Dark</>}
          </button>
        </div>
      </aside>

      {/* ─── MAIN CONTENT ─── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', height: '100vh', overflow: 'hidden' }}>
        {/* Header */}
        <header style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.85rem 1.25rem',
          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
          background: isDark ? 'rgba(6,6,8,0.4)' : 'rgba(250,250,250,0.4)',
          backdropFilter: 'blur(20px)',
          zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                background: 'none',
                border: 'none',
                color: 'inherit',
                fontSize: '1.25rem',
                cursor: 'pointer',
                padding: '0.25rem',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              ☰
            </button>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              padding: '0.3rem 0.65rem',
              borderRadius: '6px',
              background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
              color: isDark ? '#a1a1aa' : '#71717a',
              fontFamily: 'var(--loaded-dm-mono), monospace',
            }}>
              {activeTab === 'chat' ? (
                selectedModelData?.category === 'coding' ? '💻 Code' :
                selectedModelData?.category === 'reasoning' ? '🧠 Deep Think' :
                selectedModelData?.category === 'creative' ? '✨ Creative' : '💬 General'
              ) : activeTab === 'projects' ? '📁 Projects' :
                  activeTab === 'imagine' ? '⭐ Imagine' : '📦 Artifacts'}
            </span>
            {activeTab === 'chat' && (
              <span style={{ fontSize: '0.85rem', opacity: 0.6, fontWeight: 500 }}>
                {selectedModelData?.name}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            {activeTab === 'chat' && (
              <span style={{ fontSize: '0.78rem', opacity: 0.5, fontFamily: 'var(--loaded-dm-mono), monospace' }}>
                {messages.filter(m => m.role === 'user').length} / 50
              </span>
            )}
            <button
              onClick={() => setSettingsOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'inherit',
                fontSize: '1.15rem',
                cursor: 'pointer',
                opacity: 0.7,
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '1'}
              onMouseLeave={e => e.currentTarget.style.opacity = '0.7'}
            >
              ⚙️
            </button>
          </div>
        </header>

        {/* Chat Area */}
        {activeTab === 'chat' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
            {messages.length === 0 ? (
              /* Empty Greeting State */
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '75vh',
                textAlign: 'center',
                gap: '1.25rem',
              }}>
                <div style={{ marginBottom: '0.5rem' }}>
                  <JarvisLogo size="greeting" />
                </div>
                <h2 style={{
                  fontSize: 'clamp(1.25rem, 4vw, 1.8rem)',
                  fontWeight: 300,
                  margin: 0,
                  fontFamily: 'var(--font-serif), serif',
                  letterSpacing: '0.02em',
                  color: isDark ? '#e4e4e7' : '#18181b',
                }}>
                  Good Evening, {userInfo?.name || 'Guest'}.
                </h2>
                <p style={{ opacity: 0.5, margin: 0, fontSize: '0.92rem' }}>
                  Sign in to save your conversations and access premium limits.
                </p>

                {/* Suggested Prompts Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '0.85rem',
                  width: '100%',
                  maxWidth: '740px',
                  padding: '1.5rem 1rem 0 1rem',
                }}>
                  {suggestedPrompts.map(prompt => (
                    <button
                      key={prompt.title}
                      onClick={() => handlePromptCardClick(prompt.title)}
                      style={{
                        textAlign: 'left',
                        padding: '1.15rem',
                        borderRadius: '16px',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                        background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                        color: 'inherit',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.85rem',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.borderColor = '#3b82f6';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
                      }}
                    >
                      <span style={{ fontSize: '1.4rem' }}>{prompt.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.92rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {prompt.title}
                        </div>
                        <div style={{ fontSize: '0.78rem', opacity: 0.45, marginTop: '0.15rem' }}>
                          {prompt.subtitle}
                        </div>
                      </div>
                      <span style={{ opacity: 0.3, fontSize: '1.1rem' }}>→</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Message Feed */
              <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    style={{
                      alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      maxWidth: '85%',
                      padding: '1rem 1.25rem',
                      borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      background: msg.role === 'user'
                        ? 'linear-gradient(135deg, #2563eb, #7c3aed)'
                        : isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.035)',
                      color: msg.role === 'user' ? '#fff' : 'inherit',
                      fontSize: '0.96rem',
                      lineHeight: 1.6,
                      wordBreak: 'break-word',
                      border: msg.role === 'user' ? 'none' : `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`,
                    }}
                  >
                    <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                    {msg.model && (
                      <div style={{
                        fontSize: '0.72rem',
                        opacity: msg.role === 'user' ? 0.8 : 0.4,
                        marginTop: '0.6rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontFamily: 'var(--loaded-dm-mono), monospace',
                      }}>
                        <span>🤖</span> {msg.model}
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div style={{
                    alignSelf: 'flex-start',
                    padding: '1rem 1.35rem',
                    borderRadius: '18px 18px 18px 4px',
                    background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.035)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`,
                  }}>
                    <div className="dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor', animation: 'dot-pulse 1.2s infinite ease-in-out', animationDelay: '0s' }} />
                    <div className="dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor', animation: 'dot-pulse 1.2s infinite ease-in-out', animationDelay: '0.2s' }} />
                    <div className="dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor', animation: 'dot-pulse 1.2s infinite ease-in-out', animationDelay: '0.4s' }} />
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        )}

        {activeTab === 'projects' && (
          <ProjectsView isDark={isDark} router={router} />
        )}

        {activeTab === 'imagine' && (
          <ImagineView isDark={isDark} />
        )}

        {activeTab === 'artifacts' && (
          <ArtifactsView isDark={isDark} />
        )}

        {/* Input Bar Wrapper */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
          background: isDark ? 'rgba(6,6,8,0.5)' : 'rgba(250,250,250,0.5)',
          backdropFilter: 'blur(20px)',
        }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {/* Attached Files Display */}
            {attachedFiles.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', padding: '0 8px' }}>
                {attachedFiles.map((f, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px',
                    borderRadius: '12px', fontSize: '0.8rem',
                    background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                  }}>
                    <span>📎 {f.fileName}</span>
                    <button onClick={() => removeFile(i)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', opacity: 0.6, padding: '0 2px' }}>×</button>
                  </div>
                ))}
              </div>
            )}
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '0.75rem 1rem',
              borderRadius: '20px',
              border: incognitoEnabled 
                ? `1px solid rgba(139, 92, 246, 0.45)` 
                : `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
              boxShadow: incognitoEnabled 
                ? `0 0 16px rgba(139, 92, 246, 0.25)` 
                : 'none',
              background: incognitoEnabled 
                ? (isDark ? 'rgba(139, 92, 246, 0.05)' : 'rgba(139, 92, 246, 0.02)') 
                : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'),
              color: isDark ? '#e0e0e0' : '#1a1a1a',
              gap: '6px',
              transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
            }}>
              <input type="file" ref={fileInputRef} onChange={handleFileSelect} style={{ display: 'none' }} />
              
              {incognitoEnabled && (
                <div style={{
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-mono), monospace',
                  color: isDark ? '#c084fc' : '#8b5cf6',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  opacity: 0.85,
                  paddingBottom: '2px',
                  userSelect: 'none'
                }}>
                  <span>🔒 Private Session</span>
                  <span style={{ opacity: 0.6 }}>· Conversations are not saved</span>
                </div>
              )}

              {/* Textarea Row */}
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type / for skills"
                rows={1}
                style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  color: 'inherit',
                  fontSize: '1.02rem',
                  resize: 'none',
                  outline: 'none',
                  padding: '0.4rem 0',
                  maxHeight: '130px',
                  fontFamily: 'inherit',
                  lineHeight: 1.5,
                }}
              />

              {/* Tools and Action Row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`, paddingTop: '0.5rem' }}>
                
                {/* Left Side: Plus, Mic, and Incognito */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'inherit',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      opacity: 0.7,
                    }}
                  >
                    <PlusIcon size={18} />
                  </button>
                  
                  <button
                    onClick={() => setVoiceEnabled(!voiceEnabled)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: voiceEnabled ? '#60a5fa' : 'inherit',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      opacity: voiceEnabled ? 1 : 0.7,
                    }}
                  >
                    <VoiceIcon size={18} />
                  </button>

                  <button
                    onClick={() => {
                      setIncognitoEnabled(!incognitoEnabled);
                      setMessages([]);
                    }}
                    title="Toggle Incognito Mode"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: incognitoEnabled ? '#a78bfa' : 'inherit',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      opacity: incognitoEnabled ? 1 : 0.7,
                      transition: 'all 0.2s',
                    }}
                  >
                    <IncognitoIcon size={18} />
                  </button>
                </div>

                {/* Right Side: Model dropdown popover and orange upward Arrow send button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); setModelMenuOpen(!modelMenuOpen); }}
                    style={{
                      background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                      color: 'inherit',
                      fontSize: '0.8rem',
                      padding: '5px 10px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontWeight: 600,
                      transition: 'all 0.2s',
                      outline: 'none',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}
                  >
                    <span>🤖 {selectedModelData?.name || 'Select Model'}</span>
                    <span style={{ fontSize: '0.6rem', opacity: 0.6 }}>▼</span>
                  </button>

                  {modelMenuOpen && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        position: 'absolute',
                        bottom: 'calc(100% + 10px)',
                        right: 0,
                        width: '320px',
                        maxHeight: '340px',
                        overflowY: 'auto',
                        background: isDark ? 'rgba(15,15,22,0.95)' : 'rgba(255,255,255,0.95)',
                        backdropFilter: 'blur(20px)',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                        borderRadius: '18px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                        padding: '8px',
                        zIndex: 1000,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                      }}
                    >
                      <div style={{ padding: '8px 12px 6px 12px', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.5, borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`, marginBottom: '4px' }}>
                        Select Active Model
                      </div>
                      {MODELS.map(m => {
                        const isSelected = selectedModel === m.id;
                        return (
                          <div
                            key={m.id}
                            onClick={() => {
                              setSelectedModel(m.id);
                              setModelMenuOpen(false);
                            }}
                            style={{
                              padding: '10px 12px',
                              borderRadius: '12px',
                              cursor: 'pointer',
                              background: isSelected ? 'linear-gradient(135deg, rgba(37,99,235,0.12), rgba(124,58,237,0.12))' : 'transparent',
                              border: `1px solid ${isSelected ? 'rgba(37,99,235,0.25)' : 'transparent'}`,
                              color: isSelected ? (isDark ? '#60a5fa' : '#2563eb') : 'inherit',
                              transition: 'all 0.15s ease',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '2px',
                              textAlign: 'left',
                            }}
                            onMouseEnter={e => {
                              if (!isSelected) e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
                            }}
                            onMouseLeave={e => {
                              if (!isSelected) e.currentTarget.style.background = 'transparent';
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                              <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>{m.name}</span>
                              <span style={{
                                fontSize: '0.58rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                padding: '2px 5px',
                                borderRadius: '4px',
                                background: m.provider === 'Google' ? 'rgba(66,133,244,0.12)' :
                                            m.provider === 'Groq' ? 'rgba(242,100,42,0.12)' :
                                            m.provider === 'OpenRouter' ? 'rgba(124,58,237,0.12)' :
                                            m.provider === 'NVIDIA' ? 'rgba(118,185,0,0.12)' : 'rgba(255,255,255,0.1)',
                                color: m.provider === 'Google' ? '#4285F4' :
                                       m.provider === 'Groq' ? '#F2642A' :
                                       m.provider === 'OpenRouter' ? '#7C3AED' :
                                       m.provider === 'NVIDIA' ? '#76B900' : 'inherit',
                              }}>
                                {m.provider}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono), monospace', opacity: 0.4, wordBreak: 'break-all', marginTop: '1px' }}>
                              ID: {m.id}
                            </div>
                            <span style={{ fontSize: '0.68rem', opacity: 0.5, lineHeight: 1.3, marginTop: '2px' }}>{m.description}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Upward Arrow Send Button */}
                  <button
                    onClick={() => handleSend()}
                    disabled={(!input.trim() && attachedFiles.length === 0) || isLoading}
                    style={{
                      background: (!input.trim() && attachedFiles.length === 0)
                        ? (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)')
                        : '#ea580c',
                      color: (!input.trim() && attachedFiles.length === 0)
                        ? (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)')
                        : '#ffffff',
                      border: 'none',
                      width: '32px',
                      height: '32px',
                      borderRadius: '10px',
                      cursor: (!input.trim() && attachedFiles.length === 0) ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                      outline: 'none',
                    }}
                    onMouseEnter={e => {
                      if (input.trim() || attachedFiles.length > 0) {
                        e.currentTarget.style.background = '#f97316';
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (input.trim() || attachedFiles.length > 0) {
                        e.currentTarget.style.background = '#ea580c';
                        e.currentTarget.style.transform = 'scale(1)';
                      }
                    }}
                  >
                    <SendIcon size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Modes Section */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { id: 'code', label: 'Code', icon: '</>' },
                { id: 'deep', label: 'Deep-Think', icon: '◈' },
                { id: 'study', label: 'Study', icon: '🎓' },
                { id: 'therapy', label: 'Therapy', icon: '☕' },
              ].map(mode => {
                const isActive = activeMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => {
                      setActiveMode(mode.id);
                      if (mode.id === 'code') {
                        setSelectedModel('groq/llama-3.3-70b-versatile');
                      } else if (mode.id === 'deep') {
                        setSelectedModel('google/gemini-2.5-pro');
                      } else if (mode.id === 'study') {
                        setSelectedModel('google/gemini-3-flash-preview');
                      } else {
                        setSelectedModel('google/gemini-3.1-flash-lite');
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 14px',
                      borderRadius: '20px',
                      border: `1px solid ${isDark ? (isActive ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)') : (isActive ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)')}`,
                      background: isActive ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)') : 'transparent',
                      color: isDark ? '#e0e0e0' : '#1a1a1a',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      fontWeight: isActive ? 600 : 500,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span style={{ fontSize: '1rem', opacity: isActive ? 1 : 0.8 }}>{mode.icon}</span> {mode.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* ─── SETTINGS MODAL ─── */}
      {settingsOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(12px)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setSettingsOpen(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '500px',
              maxHeight: '85vh',
              overflowY: 'auto',
              background: isDark ? '#0d0d12' : '#ffffff',
              borderRadius: '24px',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <h2 style={{
                fontSize: '1.4rem',
                fontWeight: 800,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                fontFamily: 'var(--loaded-bebas), sans-serif',
              }}>
                JARVIS Settings
              </h2>
              <button
                onClick={() => setSettingsOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'inherit',
                  fontSize: '1.4rem',
                  cursor: 'pointer',
                  opacity: 0.5,
                  padding: '0.25rem',
                }}
              >
                ✕
              </button>
            </div>

            {/* Settings Body */}

            {/* Model Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <label style={{
                fontSize: '0.72rem',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: isDark ? '#71717a' : '#a1a1aa',
                fontWeight: 600,
              }}>
                AI Model Selector
              </label>

              {/* Category Tabs */}
              <div style={{
                display: 'flex',
                gap: '0.35rem',
                flexWrap: 'wrap',
              }}>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.key}
                    onClick={() => setActiveCategory(cat.key)}
                    style={{
                      padding: '0.4rem 0.8rem',
                      borderRadius: '20px',
                      border: 'none',
                      background: activeCategory === cat.key
                        ? 'linear-gradient(135deg, #2563eb, #7c3aed)'
                        : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                      color: activeCategory === cat.key ? '#fff' : 'inherit',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      transition: 'all 0.2s',
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Model List Container */}
              <div style={{
                maxHeight: '260px',
                overflowY: 'auto',
                borderRadius: '14px',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                background: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)',
              }}>
                {filteredModels.map(model => (
                  <div
                    key={model.id}
                    onClick={() => {
                      setSelectedModel(model.id);
                    }}
                    style={{
                      padding: '0.85rem 1rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`,
                      background: selectedModel === model.id
                        ? isDark ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.06)'
                        : 'transparent',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => {
                      if (selectedModel !== model.id) {
                        e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (selectedModel !== model.id) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: model.free ? '#10b981' : '#f59e0b',
                      flexShrink: 0,
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '0.88rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                      }}>
                        {model.name}
                        {model.category === 'reasoning' && (
                          <span style={{
                            fontSize: '0.62rem',
                            fontWeight: 700,
                            padding: '0.1rem 0.35rem',
                            borderRadius: '4px',
                            background: 'linear-gradient(135deg, #7c3aed, #c084fc)',
                            color: '#fff',
                            fontFamily: 'var(--loaded-dm-mono), monospace',
                          }}>
                            THINK
                          </span>
                        )}
                        {model.category === 'coding' && (
                          <span style={{
                            fontSize: '0.62rem',
                            fontWeight: 700,
                            padding: '0.1rem 0.35rem',
                            borderRadius: '4px',
                            background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
                            color: '#fff',
                            fontFamily: 'var(--loaded-dm-mono), monospace',
                          }}>
                            CODE
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.74rem', opacity: 0.45, marginTop: '0.15rem' }}>
                        {model.provider} · {model.description}
                      </div>
                    </div>
                    {selectedModel === model.id && (
                      <span style={{ color: '#2563eb', fontSize: '1rem', fontWeight: 'bold' }}>✓</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Voice Settings */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{
                fontSize: '0.72rem',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: isDark ? '#71717a' : '#a1a1aa',
                fontWeight: 600,
              }}>
                Voice Settings
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
              }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>Assistant Voice</span>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {['male', 'female'].map(gender => (
                    <button
                      key={gender}
                      onClick={() => handleVoiceGenderChange(gender)}
                      style={{
                        padding: '0.35rem 0.85rem',
                        borderRadius: '20px',
                        border: `1px solid ${voiceGender === gender ? '#2563eb' : isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}`,
                        background: voiceGender === gender ? 'rgba(37,99,235,0.12)' : 'transparent',
                        color: voiceGender === gender ? '#60a5fa' : 'inherit',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        textTransform: 'capitalize',
                        fontWeight: 500,
                        transition: 'all 0.2s',
                      }}
                    >
                      {gender}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Appearance */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{
                fontSize: '0.72rem',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: isDark ? '#71717a' : '#a1a1aa',
                fontWeight: 600,
              }}>
                Appearance
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
              }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>Visual Theme</span>
                <button
                  onClick={handleThemeChange}
                  style={{
                    width: '44px',
                    height: '24px',
                    borderRadius: '12px',
                    border: 'none',
                    background: isDark ? '#2563eb' : '#e4e4e7',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background 0.3s',
                  }}
                >
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: '#fff',
                    position: 'absolute',
                    top: '2px',
                    left: isDark ? '22px' : '2px',
                    transition: 'left 0.3s cubic-bezier(0.16,1,0.3,1)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }} />
                </button>
              </div>
            </div>

            {/* Account Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{
                fontSize: '0.72rem',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: isDark ? '#71717a' : '#a1a1aa',
                fontWeight: 600,
              }}>
                Account Tier
              </label>
              <div style={{
                padding: '1rem',
                borderRadius: '12px',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.86rem', opacity: 0.6 }}>Current User</span>
                  <span style={{ fontSize: '0.86rem', fontWeight: 600 }}>{userInfo?.name || 'Guest'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.86rem', opacity: 0.6 }}>Tier Status</span>
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase' }}>
                    {userInfo?.role || 'GUEST TIER'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.86rem', opacity: 0.6 }}>Usage Limit</span>
                  <span style={{ fontSize: '0.86rem', fontFamily: 'var(--loaded-dm-mono), monospace' }}>
                    {messages.filter(m => m.role === 'user').length} / 50 messages used
                  </span>
                </div>
                <button
                  onClick={() => {
                    localStorage.removeItem('jarvis_user');
                    router.push('/');
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '12px',
                    border: '1px solid #ef4444',
                    background: 'rgba(239, 68, 68, 0.08)',
                    color: '#f87171',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    marginTop: '0.5rem',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
                  }}
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global CSS Inject */}
      <style jsx global>{`
        @keyframes dot-pulse {
          0%, 100% { transform: scale(0.6); opacity: 0.3; }
          50% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}


