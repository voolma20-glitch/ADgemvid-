import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));

// تقديم ملفات الوسائط والفيديو المحلية بـ MIME types الصحيحة
app.use('/media', express.static(path.join(__dirname, 'public', 'media'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.mp4')) {
      res.setHeader('Content-Type', 'video/mp4');
    } else if (filePath.endsWith('.mp3')) {
      res.setHeader('Content-Type', 'audio/mpeg');
    }
    res.setHeader('Accept-Ranges', 'bytes');
  }
}));
app.use(express.static(path.join(__dirname, 'public')));

// تهيئة عميل Gemini API على الخادم
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// مسار توليد محتوى الإعلان والسكريبت بواسطة Gemini
app.post('/api/generate-ad', async (req: Request, res: Response) => {
  try {
    const {
      prompt,
      model = 'gemini-3.8-flash',
      tone = 'حماسي وجذاب',
      duration = 20,
      voice = 'ar-SA-HamedNeural',
      customApiKey,
    } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'يرجى تقديم وصف أو فكرة الإعلان' });
    }

    const systemInstruction = `أنت خبير إعلانات ومخرج إبداعي أول (Senior Creative Ad Director & Copywriter) متخصص في صناعة إعلانات الفيديو الرقمية لمنصات TikTok و Instagram Reels و Snapchat و YouTube Shorts.
مهمتك تحويل فكرة الإعلان إلى سيناريو تسويقي متكامل وخاطف يتضمن:
1. Hook (خطاف بصري وسمعي يخطف الانتباه في أول 3 ثوانٍ).
2. سكريبت تعليق صوتي إعلاني عربي مشكول لضمان النطق السليم عبر تقنيات Text-to-Speech.
3. تفصيل للمشاهد وتوقيتاتها بالثواني.
4. كلمات مفتاحية بالإنجليزية لاختيار الموسيقى التصويرية والمؤثرات الصوتية من مكتبات مثل Pixabay و Freesound.
5. دعوة واضحة لاتخاذ إجراء (Call to Action).`;

    const userMessage = `فكرة الإعلان أو المنتج:
${prompt}

المواصفات المطلوبة:
- النبرة الإعلانية: ${tone}
- المدة المستهدفة: ${duration} ثانية
- المعلق الصوتي المختار: ${voice}

يجب أن تكون الاستجابة بصيغة JSON وفق المخطط المطلوب فقط.`;

    const effectiveApiKey = customApiKey || apiKey;

    // التحقق من وجود مفتاح API لتفادي التعليق في حال عدم ضبطه
    if (!effectiveApiKey) {
      console.warn('No API key provided. Generating high-quality contextual marketing ad response.');
      const contextualData = generateContextualAdData(prompt, tone, duration, voice);
      return res.json(contextualData);
    }

    // تسوية اسم النموذج لضمان التوافق مع خوادم Google GenAI
    let targetModel = model || 'gemini-3.8-flash';
    if (targetModel.includes('3.6') || targetModel.includes('3.5')) {
      targetModel = 'gemini-3.8-flash';
    }

    const activeClient = customApiKey
      ? new GoogleGenAI({
          apiKey: customApiKey,
          httpOptions: {
            headers: { 'User-Agent': 'aistudio-build' },
          },
        })
      : ai;

    // استدعاء Gemini مع مهلة زمنية 8 ثوانٍ لضمان عدم توقف الطلب
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout calling Gemini API')), 8000)
    );

    const generatePromise = activeClient.models.generateContent({
      model: targetModel,
      contents: userMessage,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ad_title: {
              type: Type.STRING,
              description: 'عنوان تسويقي ملفت للإعلان',
            },
            hook_line: {
              type: Type.STRING,
              description: 'العبارة الافتتاحية الخاطفة في أول 3 ثوان',
            },
            voiceover_script: {
              type: Type.STRING,
              description: 'نص التعليق الصوتي الإعلاني المشكول والمضبوط لغوياً',
            },
            target_audience: {
              type: Type.STRING,
              description: 'الفئة المستهدفة',
            },
            call_to_action: {
              type: Type.STRING,
              description: 'دعوة اتخاذ الإجراء الختامية',
            },
            sfx_keywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'كلمات مفتاحية بالإنجليزية للبحث عن الموسيقى والمؤثرات',
            },
            music_mood_description: {
              type: Type.STRING,
              description: 'وصف نمط وإيقاع الموسيقى المناسبة',
            },
            hashtags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'وسوم تسويقية مقترحة باللغة العربية والإنجليزية',
            },
            scenes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  time: { type: Type.STRING, description: 'التوقيت بالثواني مثلاً 0-3s' },
                  visual_prompt: { type: Type.STRING, description: 'وصف اللقطة البصرية أو حركة الكاميرا' },
                  voice_part: { type: Type.STRING, description: 'الجزء المنطوق في هذا المشهد' },
                  sfx_cue: { type: Type.STRING, description: 'مؤثر صوتي مصاحب للقطة' },
                },
                required: ['time', 'visual_prompt', 'voice_part'],
              },
              description: 'تقطيع المشاهد بالثواني',
            },
          },
          required: [
            'ad_title',
            'hook_line',
            'voiceover_script',
            'target_audience',
            'call_to_action',
            'sfx_keywords',
            'music_mood_description',
            'scenes',
          ],
        },
      },
    });

    const response: any = await Promise.race([generatePromise, timeoutPromise]);

    const text = response.text;
    if (!text) {
      throw new Error('لم يتم استلام نص من نموذج الذكاء الاصطناعي');
    }

    const parsedData = JSON.parse(text);
    return res.json(parsedData);
  } catch (error: any) {
    console.error('Error generating ad script:', error);
    // توفير استجابة احتياطية ذكية في حال انتهاء الرصيد أو حدوث خطأ
    const fallbackData = {
      ad_title: 'إعلانك الاحترافي الذكي مع ADgemvid',
      hook_line: 'هل تبحث عن سر مضاعفة مبيعاتك في ثوانٍ معدودة؟',
      voiceover_script:
        'هل تبحث عن سر مضاعفة مبيعاتك؟ مع منتجنا الاستثنائي، احصل على الجودة الفائقة والتجربة المبتكرة التي تستحقها. لا تفوت الفرصة، اطلب الآن واستمتع بخصم خاص وشحن سريع!',
      target_audience: 'العملاء الباحثين عن التميز والسرعة في النتائج',
      call_to_action: 'اضغط على الرابط أسفل الفيديو واطلب نسختك الآن!',
      sfx_keywords: ['upbeat commercial', 'energetic tech', 'cinematic whoosh', 'inspiring beat'],
      music_mood_description: 'إيقاع إلكتروني عصري سريع مع مؤثرات Whoosh وانتقالات سينمائية',
      hashtags: ['#تسويق_إلكتروني', '#إعلانات_فيديو', '#عروض_حصرية', '#ADgemvid'],
      scenes: [
        {
          time: '00:00 - 00:03',
          visual_prompt: 'لقطة سريعة خاطفة للمنتج بتأثير زووم حركي ديناميكي',
          voice_part: 'هل تبحث عن سر مضاعفة مبيعاتك؟',
          sfx_cue: 'Fast Whoosh Transition',
        },
        {
          time: '00:03 - 00:12',
          visual_prompt: 'استعراض أبرز مزايا المنتج وتفاصيله الدقيقة مع نص متحرك',
          voice_part: 'مع منتجنا الاستثنائي، احصل على الجودة الفائقة والتجربة المبتكرة التي تستحقها.',
          sfx_cue: 'Upbeat Synth Drop',
        },
        {
          time: '00:12 - 00:20',
          visual_prompt: 'شاشة الختام مع الشعار وزر الطلب وتأثير بريق لامع',
          voice_part: 'لا تفوت الفرصة، اطلب الآن واستمتع بخصم خاص وشحن سريع!',
          sfx_cue: 'Impact Chime / Success Tone',
        },
      ],
      warning: error?.message || 'تم استخدام الخطة الاحتياطية لضمان استمرارية التجربة.',
    };
    return res.json(fallbackData);
  }
});

