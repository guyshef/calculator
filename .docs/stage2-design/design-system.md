# Stage 2 — Design System

All values below are the canonical source for implementation. Frontend developers should map these directly to Tailwind config or CSS custom properties.

---

## Typography

| Role | Font | Size | Weight | Notes |
|------|------|------|--------|-------|
| Display (titles) | Fredoka One | 32–48px | 400 | Rounded, playful — good for Hebrew RTL |
| Heading | Fredoka One | 24px | 400 | Screen headings |
| Body / Labels | Nunito | 18px | 600 | Large enough for children |
| Button text | Nunito | 20px | 700 | Bold for visibility |
| Coin / Counter | Nunito | 22px | 800 | Prominent numbers |

Both fonts support Hebrew characters. Minimum font size anywhere in the app: **16px**.

---

## Color Palette

### Primary (game UI)
| Token | Hex | Usage |
|-------|-----|-------|
| `color-primary` | `#FF6B35` | Main CTA buttons, active states |
| `color-primary-dark` | `#E05A25` | Button hover/press |
| `color-secondary` | `#4ECDC4` | Accents, progress bar fill |
| `color-secondary-dark` | `#3BADA5` | Accent hover |

### Backgrounds
| Token | Hex | Usage |
|-------|-----|-------|
| `color-bg-lobby` | `#FFF9F0` | Warm off-white — lobby & map |
| `color-bg-exercise` | `#F0F7FF` | Soft blue — exercise screen |
| `color-bg-card` | `#FFFFFF` | Avatar cards, exercise tiles |

### Feedback
| Token | Hex | Usage |
|-------|-----|-------|
| `color-success` | `#6BCB77` | Correct answer highlight |
| `color-error` | `#FF9A9A` | Wrong answer — soft, non-alarming |
| `color-locked` | `#BDBDBD` | Locked level nodes |

### Text
| Token | Hex | Usage |
|-------|-----|-------|
| `color-text-primary` | `#2D2D2D` | Main text |
| `color-text-secondary` | `#757575` | Labels, captions |
| `color-text-on-primary` | `#FFFFFF` | Text on colored buttons |

---

## Spacing Scale

Base unit: **8px**

| Token | Value |
|-------|-------|
| `space-1` | 8px |
| `space-2` | 16px |
| `space-3` | 24px |
| `space-4` | 32px |
| `space-6` | 48px |
| `space-8` | 64px |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `radius-sm` | 8px | Chips, small tags |
| `radius-md` | 16px | Cards, number tiles |
| `radius-lg` | 24px | Modals, large panels |
| `radius-pill` | 9999px | Primary buttons |

---

## Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-tile` | `0 4px 12px rgba(0,0,0,0.12)` | Draggable number tiles |
| `shadow-card` | `0 2px 8px rgba(0,0,0,0.08)` | Avatar cards |
| `shadow-modal` | `0 8px 32px rgba(0,0,0,0.20)` | Modals and overlays |

---

## Components

### Button — Primary
- Background: `color-primary`
- Text: `color-text-on-primary`, Nunito 700 20px
- Border radius: `radius-pill`
- Padding: `space-2` vertical, `space-4` horizontal
- Min height: **56px** (large touch target)
- Press state: scale(0.96) + `color-primary-dark`

### Button — Secondary (Ghost)
- Border: 2px solid `color-primary`
- Text: `color-primary`
- Same sizing as primary

### Number Tile (draggable)
- Size: 64×64px (tablet), 56×56px (mobile)
- Background: `color-bg-card`
- Border radius: `radius-md`
- Shadow: `shadow-tile`
- Font: Nunito 800 28px, `color-text-primary`
- Dragging state: scale(1.1), shadow increases, slight rotation (–3° to 3°)

### Answer Slot (drop zone)
- Size matches number tile
- Border: 3px dashed `color-secondary`
- Background: transparent
- Filled state: background `color-success` at 20% opacity, solid border

### Progress Bar
- Height: 16px
- Background: `color-bg-card` with inner shadow
- Fill: `color-secondary` with right-to-left fill direction (RTL)
- Border radius: `radius-pill`

### Level Node (World Map)
- Completed: filled star icon, `color-primary` background
- Current: pulsing ring animation, `color-secondary` background
- Locked: `color-locked` background, lock icon overlay

### Coin Counter
- Coin icon (SVG) + number, `color-primary` text
- Bump animation (scale 1→1.3→1) on increment

---

## Motion & Animation Principles

| Principle | Rule |
|-----------|------|
| Duration — micro interactions | 150–200ms |
| Duration — screen transitions | 300ms |
| Duration — celebrations | 1500–2000ms |
| Easing — enter | `cubic-bezier(0.34, 1.56, 0.64, 1)` (spring-like) |
| Easing — exit | `cubic-bezier(0.4, 0, 1, 1)` (ease-in) |
| Reduce motion | Respect `prefers-reduced-motion` — skip Lottie, use opacity only |

### Key Animations
| Animation | Implementation | Duration |
|-----------|---------------|----------|
| Coin collect | Lottie JSON | 1500ms |
| Level complete shower | Lottie JSON | 2000ms |
| Avatar celebrate | Lottie JSON (state switch) | 1500ms |
| Avatar sad | Lottie JSON (state switch) | 800ms |
| Wrong answer shake | Framer Motion `x` keyframes | 400ms |
| Screen transition | Framer Motion `AnimatePresence` slide | 300ms |
| Node pulse (map) | CSS `@keyframes` scale + opacity | ∞ loop |

---

## RTL Checklist for Designers

- [ ] All text blocks set to `direction: rtl`, `text-align: right`
- [ ] Progress bar fills from **right to left**
- [ ] World Map path flows from bottom-right to top-left
- [ ] Back arrows point **right** (←→ flip in RTL)
- [ ] Icon + label pairs: icon on the **left** of text (which is on the right in RTL layout)
- [ ] Coin counter in top-**left** corner (leading side in RTL)
