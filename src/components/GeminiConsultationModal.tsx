import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  HelpCircle, 
  Cpu, 
  Compass,
  Bot,
  User,
  Copy,
  Check,
  Key
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';

export interface GeminiConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  contextType: 'roadmap' | 'challenges' | 'general' | 'path';
  contextData?: any; 
  isLight?: boolean;
}

const TEMPLATES: Record<'roadmap' | 'challenges' | 'general' | 'path', { label: string; prompt: string }[]> = {
  roadmap: [
    { label: 'پیشنهاد سیر آموزشی جدید', prompt: 'من می‌خواهم یک سیر جدید برنامه‌ریزی کنم. لطفاً ۴ گام اصلی پیشنهادی به همراه چک‌لیست برای هر گام به من بده.' },
    { label: 'بهینه‌سازی گام‌های فعلی برنامه', prompt: 'لطفاً برنامه فعلی من را تحلیل کن و پیشنهاد بده چطور می‌توانم آن را منسجم‌تر کنم.' },
    { label: 'برنامه‌ریزی زمانی واقعی (ددلاین)', prompt: 'چطور می‌توانم ددلاین‌های واقعی برای گام‌های اهداف بلندمدت خودم بگذارم؟' }
  ],
  challenges: [
    { label: 'ایده برای ایجاد چالش جدید', prompt: '۳ ایده برای به چالش کشیدن خودم جهت ساخت عادت‌های خوب روزانه پیشنهاد بده.' },
    { label: 'راهکار پایبندی به عادت‌ها', prompt: 'چه سیستم یا تکنیکی برای پایبندی به عادت‌ها پیشنهاد می‌کنی؟' },
    { label: 'تحلیل روانشناختی شکست عادت', prompt: 'چرا وقتی یک روز تیک عادت را نمی‌زنیم، بقیه روزها هم رها می‌شوند؟' }
  ],
  general: [
    { label: 'تکنیک‌های مدیریت زمان', prompt: 'تکنیک پومودورو در کنار سیستم‌های برنامه‌ریزی کلان چطور عمل می‌کند؟' },
    { label: 'رهایی از بمباران اطلاعاتی', prompt: 'چطور می‌توانیم روی اهداف اصلی متمرکز بمانیم؟' }
  ],
  path: [
    { label: 'چگونه این سیر را شروع کنم؟', prompt: 'اولین گام عملی و کوچک من برای این سیر چه باید باشد؟' },
    { label: 'چالش‌ها و موانع این سیر', prompt: 'بزرگترین چالش‌ها و موانع در طی کردن این سیر چیست و چطور مقابله کنم؟' },
    { label: 'پیشنهاد منابع تکمیلی', prompt: 'لطفاً منابع آموزشی تکمیلی مرتبط با موضوع این سیر را به من معرفی کن.' }
  ]
};

