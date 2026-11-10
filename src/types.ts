export interface SceneBreakdown {
  time: string;
  visual_prompt: string;
  voice_part: string;
  sfx_cue?: string;
}

export interface GeneratedAdData {
  ad_title: string;
  hook_line: string;
  voiceover_script: string;
  target_audience: string;
  call_to_action: string;
  sfx_keywords: string[];
  music_mood_description: string;
  hashtags?: string[];
  scenes: SceneBreakdown[];
  warning?: string;
}

export interface VoiceOption {
  id: string;
  name: string;
  country: string;
  gender: 'male' | 'female';
  langCode: string;
  description: string;
}

export interface SampleVideo {
  id: string;
  title: string;
  category: string;
  url: string;
  poster: string;
  suggestedPrompt: string;
}

export interface BackgroundMusicTrack {
  id: string;
  name: string;
  genre: string;
  mood: string;
  url: string;
  duration: string;
}