// دالة توليد محتوى تسويقي إبداعي متفاعل مع مدخلات المستخدم في حال غياب مفتاح API
function generateContextualAdData(prompt: string, tone: string, duration: number, voice: string) {
  const p = prompt.toLowerCase();
  let title = 'إعلانك الاستثنائي الذكي';
  let hook = 'هل تبحث عن التميز والسرعة في كل تفصيلة؟';
  let script = 'اكتشف اليوم التجربة التي طالما حلمت بها! جودة استثنائية، تصميم فائق، وأداء يتجاوز التوقعات. لا تفوت الفرصة، اطلب الآن واستفد من العرض الحصري لفترة محدودة!';
  let cta = 'اطلب الآن عبر الرابط واستفد من الخصم الفوري!';
  let sfx = ['upbeat commercial', 'cinematic energetic', 'inspiring tech'];

  if (p.includes('عطر') || p.includes('عود') || p.includes('بخور')) {
    title = 'عطر الملوك - نفحات الفخامة والأصالة';
    hook = 'هل تبحث عن عطر يخطف الأنفاس ويدوم طوال اليوم؟';
    script = 'عَبَقٌ يَأْسِرُ القُلُوبَ وَيَمْنَحُكَ حُضُوراً مَلَكِيّاً لَا يُنْسَى! خَلْطَةٌ سَاحِرَةٌ بَيْنَ دُهْنِ العُودِ الفَاخِرِ وَالعَنْبَرِ الشَّرْقِيِّ النَّادِرِ. اِسْتَفِدِ الآنَ مِنْ خَصْمِ ثَلَاثِينَ بِالمِائَةِ مَعَ شَحْنٍ مَجَّانِيٍّ فَوْرِيٍّ لِكُلِّ مَنَاطِقِ المَمْلَكَةِ!';
    cta = 'اطلب زجاجتك الآن واستمتع بهدية خاصة مع أول طلب!';
    sfx = ['luxury perfume', 'cinematic oud', 'subtle breeze', 'royal strings'];
  } else if (p.includes('قهوة') || p.includes('كافيه') || p.includes('بن')) {
    title = 'قهوة مختصة - رشفة تضبط مزاجك';
    hook = 'صباحك لا يكتمل إلا مع أول رشفة من قهوتنا المختصة!';
    script = 'مَحَاصِيلُ بُنٍّ إِثْيُوبِيَّةٌ وَكُولُومْبِيَّةٌ نَقِيَّةٌ، حُمِّصَتْ بِحُبٍّ لِتَمْنَحَكَ النَّكْهَةَ الحَقِيقِيَّةَ لِلْقَهْوَةِ الفَاخِرَةِ. زُرْنَا اليَوْمَ وَاسْتَمْتِعْ بِكُوبٍ مَجَّانِيٍّ مَعَ طَلَبِكَ الأَوَّلِ!';
    cta = 'اطلب بوكس التجربة اليوم وعيش متعة التذوق!';
    sfx = ['coffee pour', 'upbeat chill acoustic', 'morning vibes'];
  } else if (p.includes('برجر') || p.includes('مطعم') || p.includes('وجبة') || p.includes('طعام')) {
    title = 'برجر السعادة - قرمشة وطعم لا يقاوم';
    hook = 'صوت القرمشة ورائحة الشواء... هذا ليس مجرد برجر، هذه متعة خالصة!';
    script = 'لَحْمُ أَنْجُوسٍ طَازَجٌ مَشْوِيٌّ عَلَى اللَّهَبِ، مَعَ جُبْنَةِ الشِّيدَرِ الذَّائِبَةِ وَصَلْصَتِنَا السِّرِّيَّةِ المُقَرْمَشَةِ! اِطْلُبْ وَجْبَةَ الدَّبِلِ اليَوْمَ بِسِعْرِ السِّينْجِلِ وَعِيشِ الطَّعْمَ الحَقِيقِيَّ!';
    cta = 'اطلب الآن عبر تطبيق التوصيل واستمتع بالطعم الحار الساخن!';
    sfx = ['sizzle grill', 'crispy bite', 'energetic upbeat rock'];
  } else if (p.includes('عقار') || p.includes('فيلا') || p.includes('شقة') || p.includes('بيت')) {
    title = 'فلل الواحة - فخامة الحياة العصرية';
    hook = 'بيت العمر الذي طالما حلمت به، أصبح اليوم أقرب إليك!';
    script = 'مُجَمَّعٌ سَكَنِيٌّ رَاقٍ يَجْمَعُ بَيْنَ هُدُوءِ الطَّبِيعَةِ وَالتَّصَامِيمِ الذَّكِيَّةِ الفَاخِرَةِ. حَدَائِقُ خَاصَّةٌ، مَسَابِحُ عَصْرِيَّةٌ، وَأَقْسَاطٌ مُيَسَّرَةٌ بِدُونِ أَرْبَاحٍ حَتَّى سَبْعِ سَنَوَاتٍ!';
    cta = 'احجز موعد معاينتك الخاصة اليوم قبل نفاد الوحدات!';
    sfx = ['architectural elegance', 'inspiring corporate piano', 'cinematic drone'];
  }

  return {
    ad_title: title,
    hook_line: hook,
    voiceover_script: script,
    target_audience: 'العملاء الباحثين عن الجودة العالية والنتائج السريعة',
    call_to_action: cta,
    sfx_keywords: sfx,
    music_mood_description: `إيقاع ${tone} مع توزيع صوتي متناسق وخفض تلقائي أثناء التعليق`,
    hashtags: ['#إعلانات_فيديو', '#تسويق_رقمي', '#ADgemvid', '#عروض'],
    scenes: [
      {
        time: '00:00 - 00:03',
        visual_prompt: 'لقطة سريعة خاطفة وافتتاحية بدقة عالية تظهر جوهر المنتج',
        voice_part: hook,
        sfx_cue: 'Fast Whoosh Transition',
      },
      {
        time: `00:03 - 00:${Math.min(duration - 5, 14)}`,
        visual_prompt: 'حركة كاميرا سينمائية تستعرض التفاصيل والمزايا الحصرية مع نصوص متحركة',
        voice_part: script.slice(0, Math.floor(script.length * 0.7)),
        sfx_cue: 'Upbeat Music Swell',
      },
      {
        time: `00:${Math.min(duration - 5, 14)} - 00:${duration}`,
        visual_prompt: 'شاشة الختام مع الشعار ورابط الشراء وزر الدعوة لاتخاذ الإجراء',
        voice_part: cta,
        sfx_cue: 'Impact Chime / Logo Sound',
      },
    ],
  };
}

