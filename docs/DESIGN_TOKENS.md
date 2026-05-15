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

## UX Guidance Patterns

> These patterns make interactions discoverable without onboarding or instructions. Every interactive element a user might not understand should have at least one of these applied.

---

### Tooltips

**Implementation**: CSS-only via `.tooltip` class + `data-tip` attribute. No JS required.

```jsx
<button className="tooltip" data-tip="Delete task" aria-label="Delete task">
  <i className="ti ti-x" />
</button>
```

**When to use**:
- Icon-only buttons (always — no exceptions)
- Collapsed/ambiguous controls (drag handle, color dot, collapse toggle)
- Double-click affordances on text ("Double-click to rename")
- Click-to-cycle controls ("Click to change priority")

**When NOT to use**:
- Buttons that already have a visible text label
- Inputs and textareas
- Badges that are self-explanatory (status names are readable)

**Placement**: Tooltips appear above the element (`bottom: calc(100% + 10px)`). Keep `data-tip` text under 40 characters — it's a hint, not a label.

---

### Toasts

**Implementation**: `useToast()` hook from `src/components/shared/Toast.jsx`. Wrap App in `<ToastProvider>`.

```jsx
import { useToast } from '../shared/Toast'

const toast = useToast()
toast('Client link copied!', 'success')   // green
toast('Failed to save changes', 'error')  // red
toast('Task deleted')                     // neutral (default)
```

**Types**: `'success'` (green), `'error'` (red), `'default'` (neutral gray).

**When to use**:
- Confirming a clipboard copy
- Confirming a destructive action completed (delete, archive)
- Surfacing a save error that would otherwise be silent

**When NOT to use**:
- Inline saves that already have a visible "Saved ✓" indicator
- Every mutation — toasts are for non-obvious outcomes only
- Errors the user caused via a form (show inline validation instead)

**Duration**: Auto-dismisses at 3 seconds. No manual dismiss in v1.

---

### Icon-only buttons

Every button with no visible text label must have BOTH:
1. `aria-label="..."` — for screen readers and developer legibility
2. `data-tip="..."` + `.tooltip` class — for sighted users who don't know the icon

```jsx
<button
  className="tooltip w-6 h-6 ..."
  data-tip="Delete task"
  aria-label="Delete task"
  onClick={onDelete}
>
  <i className="ti ti-x" style={{ fontSize: '12px' }} />
</button>
```

---

### Hover-reveal controls

Some controls (drag handle, delete button, three-dot menu) are hidden at rest and revealed on row/card hover. This reduces visual noise without hiding functionality.

**Pattern**: Use `opacity-0 group-hover:opacity-100` on the control. The parent must have `group` class.

```jsx
<div className="group flex items-center ...">
  <button className="opacity-0 group-hover:opacity-100 tooltip" data-tip="Delete">
    <i className="ti ti-x" />
  </button>
</div>
```

**When to use**: Actions that are destructive, rarely needed, or secondary to the row's primary interaction.

**When NOT to use**: Primary CTAs, status badges, anything the user will need to find on first visit.

---

### Double-click to edit

Inline editing (task title, group name) is triggered by double-click. Single-click is reserved for navigation or toggle.

**Discoverable via**: `.tooltip` with `data-tip="Double-click to rename"` on the text element.

**Implementation pattern**:
```jsx
<span
  className="tooltip ..."
  data-tip="Double-click to rename"
  onDoubleClick={() => { setEditing(true); setValue(item.name) }}
>
  {item.name}
</span>
```

When editing mode is active: show an `<input autoFocus>` with `onBlur` → save, `Enter` → save, `Escape` → cancel.

---

### Empty states

Every list or canvas that can be empty needs an empty state. Formula:

```
[Optional icon]
[Short statement — what's missing]
[One-line context — why it matters or what to do]
[Primary action button]
```

Example (Brain Dump canvas):
```
No brain dump cards yet
Drop thoughts, concepts, and visual ideas here.
[+ Add card]
```

**Rules**:
- Never just blank space — always guide the user toward the first action
- Keep copy warm and specific to the context (not generic "Nothing here yet")
- One CTA max — don't offer three ways to proceed

---

### Loading skeletons

Use animated pulse skeletons during async data loads. Never show a spinner for content that has a known shape.

**Pattern**: Replace the real component structure with `<div className="animate-pulse">` containing `div` blocks with `background-color: var(--color-elevated-hi)` and approximate widths/heights.

Skeleton color: `var(--color-elevated-hi)` (`#323230`) against card background `var(--color-surface)` (`#252523`) — subtle but visible.

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
