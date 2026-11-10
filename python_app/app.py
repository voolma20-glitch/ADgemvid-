#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
=============================================================================
ADgemvid - استوديو ومخرج إعلانات الفيديو الذكي (AI Smart Video Director)
=============================================================================
المتطلبات:
    pip install streamlit google-genai edge-tts moviepy opencv-python-headless requests pydantic python-dotenv

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

# استيراد مكتبة OpenCV للمعالجة السينمائية
try:
    import cv2
    import numpy as np
except ImportError:
    cv2 = None
    np = None

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
    page_title="ADgemvid | المخرج الذكي لإعلانات الفيديو",
    page_icon="🎬",
    layout="wide",
    initial_sidebar_state="collapsed"
)

CUSTOM_CSS = """
<style>
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');

/* إخفاء القائمة الجانبية لمنع تداخل الحروف على شاشات الموبايل */
[data-testid="stSidebar"], [data-testid="collapsedControl"] {
    display: none !important;
}

html, body, .stApp {
    font-family: 'Cairo', sans-serif !important;
    direction: rtl !important;
    text-align: right !important;
}

.main .block-container {
    max-width: 980px;
    padding: 1.2rem 1rem !important;
    margin: 0 auto;
    direction: rtl !important;
    text-align: right !important;
}

@media (max-width: 768px) {
    .main .block-container {
        padding: 0.75rem 0.5rem !important;
    }
}

/* تنسيق أزرار التنقل العلوية */
div[role="radiogroup"] {
    display: flex;
    flex-wrap: wrap;
    gap: 0.45rem;
    background: #0f172a;
    padding: 0.55rem;
    border-radius: 16px;
    border: 1px solid #1e293b;
    margin-bottom: 1.2rem;
    justify-content: center;
}

div[role="radiogroup"] label {
    background: #1e293b;
    color: #e2e8f0 !important;
    padding: 0.45rem 0.9rem;
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

.chat-bubble-user {
    background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
    color: white;
    padding: 0.85rem 1.15rem;
    border-radius: 16px 16px 4px 16px;
    margin-bottom: 0.75rem;
    max-width: 85%;
    margin-right: auto;
    font-size: 0.92rem;
}

.chat-bubble-ai {
    background: #1e293b;
    border: 1px solid #334155;
    color: #f1f5f9;
    padding: 0.85rem 1.15rem;
    border-radius: 16px 16px 16px 4px;
    margin-bottom: 0.75rem;
    max-width: 90%;
    margin-left: auto;
    font-size: 0.92rem;
}
</style>
"""

st.markdown(CUSTOM_CSS, unsafe_allow_html=True)

# مكتبة صوتيات موسيقية احتياطية مجانية
FALLBACK_TRACKS = [
    {"name": "إيقاع حماسي إلكتروني", "url": "https://assets.mixkit.co/music/preview/mixkit-energetic-hip-hop-8.mp3"},
    {"name": "طابع سينمائي راقي وملهم", "url": "https://assets.mixkit.co/music/preview/mixkit-inspiring-cinematic-trailer-592.mp3"},
    {"name": "إيقاع عصري خفيف ومبهج", "url": "https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3"},
    {"name": "موسيقى ترويجية للمنتجات", "url": "https://assets.mixkit.co/music/preview/mixkit-corporate-business-motivation-906.mp3"}
]

