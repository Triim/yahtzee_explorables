# Fix Prompt 01 — Yahtzee Explorable (for Claude Code)

> The first build is up at `localhost:5173` but the core mechanic is broken. Fix the problems below **in strict priority order**. Do **not** start a lower priority until the one above it is implemented and visually verified. The engine and the four spec docs are still the source of truth — don't change the math, fix the presentation.

## What's wrong right now (from the running build)

- The whole page is one long stack: the right column scrolls together with the left instead of staying put. The sticky stage isn't working.
- Every scene's model is rendered stacked down the page — they're all visible at once. There should be **one** model visible at a time.
- All the left-column text is shown at once. It should appear **progressively** as you scroll, so it reads like a step-by-step dialogue paced to the model.
- Dice look crude and there's no roll animation.
- Charts feel disconnected from the models they belong to.

---

## PRIORITY 1 — Rebuild the scrollytelling spine (foundation; nothing else until this is verified)

### Step 1.1 — Diagnose
Find why the right column isn't sticky. The usual causes, check all: (a) `overflow: hidden/auto/scroll` on `html`, `body`, or any ancestor between the page scroll and the sticky element — this silently kills `position: sticky`; (b) each scene renders its own right panel (so they stack) instead of a single shared stage; (c) the sticky element has no tall parent to travel within; (d) a fixed-height wrapper clipping the layout. Report what you found before changing code.

### Step 1.2 — Correct architecture
There is **one** layout for the whole article: a two-column grid. The **left** column is the full, normal-flow text track (all steps stacked, the page scrolls it). The **right** column is a **single sticky stage** that stays in the viewport and whose **content swaps** to the active scene's model. Scenes must **not** each mount their own right panel.

Reference skeleton (adapt names to the codebase):

```tsx
<div className="layout">
  <div className="track">
    {steps.map(s => (
      <section className="step" data-step-id={s.id} data-scene={s.scene}>
        {/* left-column copy + KaTeX */}
      </section>
    ))}
  </div>
  <aside className="stage">
    <ActiveSceneModel sceneId={activeScene} stepId={activeStep} />
  </aside>
</div>
```

```css
/* No ancestor (html, body, #root, .layout) may have overflow other than visible. The page itself scrolls. */
html, body, #root { overflow: visible; height: auto; }

.layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: clamp(24px, 5vw, 80px);
  align-items: start;
}
.stage {
  position: sticky;
  top: 0;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
.track > .step {
  min-height: 85vh;            /* each step holds the screen so its model gets time */
  display: flex;
  align-items: center;
  /* progressive reveal — see 1.4 */
}
```

The single `<ActiveSceneModel>` reads `activeScene`/`activeStep` from a context/store and renders only that scene's model.

### Step 1.3 — Scene/step activation (IntersectionObserver, no scroll-hijacking)
One `IntersectionObserver` watches every `.step`. Use a `rootMargin` that puts the trigger band near the vertical middle of the viewport (e.g. `-45% 0px -45% 0px`) so a step becomes "active" when it reaches center. On active-step change: update `activeStep`/`activeScene` and fire that step's directive (`activate` / `unlock` / `setState` / `showcase`) into the stage.

Clarification on the "no scroll-hijacking" rule: native scroll + `sticky` + IntersectionObserver is exactly right. `driven` scenes that **scrub a parameter from scroll progress** are also fine and expected — that is not hijacking. Hijacking (forbidden) means overriding scroll speed, snapping, or trapping the wheel. Don't do that; do bind parameters to scroll progress where the spec says `driven`.

### Step 1.4 — Progressive text reveal
Each `.step` starts hidden (`opacity: 0; transform: translateY(12px)`) and animates to visible when it enters the viewport. Keep already-read steps visible but slightly dimmed (`opacity: ~0.4`); keep upcoming steps hidden until reached. The active step is full-strength. This is what makes it read as a paced dialogue. Honor `prefers-reduced-motion` (no transform; instant or simple fade).

### Step 1.5 — Verify P1 (visual gate)
Scroll the page and confirm **all** of these, then report with a screenshot:
- Only the left text moves; the right stage stays fixed in the viewport.
- Exactly **one** model is shown at a time; it swaps at scene boundaries.
- Left text fades in step by step as you scroll, not all at once.
- The Scene 1 rolls-slider scrubs as you scroll through its `driven` step.
- No leftover stacked per-scene right panels anywhere on the page.

**Do not proceed to Priority 2 until every box above is true.**

---

## PRIORITY 2 — Dice quality and roll animation

### Step 2.1 — Redesign the `Die` component (clean SVG)
One crisp, theme-aware SVG die: rounded-square body, correct centered pip layouts for faces 1–6, consistent dimensions, subtle depth (soft shadow + faint inner highlight via tokens). Pips and body use the design tokens; it must look good in light and dark.

### Step 2.2 — Roll animation
On roll, play a ~500–700ms animation: the die rapidly cycles random faces with a small shake/scale/tilt, then eases to settle on the result. The result is decided up front by the engine — the animation is purely cosmetic over the honest outcome. Stagger multiple dice by ~60–100ms each. Honor `prefers-reduced-motion` (snap to result, no motion).

### Step 2.3 — `DiceSet` and holding
Consistent layout and sizing across all dice. Held dice are visually distinct (outline / slight lift / label). On reroll, only the non-held dice animate; held dice stay put.

### Step 2.4 — Verify P2
Rolling reads as a real roll; dice are crisp and uniform; held vs rerolled is obvious. Report with a short clip or screenshots.

---

## PRIORITY 3 — Chart ↔ model coordination

### Step 3.1 — One visual language
Shared design tokens and **one color per die face** used consistently across `Die`, `Histogram`, `Grid6x6`, and `CategoryProbBars`. Shared SVG scale/axis utilities, shared margins and type sizes, so a chart and its model look like one system, not two.

### Step 3.2 — Live binding
Charts update from the **same state** as their model, in real time: hold a die → the conditional distribution rerenders immediately; pick a sum → the 6×6 grid highlight and the histogram bar emphasize **together**; toggle one-roll/three-roll → the category bars animate to the new values. No stale or disconnected charts.

### Step 3.3 — Layout grouping
In `rich` scenes, the model and its chart stack inside the stage with shared width and alignment (one visual card), not floating apart.

### Step 3.4 — Verify P3
Interacting with any model visibly and instantly updates its linked chart; colors and scales match across model and chart. Report with screenshots.

---

## Working style

Fix P1 fully, show it, and wait for confirmation before P2; same for P3. Commit per priority. Don't touch `src/engine/`. Keep all locked constraints from `yahtzee-explorable-architecture.md` (hand-rolled SVG, in-memory state, desktop-first, KaTeX, three registers + integrity, `prefers-reduced-motion`). If something in the layout requires touching the Scene/Step contract, prefer fixing the contract once, cleanly, over per-scene patches.
