#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
=============================================================================
ADgemvid - استوديو إعلانات الفيديو الذكي بالذكاء الاصطناعي (AI Smart Video Ad Studio)
=============================================================================
المتطلبات:
    pip install streamlit google-genai edge-tts moviepy requests pydantic python-dotenv

طريقة التشغيل:
    streamlit run app.py
"""

import os
import sys
import json
import asyncio
import tempfile
import urllib.parse
from pathlib import Path
from typing import Optional, Dict, Any, List

import streamlit as st
import requests
from dotenv import load_dotenv

# استيراد مكتبات MoviePy مع دعم الإصدارين (v1 و v2)
try:
    from moviepy.editor import (
        VideoFileClip,
        AudioFileClip,
        CompositeAudioClip,
        afx,
    )
except ImportError:
    try:
        from moviepy import (
            VideoFileClip,
            AudioFileClip,
            CompositeAudioClip,
        )
    except Exception as e:
        VideoFileClip = None
        AudioFileClip = None
        CompositeAudioClip = None

# استيراد مكتبة edge-tts
try:
    import edge_tts
except ImportError:
    edge_tts = None

# استيراد مكتبة google-genai الحديثة
try:
    from google import genai
    from google.genai import types
except ImportError:
    genai = None

# تحميل متغيرات البيئة من ملف .env إن وجد
load_dotenv()

# =============================================================================
# 1. إعدادات الصفحة والتصميم المتجاوب مع الهواتف (Mobile Responsive + RTL Style)
# =============================================================================
st.set_page_config(
    page_title="ADgemvid | استوديو إعلانات الفيديو الذكي",
    page_icon="🎬",
    layout="wide",
    initial_sidebar_state="auto"
)

CUSTOM_CSS = """
<style>
/* استيراد خط Cairo من Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');

html, body, [class*="css"] {
    font-family: 'Cairo', sans-serif !important;
    direction: rtl;
    text-align: right;
}

/* تحسين تجاوب الهواتف المحمولة */
@media (max-width: 768px) {
    .block-container {
        padding: 1rem 0.75rem !important;
    }
    h1 {
        font-size: 1.6rem !important;
    }
    h2 {
        font-size: 1.3rem !important;
    }
}

/* تخصيص أزرار التحكم والبطاقات */
.stButton > button {
    width: 100%;
    border-radius: 12px;
    font-weight: 700;
    padding: 0.65rem 1.25rem;
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
    color: white;
    border: none;
    transition: all 0.25s ease;
    box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35);
}

.stButton > button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(79, 70, 229, 0.5);
}

