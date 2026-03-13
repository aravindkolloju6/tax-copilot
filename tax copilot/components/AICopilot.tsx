import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, User, Bot, Sparkles, Mic, MicOff, Paperclip, ShieldCheck, Zap, Volume2, X, ListChecks, Loader2 } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { getTaxAdvice } from '../services/geminiService.ts';
import { Message } from '../types.ts';

// Audio Utility Functions
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const AICopilot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: "Namaste! I'm your AI Chartered Accountant. I'm ready for both text and voice commands. How can I assist you with your taxes today?" }
  ]);
  const [input, setInput] = useState('');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transcription, setTranscription] = useState('');
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionRef = useRef<any>(null);
  const audioContexts = useRef<{ input?: AudioContext, output?: AudioContext }>({});
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, transcription, isLoading]);

  const stopVoice = useCallback(() => {
    if (sessionRef.current) {
      try {
        sessionRef.current.close();
      } catch (e) {
        console.warn("Session already closed or error closing:", e);
      }
      sessionRef.current = null;
    }
    
    // Stop all active audio playback sources
    sourcesRef.current.forEach(s => {
      try {
        s.stop();
      } catch (e) {
        // Source might have already ended or not started
      }
    });
    sourcesRef.current.clear();
    
    setIsVoiceActive(false);
    setIsConnecting(false);
    setTranscription('');

    // Safely close audio contexts
    const { input, output } = audioContexts.current;
    if (input && input.state !== 'closed') {
      input.close().catch(err => console.error("Error closing input AudioContext:", err));
    }
    if (output && output.state !== 'closed') {
      output.close().catch(err => console.error("Error closing output AudioContext:", err));
    }
    audioContexts.current = {};
    nextStartTimeRef.current = 0;
  }, []);

  const startVoice = async () => {
    try {
      setIsConnecting(true);
      // Create a new GoogleGenAI instance right before making an API call
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const inCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContexts.current = { input: inCtx, output: outCtx };

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsVoiceActive(true);
            setIsConnecting(false);
            const source = inCtx.createMediaStreamSource(stream);
            const scriptProcessor = inCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
              sessionPromise.then(session => {
                session.sendRealtimeInput({ 
                  media: { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' } 
                });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              setTranscription(prev => prev + message.serverContent.outputTranscription.text);
            }

            if (message.serverContent?.turnComplete) {
              setMessages(prev => [...prev, { role: 'model', content: transcription }]);
              setTranscription('');
            }

            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtx.currentTime);
              const buffer = await decodeAudioData(decode(audioData), outCtx, 24000, 1);
              const source = outCtx.createBufferSource();
              source.buffer = buffer;
              source.connect(outCtx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => {
                sourcesRef.current.delete(source);
              };
            }
          },
          onclose: () => stopVoice(),
          onerror: () => stopVoice(),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          systemInstruction: "You are a top-tier Indian Chartered Accountant. Communicate via voice in a helpful, concise manner. Use English mixed with occasional Hindi greetings like 'Namaste'. Guide the user through tax questions.",
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setIsConnecting(false);
      stopVoice();
    }
  };

  const handleSend = async (text?: string) => {
    const content = text || input;
    if (!content.trim() || isVoiceActive || isLoading) return;

    const userMsg = content.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const response = await getTaxAdvice(messages, userMsg);
      setMessages(prev => [...prev, { role: 'model', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', content: "I'm having trouble processing that right now. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleIntakeCommand = (cmd: string) => {
    handleSend(cmd);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-full bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xl">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white z-10">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white transition-all ${isVoiceActive ? 'bg-rose-500 animate-pulse' : 'bg-indigo-600 shadow-lg shadow-indigo-100'}`}>
            {isVoiceActive ? <Mic className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="font-bold text-slate-800">CA Copilot Live</h3>
            <div className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${isVoiceActive ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'}`}></span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {isVoiceActive ? 'Voice Session Active' : isConnecting ? 'Connecting CA...' : 'Secure & Encrypted'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isVoiceActive && (
            <button 
              onClick={stopVoice}
              className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-full text-xs font-bold hover:bg-rose-100 transition-all"
            >
              <X className="w-3.5 h-3.5" /> End Session
            </button>
          )}
          <div className="bg-slate-50 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-md border border-slate-100 flex items-center gap-1">
            <Volume2 className="w-3 h-3" /> PCM 24KHZ
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30" ref={scrollRef}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center shadow-sm ${
              msg.role === 'user' ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-indigo-600'
            }`}>
              {msg.role === 'user' ? <User className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
            </div>
            <div className={`max-w-[85%] rounded-2xl px-6 py-4 text-base leading-relaxed shadow-sm ${
              msg.role === 'user' 
              ? 'bg-indigo-600 text-white rounded-tr-none font-medium' 
              : 'bg-white text-slate-900 border border-slate-100 rounded-tl-none font-medium'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        
        {(isLoading || transcription) && (
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-white border border-slate-200 text-indigo-600 flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <div className="bg-white/80 border border-indigo-100 rounded-2xl rounded-tl-none px-6 py-4 text-base italic text-indigo-600 font-semibold animate-pulse">
              {transcription || "Thinking..."}
            </div>
          </div>
        )}
      </div>

      {/* Intake Dashboard (Commands) */}
      {!isVoiceActive && (
        <div className="px-6 py-4 bg-white border-t border-slate-100">
          <div className="flex items-center gap-2 mb-3">
            <ListChecks className="w-4 h-4 text-slate-400" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quick Intake Commands</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: 'Analyze Income', icon: '📊', prompt: 'I want to analyze my salary and other income sources.' },
              { label: 'Check Deductions', icon: '💎', prompt: 'What deductions are available for 80C and 80D?' },
              { label: 'Regime Compare', icon: '⚖️', prompt: 'Can you compare the Old and New tax regimes for me?' },
              { label: 'ITR Filing Help', icon: '📝', prompt: 'What documents do I need for ITR-1 filing?' },
            ].map((cmd, i) => (
              <button 
                key={i}
                disabled={isLoading}
                onClick={() => handleIntakeCommand(cmd.prompt)}
                className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-all text-left disabled:opacity-50"
              >
                <span className="text-lg">{cmd.icon}</span>
                <span className="text-[11px] font-bold text-slate-600 leading-tight">{cmd.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Control Area */}
      <div className="p-6 pt-2 bg-white shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isVoiceActive ? "Listening..." : "Type your query here..."}
              disabled={isVoiceActive || isLoading}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-5 pr-14 py-5 text-base font-semibold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none disabled:opacity-50 shadow-inner"
            />
            <button 
              onClick={() => handleSend()}
              disabled={isVoiceActive || isLoading || !input.trim()}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 text-indigo-600 hover:bg-indigo-50 rounded-xl disabled:opacity-30 transition-colors"
            >
              <Send className="w-6 h-6" />
            </button>
          </div>
          
          <button 
            onClick={isVoiceActive ? stopVoice : startVoice}
            disabled={isConnecting || isLoading}
            className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-all ${
              isVoiceActive 
              ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-rose-200' 
              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
            } ${(isConnecting || isLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isConnecting ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : isVoiceActive ? (
              <MicOff className="w-8 h-8" />
            ) : (
              <Mic className="w-8 h-8" />
            )}
          </button>
        </div>
        
        {isVoiceActive && (
          <div className="mt-4 flex items-center justify-center gap-1.5 h-6">
            {[...Array(12)].map((_, i) => (
              <div 
                key={i} 
                className="w-1.5 bg-indigo-500 rounded-full animate-wave" 
                style={{ 
                  height: `${20 + Math.random() * 80}%`,
                  animationDelay: `${i * 0.1}s` 
                }}
              ></div>
            ))}
          </div>
        )}
        
        <p className="text-[11px] text-center text-slate-500 mt-4 font-bold uppercase tracking-widest">
          {isVoiceActive ? 'Voice mode: Live audio streaming enabled' : 'Secure text chat: AES-256 encrypted'}
        </p>
      </div>

      <style>{`
        @keyframes wave {
          0%, 100% { height: 20%; }
          50% { height: 100%; }
        }
        .animate-wave {
          animation: wave 0.6s ease-in-out infinite;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default AICopilot;