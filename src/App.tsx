import React, { useState, useEffect } from 'react';
import { Header, PageTab } from './components/Header';
import { MobileBottomNav } from './components/MobileBottomNav';
import { VideoStudio } from './components/VideoStudio';
import { SecureSettings } from './components/SecureSettings';
import { PythonCodeViewer } from './components/PythonCodeViewer';
import { AdInspirations } from './components/AdInspirations';
import { Terminal, ShieldCheck, Heart, Sparkles, Video, Lock, Lightbulb, Code2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<PageTab>('studio');
  const [currentPrompt, setCurrentPrompt] = useState<string>(
    'إعلان عطر شرقي فاخر بنفحات العود الملكي والعنبر والمسك الأبيض مع خصم 30% وشحن مجاني وسريع لكافة المناطق بمناسبة يوم التأسيس.'
  );
  const [currentTone, setCurrentTone] = useState<string>('فاخر وهادئ');

  // Secure Vault Settings
  const [apiKey, setApiKey] = useState<string>('');
  const [pixabayKey, setPixabayKey] = useState<string>('');
  const [defaultModel, setDefaultModel] = useState<string>('gemini-2.5-flash');
  const [defaultVoice, setDefaultVoice] = useState<string>('ar-SA-HamedNeural');

  // Load saved credentials from localStorage on mount
  useEffect(() => {
    try {
      const savedGemini = localStorage.getItem('adgemvid_custom_gemini_key');
      const savedPixabay = localStorage.getItem('adgemvid_custom_pixabay_key');
      const savedModel = localStorage.getItem('adgemvid_default_model');
      const savedVoice = localStorage.getItem('adgemvid_default_voice');

      if (savedGemini) setApiKey(savedGemini);
      if (savedPixabay) setPixabayKey(savedPixabay);
      if (savedModel) setDefaultModel(savedModel);
      if (savedVoice) setDefaultVoice(savedVoice);
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, []);

  const handleSelectInspiration = (prompt: string, tone: string) => {
    setCurrentPrompt(prompt);
    setCurrentTone(tone);
    setActiveTab('studio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Cairo',sans-serif] pb-20 sm:pb-0">
      {/* Main Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasCustomKey={Boolean(apiKey)}
      />

      {/* Main Page Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
        {/* Page 1: 🎬 Studio */}
        {activeTab === 'studio' && (
          <VideoStudio
            initialPrompt={currentPrompt}
            initialTone={currentTone}
            customApiKey={apiKey}
            defaultModel={defaultModel}
            defaultVoice={defaultVoice}
            onNavigateToSettings={() => setActiveTab('settings')}
          />
        )}

        {/* Page 2: 💡 Inspirations Bank */}
        {activeTab === 'inspirations' && (
          <AdInspirations onSelectPrompt={handleSelectInspiration} />
        )}

        {/* Page 3: 🔒 Secure Vault & Settings */}
        {activeTab === 'settings' && (
          <SecureSettings
            apiKey={apiKey}
            setApiKey={setApiKey}
            pixabayKey={pixabayKey}
            setPixabayKey={setPixabayKey}
            defaultModel={defaultModel}
            setDefaultModel={setDefaultModel}
            defaultVoice={defaultVoice}
            setDefaultVoice={setDefaultVoice}
          />
        )}

        {/* Page 4: 💻 Python Code & Deployment Hub */}
        {activeTab === 'code' && <PythonCodeViewer />}
      </main>

      {/* Mobile Sticky Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasCustomKey={Boolean(apiKey)}
      />

      {/* Desktop Footer */}
      <footer className="hidden sm:block border-t border-slate-900 bg-slate-950/90 py-6 text-xs text-slate-400 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200">ADgemvid Studio</span>
            <span>•</span>
            <span>منصة صناعة إعلانات الفيديو الذكية باللغة العربية</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('settings')}
              className="text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1 font-semibold"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>خزنة المفاتيح المشفرة</span>
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveTab('code')}
              className="text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1 font-semibold"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>كود Python و Streamlit</span>
            </button>
            <span>•</span>
            <span className="text-slate-500">Gemini 2.5/3.8 + Edge-TTS + MoviePy</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
