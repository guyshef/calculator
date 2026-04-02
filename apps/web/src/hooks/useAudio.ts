import { useCallback, useEffect, useRef } from 'react';
import { narrationPath, NARRATION_TEXT, SFX } from '../audio/manifest';

type SfxKey = keyof typeof SFX;

/**
 * Resolves the user's sound preference.
 * Respects prefers-reduced-motion — no audio when the user has opted out of motion.
 */
function isSoundEnabled() {
  if (typeof window === 'undefined') return false;
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Attempts to play an audio file at the given URL.
 * Returns true if playback started, false if the file was not found or playback failed.
 */
async function playFile(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const audio = new Audio(url);
    audio.oncanplaythrough = () => { audio.play().then(() => resolve(true)).catch(() => resolve(false)); };
    audio.onerror = () => resolve(false);
    // Abort loading after 1s if file not found (avoids long hangs in dev)
    setTimeout(() => resolve(false), 1000);
    audio.load();
  });
}

/**
 * Falls back to Web Speech API (browser TTS) for a given narration key.
 * Only works when the narration text is mapped in NARRATION_TEXT.
 */
function speakFallback(narrationKey: string): void {
  const text = NARRATION_TEXT[narrationKey];
  if (!text || typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = 'he-IL';
  utt.rate = 0.85;
  utt.pitch = 1.1;
  window.speechSynthesis.speak(utt);
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UseAudioReturn {
  /** Play a narration clip by its key (e.g. "ex.addition.3.4"). Falls back to TTS. */
  playNarration: (key: string) => void;
  /** Play a one-shot sound effect. */
  playSfx: (sfx: SfxKey) => void;
  /** Cancel any in-progress TTS speech. */
  cancelSpeech: () => void;
}

export function useAudio(): UseAudioReturn {
  const sfxCache = useRef<Map<string, HTMLAudioElement>>(new Map());

  // Pre-cache SFX on mount so first play has no delay
  useEffect(() => {
    if (!isSoundEnabled()) return;
    Object.values(SFX).forEach((url) => {
      if (!sfxCache.current.has(url)) {
        const el = new Audio(url);
        el.preload = 'auto';
        sfxCache.current.set(url, el);
      }
    });
  }, []);

  const playNarration = useCallback((key: string) => {
    if (!isSoundEnabled()) return;
    const url = narrationPath(key);
    playFile(url).then((played) => {
      if (!played) speakFallback(key);
    });
  }, []);

  const playSfx = useCallback((sfx: SfxKey) => {
    if (!isSoundEnabled()) return;
    const url = SFX[sfx];
    const cached = sfxCache.current.get(url);
    if (cached) {
      cached.currentTime = 0;
      cached.play().catch(() => {/* sfx failure is silent */});
    } else {
      playFile(url).catch(() => {/* silent */});
    }
  }, []);

  const cancelSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  return { playNarration, playSfx, cancelSpeech };
}

/** Hook for looping background music with play/pause control. */
export function useBackgroundMusic(src: string, enabled: boolean) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!isSoundEnabled() || !enabled) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(src);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3;
    }
    audioRef.current.play().catch(() => {/* autoplay blocked — user must interact first */});
    return () => { audioRef.current?.pause(); };
  }, [src, enabled]);
}
