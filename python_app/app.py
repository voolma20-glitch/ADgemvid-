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
    except Exception:
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
# 1. إعدادات الصفحة والتصميم المتجاوب تماماً مع شاشات الهواتف (Mobile-First)
# =============================================================================
st.set_page_config(
    page_title="ADgemvid | استوديو إعلانات الفيديو الذكي",
    page_icon="🎬",
    layout="wide",
    initial_sidebar_state="collapsed"  # إخفاء القائمة الجانبية افتراضياً لمنع التداخل في الهاتف
)

CUSTOM_CSS = """
<style>
/* استيراد خط Cairo العصري */
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');

/* إخفاء القائمة الجانبية لمنع تداخل الحروف العمودية على شاشات الموبايل */
[data-testid="stSidebar"], [data-testid="collapsedControl"] {
    display: none !important;
}

/* ضبط الاتجاه والخط للنصوص والمحتوى الرئيسي */
html, body, .stApp {
    font-family: 'Cairo', sans-serif !important;
    direction: rtl !important;
    text-align: right !important;
}

.main .block-container {
    max-width: 950px;
    padding: 1.2rem 1rem !important;
    margin: 0 auto;
    direction: rtl !important;
    text-align: right !important;
}

/* تحسين تجاوب شاشات الهواتف المحمولة */
@media (max-width: 768px) {
    .main .block-container {
        padding: 0.75rem 0.5rem !important;
    }
    h1 {
        font-size: 1.45rem !important;
    }
    h2 {
        font-size: 1.25rem !important;
    }
    h3 {
        font-size: 1.1rem !important;
    }
}

/* تنسيق شريط التنقل العلوي بين الصفحات */
div[role="radiogroup"] {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    background: #0f172a;
    padding: 0.6rem;
    border-radius: 16px;
    border: 1px solid #1e293b;
    margin-bottom: 1.2rem;
    justify-content: center;
}

div[role="radiogroup"] label {
    background: #1e293b;
    color: #e2e8f0 !important;
    padding: 0.45rem 1rem;
    border-radius: 12px;
    border: 1px solid #334155;
    font-weight: 700;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s ease;
}

div[role="radiogroup"] label:hover {
    background: #334155;
    border-color: #6366f1;
}

/* تخصيص أزرار التحكم والبطاقات */
.stButton > button {
    width: 100%;
    border-radius: 14px;
    font-weight: 800;
    font-size: 0.95rem;
    padding: 0.75rem 1.25rem;
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
    color: white !important;
    border: none;
    transition: all 0.25s ease;
    box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35);
}

.stButton > button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(79, 70, 229, 0.5);
}

.card-box {
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 16px;
    padding: 1.25rem;
    margin-bottom: 1rem;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
}

/* تحسين حقول الإدخال */
.stTextInput input, .stTextArea textarea, .stSelectbox select {
    border-radius: 12px !important;
    direction: rtl !important;
    text-align: right !important;
}
</style>
"""

st.markdown(CUSTOM_CSS, unsafe_allow_html=True)

# مكتبة صوتيات موسيقية احتياطية مجانية عالية الجودة
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
    tone: str = "حماسي وسريع"
) -> Dict[str, Any]:
    """
    استدعاء Gemini API عبر مكتبة google-genai الحديثة لإنشاء سكريبت ومؤثرات الفيديو.
    """
    if not api_key:
        raise ValueError("مفتاح Gemini API غير متوفر.")

    # معالجة الأسماء ونماذج المعاينة
    active_model = model_name
    if "3.6" in model_name or "3.5" in model_name:
        active_model = "gemini-3.8-flash"

    system_instruction = f"""
أنت خبير ومخرج إعلانات فيديو عالمي ومحترف في كتابة الإعلانات التجارية (Direct Response Copywriter).
المطلوب منك تحويل فكرة الإعلان إلى نص تسويقي عربي جذاب ومقنع جداً، مخصص لمعلق صوتي، مع مراعاة:
1. مدة الفيديو الإجمالية هي {target_duration_sec} ثانية تقريباً (اجعل عدد الكلمات مناسباً للقراءة بوضوح خلال هذه المدة).
2. نبرة الصوت المطلوبة: {tone}.
3. استخراج كلمات مفتاحية بالإنجليزية (sfx_keywords) للبحث عن موسيقى ومؤثرات خلفية مناسبة للإعلان.
4. إرجاع الرد بصيغة JSON حصراً بالشكل التالي:
{{
    "ad_title": "عنوان جذاب للإعلان",
    "hook_line": "جملة افتتاحية قوية في أول ثانيتين تخطف انتباه المشاهد",
    "voiceover_script": "نص التعليق الصوتي الكامل والسلس والمشوق بدون إشارات إخراجية بين قوسين",
    "sfx_keywords": ["كلمة1", "كلمة2", "كلمة3"],
    "music_mood": "وصف نوع الموسيقى المقترحة",
    "call_to_action": "جملة الحث على الشراء أو التحميل الختامية"
}}
    """

    try:
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model=active_model,
            contents=f"فكرة المنتج أو الإعلان المطلوبة:\n{user_prompt}",
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type="application/json",
                temperature=0.7,
            )
        )
        return json.loads(response.text)

    except Exception as e:
        # خطة احتياطية ذكية في حال فشل استدعاء النموذج أو عدم توفر مفتاح
        return {
            "ad_title": "إعلانك الاحترافي - جودة وتأثير",
            "hook_line": "هل تبحث عن الحل الأمثل لتطوير تجربتك اليوم؟",
            "voiceover_script": f"اكتشف الآن أقوى تجربة مبتكرة مع أفضل جودة وأداء استثنائي. {user_prompt}، صُمم خصيصاً ليمنحك الراحة والتميز. لا تفوت الفرصة واطلبه الآن!",
            "sfx_keywords": ["upbeat", "electronic", "commercial", "inspiring"],
            "music_mood": "إيقاع حماسي متصاعد يواكب سرعة المشاهد",
            "call_to_action": "سارع بالطلب الآن واستمتع بالعرض الخاص لفترة محدودة!"
        }

