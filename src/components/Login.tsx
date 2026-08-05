import React, { useState } from 'react';
import { Compass, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (username: string, role: 'admin' | 'user') => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate small smooth delay
    setTimeout(() => {
      const trimmedUser = username.trim().toLowerCase();
      
      if (trimmedUser === 'sadeghho' && password === '8411924As') {
        onLoginSuccess('sadeghho', 'admin');
      } else if (trimmedUser === 'mo' && password === '09039461671') {
        onLoginSuccess('mo', 'user');
      } else {
        setError('نام کاربری یا کلمه عبور اشتباه است.');
        setLoading(false);
      }
    }, 700);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 animate-gradient-bg" dir="rtl">
      
      {/* Decorative backdrop elements */}
      <div className="absolute top-1/4 right-1/4 w-[350px] h-[350px] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[350px] h-[350px] rounded-full bg-purple-500/10 blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-md bg-slate-900/85 border border-slate-800/80 rounded-3xl p-8 shadow-2xl backdrop-blur-md overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Glow Top Line */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />

        {/* Brand/Logo */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="p-3.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl text-white shadow-xl shadow-indigo-500/20 mb-4 animate-bounce-slow">
            <Compass className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white">سامانه جامع برنامه‌ریزی بلندمدت</h2>
          <p className="text-xs text-slate-400 mt-2">وارد حساب کاربری خود شوید تا به سیر اختصاصی خود دسترسی داشته باشید.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-900/50 rounded-xl flex items-center gap-2.5 text-rose-400 text-xs animate-in shake duration-150">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">نام کاربری</label>
            <div className="relative">
              <span className="absolute right-3 top-2.5 text-slate-500">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="مثال: sadeghho"
                className="w-full pl-3 pr-10 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all text-left"
                dir="ltr"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">رمز عبور</label>
            <div className="relative">
              <span className="absolute right-3 top-2.5 text-slate-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all text-left"
                dir="ltr"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-2.5 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 mt-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors shadow-lg shadow-indigo-600/10 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>در حال تأیید هویت...</span>
              </>
            ) : (
              <span>ورود به پنل کاربری</span>
            )}
          </button>
        </form>

        {/* Hint Box */}
        <div className="mt-8 pt-6 border-t border-slate-800/60 text-center">
          <p className="text-[10px] text-slate-500">
            برای ورود به عنوان مدیر از نام کاربری <code className="text-indigo-400">sadeghho</code> استفاده کنید.
          </p>
        </div>

      </div>
    </div>
  );
}
