import React, { useState } from 'react';
import {
  Film,
  Palette,
  Volume2,
  Sliders,
  CheckCircle2,
  Sparkles,
  Layers,
  Key,
  ShieldCheck,
  Video,
  Play,
  Maximize,
  Info,
  Wand2,
  Zap,
  Activity
} from 'lucide-react';

interface CinematicStudioProps {
  onApplySettings?: (filter: string, letterbox: boolean) => void;
}

export const CinematicEffectsStudio: React.FC<CinematicStudioProps> = ({ onApplySettings }) => {
  const [activeFilter, setActiveFilter] = useState<string>('teal_orange');
  const [activeLetterbox, setActiveLetterbox] = useState<boolean>(true);
  const [playingSfx, setPlayingSfx] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string>('perfume.mp4');

  const COLOR_PRESETS = [
    {
      id: 'teal_orange',
      name: 'Teal & Orange السينمائي (هوليوود)',
      desc: 'التباين الكلاسيكي بين درجات البرتقالي للوجوه والأزرق المخضر للخلفيات',
      filterCss: 'contrast(1.15) saturate(1.3) hue-rotate(-10deg) brightness(1.05)',
      badge: 'الأكثر طلباً',
      color: 'from-amber-500 to-cyan-500',
    },
    {
      id: 'luxury',
      name: 'Warm Luxury (الفخامة الملكية)',
      desc: 'درجات ذهبية دافئة ناعمة تبرز العطور، المجوهرات، والمنتجات الفاخرة',
      filterCss: 'contrast(1.1) saturate(1.2) sepia(0.2) brightness(1.02)',
      badge: 'عطور ومجوهرات',
      color: 'from-amber-400 to-yellow-600',
    },
    {
      id: 'cyberpunk',
      name: 'Cyberpunk Neon (التقنية المستقبلية)',
      desc: 'ألوان مشبعة بظلال النيون الأرجواني والأزرق لتطبيقات الهاتف والألعاب',
      filterCss: 'contrast(1.35) saturate(1.6) hue-rotate(30deg)',
      badge: 'تطبيقات وتقنية',
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: 'noir',
      name: 'Film Noir (الأبيض والأسود الدرامي)',
      desc: 'تباين قوي بالأبيض والأسود يعكس هيبة وغموض الإعلانات الوثائقية',
      filterCss: 'grayscale(1) contrast(1.4) brightness(0.95)',
      badge: 'درامي وكلاسيكي',
      color: 'from-slate-400 to-slate-700',
    },
    {
      id: 'natural',
      name: 'Natural Clean (الألوان الطبيعية)',
      desc: 'ألوان نقية وواضحة تناسب إعلانات الأطعمة والمطاعم بدون فلترة مبالغة',
      filterCss: 'contrast(1.05) saturate(1.1) brightness(1.0)',
      badge: 'طبيعي ومريح',
      color: 'from-emerald-400 to-teal-600',
    },
  ];

  const SFX_EFFECTS = [
    {
      id: 'sfx-whoosh',
      name: 'Fast Whoosh Transition',
      desc: 'صوت اندفاع هوائي سينمائي سريع يواكب حركات الزووم وانتقال المشاهد',
      file: '/media/sfx-whoosh.mp3',
      iconColor: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10 border-indigo-500/30',
    },
    {
      id: 'sfx-impact',
      name: 'Cinematic Sub-Impact',
      desc: 'ضربة صوتية منخفضة التردد تعطي وزناً وهيبة لظهور اسم المنتج أو اللوجو',
      file: '/media/sfx-impact.mp3',
      iconColor: 'text-purple-400',
      bgColor: 'bg-purple-500/10 border-purple-500/30',
    },
    {
      id: 'sfx-riser',
      name: 'Dramatic Tension Riser',
      desc: 'نغمة تصاعدية تشويقية تبني الحماس قبل الكشف عن الخصم أو العرض',
      file: '/media/sfx-riser.mp3',
      iconColor: 'text-pink-400',
      bgColor: 'bg-pink-500/10 border-pink-500/30',
    },
    {
      id: 'sfx-chime',
      name: 'Impact Success Chime',
      desc: 'رنة بريق كريستالية لامعة تبرز علامة الجودة أو اللمسة الختامية',
      file: '/media/sfx-chime.mp3',
      iconColor: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/30',
    },
  ];

  const LIBRARIES_OVERVIEW = [
    {
      name: 'OpenCV (cv2)',
      needsKey: false,
      role: 'تصحيح الألوان السينمائية (Color Grading LUTs)، إضافة الأشرطة السينمائية (Letterbox)، وتثبيت الإطارات وتسريع الحركة.',
      cost: 'مجاني تماماً 100% بدون أي مفاتيح أو إنترنت',
      tag: 'محلي (On-Device)',
    },
    {
      name: 'MoviePy',
      needsKey: false,
      role: 'دمج طبقات الفيديو مع المقاطع الصوتية، وخفض الموسيقى الذكي أثناء الكلام (Audio Ducking)، وتصدير الفيديو بصيغة MP4.',
      cost: 'مجاني ومفتوح المصدر 100%',
      tag: 'محلي (On-Device)',
    },
    {
      name: 'Edge-TTS (Microsoft)',
      needsKey: false,
      role: 'توليد تعليق صوتي باللغة العربية الطبيعية بلهجات متعددة (سعودي، مصري، إماراتي، مغربي) بجودة استوديو تفوق الصوت البشري.',
      cost: 'مجاني بالكامل بدون أي اشتراك أو بطاقة بنكية',
      tag: 'سحابي مجاني',
    },
    {
      name: 'Pixabay & Mixkit Assets',
      needsKey: false,
      role: 'جلب خلفيات موسيقية مرخصة ومؤثرات صوتية، مع دعم مفتاح Pixabay اختياري للبحث غير المحدود.',
      cost: 'مجاني للاستخدام التجاري بدون مفتاح',
      tag: 'مكتبة مدمجة',
    },
    {
      name: 'Freesound.org API',
      needsKey: true,
      role: 'أكبر بنك عالمي للمؤثرات الصوتية (Whoosh, Impact, Transitions)، ويوجد بنك صوتي مدمج بالتطبيق يعمل بدون مفتاح.',
      cost: 'مفتاح مجاني بالكامل عند التسجيل في موقعهم',
      tag: 'مفتاح مطور مجاني',
    },
    {
      name: 'Google Gemini AI',
      needsKey: true,
      role: 'العقل المدبر: يقرأ الفيديو ويفهمه ثانية بثانية، ويصوغ السكريبت التسويقي، ويحدد توقيتات المؤثرات والنبرة.',
      cost: 'مفتاح مجاني من Google AI Studio',
      tag: 'ذكاء اصطناعي فائق',
    },
  ];

  const currentPreset = COLOR_PRESETS.find((p) => p.id === activeFilter) || COLOR_PRESETS[0];

  const playSound = (id: string, file: string) => {
    setPlayingSfx(id);
    const audio = new Audio(file);
    audio.volume = 0.85;
    audio.play().catch(() => {});
    audio.onended = () => setPlayingSfx(null);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950/70 via-slate-900/90 to-purple-950/60 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Palette className="w-5 h-5 text-indigo-400" />
              </span>
              <h2 className="text-xl md:text-2xl font-black text-white">
                معمل المؤثرات السينمائية والمكتبات الذكية (Cinematic FX Lab)
              </h2>
            </div>
            <p className="text-xs md:text-sm text-slate-400 max-w-2xl leading-relaxed">
              استكشف كيفية عمل مكتبات <strong>OpenCV</strong> و <strong>MoviePy</strong> و <strong>Freesound</strong>، وجرب فلاتر تصحيح الألوان السينمائية والأشرطة السوداء والمؤثرات الصوتية فورياً!
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/90 p-2 rounded-2xl border border-slate-800 shrink-0">
            <Video className="w-4 h-4 text-indigo-400" />
            <span className="text-xs text-slate-400">مقطع المعاينة:</span>
            <select
              value={selectedVideo}
              onChange={(e) => setSelectedVideo(e.target.value)}
              className="bg-transparent text-xs text-white font-bold focus:outline-none cursor-pointer"
            >
              <option value="perfume.mp4" className="bg-slate-900 text-white">عطور فاخرة</option>
              <option value="tech.mp4" className="bg-slate-900 text-white">تطبيقات وتقنية</option>
              <option value="coffee.mp4" className="bg-slate-900 text-white">كافيه ومشروبات</option>
              <option value="food.mp4" className="bg-slate-900 text-white">مطاعم وبرجر</option>
              <option value="realestate.mp4" className="bg-slate-900 text-white">عقارات وفيلات</option>
            </select>
          </div>
        </div>
      </div>

      {/* Real-time Interactive Video Previewer with Live Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Video Canvas & Controls */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-4 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">
                  معاينة الفلتر السينمائي المباشر (Real-time Live Preview)
                </h3>
              </div>
              <button
                onClick={() => setActiveLetterbox(!activeLetterbox)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                  activeLetterbox
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                <Maximize className="w-3.5 h-3.5" />
                <span>أشرطة السينما 2.35:1: {activeLetterbox ? 'مفعلة' : 'معطلة'}</span>
              </button>
            </div>

            {/* Video Player Display with CSS Filter Simulation */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl border border-slate-800 group">
              <video
                key={selectedVideo}
                src={`/media/${selectedVideo}`}
                controls
                autoPlay
                loop
                muted
                className="w-full h-full object-cover transition duration-300"
                style={{ filter: currentPreset.filterCss }}
              />

              {/* Cinematic Letterbox Simulation */}
              {activeLetterbox && (
                <>
                  <div className="absolute top-0 left-0 right-0 h-[10%] bg-black pointer-events-none z-10 transition-all duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 h-[10%] bg-black pointer-events-none z-10 transition-all duration-300" />
                </>
              )}

              {/* Status Indicator */}
              <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md text-xs font-bold text-white border border-white/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{currentPreset.name}</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
              💡 <strong>كيف ينفذها الكود؟</strong> تقوم دالة OpenCV بتعديل قنوات الألوان (Color LUT Matrix) وإضافة الأشرطة السوداء، ثم يقوم MoviePy بتصدير الفيديو بدقة 1080p بمعدل 24 إطار سينمائي بالثانية.
            </p>
          </div>
        </div>

        {/* Color Presets Selection */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Palette className="w-4 h-4 text-purple-400" />
            <span>اختر نمط الألوان السينمائي (Color Grade):</span>
          </h3>

          <div className="space-y-2.5">
            {COLOR_PRESETS.map((preset) => {
              const isSelected = activeFilter === preset.id;
              return (
                <div
                  key={preset.id}
                  onClick={() => setActiveFilter(preset.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'bg-slate-800/90 border-indigo-500 shadow-lg shadow-indigo-500/20'
                      : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-3.5 h-3.5 rounded-full bg-gradient-to-r ${preset.color}`} />
                      <span className="text-xs md:text-sm font-bold text-white">{preset.name}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                      {preset.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed pr-5">{preset.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SFX Interactive Soundboard */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Volume2 className="w-5 h-5 text-purple-400" />
            </span>
            <div>
              <h3 className="text-base font-bold text-white">
                لوحة المؤثرات الصوتية السينمائية (SFX Soundboard)
              </h3>
              <p className="text-xs text-slate-400">
                اضغط على أي مؤثر للاستماع الفوري وتجربة ما سيتم دمجه في الفيديو:
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {SFX_EFFECTS.map((sfx) => {
            const isPlaying = playingSfx === sfx.id;
            return (
              <button
                key={sfx.id}
                onClick={() => playSound(sfx.id, sfx.file)}
                className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between gap-3 ${
                  isPlaying
                    ? 'bg-purple-950/80 border-purple-500 shadow-lg shadow-purple-500/25 scale-102'
                    : `${sfx.bgColor} hover:bg-slate-800/80`
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`p-2 rounded-xl bg-slate-950/80 ${sfx.iconColor}`}>
                    <Volume2 className={`w-4 h-4 ${isPlaying ? 'animate-bounce' : ''}`} />
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-950 text-slate-300 border border-slate-800">
                    {isPlaying ? 'جاري التشغيل...' : 'اضغط للتشغيل'}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white mb-1">{sfx.name}</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{sfx.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Answer to User Question: How do these libraries work and do they need API Keys? */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-5">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <Key className="w-5 h-5 text-emerald-400" />
          </span>
          <div>
            <h3 className="text-base md:text-lg font-bold text-white">
              🔑 هل تحتاج هذه المكتبات إلى مفاتيح API مثل Gemini؟
            </h3>
            <p className="text-xs text-slate-400">
              دليل شامل يوضح طبيعة كل مكتبة ومصدر التكلفة والترخيص:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {LIBRARIES_OVERVIEW.map((lib, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-indigo-400" />
                  <span>{lib.name}</span>
                </h4>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                    lib.needsKey
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  }`}
                >
                  {lib.needsKey ? 'يحتاج مفتاح مجاني' : 'بدون مفتاح (مجاني 100%)'}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{lib.role}</p>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-medium">{lib.cost}</span>
                <span className="text-indigo-400 font-bold">{lib.tag}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
