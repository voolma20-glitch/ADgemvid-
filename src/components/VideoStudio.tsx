import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  Sliders,
  Download,
  Copy,
  Check,
  Film,
  Music,
  Clock,
  Layers,
  ChevronDown,
  ArrowRight,
  Sparkle,
  Radio,
  FileText,
  Share2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { VOICES_LIST, SAMPLE_VIDEOS, BACKGROUND_MUSIC_TRACKS } from '../data/mockData';
import { GeneratedAdData, SampleVideo, BackgroundMusicTrack } from '../types';

interface VideoStudioProps {
  initialPrompt?: string;
  initialTone?: string;
  customApiKey?: string;
  defaultModel?: string;
  defaultVoice?: string;
  onNavigateToSettings?: () => void;
}

export const VideoStudio: React.FC<VideoStudioProps> = ({
  initialPrompt = '',
  initialTone = 'حماسي وسريع',
  customApiKey = '',
  defaultModel = 'gemini-2.5-flash',
  defaultVoice = 'ar-SA-HamedNeural',
  onNavigateToSettings,
}) => {
  // Video Source state
  const [selectedVideo, setSelectedVideo] = useState<SampleVideo>(SAMPLE_VIDEOS[0]);
  const [customVideoUrl, setCustomVideoUrl] = useState<string | null>(null);
  const [customVideoName, setCustomVideoName] = useState<string | null>(null);

  // Form inputs
  const [adPrompt, setAdPrompt] = useState<string>(
    initialPrompt || 'إعلان عطر شرقي فاخر برائحة العود والعنبر مع خصم 30% وشحن مجاني وسريع لكافة المناطق بمناسبة يوم التأسيس.'
  );
  const [aiModel, setAiModel] = useState<string>(defaultModel || 'gemini-2.5-flash');
  const [adTone, setAdTone] = useState<string>(initialTone);
  const [targetDuration, setTargetDuration] = useState<number>(20);
  const [selectedVoice, setSelectedVoice] = useState<string>(defaultVoice || 'ar-SA-HamedNeural');
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [selectedMusic, setSelectedMusic] = useState<BackgroundMusicTrack>(BACKGROUND_MUSIC_TRACKS[0]);
  const [musicDuckingVolume, setMusicDuckingVolume] = useState<number>(0.15);
  const [normalMusicVolume, setNormalMusicVolume] = useState<number>(0.55);

  // AI Generation status
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [generatedData, setGeneratedData] = useState<GeneratedAdData | null>(null);

  // Playback & Assembly state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [isVoiceSpeaking, setIsVoiceSpeaking] = useState<boolean>(false);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  const [showTashkeel, setShowTashkeel] = useState<boolean>(true);
  const [captionsEnabled, setCaptionsEnabled] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportedVideoUrl, setExportedVideoUrl] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<boolean>(false);

  // Media Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioMusicRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Synchronize initial prompt changes from outside
  useEffect(() => {
    if (initialPrompt) {
      setAdPrompt(initialPrompt);
    }
    if (initialTone) {
      setAdTone(initialTone);
    }
  }, [initialPrompt, initialTone]);

  // Active video URL
  const activeVideoSrc = customVideoUrl || selectedVideo.url;

  // Handle Video File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomVideoUrl(url);
      setCustomVideoName(file.name);
      setVideoError(false);
      if (videoRef.current) {
        videoRef.current.load();
      }
    }
  };

  // AI Generation Handler
  const handleGenerateAd = async () => {
    if (!adPrompt.trim()) return;

    setIsGenerating(true);
    setGenerationStep('🤖 1/4: استدعاء Gemini لتحليل الفكرة وكتابة السكريبت...');
    setGeneratedData(null);
    setExportedVideoUrl(null);

    try {
      // Small visual pause for smooth transition
      await new Promise((r) => setTimeout(r, 600));
      setGenerationStep('🎙️ 2/4: ضبط نبرة المعلق الصوتي وتحسين التشكيل اللغوي...');

      const response = await fetch('/api/generate-ad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: adPrompt,
          model: aiModel,
          tone: adTone,
          duration: targetDuration,
          voice: selectedVoice,
          customApiKey: customApiKey || undefined,
        }),
      });

      setGenerationStep('🎵 3/4: اختيار وضبط الموسيقى والمؤثرات الصوتية...');
      await new Promise((r) => setTimeout(r, 500));

      setGenerationStep('🎞️ 4/4: إعداد مسارات المونتاج وخاصية Audio Ducking...');
      const data: GeneratedAdData = await response.json();
      await new Promise((r) => setTimeout(r, 400));

      setGeneratedData(data);
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (err) {
      console.error('Error generating ad:', err);
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  // Web Speech API Voiceover synthesis
  const speakVoiceover = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA';
    utterance.rate = speechRate;
    utterance.pitch = 1.0;

    // Try finding an Arabic voice
    const voices = window.speechSynthesis.getVoices();
    const arabicVoice = voices.find((v) => v.lang.startsWith('ar'));
    if (arabicVoice) {
      utterance.voice = arabicVoice;
    }

    utterance.onstart = () => {
      setIsVoiceSpeaking(true);
      // Duck music
      if (audioMusicRef.current) {
        audioMusicRef.current.volume = musicDuckingVolume;
      }
    };

    utterance.onend = () => {
      setIsVoiceSpeaking(false);
      // Restore normal music volume
      if (audioMusicRef.current) {
        audioMusicRef.current.volume = normalMusicVolume;
      }
    };

    utterance.onerror = () => {
      setIsVoiceSpeaking(false);
      if (audioMusicRef.current) {
        audioMusicRef.current.volume = normalMusicVolume;
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopVoiceover = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsVoiceSpeaking(false);
      if (audioMusicRef.current) {
        audioMusicRef.current.volume = normalMusicVolume;
      }
    }
  };

  // Synchronized Play / Pause
  const handleTogglePlay = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      if (audioMusicRef.current) {
        audioMusicRef.current.pause();
      }
      stopVoiceover();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(console.error);
      if (audioMusicRef.current) {
        audioMusicRef.current.play().catch(console.error);
      }
      // If we have generated script, start speech synthesis
      if (generatedData?.voiceover_script) {
        speakVoiceover(generatedData.voiceover_script);
      }
      setIsPlaying(true);
    }
  };

  // Reset playback
  const handleResetPlayback = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.pause();
    }
    if (audioMusicRef.current) {
      audioMusicRef.current.currentTime = 0;
      audioMusicRef.current.pause();
    }
    stopVoiceover();
    setIsPlaying(false);
    setCurrentTime(0);
  };

  // Update current playback time
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  // Strip diacritics for clean view
  const getScriptDisplay = (text: string) => {
    if (showTashkeel) return text;
    // Arabic Tashkeel regex
    return text.replace(/[\u064B-\u065F\u0670]/g, '');
  };

  // Get active scene based on time
  const activeScene = generatedData?.scenes?.find((scene) => {
    const parts = scene.time.replace(/s/g, '').split('-');
    if (parts.length === 2) {
      const start = parseFloat(parts[0]);
      const end = parseFloat(parts[1]);
      return currentTime >= start && currentTime <= end;
    }
    return false;
  }) || generatedData?.scenes?.[0];

  // Video Export Simulator & Recorder
  const handleExportVideo = async () => {
    setIsExporting(true);
    // Start playback
    handleResetPlayback();
    setTimeout(() => {
      handleTogglePlay();
    }, 200);

    // Simulate complete processing & assemble
    await new Promise((r) => setTimeout(r, 4000));
    setExportedVideoUrl(activeVideoSrc);
    setIsExporting(false);
    confetti({ particleCount: 80, spread: 90 });
  };

  // Voiceover download simulation
  const handleDownloadVoiceover = () => {
    if (!generatedData) return;
    const blob = new Blob([generatedData.voiceover_script], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'voiceover_script.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Step Progress Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-indigo-500/30 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-sm border border-indigo-500/30 shrink-0">
            1
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-white truncate">فيديو الإعلان</div>
            <div className="text-[10px] text-slate-400 truncate">رفع أو اختيار نموذج</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-purple-500/30 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 font-bold flex items-center justify-center text-sm border border-purple-500/30 shrink-0">
            2
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-white truncate">الفكرة والمعلق الصوتي</div>
            <div className="text-[10px] text-slate-400 truncate">نبرة حامد، سلمى، وغيرهم</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-pink-500/30 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-400 font-bold flex items-center justify-center text-sm border border-pink-500/30 shrink-0">
            3
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-white truncate">توليد الذكاء الاصطناعي</div>
            <div className="text-[10px] text-slate-400 truncate">صياغة Hook ومؤثرات</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-emerald-500/30 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-sm border border-emerald-500/30 shrink-0">
            4
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-white truncate">المونتاج و Ducking</div>
            <div className="text-[10px] text-slate-400 truncate">تصدير ومشاهدة الإعلان</div>
          </div>
        </div>
      </div>

      {/* Main Studio Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Controls (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Section 1: Video Selection */}
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
                <Film className="w-4 h-4 text-indigo-400" />
                <span>1. فيديو الإعلان الأساسي (Video Footage)</span>
              </h3>
              {customVideoName && (
                <span className="text-[11px] font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                  فيديو مخصص: {customVideoName}
                </span>
              )}
            </div>

            {/* Upload or Preset tabs */}
            <div className="space-y-3">
              <label className="relative flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-700 hover:border-indigo-500/60 rounded-2xl cursor-pointer bg-slate-950/60 hover:bg-slate-950 transition group">
                <input
                  type="file"
                  accept="video/mp4,video/quicktime,video/mov"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 group-hover:scale-110 transition">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="text-right">
                    <span className="text-xs md:text-sm font-bold text-white block">
                      اضغط هنا لرفع فيديو الإعلان (MP4 أو MOV)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      يدعم الفيديوهات العمودية (TikTok/Reels) أو الأفقية
                    </span>
                  </div>
                </div>
              </label>

              {/* Sample Videos Selector */}
              <div>
                <span className="text-xs text-slate-400 block mb-2 font-medium">
                  أو اختر أحد المقاطع الجاهزة للتجربة الفورية:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {SAMPLE_VIDEOS.map((sample) => (
                    <button
                      key={sample.id}
                      onClick={() => {
                        setSelectedVideo(sample);
                        setCustomVideoUrl(null);
                        setCustomVideoName(null);
                        setAdPrompt(sample.suggestedPrompt);
                        setVideoError(false);
                        if (videoRef.current) videoRef.current.load();
                      }}
                      className={`p-2 rounded-xl border text-right transition flex flex-col justify-between h-20 ${
                        !customVideoUrl && selectedVideo.id === sample.id
                          ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                          : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-xs font-bold truncate block">{sample.title}</span>
                      <span className="text-[10px] text-slate-400">{sample.category}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Prompt and Tone */}
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>2. فكرة الإعلان والمواصفات الإبداعية</span>
              </h3>
              <span className="text-xs text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                صياغة Gemini الذكية
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-300">
                  وصف المنتج، العرض، أو الفكرة التسويقية:
                </label>
                <span className="text-[11px] text-slate-400">{adPrompt.length} حرف</span>
              </div>
              <textarea
                value={adPrompt}
                onChange={(e) => setAdPrompt(e.target.value)}
                rows={3}
                placeholder="اكتب هنا تفاصيل إعلانك: اسم المنتج، مميزاته، الخصم أو العرض، والجمهور المستهدف..."
                className="w-full p-3.5 rounded-2xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-slate-100 placeholder-slate-500 transition resize-none"
              />
            </div>

            {/* Tone, Duration, Model in responsive row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  نبرة وأسلوب الإعلان:
                </label>
                <select
                  value={adTone}
                  onChange={(e) => setAdTone(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-indigo-500"
                >
                  <option value="حماسي وسريع">حماسي وسريع (TikTok/Reels)</option>
                  <option value="فاخر وهادئ">فاخر وهادئ (براندات فاخرة)</option>
                  <option value="عفوي وترند">عفوي وترند (User Generated)</option>
                  <option value="رسمي ومقنع">رسمي ومقنع (شركات وعقارات)</option>
                  <option value="سينمائي درامي">سينمائي درامي (مؤثر)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  المدة المستهدفة:
                </label>
                <select
                  value={targetDuration}
                  onChange={(e) => setTargetDuration(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-indigo-500"
                >
                  <option value={15}>15 ثانية (سريع وخاطف)</option>
                  <option value={20}>20 ثانية (المثالي للإعلانات)</option>
                  <option value={30}>30 ثانية (تفصيلي ومقنع)</option>
                  <option value={45}>45 ثانية (قصة متكاملة)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  نموذج Gemini:
                </label>
                <select
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-indigo-500"
                >
                  <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                  <option value="gemini-3.6-flash">gemini-3.6-flash</option>
                  <option value="gemini-3.5-flash">gemini-3.5-flash</option>
                  <option value="gemini-3.1-flash">gemini-3.1-flash</option>
                  <option value="gemini-3.5-flash-lite">gemini-3.5-flash-lite</option>
                  <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite</option>
                  <option value="gemini-2.5-pro">gemini-2.5-pro</option>
                  <option value="gemini-3.8-flash">gemini-3.8-flash</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Arabic Voiceover Engine */}
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-pink-400" />
                <span>3. محرك التعليق الصوتي العربي (Edge-TTS Engine)</span>
              </h3>
              <span className="text-[11px] font-bold text-pink-300 bg-pink-500/10 px-2 py-0.5 rounded-full border border-pink-500/20">
                مجاني بدون قيود
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {VOICES_LIST.map((voice) => (
                <div
                  key={voice.id}
                  onClick={() => setSelectedVoice(voice.id)}
                  className={`p-3 rounded-2xl border text-right cursor-pointer transition flex items-start justify-between gap-2 ${
                    selectedVoice === voice.id
                      ? 'bg-gradient-to-r from-pink-950/40 to-purple-950/40 border-pink-500/70 shadow-lg'
                      : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="font-bold text-sm text-white">{voice.name}</span>
                      <span className="text-xs text-slate-400">{voice.country}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {voice.description}
                    </p>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-1 ${
                      selectedVoice === voice.id
                        ? 'border-pink-500 bg-pink-500'
                        : 'border-slate-600'
                    }`}
                  >
                    {selectedVoice === voice.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                </div>
              ))}
            </div>

            {/* Audio Ducking & Music Setting */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5 text-indigo-400" />
                  <span>موسيقى الخلفية:</span>
                </span>
                <select
                  value={selectedMusic.id}
                  onChange={(e) => {
                    const found = BACKGROUND_MUSIC_TRACKS.find((t) => t.id === e.target.value);
                    if (found) setSelectedMusic(found);
                  }}
                  className="bg-slate-900 border border-slate-700 rounded-lg text-xs p-1.5 text-slate-200"
                >
                  {BACKGROUND_MUSIC_TRACKS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-slate-300 font-medium">
                    نسبة خفض الموسيقى التلقائي أثناء الكلام (Audio Ducking):
                  </span>
                  <span className="font-mono text-indigo-400 font-bold">
                    {Math.round(musicDuckingVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.35"
                  step="0.05"
                  value={musicDuckingVolume}
                  onChange={(e) => setMusicDuckingVolume(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Action Trigger Button */}
          <button
            onClick={handleGenerateAd}
            disabled={isGenerating || !adPrompt.trim()}
            className={`w-full py-4 px-6 rounded-2xl font-black text-base transition-all duration-300 flex items-center justify-center gap-3 shadow-2xl ${
              isGenerating
                ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white shadow-indigo-500/30 hover:scale-[1.01]'
            }`}
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{generationStep || 'جاري المعالجة وصياغة الإعلان بالذكاء الاصطناعي...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-yellow-300" />
                <span>تحسين الوصف وإنشاء الإعلان المتكامل</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Live Player & Assembly Studio (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Video Preview Card */}
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-4 sticky top-24">
            <div className="flex items-center justify-between">
              <h3 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
                <Play className="w-4 h-4 text-emerald-400" />
                <span>شاشة المونتاج والمعاينة الحية</span>
              </h3>
              <div className="flex items-center gap-2">
                {isVoiceSpeaking && (
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 text-[10px] font-bold animate-pulse border border-pink-500/30">
                    <Volume2 className="w-3 h-3" />
                    <span>Ducking نشط</span>
                  </span>
                )}
                <button
                  onClick={() => setCaptionsEnabled(!captionsEnabled)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition ${
                    captionsEnabled
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  الترجمة: {captionsEnabled ? 'مفعلة' : 'معطلة'}
                </button>
              </div>
            </div>

            {/* Video Viewport Container */}
            <div className="relative aspect-[9/16] max-h-[460px] mx-auto w-full max-w-[280px] sm:max-w-[320px] rounded-2xl overflow-hidden bg-black shadow-2xl border border-slate-800 flex items-center justify-center">
              {videoError ? (
                <div className="relative w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950">
                  <img
                    src={selectedVideo.poster}
                    alt={selectedVideo.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
                  />
                  <div className="relative z-10 p-3 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 space-y-2">
                    <Film className="w-8 h-8 text-indigo-400 mx-auto" />
                    <span className="text-xs font-bold text-white block">
                      {selectedVideo.title}
                    </span>
                    <span className="text-[10px] text-slate-300 block">
                      معاينة حية للمشهد الإعلاني
                    </span>
                  </div>
                </div>
              ) : (
                <video
                  ref={videoRef}
                  src={activeVideoSrc}
                  loop
                  playsInline
                  muted
                  preload="auto"
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={(e) => {
                    setVideoDuration(e.currentTarget.duration);
                    setVideoError(false);
                  }}
                  onLoadedData={() => setVideoError(false)}
                  onError={(e) => {
                    console.warn('Video failed to load source:', activeVideoSrc, e);
                    setVideoError(true);
                  }}
                  className="w-full h-full object-cover"
                />
              )}

              {/* Background Music Audio Element */}
              <audio
                ref={audioMusicRef}
                src={selectedMusic.url}
                loop
                preload="auto"
                onError={(e) => {
                  console.warn('Audio background track not loaded:', selectedMusic.url, e);
                }}
              />

              {/* Dynamic Animated Subtitle Overlay */}
              {captionsEnabled && generatedData && isPlaying && (
                <div className="absolute bottom-6 left-3 right-3 text-center pointer-events-none z-10 transition-all">
                  <div className="inline-block p-2.5 rounded-xl bg-black/75 backdrop-blur-md border border-white/10 shadow-2xl">
                    <p className="text-xs sm:text-sm font-black text-yellow-300 leading-snug drop-shadow-md">
                      {isVoiceSpeaking
                        ? activeScene?.voice_part || generatedData.hook_line
                        : generatedData.call_to_action}
                    </p>
                  </div>
                </div>
              )}

              {/* Top watermark / brand badge */}
              <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] text-white font-bold tracking-wider border border-white/10">
                ADgemvid AI
              </div>

              {/* Play overlay button if paused */}
              {!isPlaying && (
                <div
                  onClick={handleTogglePlay}
                  className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center cursor-pointer group"
                >
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition">
                    <Play className="w-7 h-7 ml-0.5" />
                  </div>
                </div>
              )}
            </div>

            {/* Playback Controls Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={handleTogglePlay}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-md ${
                    isPlaying
                      ? 'bg-amber-600 hover:bg-amber-500 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4" />
                      <span>إيقاف مؤقت</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>تشغيل متزامن مع الصوت</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleResetPlayback}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  title="إعادة التشغيل من البداية"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Time display */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono px-1">
                <span>00:{Math.floor(currentTime).toString().padStart(2, '0')}</span>
                <span className="text-slate-500">مزامنة التعليق والموسيقى</span>
                <span>00:{Math.floor(videoDuration || targetDuration).toString().padStart(2, '0')}</span>
              </div>
            </div>

            {/* Export & Download Buttons */}
            {generatedData && (
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <button
                  onClick={handleExportVideo}
                  disabled={isExporting}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2"
                >
                  {isExporting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>جاري معالجة وتصدير الفيديو...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>تنزيل الإعلان المكتمل (MP4)</span>
                    </>
                  )}
                </button>

                {exportedVideoUrl && (
                  <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-[11px] text-emerald-300 flex items-center justify-between">
                    <span>🎉 الفيديو متاح للتحميل الفوري</span>
                    <a
                      href={exportedVideoUrl}
                      download="ADgemvid_Ad.mp4"
                      className="font-bold underline text-white"
                    >
                      تحميل مباشر
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Generated Creative Results Card (Shown when data is generated) */}
      {generatedData && (
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
                  نتيجة الذكاء الاصطناعي
                </span>
                <h3 className="text-lg md:text-xl font-black text-white">
                  {generatedData.ad_title}
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                الجمهور المستهدف: <strong className="text-slate-200">{generatedData.target_audience}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedData.voiceover_script);
                  setCopiedScript(true);
                  setTimeout(() => setCopiedScript(false), 2000);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition"
              >
                {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedScript ? 'تم النسخ!' : 'نسخ السكريبت'}</span>
              </button>

              <button
                onClick={() => setShowTashkeel(!showTashkeel)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition"
              >
                التشكيل: {showTashkeel ? 'ظاهر' : 'مخفي'}
              </button>
            </div>
          </div>

          {/* Highlights Grid: Hook & CTA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-slate-950 border border-indigo-500/30">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 mb-1.5">
                <Sparkle className="w-4 h-4" />
                <span>الخطاف الافتتاحي (Hook - أول 3 ثوان):</span>
              </div>
              <p className="text-sm font-bold text-white leading-relaxed">
                "{generatedData.hook_line}"
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-slate-950 border border-emerald-500/30">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-1.5">
                <ArrowRight className="w-4 h-4" />
                <span>الحث على اتخاذ الإجراء (Call to Action):</span>
              </div>
              <p className="text-sm font-bold text-white leading-relaxed">
                "{generatedData.call_to_action}"
              </p>
            </div>
          </div>

          {/* Full Voiceover Script Card */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <FileText className="w-4 h-4 text-pink-400" />
                <span>سكريبت التعليق الصوتي الإعلاني الكامل (Voiceover Script):</span>
              </span>
              <button
                onClick={() => speakVoiceover(generatedData.voiceover_script)}
                className="text-xs text-pink-400 hover:text-pink-300 font-bold flex items-center gap-1"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>استماع للتعليق الصوتي</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-sm md:text-base text-slate-100 font-medium leading-loose text-justify">
              {getScriptDisplay(generatedData.voiceover_script)}
            </div>

            {/* SFX Keywords & Music Tags */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-xs text-slate-400">الكلمات المفتاحية للمؤثرات:</span>
              {generatedData.sfx_keywords?.map((kw, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-full bg-slate-900 text-indigo-300 border border-indigo-500/30 text-xs font-mono"
                >
                  #{kw}
                </span>
              ))}
            </div>
          </div>

          {/* Storyboard Breakdown Table */}
          {generatedData.scenes?.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs md:text-sm font-bold text-slate-200 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>دليل توزيع المشاهد الترويجي (Storyboard Timeline):</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {generatedData.scenes.map((scene, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 hover:border-slate-700 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        ⏱️ {scene.time}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">مشهد {idx + 1}</span>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 block mb-0.5">اللقطة البصرية:</span>
                      <p className="text-xs text-slate-200 font-medium leading-relaxed">
                        {scene.visual_prompt}
                      </p>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 block mb-0.5">الصوت المصاحب:</span>
                      <p className="text-xs text-indigo-300 leading-relaxed font-semibold">
                        "{scene.voice_part}"
                      </p>
                    </div>

                    {scene.sfx_cue && (
                      <div className="text-[10px] text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20">
                        مؤثر صوتي: {scene.sfx_cue}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
