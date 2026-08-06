import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Key,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  Gift,
  MapPin,
  PartyPopper,
  MessageSquare,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppTheme, Message } from '../types';
import Markdown from 'react-markdown';
import { GoogleGenAI } from '@google/genai';

interface AiConsultantProps {
  theme: AppTheme;
  messages: Message[];
  onUpdateMessages: (messages: Message[]) => void;
  onClose: () => void;
}

const SUGGESTIONS = [
  { text: 'برای تولد همسرم چه هدیه‌ای بخرم؟', icon: Gift },
  { text: 'یک ایده برای جشن سالگرد ازدواج در خانه بده.', icon: PartyPopper },
  { text: 'کجا برای شام رمانتیک در تهران مناسب است؟', icon: MapPin },
  { text: 'چطور یک همایش موفق برگزار کنم؟', icon: Sparkles },
];

export default function AiConsultant({ theme, messages, onUpdateMessages, onClose }: AiConsultantProps) {
  const isLight = theme.startsWith('light-');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('user_gemini_api_key') || '');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isLoading) return;
    if (!apiKey) {
      setShowKeyInput(true);
      return;
    }

    const userMessage: Message = { role: 'user', parts: [{ text }] };
    const newMessages = [...messages, userMessage];
    onUpdateMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const genAI = new GoogleGenAI({ apiKey });
      
      const response = await genAI.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: [
          { role: 'user', parts: [{ text: "شما یک مشاور حرفه‌ای برای برنامه‌ریزی مناسبت‌ها، خرید هدیه و برگزاری جشن‌ها هستید. پاسخ‌های خود را به زبان فارسی و با لحنی دوستانه و محترمانه ارائه دهید." }] },
          ...messages.map(m => ({
            role: m.role,
            parts: [{ text: m.parts[0].text }]
          })),
          { role: 'user', parts: [{ text }] }
        ]
      });

      const responseText = response.text;

      onUpdateMessages([...newMessages, { role: 'model', parts: [{ text: responseText }] }]);
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      onUpdateMessages([...newMessages, { role: 'model', parts: [{ text: `خطا در ارتباط با هوش مصنوعی: ${error.message || 'لطفاً از صحت کلید API اطمینان حاصل کنید.'}` }] }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveApiKey = () => {
    localStorage.setItem('user_gemini_api_key', apiKey);
    setShowKeyInput(false);
  };

  const startNewChat = () => {
    if (confirm('آیا از شروع مکالمه جدید و پاک کردن تاریخچه اطمینان دارید؟')) {
      onUpdateMessages([]);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto h-[calc(100vh-120px)] flex flex-col p-4 md:p-8" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-600/20">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className={`text-xl font-black ${isLight ? 'text-slate-800' : 'text-white'}`}>مشاور هوشمند</h1>
            <p className="text-xs font-medium text-slate-500">مشورت برای هدیه، برنامه‌ریزی و مناسبت‌ها</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={startNewChat}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-xs font-black ${
              isLight ? 'bg-white border-slate-200 text-slate-600 hover:text-emerald-500' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-emerald-400'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span>مکالمه جدید</span>
          </button>
          
          <div className="w-px h-8 bg-slate-800/10 mx-1" />

          <button 
            onClick={() => setShowKeyInput(!showKeyInput)}
            className={`p-2.5 rounded-xl border transition-all ${
              showKeyInput ? 'bg-indigo-600 border-indigo-500 text-white' : isLight ? 'bg-white border-slate-200 text-slate-600' : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
            title="تنظیمات کلید API"
          >
            <Key className="w-5 h-5" />
          </button>

          <button 
            onClick={onClose}
            className={`p-2.5 rounded-xl border transition-all ${
              isLight ? 'bg-white border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-500' : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-rose-500/10 hover:text-rose-500'
            }`}
            title="بستن"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* API Key Input Overlay */}
      <AnimatePresence>
        {showKeyInput && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mb-6 p-6 rounded-3xl border shadow-xl ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <Key className="w-5 h-5 text-indigo-500" />
              <h3 className={`text-sm font-black ${isLight ? 'text-slate-800' : 'text-white'}`}>تنظیمات کلید API هوش مصنوعی</h3>
            </div>
            <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">
              برای استفاده از مشاور هوشمند، می‌توانید کلید اختصاصی خود را وارد کنید. این کلید فقط در مرورگر شما ذخیره می‌شود.
            </p>
            
            <div className="flex gap-3">
              <input 
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="کلید API خود را اینجا وارد کنید..."
                className={`flex-1 px-4 py-3 rounded-2xl text-xs font-bold focus:outline-none border transition-all ${
                  isLight 
                    ? 'bg-slate-50 border-slate-200 focus:border-indigo-400 text-slate-800' 
                    : 'bg-slate-950 border-slate-800 focus:border-indigo-500 text-white'
                }`}
              />
              <button 
                onClick={handleSaveApiKey}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl text-xs font-black transition-all shadow-lg shadow-indigo-600/20"
              >
                ذخیره کلید
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Messages */}
      <div 
        ref={scrollRef}
        className={`flex-1 overflow-y-auto p-4 md:p-6 space-y-6 rounded-3xl border mb-6 custom-scrollbar ${
          isLight ? 'bg-white/50 border-slate-200' : 'bg-black/20 border-slate-800'
        }`}
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="p-6 rounded-full bg-indigo-500/10 mb-6">
              <Sparkles className="w-12 h-12 text-indigo-500" />
            </div>
            <h3 className={`text-lg font-black mb-2 ${isLight ? 'text-slate-800' : 'text-white'}`}>چطور می‌توانم به شما کمک کنم؟</h3>
            <p className="text-sm text-slate-500 max-w-xs mb-8">من می‌توانم در مورد خرید هدیه، ایده‌های سورپرایز و برنامه‌ریزی مناسبت‌ها به شما مشورت بدهم.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
              {SUGGESTIONS.map((s, i) => {
                const Icon = s.icon;
                return (
                  <button
                    key={i}
                    onClick={() => handleSend(s.text)}
                    className={`flex items-center gap-3 p-4 rounded-2xl border text-right transition-all hover:scale-[1.02] ${
                      isLight ? 'bg-white border-slate-100 hover:border-indigo-200 text-slate-700' : 'bg-slate-900 border-slate-800 hover:border-indigo-900 text-slate-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span className="text-[11px] font-bold">{s.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center shadow-lg ${
                  msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-indigo-600 border border-slate-100 dark:border-slate-700'
                }`}>
                  {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>
                <div className={`p-4 rounded-2xl text-[13px] font-medium leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white' 
                    : isLight ? 'bg-white border border-slate-100 text-slate-800' : 'bg-slate-900 border border-slate-800 text-slate-200'
                }`}>
                  <div className="markdown-body">
                    <Markdown>{msg.parts[0].text}</Markdown>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-3">
              <div className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center bg-white dark:bg-slate-800 text-indigo-600 border border-slate-100 dark:border-slate-700">
                <RefreshCw className="w-5 h-5 animate-spin" />
              </div>
              <div className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex gap-1 items-center`}>
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce delay-75" />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce delay-150" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="relative group">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="سوالی بپرسید..."
          className={`w-full px-6 py-5 rounded-[2rem] text-sm font-bold focus:outline-none border transition-all pr-14 pl-20 shadow-xl resize-none h-20 flex items-center overflow-hidden leading-relaxed ${
            isLight 
              ? 'bg-white border-slate-200 focus:border-indigo-400 text-slate-800' 
              : 'bg-slate-900 border-slate-800 focus:border-indigo-500 text-white shadow-indigo-900/10'
          }`}
        />
        <div className="absolute right-6 top-1/2 -translate-y-1/2 p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-500">
          <MessageSquare className="w-5 h-5" />
        </div>
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || isLoading}
          className={`absolute left-6 top-1/2 -translate-y-1/2 p-3 rounded-2xl bg-indigo-600 text-white transition-all shadow-lg hover:shadow-indigo-600/30 active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:shadow-none`}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
