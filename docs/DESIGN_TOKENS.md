# Design Tokens — Studio OS

> Single source of truth for all visual decisions. CODEX_HANDOFF.md references these; this file defines them. When a token changes, update here first.

---

## Color system

All colors are defined as CSS variables in `src/styles/index.css`. Dark mode only — no light mode variant exists yet.

### Base layers

| Token | Hex | Usage |
|---|---|---|
| `--bg` | `#1E1E1C` | Page background, outermost surface |
| `--surface` | `#252523` | Cards, panels, modals |
| `--elevated` | `#2A2A28` | Hover states, nested surfaces, dropdowns |
| `--border` | `rgba(255,255,255,0.08)` | Default borders on cards and rows |
| `--border-hover` | `rgba(255,255,255,0.15)` | Hovered or focused borders |

### Text

| Token | Hex | Usage |
|---|---|---|
| `--text-primary` | `#E8E6DF` | Headings, task titles, primary labels |
| `--text-muted` | `#9C9A92` | Metadata, dates, secondary labels |
| `--text-subtle` | `#6B6963` | Placeholder text, disabled states, timestamps |

### Brand green (primary action color)

| Token | Hex | Usage |
|---|---|---|
| `--green-bright` | `#1D9E75` | Progress fills, active checkboxes, brand accent |
| `--green-mid` | `#0F6E56` | Hover state on primary buttons |
| `--green-deep` | `#085041` | Badge backgrounds, avatar fills |
| `--green-text` | `#9FE1CB` | Text on dark green backgrounds |

### Status colors

| Status | Background | Text | Border | Usage |
|---|---|---|---|---|
| On track / Done | `#0A2018` | `#5DCAA5` | `#085041` | Health badges, done pills |
| In progress | `#0C2A42` | `#85B7EB` | `#185FA5` | Status badges, calendar events |
| Needs attention / High priority | `#1C130A` | `#FAC775` | `#412402` | Amber warnings, priority flags |
| Blocked / Overdue | `#1C0808` | `#F09595` | `#791F1F` | Error states, blocked tasks |
| Paused / Normal | `#2A2A28` | `#9C9A92` | `rgba(255,255,255,0.08)` | Gray neutral states |
| Nearly done | `#0C2A42` | `#85B7EB` | `#0C447C` | Blue completion states |

### AI / Claude panel

| Token | Hex | Usage |
|---|---|---|
| `--ai-bg` | `#1A1A2E` | Claude panel background |
| `--ai-border` | `#3C3489` | Claude panel border |
| `--ai-icon-bg` | `#3C3489` | Claude sparkle icon background |
| `--ai-text` | `#CECBF6` | Claude response text |
| `--ai-label` | `#AFA9EC` | "Claude" label, button text |
| `--ai-badge-bg` | `#26215C` | "Context loaded" badge |

### Brain dump card colors

| Name | Background | Border | Text |
|---|---|---|---|
| `amber` (default) | `#1C130A` | `#412402` | `#EF9F27` |
| `teal` | `#0F2E22` | `#1D9E75` | `#9FE1CB` |
| `purple` | `#1C1A3A` | `#3C3489` | `#AFA9EC` |
| `red` | `#1C0808` | `#791F1F` | `#E24B4A` |
| `gray` (neutral) | `#252523` | `rgba(255,255,255,0.12)` | `#E8E6DF` |

---

## Typography

Font family: **DM Sans** — loaded via Google Fonts in `index.html`. Fallback: `system-ui, sans-serif`.

| Role | Size | Weight | Color token | Usage |
|---|---|---|---|---|
| App name / page title | `17–18px` | `500` | `--text-primary` | Studio OS wordmark, client titles |
| Section heading | `15px` | `500` | `--text-primary` | Card headers, group names |
| Body / task title | `13–14px` | `400` | `--text-primary` | Task rows, description text |
| Label / badge | `11–12px` | `500` | varies by status | Badges, pills, metadata |
| Caption / timestamp | `11px` | `400` | `--text-subtle` | Dates, "2h ago", file sizes |

