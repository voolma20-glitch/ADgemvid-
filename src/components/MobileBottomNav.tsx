import React from 'react';
import { Video, Lightbulb, Lock, Code2, Bot, Palette } from 'lucide-react';
import { PageTab } from './Header';

interface MobileBottomNavProps {
  activeTab: PageTab;
  setActiveTab: (tab: PageTab) => void;
  hasCustomKey: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  hasCustomKey,
}) => {
  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80 px-1.5 py-1.5 shadow-2xl">
      <div className="grid grid-cols-5 gap-1 max-w-md mx-auto">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition ${
            activeTab === 'chat'
              ? 'text-pink-400 font-bold bg-pink-500/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bot className="w-4 h-4 mb-0.5" />
          <span className="text-[9px]">المخرج</span>
        </button>

        <button
          onClick={() => setActiveTab('studio')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition ${
            activeTab === 'studio'
              ? 'text-indigo-400 font-bold bg-indigo-500/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Video className="w-4 h-4 mb-0.5" />
          <span className="text-[9px]">الاستوديو</span>
        </button>

        <button
          onClick={() => setActiveTab('cinematic')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition ${
            activeTab === 'cinematic'
              ? 'text-purple-400 font-bold bg-purple-500/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Palette className="w-4 h-4 mb-0.5" />
          <span className="text-[9px]">المؤثرات</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`relative flex flex-col items-center justify-center py-1.5 rounded-xl transition ${
            activeTab === 'settings'
              ? 'text-emerald-400 font-bold bg-emerald-500/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Lock className="w-4 h-4 mb-0.5" />
          <span className="text-[9px]">المفاتيح</span>
          {hasCustomKey && (
            <span className="absolute top-1 right-4 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('code')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition ${
            activeTab === 'code'
              ? 'text-indigo-400 font-bold bg-indigo-500/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code2 className="w-4 h-4 mb-0.5" />
          <span className="text-[9px]">الكود</span>
        </button>
      </div>
    </nav>
  );
};
