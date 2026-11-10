import React from 'react';
import { Video, Lightbulb, Lock, Code2 } from 'lucide-react';
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
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80 px-2 py-1.5 shadow-2xl">
      <div className="grid grid-cols-4 gap-1 max-w-md mx-auto">
        <button
          onClick={() => setActiveTab('studio')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition ${
            activeTab === 'studio'
              ? 'text-indigo-400 font-bold bg-indigo-500/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Video className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">الاستوديو</span>
        </button>

        <button
          onClick={() => setActiveTab('inspirations')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition ${
            activeTab === 'inspirations'
              ? 'text-amber-400 font-bold bg-amber-500/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Lightbulb className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">الأفكار</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`relative flex flex-col items-center justify-center py-1.5 rounded-xl transition ${
            activeTab === 'settings'
              ? 'text-emerald-400 font-bold bg-emerald-500/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Lock className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">المفاتيح</span>
          {hasCustomKey && (
            <span className="absolute top-1.5 right-6 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('code')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition ${
            activeTab === 'code'
              ? 'text-purple-400 font-bold bg-purple-500/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code2 className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">الكود</span>
        </button>
      </div>
    </nav>
  );
};
