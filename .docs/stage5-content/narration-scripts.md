# Stage 5 — Narration Scripts (Hebrew)

All audio files follow the naming convention: `audio/narration/<narrationKey>.mp3` + `.ogg`.
The `narrationKey` is stored on each `Exercise` record in the database (e.g. `ex.addition.3.4`).

Recording guidelines:
- Speaker: warm, encouraging, child-directed female or male voice
- Pace: slow and clear — leave 0.5s silence at start and end
- Export: 44.1kHz, mono, MP3 @128kbps + OGG @96kbps, max 200KB per file

---

## Exercise Prompts — Addition (כמה זה?)

Pattern: `ex.addition.<operandA>.<operandB>`

| narrationKey | Hebrew text | Pronunciation note |
|---|---|---|
| `ex.addition.1.1` | כמה זה אחת ועוד אחת? | "kama ze akhat ve'od akhat?" |
| `ex.addition.1.2` | כמה זה אחת ועוד שתיים? | |
| `ex.addition.1.3` | כמה זה אחת ועוד שלוש? | |
| `ex.addition.1.4` | כמה זה אחת ועוד ארבע? | |
| `ex.addition.2.1` | כמה זה שתיים ועוד אחת? | |
| `ex.addition.2.2` | כמה זה שתיים ועוד שתיים? | |
| `ex.addition.2.3` | כמה זה שתיים ועוד שלוש? | |
| `ex.addition.3.1` | כמה זה שלוש ועוד אחת? | |
| `ex.addition.3.2` | כמה זה שלוש ועוד שתיים? | |
| `ex.addition.3.3` | כמה זה שלוש ועוד שלוש? | |
| `ex.addition.3.4` | כמה זה שלוש ועוד ארבע? | |
| `ex.addition.4.1` | כמה זה ארבע ועוד אחת? | |
| `ex.addition.4.4` | כמה זה ארבע ועוד ארבע? | |
| `ex.addition.5.5` | כמה זה חמש ועוד חמש? | |

*(Full list: all combinations for levels 1–5 where operandA + operandB ≤ level × 5)*

---

## Feedback Messages

| narrationKey | Hebrew text | When played |
|---|---|---|
| `feedback.correct.1` | כל הכבוד! נכון מאוד! | Correct answer — variant 1 |
| `feedback.correct.2` | מצוין! ממש חכם/חכמה! | Correct answer — variant 2 |
| `feedback.correct.3` | וואו! איזה כיף! | Correct answer — variant 3 |
| `feedback.wrong.1` | לא נורא, נסה שוב | Wrong answer — variant 1 |
| `feedback.wrong.2` | כמעט! תנסה עוד פעם | Wrong answer — variant 2 |
| `feedback.levelcomplete` | כל הכבוד! סיימת את השלב! | Level complete |
| `feedback.newlevel` | יופי! עברת לשלב הבא! | Level unlocked |

---

## Sound Effects Spec

| File | Description | Duration | Notes |
|---|---|---|---|
| `audio/sfx/coin.mp3` | Single coin collect "ching" | ~0.3s | Bright, metallic, satisfying |
| `audio/sfx/correct.mp3` | Short success chime | ~0.8s | Major chord, upward arpeggio |
| `audio/sfx/wrong.mp3` | Soft "thud" or low tone | ~0.5s | Non-alarming, neutral |
| `audio/sfx/level-complete.mp3` | Celebratory fanfare | ~2.0s | Upbeat, triumphant but short |
| `audio/sfx/button-tap.mp3` | Subtle UI tap | ~0.1s | Soft pop |

## Background Music Spec

| File | Description | Loop | Notes |
|---|---|---|---|
| `audio/music/lobby.mp3` | Calm, welcoming | Yes | Plays on lobby + map screens |
| `audio/music/exercise.mp3` | Light, focused, upbeat | Yes | Plays during exercises |

---

## Web Speech API Fallback Script

When audio files are not yet available (development or missing assets), the app falls back
to the browser's `SpeechSynthesis` API using the script below. The hook at
`apps/web/src/hooks/useAudio.ts` implements this automatically.

Hebrew voice preference: `lang: 'he-IL'`, rate: 0.85, pitch: 1.1