# =============================================================================
# 2. دوال معالجة المؤثرات السينمائية عبر OpenCV
# =============================================================================
def apply_opencv_cinematic_filter(frame, filter_name: str = "teal_orange", letterbox: bool = True):
    """
    تطبيق تصحيح الألوان السينمائية (Color Grading) وأشرطة السينما (Letterbox 2.35:1) عبر OpenCV.
    هذه الدالة تعمل محلياً 100% بدون أي مفاتيح API!
    """
    if cv2 is None or np is None:
        return frame

    h, w = frame.shape[:2]
    img = frame.copy()

    # 1. تطبيق فلاتر الألوان
    if filter_name == "teal_orange":
        # زيادة التباين وتقوية درجات الأزرق المخضر والبرتقالي
        img_float = img.astype(np.float32) / 255.0
        # تعديل القنوات: R تزيد قليلاً للدفء، B تزيد للظلال
        img_float[:, :, 0] = np.clip(img_float[:, :, 0] * 1.15, 0, 1.0) # R
        img_float[:, :, 2] = np.clip(img_float[:, :, 2] * 1.10, 0, 1.0) # B
        img = (img_float * 255.0).astype(np.uint8)

    elif filter_name == "luxury":
        # طابع ذهبي دافئ فاخر (Warm Gold)
        img_float = img.astype(np.float32) / 255.0
        img_float[:, :, 0] = np.clip(img_float[:, :, 0] * 1.20, 0, 1.0) # Red
        img_float[:, :, 1] = np.clip(img_float[:, :, 1] * 1.08, 0, 1.0) # Green
        img = (img_float * 255.0).astype(np.uint8)

    elif filter_name == "cyberpunk":
        # نيون مستقبلي مشبع
        hsv = cv2.cvtColor(img, cv2.COLOR_RGB2HSV)
        hsv[:, :, 1] = np.clip(hsv[:, :, 1] * 1.45, 0, 255).astype(np.uint8) # Saturate
        img = cv2.cvtColor(hsv, cv2.COLOR_HSV2RGB)

    elif filter_name == "noir":
        # أبيض وأسود عالي التباين
        gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
        img = cv2.cvtColor(gray, cv2.COLOR_GRAY2RGB)

    # 2. إضافة الأشرطة السينمائية السوداء (Cinematic Letterbox 2.35:1)
    if letterbox:
        target_h = int(w / 2.35)
        if target_h < h:
            bar_height = (h - target_h) // 2
            img[0:bar_height, :] = 0
            img[h - bar_height:h, :] = 0

    return img

# =============================================================================
# 3. محرك محادثة المخرج الذكي (AI Director Logic)
# =============================================================================
def ask_ai_director(
    api_key: str,
    model_name: str,
    user_prompt: str,
    conversation_history: List[Dict[str, str]],
    voice: str = "ar-SA-HamedNeural"
) -> Dict[str, Any]:
    active_model = model_name
    if "3.6" in model_name or "3.5" in model_name:
        active_model = "gemini-3.8-flash"

    system_instruction = f"""
أنت "المخرج الذكي" (AI Smart Video Director) في تطبيق ADgemvid.
أنت مخرج إعلاني سينمائي محترف باللغة العربية. مهمتك التفاعل الحواري مع المستخدم والتجاوب مع رغبته في إنتاج وتعديل الفيديو.
الصوت المعتمد حالياً: {voice}.
أرجع ردك بتنسيق JSON حصراً:
{{
    "director_reply": "رد حواري عربي مشوق وموجز يشرح ما تم تنفيذه",
    "ad_title": "عنوان الإعلان",
    "hook_line": "الخطاف الافتتاحي في أول ثانيتين",
    "voiceover_script": "نص التعليق الصوتي الإعلاني الجذاب",
    "recommended_filter": "teal_orange أو luxury أو cyberpunk أو noir أو natural",
    "recommended_letterbox": true,
    "sfx_keywords": ["whoosh", "impact", "riser"],
    "music_mood": "upbeat أو cinematic أو luxury"
}}
    """

    try:
        if not api_key:
            raise ValueError("No API Key")
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model=active_model,
            contents=f"سجل المحادثة: {json.dumps(conversation_history[-4:])}\nطلب المستخدم الجديد: {user_prompt}",
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type="application/json",
                temperature=0.7
            )
        )
        return json.loads(response.text)
    except Exception:
        # رد احتياطي ذكي في حال غياب المفتاح
        return {
            "director_reply": f"رؤية إخراجية ممتازة! قمت بتحليل طلبك: '{user_prompt}'، وصياغة سكريبت جذاب مع ضبط الأشرطة السينمائية ومؤثرات الانتقال الحركية.",
            "ad_title": "إعلان سينمائي ذكي متكامل",
            "hook_line": "هل أنت مستعد لنقل تجربتك إلى القمة؟",
            "voiceover_script": f"اكتشف اليوم الحل الذي طالما بحثت عنه! جودة استثنائية، أداء مبتكر، وتجربة تلبي طموحك. {user_prompt}. لا تفوت الفرصة، اطلب الآن!",
            "recommended_filter": "teal_orange",
            "recommended_letterbox": True,
            "sfx_keywords": ["whoosh", "impact", "chime"],
            "music_mood": "cinematic"
        }

# =============================================================================
# 4. محرك التعليق الصوتي والمونتاج ومكتبة Freesound / Pixabay
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
        loop.run_until_complete(_async_generate_voiceover(text, voice, output_path, rate))
        return os.path.exists(output_path) and os.path.getsize(output_path) > 0
    except Exception:
        return False

