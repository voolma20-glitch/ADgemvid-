import React from 'react';
import { Sparkles, Code2, Video, Lightbulb, Film, Volume2, ShieldCheck, Lock, SlidersHorizontal } from 'lucide-react';

export type PageTab = 'studio' | 'inspirations' | 'settings' | 'code';

interface HeaderProps {
  activeTab: PageTab;
  setActiveTab: (tab: PageTab) => void;
  hasCustomKey: boolean;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, hasCustomKey }) => {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between py-3 gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
              <Film className="w-5 h-5 text-white" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-slate-950 rounded-full animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl md:text-2xl font-black tracking-tight bg-gradient-to-l from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent font-['Cairo']">
                  ADgemvid
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  AI Video Ads
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                استوديو صناعة إعلانات الفيديو الذكية بالتعليق الصوتي العربي
              </p>
            </div>
          </div>

          {/* Desktop/Tablet Nav Pages */}
          <nav className="hidden sm:flex items-center bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
            <button
              onClick={() => setActiveTab('studio')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs md:text-sm font-bold transition-all ${
                activeTab === 'studio'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>استوديو الإعلان</span>
            </button>

            <button
              onClick={() => setActiveTab('inspirations')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs md:text-sm font-bold transition-all ${
                activeTab === 'inspirations'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>بنك الأفكار</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs md:text-sm font-bold transition-all ${
                activeTab === 'settings'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>المفاتيح الآمنة</span>
              {hasCustomKey && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs md:text-sm font-bold transition-all ${
                activeTab === 'code'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Code2 className="w-4 h-4 text-purple-400" />
              <span>كود بايثون</span>
            </button>
          </nav>
        </div>

        {/* Top Badges Bar */}
        <div className="hidden md:flex items-center justify-between py-2 border-t border-slate-900 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>محرك الصياغة الإعلانية: <strong>Gemini 2.5 & 3.8 Flash</strong></span>
            </span>
            <span className="text-slate-700">•</span>
            <span className="flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-pink-400" />
              <span>التعليق الصوتي: <strong>Edge-TTS صوت حامد وسلمى</strong></span>
            </span>
            <span className="text-slate-700">•</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>المفاتيح والكود: <strong>مخفية ومحمية في الخزنة</strong></span>
            </span>
          </div>

          <button
            onClick={() => setActiveTab('settings')}
            className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold"
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>ضبط الإعدادات والخصوصية</span>
          </button>
        </div>
      </div>
    </header>
  );
};