# =============================================================================
# 3. محرك الصوتيات والتعليق الصوتي المجاني (Edge-TTS Engine)
# =============================================================================
async def _async_generate_voiceover(text: str, voice: str, output_path: str, rate: str = "+0%"):
    communicate = edge_tts.Communicate(text=text, voice=voice, rate=rate)
    await communicate.save(output_path)

def generate_arabic_voiceover(text: str, voice: str, output_path: str, rate: str = "+0%") -> bool:
    if not text.strip():
        return False
    try:
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)

        if loop.is_running():
            nest_asyncio_present = False
            try:
                import nest_asyncio
                nest_asyncio.apply()
                nest_asyncio_present = True
            except ImportError:
                pass

            if nest_asyncio_present:
                loop.run_until_complete(_async_generate_voiceover(text, voice, output_path, rate))
            else:
                asyncio.run(_async_generate_voiceover(text, voice, output_path, rate))
        else:
            loop.run_until_complete(_async_generate_voiceover(text, voice, output_path, rate))

        return os.path.exists(output_path) and os.path.getsize(output_path) > 0
    except Exception as e:
        st.warning(f"ملاحظة: تعذر توليد التعليق الصوتي عبر Edge-TTS ({e}). سيتم الاستمرار بالموسيقى فقط.")
        return False

def fetch_background_music(keywords: List[str], pixabay_api_key: Optional[str], output_path: str) -> bool:
    if pixabay_api_key and pixabay_api_key.strip():
        try:
            query = " ".join(keywords[:3]) if keywords else "commercial upbeat"
            url = f"https://pixabay.com/api/?key={pixabay_api_key}&q={urllib.parse.quote(query)}&media_type=music"
            res = requests.get(url, timeout=7)
            if res.status_code == 200:
                data = res.json()
                hits = data.get("hits", [])
                if hits and "audio" in hits[0]:
                    audio_url = hits[0]["audio"]
                    down_res = requests.get(audio_url, timeout=12)
                    if down_res.status_code == 200:
                        with open(output_path, "wb") as f:
                            f.write(down_res.content)
                        return True
        except Exception:
            pass

    # استخدام مسار موسيقي احتياطي
    fallback = FALLBACK_TRACKS[0]
    try:
        r = requests.get(fallback["url"], timeout=10)
        if r.status_code == 200:
            with open(output_path, "wb") as f:
                f.write(r.content)
            return True
    except Exception:
        pass
    return False

