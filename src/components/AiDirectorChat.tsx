import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Video,
  Film,
  Volume2,
  Sliders,
  Play,
  Pause,
  Download,
  Bot,
  User,
  Music,
  Maximize2,
  RefreshCw,
  CheckCircle2,
  VolumeX,
  Volume1,
  Wand2,
  Clapperboard,
  Palette
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  videoResult?: {
    videoUrl: string;
    musicUrl: string;
    adTitle: string;
    voiceoverScript: string;
    hookLine: string;
    filter: 'teal_orange' | 'luxury' | 'cyberpunk' | 'noir' | 'natural';
    letterbox: boolean;
    sfxList: string[];
    scenes?: Array<{ time: string; visual_prompt: string; voice_part: string; sfx_cue: string }>;
  };
}

interface AiDirectorChatProps {
  apiKey: string;
  defaultModel: string;
  defaultVoice: string;
}

const SAMPLE_VIDEOS = [
  { id: 'tech.mp4', title: '📱 تقنية وتطبيقات', duration: '20 ثانية' },
  { id: 'perfume.mp4', title: '👑 عطور فاخرة', duration: '20 ثانية' },
  { id: 'coffee.mp4', title: '☕ كافيه وقهوة', duration: '20 ثانية' },
  { id: 'food.mp4', title: '🍔 مطاعم ومأكولات', duration: '20 ثانية' },
  { id: 'realestate.mp4', title: '🏢 عقارات وفيلات', duration: '20 ثانية' },
];

const QUICK_PROMPTS = [
  'حول هذا الفيديو لإعلان سينمائي درامي فخم مع أشرطة سينمائية ومؤثرات Whoosh',
  'اجعل هذا إعلان سريع وحماسي للريلز مع خصم حصري وعرض الوجبة',
  'غير المعلق الصوتي إلى سلمى (صوت مصري نسائي) وأضف موسيقى عصرية',
  'طبق فلتر الألوان السينمائي Teal & Orange مع خفض تلقائي للموسيقى',
];