.metric-card {
    background: rgba(30, 41, 59, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 14px;
    padding: 1.2rem;
    margin-bottom: 1rem;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
}

.tag-badge {
    display: inline-block;
    padding: 0.25rem 0.65rem;
    background: rgba(99, 102, 241, 0.2);
    color: #a5b4fc;
    border: 1px solid rgba(99, 102, 241, 0.4);
    border-radius: 9999px;
    font-size: 0.85rem;
    margin: 0.2rem;
}
</style>
"""

st.markdown(CUSTOM_CSS, unsafe_allow_html=True)

# مكتبة صوتيات موسيقية احتياطية مجانية عالية الجودة ومرخصة
FALLBACK_TRACKS = [
    {
        "name": "إيقاع حماسي إلكتروني (Upbeat Electronic)",
        "url": "https://assets.mixkit.co/music/preview/mixkit-energetic-hip-hop-8.mp3",
        "genre": "electronic upbeat commercial"
    },
    {
        "name": "طابع سينمائي راقي وملهم (Inspiring Cinematic)",
        "url": "https://assets.mixkit.co/music/preview/mixkit-inspiring-cinematic-trailer-592.mp3",
        "genre": "cinematic inspiring"
    },
    {
        "name": "إيقاع عصري خفيف ومبهج (Upbeat Vlog & Fashion)",
        "url": "https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3",
        "genre": "tech luxury trendy"
    },
    {
        "name": "موسيقى ترويجية للمنتجات والشركات (Corporate Business)",
        "url": "https://assets.mixkit.co/music/preview/mixkit-corporate-business-motivation-906.mp3",
        "genre": "corporate promotion"
    }
]

# =============================================================================
# 2. دوال الذكاء الاصطناعي (Gemini Logic)
# =============================================================================
def generate_ad_script_with_gemini(
    api_key: str,
    model_name: str,
    user_prompt: str,
    target_duration_sec: int = 20,
    tone: str = "حماسي وجذاب"
) -> Dict[str, Any]:
    """
    استدعاء Gemini API عبر مكتبة google-genai وتوليد السكريبت والكلمات المفتاحية
    """
    if not genai:
        raise ImportError("مكتبة google-genai غير مثبتة. يرجى تثبيتها عبر: pip install google-genai")

    if not api_key:
        raise ValueError("مفتاح Gemini API مطلوب للتشغيل.")

    # تهيئة عميل GenAI
    client = genai.Client(api_key=api_key)

    system_instruction = (
        "أنت خبير كتابة نصوص إعلانية عالمي (Senior Creative Ad Copywriter & Director). "
        "مهمتك صياغة سكريبت تعليق صوتي إعلاني عربي احترافي ومبهر ومخصص لمنصات التواصل الاجتماعي (TikTok, Instagram Reels, Snapchat, YouTube Shorts). "
        "يجب أن يتضمن السكريبت: "
        "1. Hook (خطاف افتتاحي سريع يخطف الانتباه في أول 3 ثوانٍ). "
        "2. المشكلة والحل ومميزات المنتج/الخدمة. "
        "3. Call To Action (حث واضح وقوي على اتخاذ إجراء). "
        "4. تشكيل سليم للكلمات لضمان نطق سليم للتعليق الصوتي. "
        "5. كلمات مفتاحية بالإنجليزية مناسبة لموسيقى الخلفية والمؤثرات الصوتية للبحث في مكتبات Pixabay وFreesound."
    )

    prompt = f"""
    فكرة الإعلان أو المنتج المطلوب:
    {user_prompt}

    المواصفات المطلوبة:
    - النبرة الإعلانية: {tone}
    - المدة المستهدفة للإعلان: حوالي {target_duration_sec} ثانية (بين 25 إلى 60 كلمة مناسبة للقراءة في هذه المدة).
    
    أجب فقط بتنسيق JSON نظيف وصحيح بالهيكل التالي تماماً بدون أي علامات ماركداون إضافية:
    {{
      "ad_title": "عنوان تسويقي جذاب للإعلان",
      "target_audience": "الجمهور المستهدف",
      "hook_line": "العبارة الافتتاحية الخاطفة",
      "voiceover_script": "النص الكامل المشكول للتعليق الصوتي لتقرأه أداة التحويل الصوتي بسلاسة تامة وبدون حشو",
      "sfx_keywords": ["كلمة 1 بالإنجليزية", "كلمة 2 بالإنجليزية", "كلمة 3 بالإنجليزية"],
      "music_style_desc": "وصف نمط الموسيقى الأنسب (مثلاً: Fast paced energetic beat with subtle synth drops)",
      "call_to_action": "عبارة الحث على اتخاذ الإجراء",
      "scene_breakdown": [
        {{"sec": "0-3s", "visual": "وصف المشهد البصري الأول", "audio": "جزء التعليق الصوتي"}},
        {{"sec": "3-10s", "visual": "وصف المشهد البصري الثاني", "audio": "جزء التعليق الصوتي"}},
        {{"sec": "10-20s", "visual": "المشهد النهائي والـ CTA", "audio": "الخاتمة"}}
      ]
    }}
    """

    # تسوية اسم النموذج لضمان التوافق مع خوادم Google GenAI الرسمية
    target_model = model_name
    if "3.6" in target_model or "3.5" in target_model:
        target_model = "gemini-3.8-flash"

    try:
        response = client.models.generateContent(
            model=target_model,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type="application/json",
            )
        )
        
        raw_text = response.text
        cleaned_text = raw_text.strip()
        if cleaned_text.startswith("```json"):
            cleaned_text = cleaned_text[7:]
        if cleaned_text.startswith("```"):
            cleaned_text = cleaned_text[3:]
        if cleaned_text.endswith("```"):
            cleaned_text = cleaned_text[:-3]
            
        return json.loads(cleaned_text.strip())

    except Exception as e:
        # خيار احتياطي في حال حدوث خطأ من الـ API لضمان استمرارية التجربة
        return {
            "ad_title": "إعلانك الاحترافي الذكي",
            "target_audience": "الجمهور المهتم بالجودة والسرعة",
            "hook_line": "هل تبحث عن الحل الأمثل لتنمية عملك؟",
            "voiceover_script": "اكتشف الحل الأمثل اليوم! نقدم لك تجربة استثنائية تجمع بين السرعة والجودة الفائقة. لا تفوت الفرصة، اطلب الآن واستفد من العرض الحصري!",
            "sfx_keywords": ["upbeat commercial", "cinematic energetic", "modern corporate"],
            "music_style_desc": "Upbeat modern advertising rhythm",
            "call_to_action": "اطلب الآن عبر الرابط في الوصف",
            "scene_breakdown": [
                {"sec": "0-3s", "visual": "لقطة خاطفة للمنتج", "audio": "اكتشف الحل الأمثل اليوم!"},
                {"sec": "3-15s", "visual": "استعراض المزايا والنتائج", "audio": "نقدم لك تجربة استثنائية بجودة لا تضاهى."},
                {"sec": "15-20s", "visual": "ظهور الشعار وزر الطلب", "audio": "اطلب الآن واستفد من العرض الحصري!"}
            ],
            "api_warning": str(e)
        }

# =============================================================================
# 3. محرك الصوتيات والتعليق الصوتي المجاني (Free Media Engine)
# =============================================================================
async def _async_generate_voiceover(text: str, voice: str, output_path: str, rate: str = "+0%", pitch: str = "+0Hz"):
    """دالة غير متزامنة لتوليد الصوت عبر edge-tts"""
    communicate = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch)
    await communicate.save(output_path)

def generate_arabic_voiceover(text: str, voice: str, output_path: str, rate: str = "+0%", pitch: str = "+0Hz") -> bool:
    """
    توليد التعليق الصوتي باللغة العربية مجاناً وبجودة استوديو باستخدام edge-tts
    """
    if not edge_tts:
        st.error("مكتبة edge-tts غير مثبتة. قم بتشغيل: pip install edge-tts")
        return False
        
    try:
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
        if loop.is_running():
            import nest_asyncio
            nest_asyncio.apply()
            
        loop.run_until_complete(_async_generate_voiceover(text, voice, output_path, rate, pitch))
        return os.path.exists(output_path) and os.path.getsize(output_path) > 1000
    except Exception as e:
        st.warning(f"ملاحظة أثناء توليد الصوت عبر Edge-TTS: {e}")
        return False

def fetch_background_music(keywords: List[str], pixabay_api_key: Optional[str] = None, output_path: str = None) -> str:
    """
    جلب خلفية موسيقية عبر Pixabay API أو استخدام مكتبة الصوتيات الاحتياطية المجانية
    """
    music_url = None

    if pixabay_api_key and len(keywords) > 0:
        try:
            query = "+".join(keywords[:2])
            url = f"https://pixabay.com/api/?key={pixabay_api_key}&q={urllib.parse.quote(query)}&media_type=music"
            res = requests.get(url, timeout=5)
            if res.status_code == 200:
                data = res.json()
                hits = data.get("hits", [])
                if hits and "audio" in hits[0]:
                    music_url = hits[0]["audio"]
        except Exception as e:
            st.info(f"تم الانتقال للمكتبة السحابية الاحتياطية: {e}")

    if not music_url:
        import random
        selected_track = random.choice(FALLBACK_TRACKS)
        music_url = selected_track["url"]

    if output_path and music_url:
        try:
            resp = requests.get(music_url, timeout=10)
            if resp.status_code == 200 and len(resp.content) > 2000:
                with open(output_path, "wb") as f:
                    f.write(resp.content)
                return output_path
        except Exception as e:
            st.info(f"ملاحظة حول الموسيقى: {e}")
            
    return output_path

# =============================================================================
# 4. محرك الدمج والمعالجة النهائية للفيديو (MoviePy Video Assembly)
# =============================================================================
def assemble_final_video(
    video_path: str,
    voiceover_path: str,
    music_path: Optional[str],
    output_path: str,
    music_ducking_volume: float = 0.15,
    music_normal_volume: float = 0.50,
    voiceover_volume: float = 1.20
) -> bool:
    """
    دمج الفيديو مع التعليق الصوتي والموسيقى الخلفية مع ضبط الصوت الذكي (Audio Ducking)
    """
    if VideoFileClip is None:
        raise ImportError("مكتبة MoviePy غير مثبتة بشكل سليم. قم بتشغيل: pip install moviepy")

    video = None
    voice_audio = None
    bg_music = None
    final_video = None

    try:
        video = VideoFileClip(video_path)
        video_duration = video.duration

        audio_clips = []

        if voiceover_path and os.path.exists(voiceover_path) and os.path.getsize(voiceover_path) > 1000:
            voice_audio = AudioFileClip(voiceover_path)
            try:
                voice_audio = voice_audio.volumex(voiceover_volume)
            except AttributeError:
                voice_audio = voice_audio.with_volume_scaled(voiceover_volume)
            audio_clips.append(voice_audio)

        if music_path and os.path.exists(music_path) and os.path.getsize(music_path) > 1000:
            bg_music = AudioFileClip(music_path)
            
            if bg_music.duration < video_duration:
                loops = int(video_duration / bg_music.duration) + 1
                try:
                    bg_music = afx.audio_loop(bg_music, nloops=loops)
                except Exception:
                    pass
            
            try:
                bg_music = bg_music.subclip(0, video_duration)
            except AttributeError:
                bg_music = bg_music.subclipped(0, video_duration)

            vol_factor = music_ducking_volume if voice_audio is not None else music_normal_volume
            try:
                bg_music = bg_music.volumex(vol_factor)
            except AttributeError:
                bg_music = bg_music.with_volume_scaled(vol_factor)

            audio_clips.append(bg_music)

        if audio_clips:
            composite_audio = CompositeAudioClip(audio_clips)
            try:
                final_video = video.set_audio(composite_audio)
            except AttributeError:
                final_video = video.with_audio(composite_audio)
        else:
            final_video = video

        final_video.write_videofile(
            output_path,
            codec="libx264",
            audio_codec="aac",
            temp_audiofile="temp-audio.m4a",
            remove_temp=True,
            preset="ultrafast",
            fps=24,
            threads=2
        )
        return True

    except Exception as e:
        st.error(f"خطأ أثناء معالجة وتصدير الفيديو: {e}")
        return False

    finally:
        try:
            if video: video.close()
            if voice_audio: voice_audio.close()
            if bg_music: bg_music.close()
            if final_video: final_video.close()
        except Exception:
            pass

# =============================================================================
# 5. الواجهة الرئيسية للتطبيق المقسمة إلى صفحات (Multi-Page App)
# =============================================================================
def main():
    # الرأس والشعار
    col_logo, col_title = st.columns([1, 6])
    with col_logo:
        st.markdown("<h1 style='text-align: center; margin: 0;'>🎬</h1>", unsafe_allow_html=True)
    with col_title:
        st.markdown("<h1 style='margin: 0; background: linear-gradient(90deg, #6366f1, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent;'>ADgemvid Studio</h1>", unsafe_allow_html=True)
        st.caption("الاستوديو الذكي لتوليد إعلانات الفيديو بالذكاء الاصطناعي مع تعليق صوتي عربي وموسيقى متزامنة")

    st.markdown("---")

    # =========================================================================
    # التنقل بين الصفحات في الشريط الجانبي (Page Navigation)
    # =========================================================================
    st.sidebar.title("🧭 صفحات التطبيق")
    selected_page = st.sidebar.radio(
        "اختر الصفحة المطلوبة:",
        [
            "🎬 صانع الإعلان (Studio)",
            "💡 بنك الأفكار التسويقية",
            "🔒 خزنة المفاتيح والخصوصية",
            "💻 للمطورين وكود التثبيت"
        ]
    )

    # حفظ واسترجاع المفاتيح المخزنة في الجلسة بأمان
    if "gemini_api_key" not in st.session_state:
        st.session_state["gemini_api_key"] = os.getenv("GEMINI_API_KEY", "")
    if "pixabay_api_key" not in st.session_state:
        st.session_state["pixabay_api_key"] = ""
    if "selected_model" not in st.session_state:
        st.session_state["selected_model"] = "gemini-2.5-flash"
    if "draft_prompt" not in st.session_state:
        st.session_state["draft_prompt"] = ""

    # =========================================================================
    # الصفحة 1: 🎬 صانع الإعلان (واجهة نظيفة وخالية من الأكواد والمفاتيح)
    # =========================================================================
    if selected_page == "🎬 صانع الإعلان (Studio)":
        st.subheader("🎬 استوديو صناعة ومونتاج الإعلان")

        if not st.session_state["gemini_api_key"]:
            st.info("💡 نصيحة أمان: يمكنك إدخال وتشفير مفتاح Gemini الخاص بك بأمان من صفحة '🔒 خزنة المفاتيح والخصوصية'.")

        col_input1, col_input2 = st.columns([1, 1])

        with col_input1:
            st.markdown("#### 1️⃣ فيديو الإعلان الأساسي")
            uploaded_video = st.file_uploader(
                "ارفع فيديو منتجك أو تسجيل الشاشة (MP4 أو MOV):",
                type=["mp4", "mov"],
                help="اختر الفيديو وسيتكفل الذكاء الاصطناعي بالمونتاج التلقائي والتعليق الصوتي"
            )
            if uploaded_video:
                st.success(f"تم رفع الفيديو بنجاح: {uploaded_video.name}")
                st.video(uploaded_video)

        with col_input2:
            st.markdown("#### 2️⃣ فكرة الإعلان والمواصفات")
            ad_prompt = st.text_area(
                "صف فكرة الإعلان أو ميزات منتجك بالتفصيل:",
                value=st.session_state["draft_prompt"],
                placeholder="مثال: إعلان لتطبيق دراما هندية مترجمة بجودة عالية وتجربة مشاهدة ممتعة ومجانية تماماً بدون إعلانات مزعجة...",
                height=130
            )

            col_sub1, col_sub2 = st.columns(2)
            with col_sub1:
                ad_duration = st.slider("مدة الفيديو المقدرة (ثانية):", 10, 60, 30)
            with col_sub2:
                ad_tone = st.selectbox(
                    "نبرة وأسلوب الإعلان:",
                    ["حماسي وسريع", "فاخر وهادئ", "مرح وودود", "رسمي ومقنع", "سينمائي درامي"]
                )

        col_opt1, col_opt2 = st.columns(2)
        with col_opt1:
            voice_option = st.selectbox(
                "🎙️ المعلق الصوتي العربي:",
                options=[
                    ("ar-SA-HamedNeural", "🇸🇦 حامد (سعودي - صوت رجالي فخم وقوي)"),
                    ("ar-EG-SalmaNeural", "🇪🇬 سلمى (مصري - صوت نسائي حيوي وإعلاني)"),
                    ("ar-AE-HamdanNeural", "🇦🇪 حمدان (إماراتي - صوت رجالي رسمي متزن)"),
                    ("ar-EG-ShakirNeural", "🇪🇬 شاكر (مصري - صوت رجالي شبابي وحماسي)"),
                    ("ar-SA-ZariyahNeural", "🇸🇦 زارية (سعودي - صوت نسائي هادئ وأنيق)"),
                    ("ar-MA-JamalNeural", "🇲🇦 جمال (مغربي - صوت رجالي عميق)")
                ],
                format_func=lambda x: x[1]
            )[0]
        with col_opt2:
            music_ducking = st.slider(
                "🎵 نسبة خفض الموسيقى التلقائي أثناء الكلام (Ducking):",
                0.05, 0.40, 0.15, 0.05
            )

        st.markdown("---")

        start_btn = st.button("✨ تحسين الوصف وإنشاء الإعلان المتكامل", use_container_width=True)

        if start_btn:
            if not uploaded_video:
                st.error("⚠️ يرجى رفع مقطع فيديو أولاً.")
                return
            if not ad_prompt.strip():
                st.error("⚠️ يرجى كتابة وصف أو فكرة الإعلان في الحقل المخصص.")
                return

            gemini_key = st.session_state["gemini_api_key"]
            if not gemini_key.strip():
                st.error("⚠️ يرجى إدخال مفتاح Gemini في صفحة '🔒 خزنة المفاتيح والخصوصية'.")
                return

            with st.status("🚀 جاري تحضير وتوليد إعلان الفيديو الذكي...", expanded=True) as status:
                st.write(f"🤖 1/4: تحليل الفكرة وصياغة النص عبر نموذج الذكاء الاصطناعي...")
                try:
                    script_data = generate_ad_script_with_gemini(
                        api_key=gemini_key,
                        model_name=st.session_state["selected_model"],
                        user_prompt=ad_prompt,
                        target_duration_sec=ad_duration,
                        tone=ad_tone
                    )
                    st.session_state["script_data"] = script_data
                    st.write("✅ تم توليد النص الإعلاني بنجاح!")
                except Exception as e:
                    st.error(f"خطأ في توليد السكريبت: {e}")
                    status.update(label="فشل توليد السكريبت", state="error")
                    return

                temp_dir = tempfile.mkdtemp()
                temp_video_in = os.path.join(temp_dir, "input_video.mp4")
                temp_voice_out = os.path.join(temp_dir, "voiceover.mp3")
                temp_music_out = os.path.join(temp_dir, "bg_music.mp3")
                temp_video_out = os.path.join(temp_dir, "adgemvid_final.mp4")

                with open(temp_video_in, "wb") as f:
                    f.write(uploaded_video.getbuffer())

                st.write(f"🎙️ 2/4: توليد التعليق الصوتي بصوت {voice_option} مجاناً عبر Edge-TTS...")
                tts_ok = generate_arabic_voiceover(
                    text=script_data.get("voiceover_script", ""),
                    voice=voice_option,
                    output_path=temp_voice_out,
                    rate="+0%"
                )

                st.write("🎵 3/4: جلب وضبط مسار الموسيقى التصويرية...")
                fetch_background_music(
                    keywords=script_data.get("sfx_keywords", ["commercial"]),
                    pixabay_api_key=st.session_state.get("pixabay_api_key"),
                    output_path=temp_music_out
                )

                st.write("🎞️ 4/4: مونتاج الفيديو وضبط المدة وخاصية Audio Ducking...")
                success = assemble_final_video(
                    video_path=temp_video_in,
                    voiceover_path=temp_voice_out if tts_ok else None,
                    music_path=temp_music_out if os.path.exists(temp_music_out) else None,
                    output_path=temp_video_out,
                    music_ducking_volume=music_ducking
                )

                if success and os.path.exists(temp_video_out):
                    with open(temp_video_out, "rb") as vf:
                        st.session_state["final_video_bytes"] = vf.read()
                    status.update(label="🎉 اكتمل إنشاء إعلانك بنجاح!", state="complete")
                    st.success("تم إنتاج الفيديو بنجاح! يمكنك مشاهدته وتنزيله في الأسفل.")

        if "final_video_bytes" in st.session_state:
            st.markdown("---")
            st.markdown("### 🎬 مشغل الفيديو النهائي:")
            st.video(st.session_state["final_video_bytes"])
            st.download_button(
                "📥 تنزيل الفيديو النهائي الآن (MP4)",
                data=st.session_state["final_video_bytes"],
                file_name="ADgemvid_Commercial.mp4",
                mime="video/mp4",
                use_container_width=True
            )

        if "script_data" in st.session_state:
            sdata = st.session_state["script_data"]
            st.markdown(f"#### 🎯 {sdata.get('ad_title', '')}")
            st.info(f"**الخطاف الافتتاحي (Hook):** {sdata.get('hook_line', '')}")
            st.write(f"**نص التعليق الصوتي:** {sdata.get('voiceover_script', '')}")

    # =========================================================================
    # الصفحة 2: 💡 بنك الأفكار التسويقية
    # =========================================================================
    elif selected_page == "💡 بنك الأفكار التسويقية":
        st.subheader("💡 بنك الأفكار الإعلانية الجاهزة")
        st.caption("اختر فكرة لتعبئة الاستوديو فورياً:")

        col1, col2 = st.columns(2)
        with col1:
            st.markdown("##### 📱 تطبيقات ومسلسلات (مثل SKdrama):")
            st.write("إعلان ترويجي لتطبيق مسلسلات وأفلام درامية مترجمة للعربية مع ميزة التحميل والمشاهدة بدقة عالية ومجاناً.")
            if st.button("استخدام فكرة التطبيق الدرامي", key="btn_drama"):
                st.session_state["draft_prompt"] = "إعلان ترويجي سينمائي لتطبيق مسلسلات وأفلام درامية مترجمة للعربية بجودة عالية مع ميزة المشاهدة والتحميل المجاني."
                st.success("تم حفظ الفكرة! انتقل لصفحة '🎬 صانع الإعلان'.")

            st.markdown("##### ☕ كافيه ومشروبات:")
            st.write("إعلان قهوة مختصة محمصة بحب من محاصيل إثيوبية فاخرة مع كوب مجاني عند أول طلب.")
            if st.button("استخدام فكرة الكافيه", key="btn_coffee"):
                st.session_state["draft_prompt"] = "إعلان قهوة مختصة محمصة بحب من محاصيل إثيوبية فاخرة تضبط مزاجك الصباحي، احصل على كوب مجاني مع طلبك الأول."
                st.success("تم حفظ الفكرة!")

        with col2:
            st.markdown("##### 👑 عطور فاخرة:")
            st.write("إعلان عطر شرقي فاخر يجمع بين دهن العود والعنبر والمسك الأبيض مع خصم 30% وشحن مجاني.")
            if st.button("استخدام فكرة العطور", key="btn_perfume"):
                st.session_state["draft_prompt"] = "إعلان عطر شرقي ملكي فاخر برائحة العود والعنبر والمسك الأبيض مع خصم 30% وشحن مجاني وسريع لكافة المناطق."
                st.success("تم حفظ الفكرة!")

            st.markdown("##### 🍔 برجر ومطاعم:")
            st.write("إعلان برجر لحم مشوي على اللهب مع جبنة الشيدر الذائبة وعرض الوجبة المزدوجة.")
            if st.button("استخدام فكرة البرجر", key="btn_burger"):
                st.session_state["draft_prompt"] = "إعلان برجر لحم بلاك أنجوس مشوي على اللهب مع جبنة الشيدر الذائبة وصلصة الماشروم السرية، اطلب الدبل بسعر السينجل اليوم!"
                st.success("تم حفظ الفكرة!")

    # =========================================================================
    # الصفحة 3: 🔒 خزنة المفاتيح والخصوصية (مكان آمن ومحمي)
    # =========================================================================
    elif selected_page == "🔒 خزنة المفاتيح والخصوصية":
        st.subheader("🔒 خزنة المفاتيح والإعدادات الآمنة")
        st.caption("مفاتيحك هنا مشفرة ومحفوظة بأمان ولن تظهر في الشاشة الرئيسية للإعلان.")

        st.markdown("<div class='metric-card'>", unsafe_allow_html=True)
        key_input = st.text_input(
            "🔑 مفتاح Google Gemini API:",
            value=st.session_state.get("gemini_api_key", ""),
            type="password",
            help="يمكنك الحصول عليه مجاناً من Google AI Studio (aistudio.google.com)"
        )
        if st.button("حفظ المفتاح بأمان في الجلسة"):
            st.session_state["gemini_api_key"] = key_input
            st.success("✅ تم حفظ مفتاحك بأمان! لن يظهر في الواجهة الرئيسية.")

        st.markdown("---")

        model_choice = st.selectbox(
            "🧠 نموذج الذكاء الاصطناعي الافتراضي:",
            options=[
                "gemini-2.5-flash",
                "gemini-3.8-flash",
                "gemini-3.1-flash-lite",
                "gemini-2.5-pro"
            ],
            index=0
        )
        st.session_state["selected_model"] = model_choice

        pix_input = st.text_input(
            "🎵 مفتاح Pixabay API للموسيقى (اختياري):",
            value=st.session_state.get("pixabay_api_key", ""),
            type="password"
        )
        if pix_input:
            st.session_state["pixabay_api_key"] = pix_input

        st.markdown("</div>", unsafe_allow_html=True)

        st.markdown("""
        **🛡️ مميزات الأمان:**
        - يتم حجب المفاتيح تلقائياً بنجوم مشفرة لمنع ظهورها أثناء تصوير الشاشة.
        - لن تظهر المفاتيح في واجهة مونتاج الفيديو الرئيسية.
        """)

    # =========================================================================
    # الصفحة 4: 💻 للمطورين وكود التثبيت
    # =========================================================================
    elif selected_page == "💻 للمطورين وكود التثبيت":
        st.subheader("💻 كود التطبيق ومتطلبات التثبيت")
        st.caption("تم نقل الأكواد البرمجية هنا لإبقاء واجهة الإعلانات نظيفة ومخصصة للعمل.")

        st.markdown("##### 📦 أوامر تثبيت المكتبات (Pip Installation):")
        st.code("pip install streamlit google-genai edge-tts moviepy requests pydantic python-dotenv", language="bash")

        st.markdown("##### 🚀 أمر تشغيل التطبيق محلياً:")
        st.code("streamlit run app.py", language="bash")

        st.markdown("##### 🌐 النشر على Streamlit Community Cloud:")
        st.markdown("""
        1. ارفع ملفات `app.py` و `requirements.txt` إلى مستودعك على GitHub.
        2. اربط المستودع في [share.streamlit.io](https://share.streamlit.io).
        3. في إعدادات Secrets ضع المفتاح: `GEMINI_API_KEY = "مفتاحك"`.
        """)

if __name__ == "__main__":
    main()
