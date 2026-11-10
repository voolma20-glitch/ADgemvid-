import React, { useState, useEffect } from 'react';
import { Copy, Check, Download, Terminal, Play, FileCode, CheckCircle2, Smartphone, ShieldCheck, GitBranch, Sparkles } from 'lucide-react';

export const PythonCodeViewer: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'app' | 'requirements' | 'apk_workflow' | 'capacitor' | 'readme'>('app');
  const [copied, setCopied] = useState(false);
  const [pythonCode, setPythonCode] = useState<string>('');
  const [requirementsCode, setRequirementsCode] = useState<string>('');
  const [readmeContent, setReadmeContent] = useState<string>('');
  const [workflowApk, setWorkflowApk] = useState<string>('');
  const [workflowCi, setWorkflowCi] = useState<string>('');
  const [capacitorConfig, setCapacitorConfig] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/python-assets')
      .then((res) => res.json())
      .then((data) => {
        if (data.appCode) setPythonCode(data.appCode);
        if (data.requirements) setRequirementsCode(data.requirements);
        if (data.readme) setReadmeContent(data.readme);
        if (data.workflowApk) setWorkflowApk(data.workflowApk);
        if (data.workflowCi) setWorkflowCi(data.workflowCi);
        if (data.capacitorConfig) setCapacitorConfig(data.capacitorConfig);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load python assets:', err);
        setLoading(false);
      });
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (filename: string, content: string, mimeType: string = 'text/plain') => {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getContentAndFilename = () => {
    switch (activeSubTab) {
      case 'app':
        return { content: pythonCode, filename: 'app.py', type: 'Python App' };
      case 'requirements':
        return { content: requirementsCode, filename: 'requirements.txt', type: 'Pip Requirements' };
      case 'apk_workflow':
        return { content: workflowApk, filename: 'build_apk.yml', type: 'GitHub Actions Workflow' };
      case 'capacitor':
        return { content: capacitorConfig, filename: 'capacitor.config.json', type: 'Android Config' };
      case 'readme':
        return { content: readmeContent, filename: 'README.md', type: 'Documentation' };
      default:
        return { content: pythonCode, filename: 'app.py', type: 'Python App' };
    }
  };

  const { content: currentContent, filename: currentFileName, type: currentType } = getContentAndFilename();

  return (
    <div className="space-y-6">
      {/* Top Banner / Summary */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950/60 via-slate-900/80 to-purple-950/50 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <FileCode className="w-5 h-5" />
              </span>
              <h2 className="text-xl md:text-2xl font-bold text-white">
                ملفات GitHub و Workflows وتطبيق أندرويد (APK)
              </h2>
            </div>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              تم تجهيز حزمة النشر المتكاملة: كود بايثون <code className="text-indigo-300">app.py</code>، ومسار البناء الآلي لملف الأندرويد <code className="text-indigo-300">.github/workflows/build_apk.yml</code> لتوليد ملف <strong>APK</strong> بضغطة زر واحدة مجاناً على خوادم GitHub!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => handleCopy(currentContent)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm border border-slate-700 transition shadow-lg"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">تم النسخ بنجاح!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-300" />
                  <span>نسخ {currentFileName}</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleDownload(currentFileName, currentContent)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition"
            >
              <Download className="w-4 h-4" />
              <span>تنزيل {currentFileName}</span>
            </button>
          </div>
        </div>
      </div>

      {/* APK Automated Generation Guide on GitHub */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 border border-emerald-500/40 shadow-xl space-y-4">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <Smartphone className="w-5 h-5 text-emerald-400" />
          </span>
          <div>
            <h3 className="text-base md:text-lg font-bold text-white">
              📱 كيف تحصل على ملف APK وتثبته على هاتفك عبر GitHub Actions؟
            </h3>
            <p className="text-xs text-slate-400">
              يقوم ملف الـ Workflow المجهز ببناء ملف الـ APK وتجميعه بالكامل في سحابة GitHub بدون الحاجة لأي برامج على جهازك!
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-indigo-400 font-bold">
              <span className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs border border-indigo-500/30">1</span>
              <span>رفع الكود إلى GitHub</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              ارفع ملفات المشروع إلى مستودعك، متضمناً مجلد <code className="text-slate-200">.github/workflows</code>.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-purple-400 font-bold">
              <span className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-xs border border-purple-500/30">2</span>
              <span>تشغيل البناء التلقائي</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              اذهب إلى تبويب <strong>Actions</strong> في مستودعك، اختر <strong>Build Android APK</strong> واضغط <strong>Run workflow</strong>.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs border border-emerald-500/30">3</span>
              <span>تحميل الـ APK وتثبيته</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              خلال دقيقتين ستجد ملف <code className="text-emerald-300">ADgemvid-Android-v1.0.apk</code> متاحاً للتحميل الفوري إلى هاتفك!
            </p>
          </div>
        </div>
      </div>

      {/* Code Tabs Navigation */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-2xl">
        <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800 gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveSubTab('app')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeSubTab === 'app'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <span>app.py</span>
              <span className="text-[10px] px-1 bg-black/30 rounded text-slate-300">Python</span>
            </button>

            <button
              onClick={() => setActiveSubTab('apk_workflow')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeSubTab === 'apk_workflow'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-300" />
              <span>build_apk.yml</span>
              <span className="text-[10px] px-1 bg-black/30 rounded text-emerald-200">APK Workflow</span>
            </button>

            <button
              onClick={() => setActiveSubTab('capacitor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeSubTab === 'capacitor'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <span>capacitor.config.json</span>
              <span className="text-[10px] px-1 bg-black/30 rounded text-purple-200">Android Config</span>
            </button>

            <button
              onClick={() => setActiveSubTab('requirements')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeSubTab === 'requirements'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <span>requirements.txt</span>
              <span className="text-[10px] px-1 bg-black/30 rounded text-slate-300">Pip</span>
            </button>

            <button
              onClick={() => setActiveSubTab('readme')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeSubTab === 'readme'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <span>README.md</span>
              <span className="text-[10px] px-1 bg-black/30 rounded text-slate-300">دليل التشغيل</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(currentContent)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="نسخ المحتوى"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={() => handleDownload(currentFileName, currentContent)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="تنزيل الملف"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Code Content Container */}
        <div className="p-4 bg-slate-950 font-mono text-xs text-slate-200 overflow-x-auto max-h-[600px] leading-relaxed text-left selection:bg-indigo-600" dir="ltr">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-slate-400">
              <span className="animate-spin w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full mr-2" />
              جاري تحميل الملفات...
            </div>
          ) : (
            <pre className="whitespace-pre">{currentContent || '# No content available'}</pre>
          )}
        </div>
      </div>

      {/* Terminal Quick Start Guide */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
              <GitBranch className="w-4 h-4 text-emerald-400" />
              <span>أوامر الرفع إلى GitHub السريعة:</span>
            </div>
            <button
              onClick={() =>
                handleCopy('git init && git add . && git commit -m "ADgemvid App & APK Workflow" && git branch -M main')
              }
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <Copy className="w-3 h-3" />
              <span>نسخ الأوامر</span>
            </button>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 font-mono text-xs text-emerald-400 border border-slate-800 overflow-x-auto text-left" dir="ltr">
            git init<br />
            git add .<br />
            git commit -m "ADgemvid App & APK Workflow"<br />
            git branch -M main
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
              <Play className="w-4 h-4 text-purple-400" />
              <span>تشغيل خادم بايثون محلياً:</span>
            </div>
            <button
              onClick={() => handleCopy('streamlit run python_app/app.py')}
              className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              <Copy className="w-3 h-3" />
              <span>نسخ الأمر</span>
            </button>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 font-mono text-xs text-indigo-400 border border-slate-800 overflow-x-auto text-left" dir="ltr">
            streamlit run python_app/app.py
          </div>
        </div>
      </div>
    </div>
  );
};