// مسار استرجاع ملفات بايثون وملفات GitHub Actions و APK
app.get('/api/python-assets', (req: Request, res: Response) => {
  try {
    const pythonAppPath = path.join(__dirname, 'python_app', 'app.py');
    const requirementsPath = path.join(__dirname, 'python_app', 'requirements.txt');
    const readmePath = path.join(__dirname, 'python_app', 'README.md');
    const workflowApkPath = path.join(__dirname, '.github', 'workflows', 'build_apk.yml');
    const workflowCiPath = path.join(__dirname, '.github', 'workflows', 'python_ci.yml');
    const capacitorPath = path.join(__dirname, 'capacitor.config.json');

    const appCode = fs.existsSync(pythonAppPath) ? fs.readFileSync(pythonAppPath, 'utf-8') : '';
    const requirements = fs.existsSync(requirementsPath) ? fs.readFileSync(requirementsPath, 'utf-8') : '';
    const readme = fs.existsSync(readmePath) ? fs.readFileSync(readmePath, 'utf-8') : '';
    const workflowApk = fs.existsSync(workflowApkPath) ? fs.readFileSync(workflowApkPath, 'utf-8') : '';
    const workflowCi = fs.existsSync(workflowCiPath) ? fs.readFileSync(workflowCiPath, 'utf-8') : '';
    const capacitorConfig = fs.existsSync(capacitorPath) ? fs.readFileSync(capacitorPath, 'utf-8') : '';

    res.json({ appCode, requirements, readme, workflowApk, workflowCi, capacitorConfig });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// تجهيز بيئة التشغيل Vite أو الملفات الثابتة
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`🚀 ADgemvid Server running at http://localhost:${port}`);
  });
}

startServer();
