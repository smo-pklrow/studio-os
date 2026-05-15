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

## Design Elevation Roadmap

> Current score: **~7.5–8/10**. This section documents what it would take to reach 9 and 10. These are not Phase 2 items — they are deliberate craft investments for when the product is stable and the design deserves its final form. Read before touching typography or motion.

---

### From 8 → 9: Exceptional

A 9/10 design has at least one moment that stops someone mid-scroll. Typography gasps. Every interaction feels considered. The score gap between 8 and 9 is not incremental — it requires three deliberate investments.

---

#### 1. Display typeface with personality

**The problem**: DM Sans is an excellent body/UI typeface — legible, neutral, professional. That neutrality is also its weakness. It has no signature. The dashboard greeting (`Good morning, Sean.`) is the app's biggest typographic moment and it reads like system UI.

**The fix**: Introduce a second typeface, used exclusively at display scale. Not everywhere — just:
- The dashboard greeting (`Good morning, Sean.`)
- The client name in `ClientHeader` (`h1` — currently DM Sans 500)
- Optional: client names in `ClientRow` at some future larger scale

**Recommended options** (free via Google Fonts, no CDN change required):

| Font | Character | Best for |
|---|---|---|
| **Instrument Serif** | Elegant, editorial, slightly literary | "Studio OS is a thinking tool for creative professionals" |
| **Fraunces** | Optical-size variable, soft serifs, warm | A tool with personality and a point of view |
| **Playfair Display** | High-contrast, classical, confident | Makes headlines feel important and permanent |
| **DM Serif Display** | Sister font to DM Sans — same DNA, serif drama | Easiest pairing: zero tonal mismatch, immediate contrast |

**Recommendation: DM Serif Display** — it was designed to pair with DM Sans (same family by Colophon Foundry via Google). The contrast between the two creates the typographic architecture the app needs with zero risk of aesthetic mismatch.

**Implementation**:
```html
<!-- Add to index.html alongside DM Sans -->
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet" />
```

```css
/* Add to :root in index.css */
--font-display: 'DM Serif Display', Georgia, serif;
```

```jsx
/* Dashboard greeting — change from font-medium to display font */
<h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: 400 }}>
  Good morning, Sean.
</h1>

/* ClientHeader h1 — same treatment */
<h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 400 }}>
  {client.name}
</h1>
```

**The rule**: Display font at 28px+, DM Sans everywhere else. No exceptions. Do not use the display font for body text, badges, or UI labels.

---

#### 2. Signature scroll moment on the Client Board

**The problem**: The task board loads all groups simultaneously. Scrolling through it feels like scrolling through a spreadsheet — content flows but nothing *tells a story*. There is no moment where the studio owner feels like the tool understands their work.

**The signature moment**: A **sticky group header** that pins each `TaskGroup` name as you scroll through its tasks, releasing only when the next group takes over. This is the equivalent of a chapter marker in a book — it tells you exactly where you are in the project without looking up.

**How to build it**:
```css
/* In index.css — make group header sticky */
.task-group-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: var(--color-bg);
  /* subtle backdrop blur for depth */
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  background-color: rgba(30, 30, 28, 0.85);
  padding-top: 8px;
  padding-bottom: 8px;
  margin-left: -24px;
  margin-right: -24px;
  padding-left: 24px;
  padding-right: 24px;
}
```

Apply `.task-group-header` to the group header `div` in `TaskGroup.jsx`. As the user scrolls, each group name sticks at the top of the viewport until the next group pushes it off. At scale, this makes a board with 40+ tasks feel navigable and intentional rather than overwhelming.

**Secondary moment — task row micro-animation**: When a task is marked done (checkbox click), the title should gain `line-through` with a left-to-right strikethrough animation rather than an instant toggle:

```css
.task-done-strike {
  position: relative;
}
.task-done-strike::after {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  height: 1px;
  background-color: var(--color-subtle);
  width: 0;
  animation: strike-through 300ms var(--ease-out) forwards;
}
@keyframes strike-through {
  to { width: 100%; }
}
```

This is the kind of micro-detail that makes task completion feel *satisfying* — the UI confirms the action in a way that's proportional to the effort it took.

---

#### 3. Viewport-filling client name on the Client Board header

**The problem**: `ClientHeader` shows the client name at 21px DM Sans. For a tool where each client is a world unto itself, that entry moment should feel like walking into a room. The client board is the studio owner's dedicated space for that client — it should feel immersive.

**The fix**: On `ClientBoard`, treat the client name as the hero typographic element. Increase it significantly:

```jsx
/* ClientHeader h1 — current */
<h1 className="text-dark-text font-medium text-xl leading-tight truncate">
  {client.name}{client.project_name && ` — ${client.project_name}`}
</h1>

/* ClientHeader h1 — 9/10 treatment */
<h1
  className="leading-none truncate"
  style={{
    fontFamily: 'var(--font-display)',
    fontSize: 'clamp(26px, 4vw, 40px)',
    fontWeight: 400,
    letterSpacing: '-0.02em',
    color: 'var(--color-text)',
  }}
>
  {client.name}
</h1>
{client.project_name && (
  <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
    {client.project_name}
  </p>
)}
```

