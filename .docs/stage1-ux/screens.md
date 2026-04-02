# Stage 1 — Screen Inventory & Wireframe Specs

All screens must support RTL (`direction: rtl`, Hebrew). Breakpoints: mobile (375px), tablet (768px), desktop (1280px).

---

## Screen 1 — Lobby (Home Screen)

**Purpose:** Entry point. Child selects or creates their avatar and enters the game.

```
┌─────────────────────────────────────┐
│           [App Logo / Title]        │
│                                     │
│   ┌───────┐  ┌───────┐  ┌───────┐  │
│   │Avatar │  │Avatar │  │  + New│  │
│   │  #1   │  │  #2   │  │       │  │
│   │[Name] │  │[Name] │  │       │  │
│   └───────┘  └───────┘  └───────┘  │
│                                     │
│          [Parent Area 🔒]           │
└─────────────────────────────────────┘
```

**Elements:**
- App logo and title (top center)
- Avatar cards (up to 4 child profiles): avatar illustration + name + coin count
- "Add new child" card
- Locked "Parent Area" button (requires PIN/password)

**Interactions:**
- Tap avatar card → navigate to World Map for that child
- Tap "Add new child" → avatar creation flow
- Tap "Parent Area" → parent login modal

---

## Screen 2 — Avatar Creation / Selection

**Purpose:** Child picks their character before first play.

```
┌─────────────────────────────────────┐
│  ← Back        Choose Your Hero    │
│                                     │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌────┐ │
│  │ 🐱  │ │ 🦸  │ │ 🐱  │ │ 🦸 │ │
│  │Cat 1 │ │Hero 1│ │Cat 2 │ │ .. │ │
│  └──────┘ └──────┘ └──────┘ └────┘ │
│                                     │
│  Your name: [_________________]    │
│                                     │
│         [ Let's Go! ▶ ]            │
└─────────────────────────────────────┘
```

**Elements:**
- Scrollable grid of avatar options (cats and superheroes)
- Selected avatar highlighted with a border/glow
- Name text input (Hebrew keyboard)
- "Let's Go!" CTA button (disabled until avatar + name chosen)

---

## Screen 3 — World Map

**Purpose:** Shows the child's progression path. Each node is a level/exercise.

```
┌─────────────────────────────────────┐
│  [Avatar + Name]        🪙 [coins] │
│                                     │
│         ★                          │
│        / \                          │
│  ★────★   ★  ← current            │
│  |         \                        │
│  ★    🔒   🔒                      │
│   \                                 │
│    START                            │
│                                     │
│              [ ⚙ Settings ]        │
└─────────────────────────────────────┘
```

**Elements:**
- Illustrated path connecting level nodes
- Level nodes: completed (★ filled), current (pulsing), locked (🔒)
- Child avatar + name top-left, coin count top-right
- Settings button (sound toggle, back to lobby)

**Interactions:**
- Tap unlocked level node → navigate to Exercise Screen
- Tap locked node → gentle "not yet!" animation, no navigation
- Coin counter animates when coins are earned

---

## Screen 4 — Exercise Screen

**Purpose:** Core gameplay. Child solves a math exercise using drag & drop.

```
┌─────────────────────────────────────┐
│  ← Map    Level 3        🪙 12     │
│  ████████░░░░  (progress bar)       │
│                                     │
│        [Avatar - idle/listen]       │
│   🔊 "What is 3 + 4?"              │
│                                     │
│   ┌─────────────────────────┐       │
│   │   3   +   4   =  [ ? ]  │       │
│   └─────────────────────────┘       │
│                                     │
│   ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐   │
│   │ 5 │ │ 6 │ │ 7 │ │ 8 │ │ 9 │   │
│   └───┘ └───┘ └───┘ └───┘ └───┘   │
│                                     │
└─────────────────────────────────────┘
```

**Elements:**
- Back to map button + level label + coin counter (header)
- Progress bar: exercises completed in current level
- Avatar (animated — idle while waiting, listening during narration)
- Audio narration button (auto-plays; tap to replay)
- Exercise display: equation with an empty answer slot
- Draggable number tiles (answer options)
- Drop zone for the answer slot

**Interactions:**
- Drag a tile → drop on the `[ ? ]` slot → triggers validation
- Correct: avatar celebrates, coin +1 animation, advance to next exercise
- Wrong: avatar sad, gentle shake animation, tile returns, can retry
- Progress bar fills after each correct answer
- "Correct a mistake" button appears after a wrong answer to swap the tile

---

## Screen 5 — Results / Level Complete Screen

**Purpose:** Celebrates completing a level and shows what was earned.

```
┌─────────────────────────────────────┐
│                                     │
│     🎉 [Lottie: coin shower] 🎉    │
│                                     │
│        Level 3 Complete!            │
│        You earned: 🪙 +8           │
│                                     │
│     ★★★  (star rating 1–3)         │
│                                     │
│   [  Play Again  ] [ Next Level ▶ ]│
│                                     │
└─────────────────────────────────────┘
```

**Elements:**
- Full-screen Lottie celebration animation
- Level name + coins earned
- Star rating (1–3 stars based on accuracy)
- "Play Again" and "Next Level" buttons

---

## Screen 6 — Parent Dashboard

**Purpose:** Lets a parent review their child's progress over time.

```
┌─────────────────────────────────────┐
│  ← Back       Parent Dashboard     │
│                                     │
│  Child: [Dropdown ▾]               │
│                                     │
│  ┌──────────────────────────────┐   │
│  │  Progress Over Time (chart)  │   │
│  │  [Recharts line chart]       │   │
│  └──────────────────────────────┘   │
│                                     │
│  ┌──────────────────────────────┐   │
│  │  Error Rate by Topic (chart) │   │
│  │  [Recharts bar chart]        │   │
│  └──────────────────────────────┘   │
│                                     │
│  Weak areas: Addition > 10         │
│  Total time this week: 42 min      │
│                                     │
└─────────────────────────────────────┘
```

**Elements:**
- Child selector dropdown (parent may have multiple children)
- Line chart: correct answers per day over last 30 days
- Bar chart: error rate per exercise type (addition, subtraction, etc.)
- Summary stats: identified weak areas, total time played this week

---

## Screen 7 — Parent Login Modal

**Purpose:** Gate the parent area behind authentication.

```
┌──────────────────────────┐
│      Parent Area 🔒      │
│                          │
│  Email: [____________]   │
│  Password: [__________]  │
│                          │
│      [ Log In ]          │
│  [ Forgot password? ]    │
└──────────────────────────┘
```

---

## Screen Coverage Checklist

- [x] Lobby (child selection)
- [x] Avatar creation
- [x] World Map
- [x] Exercise Screen
- [x] Results / Level Complete
- [x] Parent Dashboard
- [x] Parent Login Modal
