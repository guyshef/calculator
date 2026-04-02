/**
 * Audio manifest — all sound files required by the app.
 * Files live at /public/audio/... and are cached by the Service Worker.
 *
 * When a file is absent the useAudio hook falls back to Web Speech API (development)
 * or stays silent (production with reduced-motion preference).
 */

export const SFX = {
  coin: '/audio/sfx/coin.mp3',
  correct: '/audio/sfx/correct.mp3',
  wrong: '/audio/sfx/wrong.mp3',
  levelComplete: '/audio/sfx/level-complete.mp3',
  buttonTap: '/audio/sfx/button-tap.mp3',
} as const;

export const MUSIC = {
  lobby: '/audio/music/lobby.mp3',
  exercise: '/audio/music/exercise.mp3',
} as const;

/** Build the narration key for an addition exercise. */
export function additionKey(a: number, b: number) {
  return `ex.addition.${a}.${b}`;
}

/** Build the narration key for a subtraction exercise. */
export function subtractionKey(a: number, b: number) {
  return `ex.subtraction.${a}.${b}`;
}

export function narrationPath(key: string) {
  return `/audio/narration/${key}.mp3`;
}

/** Feedback narration keys (randomly pick one variant). */
export const FEEDBACK = {
  correct: ['feedback.correct.1', 'feedback.correct.2', 'feedback.correct.3'],
  wrong: ['feedback.wrong.1', 'feedback.wrong.2'],
  levelComplete: 'feedback.levelcomplete',
  newLevel: 'feedback.newlevel',
} as const;

/** Hebrew text used by the Web Speech API fallback (maps narrationKey → text). */
export const NARRATION_TEXT: Record<string, string> = {
  'ex.addition.1.1': 'כמה זה אחת ועוד אחת?',
  'ex.addition.1.2': 'כמה זה אחת ועוד שתיים?',
  'ex.addition.1.3': 'כמה זה אחת ועוד שלוש?',
  'ex.addition.1.4': 'כמה זה אחת ועוד ארבע?',
  'ex.addition.2.1': 'כמה זה שתיים ועוד אחת?',
  'ex.addition.2.2': 'כמה זה שתיים ועוד שתיים?',
  'ex.addition.2.3': 'כמה זה שתיים ועוד שלוש?',
  'ex.addition.2.4': 'כמה זה שתיים ועוד ארבע?',
  'ex.addition.3.1': 'כמה זה שלוש ועוד אחת?',
  'ex.addition.3.2': 'כמה זה שלוש ועוד שתיים?',
  'ex.addition.3.3': 'כמה זה שלוש ועוד שלוש?',
  'ex.addition.3.4': 'כמה זה שלוש ועוד ארבע?',
  'ex.addition.4.1': 'כמה זה ארבע ועוד אחת?',
  'ex.addition.4.2': 'כמה זה ארבע ועוד שתיים?',
  'ex.addition.4.4': 'כמה זה ארבע ועוד ארבע?',
  'ex.addition.5.5': 'כמה זה חמש ועוד חמש?',
  'feedback.correct.1': 'כל הכבוד! נכון מאוד!',
  'feedback.correct.2': 'מצוין! ממש חכם!',
  'feedback.correct.3': 'וואו! איזה כיף!',
  'feedback.wrong.1': 'לא נורא, נסה שוב',
  'feedback.wrong.2': 'כמעט! תנסה עוד פעם',
  'feedback.levelcomplete': 'כל הכבוד! סיימת את השלב!',
  'feedback.newlevel': 'יופי! עברת לשלב הבא!',
};