This separates the client identity from the project context, creates a clear typographic hierarchy, and makes the moment of opening a client feel significant rather than navigational.

---

### From 9 → 10: World-class

A 10/10 design would be submitted to Awwwards. It requires three things that no amount of small improvements can substitute: **page transitions**, **choreographed identity**, and **a detail layer so considered it rewards zooming in**. These are major investments — each is a multi-day build.

---

#### 1. Page transitions with continuity

**The problem**: Dashboard → Client Board → Task Detail are hard cuts. The router swaps pages instantly. At 9/10 this is acceptable. At 10/10 it breaks the illusion that this is one coherent space.

**The fix**: Shared-element transitions using the [View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API), now available in all major browsers (Chrome 111+, Safari 18+, Firefox 130+). No library required.

```css
/* Assign a view-transition-name to the client card avatar */
.client-card-avatar {
  view-transition-name: client-avatar; /* must be unique per element */
}

/* The same element in ClientHeader gets the same name */
.client-header-avatar {
  view-transition-name: client-avatar;
}
```

```js
/* Wrap navigation in startViewTransition */
import { flushSync } from 'react-dom'

function navigateToClient(id) {
  if (!document.startViewTransition) {
    navigate(`/client/${id}`)
    return
  }
  document.startViewTransition(() => {
    flushSync(() => navigate(`/client/${id}`))
  })
}
```

With this, the client avatar on the dashboard card morphs into the avatar in the client header when you click through. The browser interpolates position, size, and border-radius automatically. The result reads as a single continuous space, not two separate pages.

**Fallback**: The `if (!document.startViewTransition)` guard ensures graceful degradation in unsupported browsers — they get the current hard cut.

---

#### 2. Scroll-driven task board choreography

**The problem**: Even with Lenis installed, the client board is static. Content exists; it doesn't *move*. A 10/10 board uses scroll position to create depth, not just reveal.

**The technique**: Intersection Observer on task group headers that triggers a subtle color shift on the active group's color dot — signaling "you are here" as the user scrolls. Combined with the sticky header from the 9/10 section, this creates a reading experience where the UI actively narrates the user's position in the project.

```js
// In TaskGroup.jsx — observe the group header
useEffect(() => {
  const observer = new IntersectionObserver(
    ([entry]) => setIsActive(entry.isIntersecting),
    { rootMargin: '-10% 0px -85% 0px' } // active when header is near top of viewport
  )
  if (headerRef.current) observer.observe(headerRef.current)
  return () => observer.disconnect()
}, [])
```

```jsx
/* Color dot — pulses when group is in active viewport zone */
<button
  className="w-2.5 h-2.5 rounded-full transition-all duration-300"
  style={{
    backgroundColor: group.color,
    boxShadow: isActive ? `0 0 0 3px ${group.color}33` : 'none',
    transform: isActive ? 'scale(1.25)' : 'scale(1)',
  }}
/>
```

---

#### 3. The detail layer

The gap between 9 and 10 is lived in the details no one explicitly notices but everyone subconsciously feels. Each of the following is small individually; collectively they represent a design at full attention:

| Detail | Where | How |
|---|---|---|
| **Animated progress fill on load** | `ClientRow` progress bar | CSS `@keyframes` that animates width from `0` to the actual value on mount — makes progress feel earned, not static |
| **Checkbox satisfaction animation** | `TaskRow` done toggle | Scale pulse (`1 → 1.2 → 1`) + color fill transition over `240ms` when checking a task done |
| **Client color in browser tab** | `ClientBoard` page | Set `<meta name="theme-color">` dynamically to `client.color` on mount — the browser chrome matches the client's brand |
| **Keyboard shortcut `N`** | `Dashboard`, `ClientBoard` | Press `N` to open the "New client" / "New task" modal — signals this is a power tool, not a passive viewer |
| **`⌘K` command palette shell** | Global | A Phase 3 item but the shell (empty command palette that opens on `⌘K`) signals intent and makes the app feel like professional software |
| **Focus-visible rings on brand** | All inputs | Replace the default browser outline with `box-shadow: 0 0 0 2px var(--color-brand-deep), 0 0 0 4px rgba(29,158,117,0.25)` — already in CSS tokens, verify it applies universally |
| **Smooth number transitions in StatsBar** | `StatsBar` | Animate stat numbers counting up from 0 to their value on first load using a simple `requestAnimationFrame` counter — makes data feel alive |

---

### Summary

| Score | Key investments |
|---|---|
| **8/10** (current) | Lenis scroll, client color accent, staggered reveals, greeting scale, portal nudge |
| **9/10** | DM Serif Display for display moments, sticky group headers, task done strikethrough animation, client name as hero type |
| **10/10** | View Transitions API page morphing, scroll-active group indicator, animated progress bars, browser theme-color, `⌘K` shell, number transitions in StatsBar |

**When to build 9**: When Phase 3 (AI panel, calendar, digest) is complete and the product is being used daily. Polish at this level is most impactful when the feature set is stable — premature polish gets thrown away when layouts change.

**When to build 10**: When preparing for a public launch, a design award submission, or a major client pitch. The 10/10 layer is what makes someone share the app unprompted.
