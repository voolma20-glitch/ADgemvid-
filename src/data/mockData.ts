import { VoiceOption, SampleVideo, BackgroundMusicTrack } from '../types';

export const VOICES_LIST: VoiceOption[] = [
  {
    id: 'ar-SA-HamedNeural',
    name: 'حامد',
    country: '🇸🇦 السعودية',
    gender: 'male',
    langCode: 'ar-SA',
    description: 'صوت رجالي فخم، واثق، وقوي جداً للإعلانات والبراندات الراقية',
  },
  {
    id: 'ar-EG-SalmaNeural',
    name: 'سلمى',
    country: '🇪🇬 مصر',
    gender: 'female',
    langCode: 'ar-EG',
    description: 'صوت نسائي حيوي، ودود، وجذاب للإعلانات السريعة والمتاجر',
  },
  {
    id: 'ar-AE-HamdanNeural',
    name: 'حمدان',
    country: '🇦🇪 الإمارات',
    gender: 'male',
    langCode: 'ar-AE',
    description: 'صوت رجالي رسمي متزن ومناسب للشركات والعقارات والتقنية',
  },
  {
    id: 'ar-EG-ShakirNeural',
    name: 'شاكر',
    country: '🇪🇬 مصر',
    gender: 'male',
    langCode: 'ar-EG',
    description: 'صوت شبابي عفوي وحماسي لعروض التخفيضات ومقاطع تيك توك',
  },
  {
    id: 'ar-SA-ZariyahNeural',
    name: 'زارية',
    country: '🇸🇦 السعودية',
    gender: 'female',
    langCode: 'ar-SA',
    description: 'صوت نسائي هادئ وأنيق، مثالي للعطور ومستحضرات التجميل',
  },
  {
    id: 'ar-MA-JamalNeural',
    name: 'جمال',
    country: '🇲🇦 المغرب',
    gender: 'male',
    langCode: 'ar-MA',
    description: 'صوت رجالي عميق ودافئ للأفلام الوثائقية والإعلانات السينمائية',
  },
];

export const SAMPLE_VIDEOS: SampleVideo[] = [
  {
    id: 'perfume',
    title: 'عطور ومقتنيات فاخرة',
    category: 'فخامة وأناقة',
    url: '/media/perfume.mp4',
    poster: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80',
    suggestedPrompt: 'إعلان عطر شرقي فاخر يجمع بين دهن العود الملكي ونفحات اللافندر الباردة، مع عرض حصري بخصم 35% وشحن مجاني للطلبات هذا الأسبوع.',
  },
  {
    id: 'coffee',
    title: 'قهوة مختصة وكافيه',
    category: 'أغذية ومشروبات',
    url: '/media/coffee.mp4',
    poster: 'https://images.unsplash.com/photo-1509785307050-d4066910ec1e?auto=format&fit=crop&w=600&q=80',
    suggestedPrompt: 'إعلان قهوة مختصة محمصة بحب من محاصيل إثيوبية فاخرة، تبدأ بها صباحك بنشاط ونكهة لا تُنسى، اطلب بوكس التجربة واستمتع بكوب مجاني.',
  },
  {
    id: 'tech',
    title: 'هواتف وأجهزة ذكية',
    category: 'تقنية وإلكترونيات',
    url: '/media/tech.mp4',
    poster: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80',
    suggestedPrompt: 'إعلان شاحن ذكي فائق السرعة يدعم تقنية GaN بقدرة 100 واط مع 4 منافذ لشحن اللابتوب والجوال في آن واحد، ضمان سنتين واستبدال فوري.',
  },
  {
    id: 'food',
    title: 'برجر ومطاعم سريعة',
    category: 'مطاعم',
    url: '/media/food.mp4',
    poster: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    suggestedPrompt: 'إعلان برجر لحم بلاك أنجوس مشوي على اللهب مع جبنة الشيدر الذائبة وصلصة الماشروم السرية، اطلب وجبة الدبل بسعر السينجل اليوم فقط!',
  },
  {
    id: 'realestate',
    title: 'شقق وفلل سكنية',
    category: 'عقارات',
    url: '/media/realestate.mp4',
    poster: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
    suggestedPrompt: 'إعلان مجمع سكني فاخر بإطلالة بانورامية وحدائق خاصة ونظام منزل ذكي متكامل، خطط سداد ميسرة حتى 7 سنوات بدون فوائد.',
  },
];

export const BACKGROUND_MUSIC_TRACKS: BackgroundMusicTrack[] = [
  {
    id: 'upbeat-hiphop',
    name: 'حماسي إلكتروني (Upbeat Commercial)',
    genre: 'Electronic / Beats',
    mood: 'سريع، حماسي، شبابي',
    url: '/media/music-upbeat.mp3',
    duration: '0:30',
  },
  {
    id: 'luxury-tech',
    name: 'فخامة وتقنية عصرية (Luxury Modern)',
    genre: 'Tech House',
    mood: 'راقي، عصري، مبتكر',
    url: '/media/music-luxury.mp3',
    duration: '0:35',
  },
  {
    id: 'inspiring-cinematic',
    name: 'سينمائي ملهم (Inspiring Cinematic)',
    genre: 'Cinematic / Strings',
    mood: 'مؤثر، ملهم، فخم',
    url: '/media/music-cinematic.mp3',
    duration: '0:45',
  },
  {
    id: 'corporate-success',
    name: 'شركات ونجاح أعمال (Corporate Drive)',
    genre: 'Acoustic / Corporate',
    mood: 'واثق، إيجابي، تسويقي',
    url: '/media/music-corporate.mp3',
    duration: '0:40',
  },
];

export const PROMPT_TEMPLATES = [
  {
    title: 'تخفيضات وعروض نهاية الأسبوع',
    prompt: 'إعلان ترويجي لحملة خصومات كبرى تصل إلى 50% على جميع الأزياء والأحذية لفترة محدودة، مع شحن مجاني عند الشراء بأكثر من 200 ريال.',
    tone: 'حماسي وسريع',
  },
  {
    title: 'إطلاق تطبيق إلكتروني جديد',
    prompt: 'إعلان لتطبيق توصيل ذكي يضمن وصول طلبك ساخناً في أقل من 25 دقيقة، مع كود خصم 30% لأول 3 طلبات برمز (FIRST).',
    tone: 'عفوي وترند',
  },
  {
    title: 'منتج عناية بالبشرة طبيعي',
    prompt: 'إعلان سيروم فيتامين سي نقي بخلاصة الورد الطبيعي يعيد نضارة وإشراقة بشرتك خلال 7 أيام، خالٍ من المواد الكيميائية ومصرح طبياً.',
    tone: 'فاخر وهادئ',
  },
  {
    title: 'اشتراك نادي رياضي ولياقة',
    prompt: 'إعلان اشتراك نادي رياضي متكامل مع مدرب شخصي واستشارات غذائية ومسبح أولمبي، ابدأ رحلة التغيير اليوم واحصل على شهر إضافي مجاناً.',
    tone: 'حماسي وجذاب',
  },
];
