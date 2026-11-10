import React from 'react';
import { Lightbulb, ArrowLeft, Sparkles, ShoppingBag, Coffee, Smartphone, Utensils, Home, Dumbbell, Car, GraduationCap } from 'lucide-react';
import { PROMPT_TEMPLATES } from '../data/mockData';

interface AdInspirationsProps {
  onSelectPrompt: (prompt: string, tone: string) => void;
}

const CATEGORY_CARDS = [
  {
    title: 'عطور ومستحضرات تجميل',
    icon: ShoppingBag,
    color: 'from-pink-500/20 to-purple-500/20 text-pink-400 border-pink-500/30',
    prompt: 'إعلان عطر شرقي فاخر بنفحات العود والعنبر والمسك الأبيض، مصمم للمناسبات الراقية مع خصم 30% وشحن مجاني وسريع لكافة مدن المملكة.',
    tone: 'فاخر وهادئ',
    duration: 20,
    hook: 'هل تبحث عن بصمة عطرية لا تُنسى في كل مكان تدخله؟',
  },
  {
    title: 'مقاهي ومشروبات ساخنة وباردة',
    icon: Coffee,
    color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30',
    prompt: 'إعلان كافيه مختص يقدم محاصيل بُن فاخرة مع مشروب الآيس دريب المنعش وكيكة الزعفران اللذيذة، استمتع بخصم 20% على طلبات الصباح.',
    tone: 'حماسي وجذاب',
    duration: 15,
    hook: 'صباحك لا يكتمل إلا مع أول رشفة من قهوتنا المختصة!',
  },
  {
    title: 'تطبيقات ومتاجر إلكترونية',
    icon: Smartphone,
    color: 'from-indigo-500/20 to-blue-500/20 text-indigo-400 border-indigo-500/30',
    prompt: 'إعلان تطبيق توصيل مقاضي وسوبرماركت يوصل طلبك لباب بيتك في 20 دقيقة طازج وبدون رسوم توصيل لأول 3 طلبات برمز (FAST20).',
    tone: 'عفوي وترند',
    duration: 20,
    hook: 'نسيت غرض مهم والعزيمة بدأت؟ وفر وقتك وجهدك الآن!',
  },
  {
    title: 'مطاعم وبرجر ومأكولات',
    icon: Utensils,
    color: 'from-red-500/20 to-orange-500/20 text-red-400 border-red-500/30',
    prompt: 'إعلان برجر لحم واغيو مشوي على الحطب مع صوص الجبن المدخن والبطاطس المقرمشة، اطلب وجبة الدبل اليوم بسعر خاص مع مشروبك المفضل.',
    tone: 'حماسي وسريع',
    duration: 20,
    hook: 'صوت القرمشة ورائحة الشواء... هذا ليس مجرد برجر، هذه تجربة!',
  },
  {
    title: 'عقارات ومشاريع سكنية',
    icon: Home,
    color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
    prompt: 'إعلان مشروع فلل فاخرة بتصاميم مودرن ومسابح خاصة ونظام أمان ذكي، بموقع استراتيجي وأقساط ميسرة بدون دفعة أولى.',
    tone: 'رسمي ومقنع',
    duration: 30,
    hook: 'بيت العمر الذي طالما حلمت به، أصبح اليوم أقرب إليك من أي وقت مضى.',
  },
  {
    title: 'نوادي رياضية ولياقة بدنية',
    icon: Dumbbell,
    color: 'from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30',
    prompt: 'إعلان نادي رياضي مجهز بأحدث الأجهزة العالمية مع جدول تمارين مخصص واستشارات تغذية مجانية، اشترك في باقة الـ 3 شهور واحصل على شهر هدية.',
    tone: 'حماسي وجذاب',
    duration: 20,
    hook: 'جسمك هو استثمارك الأهم! ابدأ التحدي اليوم وغير حياتك.',
  },
  {
    title: 'خدمات سيارات وتلميع ساطع',
    icon: Car,
    color: 'from-violet-500/20 to-purple-500/20 text-violet-400 border-violet-500/30',
    prompt: 'إعلان باقة حماية نانو سيراميك وتلميع ساطع يعيد لمعان وكالة سيارتك مع ضمان 5 سنوات وضمان ضد الخدوش والعوامل الجوية.',
    tone: 'فاخر وهادئ',
    duration: 25,
    hook: 'حافظ على لمعان سيارتك كأنها خرجت من الوكالة للتو!',
  },
  {
    title: 'دورات تدريبية وتعليمية',
    icon: GraduationCap,
    color: 'from-yellow-500/20 to-amber-500/20 text-yellow-400 border-yellow-500/30',
    prompt: 'إعلان دورة احتراف الذكاء الاصطناعي والتسويق الرقمي مع شهادة معتمدة وتطبيق عملي خطوة بخطوة، المقاعد محدودة بخصم 40%.',
    tone: 'رسمي ومقنع',
    duration: 25,
    hook: 'هل تريد مضاعفة دخلك ومهاراتك في عصر الذكاء الاصطناعي؟',
  },
];

export const AdInspirations: React.FC<AdInspirationsProps> = ({ onSelectPrompt }) => {
  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Lightbulb className="w-5 h-5" />
            </span>
            <h2 className="text-xl md:text-2xl font-bold text-white">
              أفكار ونماذج إعلانية جاهزة للاستخدام
            </h2>
          </div>
          <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
            اختر أحد المجالات الإعلانية الأكثر مبيعاً وشهرة في الخليج والوطن العربي لتعبئة الاستوديو فورياً وتجربة المونتاج وتوليد الفيديو بضغطة زر واحدة.
          </p>
        </div>
      </div>

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {CATEGORY_CARDS.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${card.color} border`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    {card.duration} ثانية
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mb-2 group-hover:text-indigo-300 transition">
                  {card.title}
                </h3>

                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 mb-3 text-xs text-indigo-300 font-medium">
                  "{card.hook}"
                </div>

                <p className="text-xs text-slate-400 line-clamp-3 mb-4 leading-relaxed">
                  {card.prompt}
                </p>
              </div>

              <button
                onClick={() => onSelectPrompt(card.prompt, card.tone)}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-800 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 text-slate-200 hover:text-white font-bold text-xs transition-all shadow-md"
              >
                <span>استخدام هذه الفكرة في الاستوديو</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
