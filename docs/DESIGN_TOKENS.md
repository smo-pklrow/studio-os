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

Two typefaces. One system. **Never mix roles.**

### Font families

| Variable | Family | Loaded via | Role |
|---|---|---|---|
| `--font-sans` (default) | **DM Sans** | Google Fonts in `index.html` | UI, body, labels, badges, all interactive elements |
| `--font-display` | **DM Serif Display** | Google Fonts in `index.html` | Display moments only — 28px and above |

**The rule**: `--font-display` appears in exactly two places — the Dashboard greeting (`Good morning, Sean.`) and the Client Board hero heading (`h1` client name). Nowhere else. Do not use it for labels, body text, badges, or buttons.

DM Serif Display was designed by Colophon Foundry as the serif sibling to DM Sans. The pairing is architecturally correct — same proportions, contrasting personalities. The contrast between the two creates typographic hierarchy without any tonal mismatch.

### Type scale

| Role | Font | Size | Weight | Color token | Usage |
|---|---|---|---|---|---|
| Display / greeting | `--font-display` | `clamp(26px, 3.5vw, 36px)` | `400` | `--color-text` | Dashboard greeting, client board h1 |
| App name / page title | `--font-sans` | `17–18px` | `500` | `--color-text` | Studio OS wordmark, nav items |
| Section heading | `--font-sans` | `15px` | `500` | `--color-text` | Card headers, group names |
| Body / task title | `--font-sans` | `13–14px` | `400` | `--color-text` | Task rows, description text |
| Label / badge | `--font-sans` | `11–12px` | `500` | varies by status | Badges, pills, metadata |
| Caption / timestamp | `--font-sans` | `11px` | `400` | `--color-subtle` | Dates, "2h ago", file sizes |

Line height: `1.5` for body text, `1.4` for compact rows, `1.6` for description fields.

Letter spacing: `-0.02em` on display text, `-0.01em` on section headings, `0` on body.

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

## Smooth Scroll

Lenis (`lenis` npm package) is initialized globally in `src/App.jsx` and handles all window-level scrolling. It gives the app a weighted, physical scroll feel.

**Config**:
```js
const lenis = new Lenis({
  duration: 1.1,
  easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
})
```

**Required CSS** (added to `index.css` before `@layer base`):
```css
html.lenis, html.lenis body { height: auto; }
.lenis.lenis-smooth { scroll-behavior: auto !important; }
.lenis.lenis-smooth [data-lenis-prevent] { overscroll-behavior: contain; }
.lenis.lenis-stopped { overflow: hidden; }
```

**Scoping**: Lenis handles the window scroll only. Child elements with `overflow: auto` (modals, WeekCalendar horizontal scroll) are unaffected. Add `data-lenis-prevent` to any scrollable child that should opt out.

---

## Dashboard Greeting Pattern

The dashboard header uses a time-aware, name-personalized greeting at display scale — the primary typographic statement in the app.

**Scale**: `clamp(22px, 3vw, 30px)`, `font-weight: 500`, `letter-spacing: -0.01em`. This is the largest text in the app by design — it creates the hierarchy contrast that makes body text feel intimate.

**Greeting logic**:
```js
function getGreeting(name) {
  const hour = new Date().getHours()
  const time = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'
  return `Good ${time}${name ? `, ${name}` : ''}.`
}
```

**Insight line**: A single sentence surfacing the most important studio state (overdue tasks > clients needing attention > all clear). Never more than one sentence. Never raw counts ("3 clients") — always outcome language ("3 clients need attention").

**Name source**: `user.user_metadata.full_name` from `supabase.auth.getUser()`, split to first name only. Falls back to the formatted date string if name is unavailable.

---

## Onboarding Nudge Pattern

Dismissible inline banners that surface the app's key differentiators at the exact moment they become relevant.

**Rules**:
- Show only once (dismissed state stored in `localStorage`)
- Must be immediately actionable (a button that does the thing, not a link to learn about it)
- One nudge maximum visible at a time
- Dismiss without friction — an `×` button, no confirmation

**Portal nudge** — shown when `clients.length >= 1` and not yet dismissed:
```jsx
{showNudge && (
  <div style={{ backgroundColor: 'var(--color-brand-deep)', border: '1px solid var(--border-brand)' }}>
    <i className="ti ti-share" />
    <span>Share your client portal</span> — give your client a live view.
    <button onClick={shareFirstPortal}>Copy link</button>
    <button onClick={dismissNudge}><i className="ti ti-x" /></button>
  </div>
)}
```

**localStorage key**: `'portal-nudge-dismissed'` = `'true'`

---

## Animation

Lenis handles scroll. All entrance animations use CSS keyframes with custom easing.

| Name | Duration | Usage |
|---|---|---|
| `animate-fade-up` | `540ms var(--ease-out)` | Card/row entrance, staggered with `animate-delay-{1-4}` |
| `animate-fade-in` | `360ms var(--ease-out)` | Modals, dropdowns, empty states |
| `animate-pulse` | Tailwind default | Loading skeletons |
| `animate-pulse-glow` | `5.2s var(--ease-in-out) infinite` | DigestStrip unread indicator |

**Stagger delays**: `animate-delay-1` (80ms) through `animate-delay-4` (320ms). Pass via `className` prop from parent when mapping over lists.

Motion reduction: all keyframe animations are wrapped in `@media (prefers-reduced-motion: reduce)` — they collapse to `0.01ms` so content is still accessible.

---

## Dark mode note

Dark is the default and only mode at this stage. The `<html>` element has `class="dark"` set at load. Tailwind's `darkMode: 'class'` config is set but only dark classes are used — do not add light mode variants until Phase 4 explicitly enables them.

---

## Design Elevation Record