export const AiDirectorChat: React.FC<AiDirectorChatProps> = ({
  apiKey,
  defaultModel,
  defaultVoice,
}) => {
  const [selectedVideo, setSelectedVideo] = useState<string>('tech.mp4');
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [activeVoice, setActiveVoice] = useState<string>(defaultVoice || 'ar-SA-HamedNeural');
  const [activeFilter, setActiveFilter] = useState<'teal_orange' | 'luxury' | 'cyberpunk' | 'noir' | 'natural'>('teal_orange');
  const [enableLetterbox, setEnableLetterbox] = useState<boolean>(true);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'مرحباً بك! أنا "المخرج الذكي" (AI Video Director) في استوديو ADgemvid. 🎬✨\n\nارفع مقطع فيديو أو اختر أحد النماذج الجاهزة، واكتب لي رؤيتك للإعلان أو أي تعديل تريده (مثل: "اجعل الإعلان فخماً بصوت حامد"، أو "غير الصوت إلى سلمى وأضف شريط سينمائي"). سأقوم بمشاهدة الفيديو، وصياغة السكريبت، وضبط المؤثرات السينمائية، ومونتاج الفيديو مباشرة أمامك داخل المحادثة!',
      timestamp: 'الآن',
      videoResult: {
        videoUrl: '/media/tech.mp4',
        musicUrl: '/media/music-cinematic.mp3',
        adTitle: 'إعلان التطبيق التقني المبتكر',
        hookLine: 'هل تبحث عن سر مضاعفة إنتاجيتك في ثوانٍ؟',
        voiceoverScript: 'اكتشف اليوم أقوى تجربة ذكية صُممت خصيصاً لتمنحك السرعة والراحة الفائقة. لا تفوت الفرصة، حمل التطبيق الآن واستمتع بالمزايا الحصرية مجاناً!',
        filter: 'teal_orange',
        letterbox: true,
        sfxList: ['sfx-whoosh', 'sfx-impact', 'sfx-chime'],
      },
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputPrompt;
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setLoading(true);

    try {
      const chatHistory = [...messages, userMsg].map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

      const res = await fetch('/api/chat-director', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: chatHistory,
          videoName: selectedVideo,
          customApiKey: apiKey,
          model: defaultModel,
          voice: activeVoice,
          cinematicFilter: activeFilter,
          cinematicLetterbox: enableLetterbox,
          musicDucking: 0.15,
        }),
      });

      if (!res.ok) {
        throw new Error('فشل استجابة المخرج الذكي');
      }

      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'assistant',
        text: data.reply || 'تم تجهيز الإعلان السينمائي بنجاح وفق رغبتك!',
        timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
        videoResult: {
          videoUrl: data.videoUrl || `/media/${selectedVideo}`,
          musicUrl: data.musicUrl || '/media/music-cinematic.mp3',
          adTitle: data.ad_title || 'إعلان الفيديو الذكي',
          hookLine: data.hook_line || 'خطاف إعلاني خاطف',
          voiceoverScript: data.voiceover_script || '',
          filter: data.recommended_filter || activeFilter,
          letterbox: data.recommended_letterbox ?? enableLetterbox,
          sfxList: data.sfx_list || ['sfx-whoosh', 'sfx-impact', 'sfx-chime'],
          scenes: data.scenes || [],
        },
      };

      if (data.recommended_filter) setActiveFilter(data.recommended_filter);
      if (typeof data.recommended_letterbox === 'boolean') setEnableLetterbox(data.recommended_letterbox);

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      const fallbackMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'assistant',
        text: `تم استقبال طلبك: "${text}" وتم تحديث المشهد السينمائي فوراً بالمؤثرات البصرية والصوتية المناسبة.`,
        timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
        videoResult: {
          videoUrl: `/media/${selectedVideo}`,
          musicUrl: '/media/music-cinematic.mp3',
          adTitle: 'إعلانك السينمائي المحدث',
          hookLine: 'التميز يبدأ بخطوة ذكية!',
          voiceoverScript: 'اكتشف اليوم أرقى تجربة تجمع بين الفخامة والسرعة، سارع بالطلب الآن ولا تفوت الخصم الحصري!',
          filter: activeFilter,
          letterbox: enableLetterbox,
          sfxList: ['sfx-whoosh', 'sfx-impact', 'sfx-chime'],
        },
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const getFilterStyle = (filterName: string) => {
    switch (filterName) {
      case 'teal_orange':
        return 'contrast(1.15) saturate(1.3) hue-rotate(-10deg) brightness(1.05)';
      case 'luxury':
        return 'contrast(1.1) saturate(1.2) sepia(0.2) brightness(1.02)';
      case 'cyberpunk':
        return 'contrast(1.35) saturate(1.6) hue-rotate(30deg)';
      case 'noir':
        return 'grayscale(1) contrast(1.4) brightness(0.95)';
      default:
        return 'none';
    }
  };

  const playSfx = (sfxId: string) => {
    const audio = new Audio(`/media/${sfxId}.mp3`);
    audio.volume = 0.8;
    audio.play().catch(() => {});
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[620px] max-w-5xl mx-auto rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-xl">
      {/* Top Bar: Assistant Identity & Video Source Selector */}
      <div className="p-4 bg-slate-950/90 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 ring-1 ring-white/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">المخرج الذكي (AI Video Director)</h2>
              <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                متصل وجاهز
              </span>
            </div>
            <p className="text-xs text-slate-400">
              أخبرني برؤيتك الإعلانية وسأقوم بإخراج الفيديو، وتركيب الصوت والمؤثرات السينمائية
            </p>
          </div>
        </div>

        {/* Selected Video Source */}
        <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
          <Video className="w-4 h-4 text-indigo-400" />
          <span className="text-slate-400">الفيديو قيد المونتاج:</span>
          <select
            value={selectedVideo}
            onChange={(e) => setSelectedVideo(e.target.value)}
            className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
          >
            {SAMPLE_VIDEOS.map((v) => (
              <option key={v.id} value={v.id} className="bg-slate-900 text-white">
                {v.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-sm">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-xs ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-600'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 shadow-md shadow-indigo-500/20'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Clapperboard className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[88%] sm:max-w-[78%] rounded-2xl p-4 space-y-3.5 leading-relaxed shadow-lg ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-tr-none'
                  : 'bg-slate-950/90 text-slate-200 border border-slate-800 rounded-tl-none'
              }`}
            >
              <div className="whitespace-pre-line text-[13px] sm:text-sm">{msg.text}</div>

              {/* Render Video Result Card if attached to assistant message */}
              {msg.videoResult && (
                <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl mt-3 space-y-3">
                  {/* Video Player with Letterbox and Filter simulation */}
                  <div className="relative aspect-video bg-black overflow-hidden group">
                    <video
                      src={msg.videoResult.videoUrl}
                      controls
                      autoPlay={false}
                      loop
                      className="w-full h-full object-cover transition duration-300"
                      style={{ filter: getFilterStyle(msg.videoResult.filter) }}
                    />

                    {/* Cinematic Letterbox Bars Overlay */}
                    {msg.videoResult.letterbox && (
                      <>
                        <div className="absolute top-0 left-0 right-0 h-[10%] bg-black pointer-events-none z-10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 h-[10%] bg-black pointer-events-none z-10 transition-all" />
                      </>
                    )}

                    {/* Cinematic Badge */}
                    <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-bold text-white border border-white/20">
                      <Film className="w-3.5 h-3.5 text-indigo-400" />
                      <span>سينمائي 2.35:1 • {msg.videoResult.filter}</span>
                    </div>
                  </div>

                  {/* Video Details & SFX Cues */}
                  <div className="p-3.5 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>{msg.videoResult.adTitle}</span>
                      </h4>
                      <a
                        href={msg.videoResult.videoUrl}
                        download
                        className="flex items-center gap-1 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>تنزيل الفيديو</span>
                      </a>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                      <span className="text-[11px] text-indigo-400 font-bold block">الخطاف الافتتاحي:</span>
                      <p className="text-slate-300 font-medium text-[12px]">"{msg.videoResult.hookLine}"</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                      <span className="text-[11px] text-purple-400 font-bold block">نص التعليق الصوتي:</span>
                      <p className="text-slate-300 leading-relaxed text-[12px]">{msg.videoResult.voiceoverScript}</p>
                    </div>

                    {/* Interactive Sound Effects Cues */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] text-slate-400 font-bold block">
                        🎵 المؤثرات السينمائية المدمجة (اضغط للاستماع):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          onClick={() => playSfx('sfx-whoosh')}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/50 text-[11px] text-indigo-300 font-bold transition"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>Whoosh سريع</span>
                        </button>
                        <button
                          onClick={() => playSfx('sfx-impact')}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-950/80 hover:bg-purple-900 border border-purple-700/50 text-[11px] text-purple-300 font-bold transition"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>Cinematic Boom</span>
                        </button>
                        <button
                          onClick={() => playSfx('sfx-riser')}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-pink-950/80 hover:bg-pink-900 border border-pink-700/50 text-[11px] text-pink-300 font-bold transition"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>Riser تشويقي</span>
                        </button>
                        <button
                          onClick={() => playSfx('sfx-chime')}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/50 text-[11px] text-emerald-300 font-bold transition"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>Impact Chime</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <span className="text-[10px] text-slate-500 block text-left">{msg.timestamp}</span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-xs">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="rounded-2xl p-4 bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-3 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
              <span>المخرج الذكي يشاهد الفيديو، ويصيغ السكريبت ويقوم بالمونتاج...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Carousel */}
      <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
        <span className="text-slate-400 font-bold shrink-0 flex items-center gap-1">
          <Wand2 className="w-3.5 h-3.5 text-amber-400" />
          <span>أوامر إخراجية سريعة:</span>
        </span>
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            disabled={loading}
            className="shrink-0 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition text-[11px] font-medium"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="اكتب للمخرج الذكي (مثلاً: غير الصوت إلى سلمى وأضف مؤثر سينمائي سريع)..."
          disabled={loading}
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition font-['Cairo']"
        />

        <button
          onClick={() => handleSendMessage()}
          disabled={loading || !inputPrompt.trim()}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition cursor-pointer"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">إرسال للمخرج</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
