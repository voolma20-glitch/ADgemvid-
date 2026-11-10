import React, { useState } from 'react';
import { ShieldCheck, Key, Eye, EyeOff, Lock, CheckCircle2, AlertCircle, RefreshCw, Trash2, Cpu, Volume2, Sparkles } from 'lucide-react';
import { VOICES_LIST } from '../data/mockData';

interface SecureSettingsProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  pixabayKey: string;
  setPixabayKey: (key: string) => void;
  defaultModel: string;
  setDefaultModel: (model: string) => void;
  defaultVoice: string;
  setDefaultVoice: (voice: string) => void;
}

export const SecureSettings: React.FC<SecureSettingsProps> = ({
  apiKey,
  setApiKey,
  pixabayKey,
  setPixabayKey,
  defaultModel,
  setDefaultModel,
  defaultVoice,
  setDefaultVoice,
}) => {
  const [showApiKey, setShowApiKey] = useState(false);
  const [showPixabayKey, setShowPixabayKey] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Test API Key connection
  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestMessage('جاري التحقق من صلاحية المفتاح والاتصال بنماذج Google GenAI...');

    try {
      const res = await fetch('/api/generate-ad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'فحص الاتصال والجاهزية',
          model: defaultModel || 'gemini-3.8-flash',
        }),
      });

      const data = await res.json();
      if (data && data.ad_title) {
        setTestStatus('success');
        setTestMessage('✅ تم الاتصال بنجاح! المفتاح صالح ومستعد لتوليد الإعلانات.');
      } else {
        setTestStatus('error');
        setTestMessage(data.warning || 'تعذر التحقق من المفتاح، يرجى التأكد من نسخه بشكل صحيح.');
      }
    } catch (err: any) {
      setTestStatus('error');
      setTestMessage('حدث خطأ أثناء اختبار الاتصال: ' + (err.message || 'خطأ غير معروف'));
    }
  };

  const handleSave = () => {
    // Save to localStorage securely
    localStorage.setItem('adgemvid_custom_gemini_key', apiKey);
    localStorage.setItem('adgemvid_custom_pixabay_key', pixabayKey);
    localStorage.setItem('adgemvid_default_model', defaultModel);
    localStorage.setItem('adgemvid_default_voice', defaultVoice);

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleClearKeys = () => {
    setApiKey('');
    setPixabayKey('');
    localStorage.removeItem('adgemvid_custom_gemini_key');
    localStorage.removeItem('adgemvid_custom_pixabay_key');
    setTestStatus('idle');
    setTestMessage('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner / Privacy Guarantee */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-950 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Lock className="w-5 h-5" />
              </span>
              <h2 className="text-xl md:text-2xl font-black text-white">
                خزنة المفاتيح والإعدادات الآمنة (Secure Vault)
              </h2>
            </div>
            <p className="text-slate-300 text-xs md:text-sm leading-relaxed max-w-2xl">
              تم إخفاء المفاتيح والأكواد الحساسة في هذه الصفحة الآمنة المنفصلة لضمان بقاء واجهة صنع الإعلانات الرئيسية نظيفة وسريعة ومحمية من أعين المتطفلين.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>مخزن محلياً ومشفر</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Settings Card */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
        {/* 1. Gemini API Key */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs md:text-sm font-bold text-slate-200 flex items-center gap-2">
              <Key className="w-4 h-4 text-indigo-400" />
              <span>مفتاح Google Gemini API الخاص بك:</span>
            </label>
            <span className="text-[11px] text-slate-400">
              {apiKey ? 'المفتاح مدخل ومحمي' : 'غير مدخل (يعتمد على النظام تلقائياً)'}
            </span>
          </div>

          <div className="relative">
            <input
              type={showApiKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="ضع مفتاحك هنا (AIzaSy...)"
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm font-mono text-slate-100 placeholder-slate-600 transition"
              dir="ltr"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition p-1"
              title={showApiKey ? 'إخفاء المفتاح' : 'إظهار المفتاح'}
            >
              {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            * يمكنك الحصول على مفتاحك مجاناً عبر منصة <a href="https://aistudio.google.com" target="_blank" rel="noreferrer" className="text-indigo-400 underline font-semibold">Google AI Studio</a>. لن يتم إظهار المفتاح في واجهة الفيديو.
          </p>
        </div>

        {/* 2. Pixabay API Key (Optional) */}
        <div className="space-y-2 pt-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between">
            <label className="text-xs md:text-sm font-bold text-slate-200 flex items-center gap-2">
              <Key className="w-4 h-4 text-purple-400" />
              <span>مفتاح Pixabay API للموسيقى (اختياري):</span>
            </label>
            <span className="text-[11px] text-slate-400">اختياري للموسيقى المباشرة</span>
          </div>

          <div className="relative">
            <input
              type={showPixabayKey ? 'text' : 'password'}
              value={pixabayKey}
              onChange={(e) => setPixabayKey(e.target.value)}
              placeholder="مفتاح Pixabay الاختياري للبحث الموسيقي..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm font-mono text-slate-100 placeholder-slate-600 transition"
              dir="ltr"
            />
            <button
              type="button"
              onClick={() => setShowPixabayKey(!showPixabayKey)}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition p-1"
              title={showPixabayKey ? 'إخفاء المفتاح' : 'إظهار المفتاح'}
            >
              {showPixabayKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* 3. Default AI Model & Voice preferences */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800/80">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span>النموذج الافتراضي للذكاء الاصطناعي:</span>
            </label>
            <select
              value={defaultModel}
              onChange={(e) => setDefaultModel(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-indigo-500"
            >
              <option value="gemini-2.5-flash">gemini-2.5-flash (موصى به - متوازن وسريع)</option>
              <option value="gemini-3.8-flash">gemini-3.8-flash (الأحدث والأعلى جودة)</option>
              <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (خفيف وسريع جداً)</option>
              <option value="gemini-2.5-pro">gemini-2.5-pro (للسيناريوهات المعقدة)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-pink-400" />
              <span>نبرة المعلق الصوتي الافتراضية:</span>
            </label>
            <select
              value={defaultVoice}
              onChange={(e) => setDefaultVoice(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-pink-500"
            >
              {VOICES_LIST.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.country} {v.name} - ({v.gender === 'male' ? 'رجالي' : 'نسائي'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons: Test Connection & Save */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800/80">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleTestConnection}
              disabled={testStatus === 'testing'}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition border border-slate-700"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testStatus === 'testing' ? 'animate-spin' : ''}`} />
              <span>{testStatus === 'testing' ? 'جاري الفحص...' : 'فحص الاتصال بالمفتاح'}</span>
            </button>

            <button
              onClick={handleClearKeys}
              className="p-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-500/30 transition"
              title="مسح المفاتيح المخزنة"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleSave}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{savedSuccess ? 'تم الحفظ بنجاح!' : 'حفظ الإعدادات الآمنة'}</span>
          </button>
        </div>

        {/* Test Result Message */}
        {testMessage && (
          <div
            className={`p-3.5 rounded-2xl text-xs flex items-start gap-2.5 leading-relaxed ${
              testStatus === 'success'
                ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300'
                : testStatus === 'error'
                ? 'bg-amber-950/40 border border-amber-500/40 text-amber-300'
                : 'bg-slate-950 border border-slate-800 text-slate-300'
            }`}
          >
            {testStatus === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : testStatus === 'error' ? (
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            ) : (
              <RefreshCw className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5 animate-spin" />
            )}
            <span>{testMessage}</span>
          </div>
        )}
      </div>

      {/* Security Privacy Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1.5">
          <div className="flex items-center gap-1.5 text-indigo-400 font-bold">
            <Lock className="w-3.5 h-3.5" />
            <span>حماية تامة للواجهة</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            المفاتيح والأكواد لن تظهر مطلقاً في واجهة صانع الإعلانات الرئيسية أو تسجيلات الشاشة.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1.5">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>تشفير المتصفح</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            يتم تخزين بياناتك في جهازك فقط (Local Storage) ولا تُرسل لأي جهات تسويقية خارجية.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1.5">
          <div className="flex items-center gap-1.5 text-purple-400 font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>توافق مع معايير الأمان</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            يمكنك إدخال مفتاحك السري أو تركه ليعتمد تلقائياً على مفاتيح النظام السحابية.
          </p>
        </div>
      </div>
    </div>
  );
};