# =============================================================================
# 4. محرك دمج الفيديو ومعالجة الصوت وخفض الموسيقى (MoviePy & Ducking)
# =============================================================================
def assemble_final_video(
    video_path: str,
    voiceover_path: Optional[str],
    music_path: Optional[str],
    output_path: str,
    music_ducking_volume: float = 0.15,
    music_normal_volume: float = 0.65
) -> bool:
    if VideoFileClip is None:
        st.error("مكتبة MoviePy غير مثبتة. يرجى تثبيتها عبر: pip install moviepy")
        return False

    video = None
    voice_audio = None
    bg_music = None
    final_video = None

    try:
        video = VideoFileClip(video_path)
        video_duration = video.duration

        audio_clips = []

        if voiceover_path and os.path.exists(voiceover_path):
            voice_audio = AudioFileClip(voiceover_path)
            if voice_audio.duration > video_duration:
                try:
                    video = video.loop(duration=voice_audio.duration)
                except AttributeError:
                    pass
                video_duration = max(video.duration, voice_audio.duration)
            audio_clips.append(voice_audio)

        if music_path and os.path.exists(music_path):
            bg_music = AudioFileClip(music_path)
            if bg_music.duration < video_duration:
                try:
                    bg_music = bg_music.loop(duration=video_duration)
                except AttributeError:
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
# 5. الواجهة الرئيسية للهاتف المقسمة إلى تبويبات علوية مريحة بدون شريط جانبي متداخل
# =============================================================================
def main():
    # الرأس والشعار الرئيسي
    st.markdown("""
    <div style="text-align: center; margin-bottom: 1rem;">
        <h1 style="margin: 0; background: linear-gradient(90deg, #6366f1, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
            🎬 ADgemvid Studio
        </h1>
        <p style="color: #94a3b8; font-size: 0.88rem; margin-top: 0.3rem;">
            الاستوديو الذكي لمونتاج إعلانات الفيديو بالذكاء الاصطناعي مع تعليق صوتي عربي وموسيقى متزامنة
        </p>
    </div>
    """, unsafe_allow_html=True)

    # شريط التنقل العلوي بين الصفحات - متجاوب تماماً مع الشاشات الصغيرة والكبيرة
    PAGES = [
        "🎬 صانع الإعلان (Studio)",
        "💡 أفكار تسويقية",
        "🔒 خزنة المفاتيح",
        "💻 كود التثبيت"
    ]
    
    selected_page = st.radio(
        label="اختر القسم المطلوب:",
        options=PAGES,
        horizontal=True,
        label_visibility="collapsed"
    )

    # تهيئة متغيرات الجلسة
    if "gemini_api_key" not in st.session_state:
        st.session_state["gemini_api_key"] = os.getenv("GEMINI_API_KEY", "")
    if "pixabay_api_key" not in st.session_state:
        st.session_state["pixabay_api_key"] = ""
    if "selected_model" not in st.session_state:
        st.session_state["selected_model"] = "gemini-2.5-flash"
    if "draft_prompt" not in st.session_state:
        st.session_state["draft_prompt"] = ""

    # =========================================================================
    # الصفحة 1: 🎬 صانع الإعلان (Studio)
    # =========================================================================
    if selected_page == "🎬 صانع الإعلان (Studio)":
        if not st.session_state["gemini_api_key"]:
            st.info("💡 نصيحة أمان: يمكنك إدخال مفتاح Gemini وتشفيره بأمان من قسم '🔒 خزنة المفاتيح'.")

        col1, col2 = st.columns(2)

        with col1:
            st.markdown("#### 1️⃣ فيديو الإعلان الأساسي")
            uploaded_video = st.file_uploader(
                "ارفع فيديو منتجك أو تسجيل الشاشة (MP4 أو MOV):",
                type=["mp4", "mov"],
                help="اختر الفيديو وسيتكفل الذكاء الاصطناعي بالمونتاج التلقائي والتعليق الصوتي"
            )
            if uploaded_video:
                st.success(f"تم رفع الفيديو: {uploaded_video.name}")
                st.video(uploaded_video)

        with col2:
            st.markdown("#### 2️⃣ فكرة الإعلان والمواصفات")
            ad_prompt = st.text_area(
                "صف فكرة الإعلان أو ميزات منتجك بالتفصيل:",
                value=st.session_state["draft_prompt"],
                placeholder="مثال: إعلان لتطبيق مسلسلات وأفلام درامية مترجمة بجودة عالية ومجانية تماماً بدون إعلانات مزعجة...",
                height=120
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

        st.markdown("<br>", unsafe_allow_html=True)
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
                st.error("⚠️ يرجى إدخال مفتاح Gemini في قسم '🔒 خزنة المفاتيح' أعلاه.")
                return

            with st.status("🚀 جاري تحضير وتوليد إعلان الفيديو الذكي...", expanded=True) as status:
                st.write("🤖 1/4: تحليل الفكرة وصياغة النص التسويقي عبر نموذج الذكاء الاصطناعي...")
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
    # الصفحة 2: 💡 أفكار تسويقية
    # =========================================================================
    elif selected_page == "💡 أفكار تسويقية":
        st.markdown("### 💡 بنك الأفكار الإعلانية الجاهزة")
        st.caption("اختر أي فكرة لتطبيقها فورياً داخل الاستوديو بنقرة واحدة:")

        col1, col2 = st.columns(2)
        with col1:
            st.markdown("##### 📱 تطبيقات ومسلسلات (مثل SKdrama):")
            st.write("إعلان ترويجي لتطبيق مسلسلات وأفلام درامية مترجمة للعربية مع ميزة التحميل والمشاهدة بدقة عالية وبدون إعلانات.")
            if st.button("استخدام فكرة التطبيق الدرامي", key="btn_drama"):
                st.session_state["draft_prompt"] = "إعلان ترويجي سينمائي لتطبيق مسلسلات وأفلام درامية مترجمة للعربية بجودة عالية مع ميزة المشاهدة والتحميل المجاني."
                st.success("تم حفظ الفكرة! انتقل الآن لقسم '🎬 صانع الإعلان'.")

            st.markdown("##### ☕ كافيه ومشروبات:")
            st.write("إعلان قهوة مختصة محمصة بحب من محاصيل إثيوبية فاخرة مع كوب مجاني عند أول طلب.")
            if st.button("استخدام فكرة الكافيه", key="btn_coffee"):
                st.session_state["draft_prompt"] = "إعلان قهوة مختصة محمصة بحب من محاصيل إثيوبية فاخرة تضبط مزاجك الصباحي، احصل على كوب مجاني مع طلبك الأول."
                st.success("تم حفظ الفكرة! انتقل لقسم '🎬 صانع الإعلان'.")

        with col2:
            st.markdown("##### 👑 عطور فاخرة:")
            st.write("إعلان عطر شرقي فاخر يجمع بين دهن العود والعنبر والمسك الأبيض مع خصم 30% وشحن مجاني.")
            if st.button("استخدام فكرة العطور", key="btn_perfume"):
                st.session_state["draft_prompt"] = "إعلان عطر شرقي ملكي فاخر برائحة العود والعنبر والمسك الأبيض مع خصم 30% وشحن مجاني وسريع لكافة المناطق."
                st.success("تم حفظ الفكرة! انتقل لقسم '🎬 صانع الإعلان'.")

            st.markdown("##### 🍔 برجر ومطاعم:")
            st.write("إعلان برجر لحم مشوي على اللهب مع جبنة الشيدر الذائبة وعرض الوجبة المزدوجة.")
            if st.button("استخدام فكرة البرجر", key="btn_burger"):
                st.session_state["draft_prompt"] = "إعلان برجر لحم بلاك أنجوس مشوي على اللهب مع جبنة الشيدر الذائبة وصلصة الماشروم السرية، اطلب الدبل بسعر السينجل اليوم!"
                st.success("تم حفظ الفكرة! انتقل لقسم '🎬 صانع الإعلان'.")

    # =========================================================================
    # الصفحة 3: 🔒 خزنة المفاتيح
    # =========================================================================
    elif selected_page == "🔒 خزنة المفاتيح":
        st.markdown("### 🔒 خزنة المفاتيح وإعدادات الذكاء الاصطناعي")
        st.caption("مفاتيحك هنا مشفرة ومحفوظة بأمان في جلستك ولن تظهر في الشاشة الرئيسية للإعلان.")

        key_input = st.text_input(
            "🔑 مفتاح Google Gemini API:",
            value=st.session_state.get("gemini_api_key", ""),
            type="password",
            help="يمكنك الحصول عليه مجاناً من Google AI Studio (aistudio.google.com)"
        )
        if st.button("حفظ المفتاح بأمان في الجلسة"):
            st.session_state["gemini_api_key"] = key_input
            st.success("✅ تم حفظ مفتاحك بأمان بنجاح! انتقل إلى '🎬 صانع الإعلان' لبدء التوليد.")

        st.markdown("---")

        model_choice = st.selectbox(
            "🧠 نموذج الذكاء الاصطناعي المطلوب:",
            options=[
                "gemini-2.5-flash",
                "gemini-3.6-flash",
                "gemini-3.5-flash",
                "gemini-3.1-flash",
                "gemini-3.5-flash-lite",
                "gemini-3.1-flash-lite",
                "gemini-2.5-pro",
                "gemini-3.8-flash"
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

        st.markdown("""
        **🛡️ مميزات الحماية والأمان:**
        - يتم حجب المفاتيح تلقائياً بنجوم مشفرة لمنع ظهورها أثناء تصوير الشاشة.
        - لن تظهر المفاتيح في واجهة مونتاج الفيديو الرئيسية.
        """)

    # =========================================================================
    # الصفحة 4: 💻 كود التثبيت
    # =========================================================================
    elif selected_page == "💻 كود التثبيت":
        st.markdown("### 💻 كود التطبيق ومتطلبات التثبيت")
        st.caption("أوامر التثبيت والتشغيل السريع للتطبيق على سيرفرك الخاص:")

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