export default function GeminiConsultationModal({ 
  isOpen, 
  onClose, 
  contextType, 
  contextData, 
  isLight = false 
}: GeminiConsultationModalProps) {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userApiKey, setUserApiKey] = useState(() => localStorage.getItem('user_gemini_api_key') || '');

  if (!isOpen) return null;

  const currentTemplates = TEMPLATES[contextType] || TEMPLATES.general;

  const handleSubmit = async (e?: React.FormEvent, directPrompt?: string) => {
    if (e) e.preventDefault();
    const finalQuery = directPrompt || query;
    if (!finalQuery.trim() || isLoading) return;

    if (!userApiKey) {
      setMessages(prev => [...prev, { role: 'ai', content: 'لطفاً ابتدا کلید API خود را در پنل سمت چپ وارد کنید.' }]);
      return;
    }

    setMessages(prev => [...prev, { role: 'user', content: finalQuery }]);
    setQuery('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: userApiKey,
          message: finalQuery,
          history: messages.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
          }))
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'ai', content: data.text }]);
    } catch (err: any) {
      console.error('Gemini API Error:', err);
      setMessages(prev => [...prev, { role: 'ai', content: `خطا در ارتباط با هوش مصنوعی: ${err.message || 'لطفاً کلید API خود را بررسی کنید.'}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateClick = (prompt: string) => {
    handleSubmit(undefined, prompt);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6">
        {/* Overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 backdrop-blur-md ${isLight ? 'bg-slate-900/40' : 'bg-black/60'}`} 
          onClick={onClose} 
        />

        {/* Modal Dialog */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className={`relative border rounded-3xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl z-[10000] overflow-hidden text-right ${
            isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-100'
          }`} 
          dir="rtl"
        >
          {/* Header */}
          <div className={`flex flex-col gap-1 px-6 py-4 border-b ${
            isLight ? 'border-slate-150 bg-indigo-50/50' : 'border-slate-800 bg-indigo-950/20'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-500">
                <Sparkles className="w-5 h-5 animate-pulse" />
                <h3 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  مشاور هوش مصنوعی (Gemini)
                </h3>
              </div>
              <button 
                onClick={onClose}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-200' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className={`text-[11px] font-semibold mt-1 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`}>
              تحلیل برنامه‌ها، شکستن اهداف به گام‌های کوچک، و ارائه راهکار
            </p>
          </div>

          {/* Chat Area & Side Panel Layout */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* Main Chat Stream */}
            <div className={`flex-1 flex flex-col ${isLight ? 'bg-slate-50/50' : 'bg-slate-950/30'}`}>
              <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-70 px-4">
                    <div className={`p-4 rounded-full ${isLight ? 'bg-indigo-100 text-indigo-500' : 'bg-indigo-950/40 text-indigo-400'} border ${isLight ? 'border-indigo-200' : 'border-indigo-800/40'}`}>
                      <Cpu className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className={`font-bold mb-2 ${isLight ? 'text-slate-800' : 'text-white'}`}>چگونه می‌توانم به شما کمک کنم؟</h4>
                      <p className={`text-xs max-w-sm mx-auto leading-relaxed ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        یک سوال بپرسید یا از الگوهای پیشنهادی برای تحلیل برنامه‌های خود استفاده کنید.
                      </p>
                    </div>
                  </div>
                ) : (
                  messages.map((msg, idx) => (
                    <motion.div 
                      key={idx} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row' : 'flex-row'}`}
                    >
                      <div className={`p-2 rounded-xl shrink-0 mt-1 ${
                        msg.role === 'user' 
                          ? isLight ? 'bg-slate-200 text-slate-600' : 'bg-slate-800 text-slate-400'
                          : isLight ? 'bg-indigo-100 text-indigo-600' : 'bg-indigo-950 text-indigo-400'
                      }`}>
                        {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>
                      <div className={`p-4 rounded-2xl text-sm leading-relaxed max-w-[90%] ${
                        msg.role === 'user'
                          ? isLight ? 'bg-white border border-slate-200 text-slate-800 shadow-sm' : 'bg-slate-800 border border-slate-700 text-slate-200 shadow-md'
                          : isLight ? 'bg-indigo-50/70 border border-indigo-100 text-slate-800 shadow-sm' : 'bg-indigo-950/20 border border-indigo-900/40 text-slate-200 shadow-md'
                      }`}>
                        {msg.role === 'user' ? (
                          msg.content
                        ) : (
                          <div className={`markdown-body prose prose-sm max-w-none text-right ${isLight ? 'prose-slate' : 'prose-invert'} prose-p:leading-relaxed prose-li:marker:text-indigo-500`} dir="rtl">
                            <Markdown>{msg.content}</Markdown>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
                {isLoading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl shrink-0 mt-1 ${isLight ? 'bg-indigo-100 text-indigo-600' : 'bg-indigo-950 text-indigo-400'}`}>
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className={`flex gap-1.5 p-4 items-center rounded-2xl ${isLight ? 'bg-indigo-50/70 border-indigo-100' : 'bg-indigo-950/20 border-indigo-900/40'} border`}>
                      <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></span>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Input Area */}
              <div className={`p-4 border-t ${isLight ? 'border-slate-200 bg-white' : 'border-slate-800 bg-slate-900'}`}>
                <form onSubmit={(e) => handleSubmit(e)} className="relative flex items-center">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="موضوعی که نیاز به همفکری دارد را بنویسید..."
                    className={`w-full py-3 pr-4 pl-14 rounded-2xl text-sm focus:outline-none border transition-all duration-300 ${
                      isLight 
                        ? 'bg-slate-50 border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 text-slate-800 placeholder-slate-400' 
                        : 'bg-slate-950 border-slate-700 focus:border-indigo-500 focus:bg-slate-900 focus:ring-4 focus:ring-indigo-500/10 text-white placeholder-slate-500'
                    }`}
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={!query.trim() || isLoading}
                    className={`absolute left-2 p-2.5 rounded-xl transition-all duration-300 flex items-center justify-center ${
                      !query.trim() || isLoading
                        ? isLight ? 'bg-slate-100 text-slate-400' : 'bg-slate-800 text-slate-500'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>

            {/* Side Panel: Smart Prompts */}
            <div className={`w-full md:w-64 lg:w-72 border-t md:border-t-0 md:border-r flex flex-col ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/50 border-slate-800'
            }`}>
              {/* API Key Section */}
              <div className={`p-4 border-b ${isLight ? 'bg-indigo-50/30' : 'bg-indigo-950/10'} space-y-3`}>
                <div className="flex items-center justify-between mb-1">
                  <h4 className={`text-[11px] font-bold flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    <Key className="w-3.5 h-3.5 text-indigo-500" />
                    اتصال به هوش مصنوعی
                  </h4>
                </div>
                
                <div className={`p-2.5 rounded-xl border border-dashed ${isLight ? 'border-indigo-200 bg-white' : 'border-indigo-800/50 bg-slate-900/50'}`}>
                  <p className={`text-[9px] mb-2 leading-relaxed ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    برای استفاده از قابلیت‌های هوش مصنوعی، لطفاً کلید API اختصاصی خود را وارد کنید.
                  </p>
                  
                  <div className="space-y-1.5">
                    <label className={`text-[9px] font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>ورود کلید API:</label>
                    <input
                      type="password"
                      value={userApiKey}
                      onChange={(e) => {
                        const val = e.target.value;
                        setUserApiKey(val);
                        localStorage.setItem('user_gemini_api_key', val);
                      }}
                      placeholder="کلید را اینجا وارد کنید..."
                      className={`w-full px-2 py-1.5 rounded-lg text-[10px] focus:outline-none border transition-all ${
                        isLight 
                          ? 'bg-slate-50 border-slate-200 focus:border-indigo-400 text-slate-800' 
                          : 'bg-slate-950 border-slate-800 focus:border-indigo-500 text-white'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 border-b border-dashed border-slate-300 dark:border-slate-700">
                <h4 className={`text-xs font-bold flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  <HelpCircle className="w-3.5 h-3.5" />
                  الگوهای پیشنهادی
                </h4>
              </div>
              <div className="p-3 overflow-y-auto space-y-2">
                {currentTemplates.map((template, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleTemplateClick(template.prompt)}
                    disabled={isLoading}
                    className={`w-full text-right p-3 rounded-xl border text-[11px] leading-relaxed transition-all cursor-pointer group ${
                      isLight 
                        ? 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 shadow-sm' 
                        : 'bg-slate-800/50 border-slate-700 hover:border-indigo-500/50 hover:bg-indigo-950/20 text-slate-400 hover:text-indigo-300'
                    }`}
                  >
                    <span className="font-bold block mb-1">{template.label}</span>
                    <span className={`line-clamp-2 ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>{template.prompt}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