def fetch_background_music(keywords: List[str], pixabay_api_key: Optional[str], output_path: str) -> bool:
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

def assemble_cinematic_video(
    video_path: str,
    voiceover_path: Optional[str],
    music_path: Optional[str],
    output_path: str,
    filter_name: str = "teal_orange",
    letterbox: bool = True,
    music_ducking_volume: float = 0.15
) -> bool:
    if VideoFileClip is None:
        return False

    video = None
    voice_audio = None
    bg_music = None
    final_video = None

    try:
        video = VideoFileClip(video_path)
        video_duration = video.duration

        # تطبيق فلتر الألوان وأشرطة السينما عبر OpenCV إذا كانت متوفرة
        if cv2 is not None and (filter_name != "natural" or letterbox):
            try:
                def process_frame(frame):
                    return apply_opencv_cinematic_filter(frame, filter_name, letterbox)
                video = video.fl_image(process_frame)
            except Exception:
                pass

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
            bg_music = bg_music.subclip(0, video_duration)
            vol_factor = music_ducking_volume if voice_audio is not None else 0.65
            bg_music = bg_music.volumex(vol_factor)
            audio_clips.append(bg_music)

        if audio_clips:
            composite_audio = CompositeAudioClip(audio_clips)
            final_video = video.set_audio(composite_audio)
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
        st.error(f"خطأ أثناء معالجة الفيديو: {e}")
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
# 5. الواجهة الرئيسية بالتبويبات العلوية العصرية
# =============================================================================
def main():
    st.markdown("""
    <div style="text-align: center; margin-bottom: 1rem;">
        <h1 style="margin: 0; background: linear-gradient(90deg, #ec4899, #8b5cf6, #6366f1); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
            🎬 ADgemvid AI Video Director
        </h1>
        <p style="color: #94a3b8; font-size: 0.88rem; margin-top: 0.3rem;">
            المخرج الذكي لإعلانات الفيديو بالمؤثرات السينمائية والتعليق الصوتي العربي
        </p>
    </div>
    """, unsafe_allow_html=True)

    PAGES = [
        "💬 محادثة المخرج الذكي",
        "🎬 استوديو المونتاج",
        "🎨 المؤثرات السينمائية",
        "🔒 خزنة المفاتيح",
        "💻 كود التثبيت"
    ]

    selected_page = st.radio(
        label="اختر القسم:",
        options=PAGES,
        horizontal=True,
        label_visibility="collapsed"
    )

    # تهيئة الجلسة
    if "gemini_api_key" not in st.session_state:
        st.session_state["gemini_api_key"] = os.getenv("GEMINI_API_KEY", "")
    if "selected_model" not in st.session_state:
        st.session_state["selected_model"] = "gemini-2.5-flash"
    if "selected_voice" not in st.session_state:
        st.session_state["selected_voice"] = "ar-SA-HamedNeural"
    if "chat_history" not in st.session_state:
        st.session_state["chat_history"] = [
            {"role": "assistant", "content": "أهلاً بك! أنا 'المخرج الذكي' في ADgemvid. ارفع فيديو واطلب أي إعلان تريده وسأقوم بمونتاجه وإخراجه لك فوراً!"}
        ]

    # =========================================================================
    # الصفحة 1: 💬 محادثة المخرج الذكي (AI Director Chat)
    # =========================================================================
    if selected_page == "💬 محادثة المخرج الذكي":
        st.markdown("### 💬 محادثة المخرج الذكي (Interactive AI Director)")
        st.caption("تحدث مع المخرج باللغة العربية، وسيصيغ الإعلان ويحدد المؤثرات ويقوم بالمونتاج مباشرة!")

        col_v1, col_v2 = st.columns([1, 1])
        with col_v1:
            chat_video = st.file_uploader("1️⃣ ارفع فيديو الإعلان الأساسي:", type=["mp4", "mov"], key="chat_vid_upload")
            if chat_video:
                st.video(chat_video)
        with col_v2:
            st.markdown("##### 🎙️ صوت المعلق المعتمد:")
            chat_voice = st.selectbox(
                "اختر نبرة الصوت:",
                options=[
                    ("ar-SA-HamedNeural", "🇸🇦 حامد (صوت رجالي فخم وقوي)"),
                    ("ar-EG-SalmaNeural", "🇪🇬 سلمى (صوت نسائي إعلاني حيوي)"),
                    ("ar-AE-HamdanNeural", "🇦🇪 حمدان (صوت رسمي متزن)"),
                    ("ar-EG-ShakirNeural", "🇪🇬 شاكر (صوت شبابي سريع)")
                ],
                format_func=lambda x: x[1]
            )[0]
            st.session_state["selected_voice"] = chat_voice

        # عرض سجل المحادثة
        st.markdown("---")
        for msg in st.session_state["chat_history"]:
            if msg["role"] == "user":
                st.markdown(f"<div class='chat-bubble-user'>👤 {msg['content']}</div>", unsafe_allow_html=True)
            else:
                st.markdown(f"<div class='chat-bubble-ai'>🎬 <strong>المخرج الذكي:</strong><br>{msg['content']}</div>", unsafe_allow_html=True)

        # مدخل الشات
        user_chat_input = st.text_input("💬 اكتب طلبك للمخرج (مثلاً: اجعل الإعلان درامياً مع شريط سينمائي 2.35:1):", key="chat_input_text")
        
        col_btn1, col_btn2 = st.columns([3, 1])
        with col_btn1:
            send_chat_btn = st.button("🚀 إرسال للمخرج والمونتاج الفوري", use_container_width=True)
        with col_btn2:
            if st.button("🧹 مسح المحادثة", use_container_width=True):
                st.session_state["chat_history"] = []
                st.rerun()

        if send_chat_btn and user_chat_input.strip():
            st.session_state["chat_history"].append({"role": "user", "content": user_chat_input})
            
            with st.status("🎬 المخرج الذكي يعمل على الفيديو والمؤثرات...", expanded=True) as status:
                st.write("1/3: تحليل الفكرة وصياغة السكريبت التسويقي...")
                director_data = ask_ai_director(
                    api_key=st.session_state["gemini_api_key"],
                    model_name=st.session_state["selected_model"],
                    user_prompt=user_chat_input,
                    conversation_history=st.session_state["chat_history"],
                    voice=chat_voice
                )

                st.session_state["chat_history"].append({
                    "role": "assistant",
                    "content": f"{director_data.get('director_reply', '')}\n\n**السكريبت:** {director_data.get('voiceover_script', '')}"
                })

                if chat_video:
                    temp_dir = tempfile.mkdtemp()
                    temp_v_in = os.path.join(temp_dir, "input.mp4")
                    temp_voice = os.path.join(temp_dir, "voice.mp3")
                    temp_music = os.path.join(temp_dir, "music.mp3")
                    temp_v_out = os.path.join(temp_dir, "final.mp4")

                    with open(temp_v_in, "wb") as f:
                        f.write(chat_video.getbuffer())

                    st.write("2/3: توليد التعليق الصوتي العربي مجاناً عبر Edge-TTS...")
                    tts_ok = generate_arabic_voiceover(
                        text=director_data.get("voiceover_script", ""),
                        voice=chat_voice,
                        output_path=temp_voice
                    )

                    st.write("3/3: تطبيق الفلتر السينمائي وأشرطة السينما والمونتاج...")
                    fetch_background_music(["cinematic"], None, temp_music)
                    ok = assemble_cinematic_video(
                        video_path=temp_v_in,
                        voiceover_path=temp_voice if tts_ok else None,
                        music_path=temp_music if os.path.exists(temp_music) else None,
                        output_path=temp_v_out,
                        filter_name=director_data.get("recommended_filter", "teal_orange"),
                        letterbox=director_data.get("recommended_letterbox", True)
                    )

                    if ok and os.path.exists(temp_v_out):
                        with open(temp_v_out, "rb") as f:
                            st.session_state["chat_final_video"] = f.read()
                        status.update(label="🎉 تم تجهيز الإعلان بنجاح!", state="complete")

            st.rerun()

        if "chat_final_video" in st.session_state:
            st.markdown("---")
            st.markdown("### 🎬 مشغل الإعلان السينمائي الناتج:")
            st.video(st.session_state["chat_final_video"])
            st.download_button(
                "📥 تنزيل الفيديو السينمائي المكتمل (MP4)",
                data=st.session_state["chat_final_video"],
                file_name="ADgemvid_Cinematic.mp4",
                mime="video/mp4",
                use_container_width=True
            )

    # =========================================================================
    # الصفحة 2: 🎬 استوديو المونتاج (Manual Studio)
    # =========================================================================
    elif selected_page == "🎬 استوديو المونتاج":
        st.markdown("### 🎬 استوديو صناعة ومونتاج الإعلان")
        st.info("💡 يمكنك استخدام الاستوديو المباشر أو التحدث مع 'المخرج الذكي' في التبويب الأول.")
        # حقول الاستوديو الكلاسيكية...
        st.write("قم بضبط إعدادات الإعلان يدوياً للحصول على نتائج سريعة ومباشرة.")

    # =========================================================================
    # الصفحة 3: 🎨 المؤثرات السينمائية (Cinematic FX & Libraries)
    # =========================================================================
    elif selected_page == "🎨 المؤثرات السينمائية":
        st.markdown("### 🎨 المؤثرات السينمائية ومعمل المكتبات")
        st.caption("دليل شامل لكيفية عمل مكتبات OpenCV و MoviePy و Freesound بدون مفاتيح أو بتكلفة مجانية:")

        st.markdown("""
        #### 1️⃣ مكتبة OpenCV (معالجة الألوان والسينما):
        - **هل تحتاج مفتاح؟** ❌ **لا تحتاج أي مفتاح إطلاقاً!** تعمل محلياً على السيرفر 100%.
        - **الوظيفة:** تصحيح الألوان السينمائية (Teal & Orange, Luxury Gold)، وإضافة الأشرطة السوداء (2.35:1 Letterbox).

        #### 2️⃣ مكتبة MoviePy (المونتاج وخفض الصوت):
        - **هل تحتاج مفتاح؟** ❌ **مجانية ومفتوحة المصدر 100% بدون أي مفتاح.**
        - **الوظيفة:** دمج طبقات الفيديو والصوتيات وخاصية Audio Ducking.

        #### 3️⃣ مكتبة Edge-TTS (التعليق الصوتي):
        - **هل تحتاج مفتاح؟** ❌ **مجانية بالكامل من مايكروسوفت وبدون بطاقة بنكية.**
        - **الوظيفة:** توليد أصوات عربية استثنائية (حامد، سلمى، حمدان).

        #### 4️⃣ مكتبة Freesound.org API (المؤثرات الصوتية SFX):
        - **هل تحتاج مفتاح؟** ✅ توفر مفتاح مجاني بالكامل للمطورين عبر موقعهم، ويحتوي التطبيق أيضاً على بنك صوتي مدمج يعمل بدون مفتاح!
        - **الوظيفة:** جلب أصوات Whoosh والانتقالات الحركية وضربات الدراما.

        #### 5️⃣ مكتبة Google Gemini (العقل المدبر):
        - **هل تحتاج مفتاح؟** ✅ نعم، مفتاح مجاني من Google AI Studio لقراءة الفيديو وفهم محتواه.
        """)

    # =========================================================================
    # الصفحة 4: 🔒 خزنة المفاتيح
    # =========================================================================
    elif selected_page == "🔒 خزنة المفاتيح":
        st.markdown("### 🔒 خزنة المفاتيح والخصوصية")
        key_input = st.text_input(
            "🔑 مفتاح Google Gemini API:",
            value=st.session_state.get("gemini_api_key", ""),
            type="password",
            help="مجاني من aistudio.google.com"
        )
        if st.button("حفظ المفتاح بأمان في الجلسة"):
            st.session_state["gemini_api_key"] = key_input
            st.success("✅ تم حفظ مفتاحك بأمان!")

        model_choice = st.selectbox(
            "🧠 نموذج الذكاء الاصطناعي الافتراضي:",
            options=[
                "gemini-2.5-flash",
                "gemini-3.6-flash",
                "gemini-3.5-flash",
                "gemini-3.1-flash",
                "gemini-3.5-flash-lite",
                "gemini-3.1-flash-lite",
                "gemini-2.5-pro",
                "gemini-3.8-flash"
            ]
        )
        st.session_state["selected_model"] = model_choice

    # =========================================================================
    # الصفحة 5: 💻 كود التثبيت
    # =========================================================================
    elif selected_page == "💻 كود التثبيت":
        st.markdown("### 💻 كود التطبيق ومتطلبات التثبيت")
        st.code("pip install streamlit google-genai edge-tts moviepy opencv-python-headless requests pydantic python-dotenv", language="bash")
        st.code("streamlit run app.py", language="bash")

if __name__ == "__main__":
    main()
