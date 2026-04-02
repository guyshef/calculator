# Stage 1 — User Journeys

---

## Journey 1 — First-Time Child (Onboarding)

```
App opens
    │
    ▼
Lobby (empty — no profiles yet)
    │
    ▼
Tap "Add New Child"
    │
    ▼
Avatar Selection screen
    │  → Scrolls through cats and superheroes
    │  → Taps preferred avatar (highlight + bounce animation)
    │  → Types name using Hebrew keyboard
    │  → Taps "Let's Go!"
    ▼
World Map (first time)
    │  → Only Level 1 node is unlocked (pulsing)
    │  → Brief coach mark tooltip: "Tap the star to start!"
    ▼
Tap Level 1 node
    │
    ▼
Exercise Screen — Level 1, Exercise 1
    │  → Narration auto-plays: "What is 1 + 1?"
    │  → Child drags "2" tile to the answer slot
    ▼
Correct Answer
    │  → Avatar celebrates (Lottie)
    │  → Coin +1 floats up and adds to counter
    │  → Progress bar advances
    ▼
(Repeat for remaining exercises in Level 1)
    │
    ▼
Level Complete Screen
    │  → Coin shower animation
    │  → Stars awarded
    │  → Tap "Next Level" → World Map with Level 2 unlocked
```

---

## Journey 2 — Returning Child (Resuming Progress)

```
App opens
    │
    ▼
Lobby (existing avatar cards shown)
    │
    ▼
Tap own avatar card
    │
    ▼
World Map (state restored)
    │  → Completed levels shown as filled stars
    │  → Current level pulsing
    │  → Future levels locked
    ▼
Tap current level node
    │
    ▼
Exercise Screen (continues from last saved position within level)
```

---

## Journey 3 — Wrong Answer & Correction Flow

```
Exercise Screen — answer slot empty
    │
    ▼
Child drags wrong tile to answer slot
    │
    ▼
Validation: INCORRECT
    │  → Tile shakes and returns to tray
    │  → Avatar shows sad expression (brief)
    │  → Gentle error sound (soft, non-discouraging)
    │  → "Try Again" text appears below equation
    │  → "Fix my answer" button appears
    ▼
Option A: Child tries again
    │  → Drags a different tile to the slot
    ▼
Option B: Child taps "Fix my answer"
    │  → Correct answer tile is gently highlighted
    │  → Child still drags it themselves (agency preserved)
    ▼
Correct Answer → normal success flow
```

---

## Journey 4 — Offline Play

```
Device loses network connection
    │
    ▼
Child continues playing from World Map
    │  → No visible change — Service Worker serves cached exercises
    │  → Coins and progress tracked locally (Zustand + localStorage)
    ▼
Exercises completed offline
    │
    ▼
Device reconnects
    │
    ▼
Sync queue flushes automatically
    │  → Progress POSTed to API
    │  → No user action required
    │  → Optional: subtle "Progress saved ✓" toast
```

---

## Journey 5 — Parent Viewing Progress

```
Lobby screen
    │
    ▼
Tap "Parent Area 🔒"
    │
    ▼
Parent Login Modal
    │  → Enter email + password
    │  → Tap "Log In"
    ▼
Parent Dashboard
    │  → Default view: first linked child
    │  → Line chart: last 30 days of correct answers
    │  → Bar chart: error rate by topic
    │  → Summary: "Weak area: Addition > 10", "42 min this week"
    ▼
Tap child dropdown → select another child
    │
    ▼
Dashboard re-renders for selected child
    │
    ▼
Tap "← Back" → returns to Lobby
```

---

## Journey 6 — Coin / Reward Animation Detail

```
Correct answer registered
    │
    ├─ Avatar: switches to "celebrating" Lottie state (1.5s)
    ├─ Coin icon spawns at answer slot
    │   └─ Animates (float + scale) up to coin counter in header
    ├─ Counter increments with a bounce
    └─ Progress bar fills one segment with easing
    │
    ▼
After 1.5s → next exercise auto-loads
```

---

## Journey Coverage Checklist

- [x] First-time onboarding (avatar creation → first level)
- [x] Returning child (resume progress)
- [x] Wrong answer + correction flow
- [x] Offline play + sync on reconnect
- [x] Parent login + dashboard
- [x] Coin/reward animation detail