> **Current score: ~9/10.** All items below have been built. This section documents what was done and why — read before touching typography, motion, or interactive details.

---

### Built: 8 → 9 investments

#### DM Serif Display — display typeface with personality `[BUILT]`

DM Serif Display is loaded in `index.html` and registered as `--font-display` in `:root`. It appears in exactly two places:
- Dashboard greeting: `Good morning, Sean.` at `clamp(26px, 3.5vw, 36px)` weight 400
- ClientHeader hero `h1`: client name at `clamp(24px, 3.5vw, 36px)` with `letter-spacing: -0.02em`

The project name renders below in `text-sm` DM Sans so the two lines have clear typographic hierarchy.

**Rule**: `--font-display` at 28px+. DM Sans everywhere else. Non-negotiable.

---

#### Sticky task group headers `[BUILT]`

`.task-group-header` in `index.css` makes each group header sticky as the user scrolls through tasks. Uses `position: sticky; top: 0; z-index: 10` with `backdrop-filter: blur(12px)` and a semi-transparent `rgba(30,30,28,0.88)` background so content below bleeds through. Negative horizontal margins (`-24px`) give the header a full-width bleed against the constrained content column.

Effect: board with 40+ tasks reads as navigable chapters rather than an undifferentiated scroll.

---

#### Animated task done strikethrough `[BUILT]`

`.task-title-done` in `index.css` applies a CSS-animated strikethrough via `::after` pseudo-element (cannot animate `text-decoration: line-through` — it's non-interpolatable). The `@keyframes strike-through` animates `width` from `0` to `100%` in `280ms`. The checkbox also pops with a `@keyframes checkbox-pop` scale animation (`1 → 1.3 → 1`) detected by `prevDone` ref in `TaskRow.jsx`.

---

#### Client name as hero type in ClientHeader `[BUILT]`

The `h1` in `ClientHeader.jsx` uses `--font-display` at `clamp(24px, 3.5vw, 36px)` with `letter-spacing: -0.02em`. Project name is a separate `<p>` below in `text-sm` muted — this creates hierarchy and makes entering a client board feel immersive.

---

### Built: 9 → 10 investments

#### View Transitions API — page morphing `[BUILT]`

`ClientRow.jsx` wraps `navigate()` in `document.startViewTransition()` with a `flushSync` guard. The client avatar in `ClientRow` and `ClientHeader` both carry `viewTransitionName: \`client-avatar-${client.id}\`` — unique per client to satisfy the spec requirement. The browser interpolates position, size, and border-radius across the route change. CSS in `index.css` (`::view-transition-old(root)`, `::view-transition-new(root)`) controls the cross-fade.

Graceful degradation: `if (!document.startViewTransition)` guard ensures unsupported browsers get the hard cut.

---

#### Scroll-active group indicator `[BUILT]`

`TaskGroup.jsx` uses an `IntersectionObserver` on `headerRef` with `rootMargin: '-8% 0px -80% 0px'`. When a group header enters the active viewport band, `isActive` flips to `true`. The color dot responds: `transform: scale(1.25)` + `boxShadow: \`0 0 0 3px ${group.color}40\``. Combined with the sticky header, this creates a continuous "you are here" signal as the user scrolls.

---

#### Animated progress bars in ClientRow `[BUILT]`

`ClientRow.jsx` uses a `requestAnimationFrame` loop in `useEffect` to animate the progress bar from `0` to the actual completion percentage on mount. Makes progress feel earned rather than static — a detail no one names but everyone notices.

---

#### Browser theme-color matches client `[BUILT]`

`ClientBoard.jsx` sets `<meta name="theme-color">` dynamically to `client.color` on mount via `useEffect`. On unmount, resets to `#1E1E1C`. Browser chrome (mobile address bar, desktop tab strip in supported browsers) matches the client's brand.

---

#### `N` keyboard shortcut `[BUILT]`

- **Dashboard**: `N` opens the Add Client modal when focus is not on an input/textarea
- **ClientBoard**: `N` opens the new group form and focuses the group name input (50ms `setTimeout` to let form mount first)

Both use a shared pattern: keydown listener checks `active.tagName`, guards against `metaKey`/`ctrlKey`, and calls `e.preventDefault()`.

---

#### `⌘K` command palette `[BUILT]`

`src/components/shared/CommandPalette.jsx` — modal overlay with backdrop dismiss, search input, filtered results from `PLACEHOLDER_ITEMS`. Navigates to `/` (Go to dashboard) and `/settings` (Open settings). Two Phase 3 shells: "AI tools" and "Calendar integrations" with "Coming in Phase 3" hints.

Wired globally in `App.jsx`: `useEffect` keydown listener for `(e.metaKey || e.ctrlKey) && e.key === 'k'`, toggles `paletteOpen` state. Renders above all routes inside `<ToastProvider>`.

---

#### Smooth number transitions in StatsBar `[BUILT]`

`StatsBar.jsx` uses a `useCountUp(target, duration)` hook: `requestAnimationFrame` loop with cubic ease-out (`1 - Math.pow(1 - progress, 3)`). Each stat tile counts from `0` to its value over `650ms` on first load. Makes the numbers feel alive — data arrives, not appears.

---

### Remaining to reach 10/10

| Detail | Status | Notes |
|---|---|---|
| Focus-visible rings on brand green | Not built | Replace browser default outline with `box-shadow: 0 0 0 2px var(--color-brand-deep), 0 0 0 4px rgba(29,158,117,0.25)` on all inputs, buttons, and interactive elements |
| Animated progress fill on ClientRow load | Built | requestAnimationFrame from 0 to actual pct |
| ⌘K palette with real commands | Phase 3 | Currently a shell; wire to real navigation + AI actions in Phase 3 |
