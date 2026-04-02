# Stage 2 — Asset Export Specification

All assets must be exported by the design team in the formats below before Stage 3 (Frontend) can begin. Developers consume these directly.

---

## Avatar Characters

Each avatar has **5 expression states**. Export each state as a standalone Lottie JSON file.

| State | Trigger |
|-------|---------|
| `idle` | Default — subtle breathing loop |
| `listening` | Audio narration playing |
| `celebrating` | Correct answer |
| `sad` | Wrong answer |
| `thinking` | Between exercises (optional, nice-to-have) |

### File naming convention:
```
avatars/
├── cat-1/
│   ├── idle.json
│   ├── listening.json
│   ├── celebrating.json
│   └── sad.json
├── cat-2/
│   └── ...
├── hero-1/
│   └── ...
└── hero-2/
    └── ...
```

### Lottie export requirements:
- Max file size per animation: **150 KB** (compress with LottieFiles optimizer)
- Frame rate: 30fps
- No external image references — embed all assets inline in the JSON
- Test in [LottieFiles preview](https://lottiefiles.com/) before handoff

---

## Reward / Celebration Animations

| File | Usage | Max size |
|------|-------|---------|
| `animations/coin-collect.json` | Single coin flies to counter | 80 KB |
| `animations/level-complete.json` | Full-screen coin shower | 200 KB |
| `animations/stars-award.json` | 1–3 stars fill in sequence | 100 KB |

---

## World Map

| Asset | Format | Notes |
|-------|--------|-------|
| `map/background.svg` | SVG | Illustrated path background, scalable |
| `map/node-completed.svg` | SVG | Filled star node |
| `map/node-current.svg` | SVG | Current level node (static; pulse is CSS) |
| `map/node-locked.svg` | SVG | Locked node with lock icon |
| `map/path-segment.svg` | SVG | Repeating path connector between nodes |

---

## UI Icons

Export all icons as SVG only. No PNGs for icons.

| Icon | File | Usage |
|------|------|-------|
| Coin | `icons/coin.svg` | Counter, rewards |
| Lock | `icons/lock.svg` | Locked levels |
| Star (empty) | `icons/star-empty.svg` | Results screen |
| Star (filled) | `icons/star-filled.svg` | Results screen |
| Sound on | `icons/sound-on.svg` | Audio toggle |
| Sound off | `icons/sound-off.svg` | Audio toggle |
| Settings | `icons/settings.svg` | Map screen |
| Back arrow | `icons/arrow-back.svg` | Navigation (will be flipped via CSS for RTL) |
| Parent lock | `icons/parent-lock.svg` | Parent area button |

SVG requirements:
- `viewBox` set correctly, no hard-coded `width`/`height` on the `<svg>` element
- Single color paths using `currentColor` so icon color is controlled by CSS

---

## Backgrounds

| Asset | Format | Size | Usage |
|-------|--------|------|-------|
| `backgrounds/lobby-bg.png` | PNG | 1440×900 + 2x | Lobby screen background |
| `backgrounds/exercise-bg.png` | PNG | 1440×900 + 2x | Exercise screen background |
| `backgrounds/results-bg.png` | PNG | 1440×900 + 2x | Results screen |

Export at 1x and 2x (retina). Compress with TinyPNG before handoff. Target < 200 KB per image at 1x.

---

## Audio Assets (referenced from Stage 5, spec defined here)

Audio must be exported in two formats for browser compatibility.

| File | Format | Max Size | Notes |
|------|--------|---------|-------|
| `audio/narration/*.mp3` + `.ogg` | MP3 + OGG | 200 KB each | One file per exercise prompt |
| `audio/sfx/correct.mp3` + `.ogg` | MP3 + OGG | 50 KB | Success chime |
| `audio/sfx/wrong.mp3` + `.ogg` | MP3 + OGG | 50 KB | Soft error sound |
| `audio/sfx/coin.mp3` + `.ogg` | MP3 + OGG | 30 KB | Coin collect tick |
| `audio/sfx/level-complete.mp3` + `.ogg` | MP3 + OGG | 100 KB | Fanfare |
| `audio/music/background-loop.mp3` + `.ogg` | MP3 + OGG | 500 KB | Looping background music |

---

## Handoff Checklist

Before Stage 3 can begin, confirm:

- [ ] All 4 avatars exported (all 4 states each) as Lottie JSON, tested in LottieFiles
- [ ] 3 reward animations exported as Lottie JSON
- [ ] World map assets exported as SVG
- [ ] All UI icons exported as SVG with `currentColor`
- [ ] Background images exported at 1x + 2x, compressed
- [ ] Design tokens (colors, spacing, radii) documented in `design-system.md` match the Figma file
- [ ] All screens cover RTL layout (reviewed in Figma with Hebrew text)
- [ ] Audio file naming convention confirmed with narration team (Stage 5)