Line height: `1.5` for body text, `1.4` for compact rows, `1.6` for description fields.

---

## Spacing scale

Studio OS uses an 8px base unit. All spacing should be a multiple of 4px.

| Token | Value | Common usage |
|---|---|---|
| `xs` | `4px` | Icon gaps, tight label spacing |
| `sm` | `8px` | Between pills, avatar offset |
| `md` | `12px` | Card internal padding (compact) |
| `lg` | `16px` | Standard card padding |
| `xl` | `20px` | Section separation |
| `2xl` | `24px` | Page padding horizontal |
| `3xl` | `32px` | Large section gaps |

---

## Border radius

| Token | Value | Usage |
|---|---|---|
| `sm` | `4px` | Badges, pills, small chips |
| `md` | `6–8px` | Buttons, input fields |
| `lg` | `10px` | Cards, modals, panels |
| `xl` | `12px` | Large cards (ClientCard) |
| `full` | `9999px` | Avatars, toggle switches |

---

## Component patterns

### Card
```
background: #252523
border: 0.5px solid rgba(255,255,255,0.08)
border-radius: 10–12px
padding: 12–16px
```
Hover state: `border-color: rgba(255,255,255,0.15)`, no background change.

### Task row (alternating)
```
Even rows: background transparent
Odd rows: background rgba(255,255,255,0.03)
Hover (any row): background rgba(255,255,255,0.05)
```

### Button (default)
```
background: transparent
border: 0.5px solid rgba(255,255,255,0.15)
color: #9C9A92
border-radius: 6px
padding: 6px 12px
font-size: 12px
```
Hover: `background: #2A2A28`, `color: #E8E6DF`

### Button (primary)
```
background: #085041
border: 0.5px solid #085041
color: #9FE1CB
```
Hover: `background: #0F6E56`

### Progress bar
```
height: 3px
background (track): rgba(255,255,255,0.08)
border-radius: 2px
```
Fill color comes from client health: green `#1D9E75`, amber `#EF9F27`, red `#E24B4A`, blue `#378ADD`.

### Avatar
```
size: 20–22px
border-radius: 50%
border: 1.5px solid #252523 (card background — creates stacking gap)
font-size: 8–9px, font-weight: 500
```

---

## Iconography

Tabler Icons outline set — loaded via CDN in `index.html`. Usage: `<i class="ti ti-{name}">`.

Common icons in Studio OS:

| Context | Icon name |
|---|---|
| App logo / board | `ti-layout-board` |
| Client portal link | `ti-share` |
| Brain dump | `ti-bulb` |
| Tasks | `ti-checklist` |
| Notes | `ti-notes` |
| Files | `ti-paperclip` |
| Inspo board | `ti-photo` |
| Calendar | `ti-calendar-event` |
| Buffer posts | `ti-brand-buffer` |
| Figma link | `ti-brand-figma` |
| Claude / AI | `ti-sparkles` |
| Three-dot menu | `ti-dots` |
| Add / create | `ti-plus` |
| Status done | `ti-check` |
| Status blocked | `ti-alert-triangle` |
| Priority high | `ti-flag` |
| Drag handle | `ti-grip-vertical` |
| Filter | `ti-filter` |
| Search | `ti-search` |
| Settings | `ti-settings` |
| Sign out | `ti-logout` |

---

## Animation

All animations use CSS keyframes. No JS animation libraries.

| Name | Duration | Usage |
|---|---|---|
| `fadeInUp` | `240ms ease-out` | Card/modal entrance |
| `fadeIn` | `180ms ease-out` | Dropdowns, tooltips |
| `pulse` (subtle) | `2s ease-in-out infinite` | DigestStrip unread indicator |

Motion reduction: all keyframe animations are wrapped in `@media (prefers-reduced-motion: no-preference)` or use `transition` properties that browsers auto-respect.

---

## Dark mode note

Dark is the default and only mode at this stage. The `<html>` element has `class="dark"` set at load. Tailwind's `darkMode: 'class'` config is set but only dark classes are used — do not add light mode variants until Phase 4 explicitly enables them.
