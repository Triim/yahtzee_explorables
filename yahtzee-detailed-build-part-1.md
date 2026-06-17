# Detailed Build — Part 1 (for Claude Code)

> Follow this **exactly**. Do not infer, redesign, or "improve" beyond what's written. Build each lettered section, run it, and verify its acceptance line before the next. Do **not** touch `src/engine/`. This is one of a series — Parts 2+ will spec the remaining models one at a time in this same granular format. Build and verify all of Part 1 before asking for Part 2.

---

## A. Restore the right column (it is currently blank — fix first)

The right panel renders nothing right now. Diagnose and fix in this order:

1. Open the stage component (the single sticky right panel). Confirm it renders the **active scene's model** via an explicit registry. If there's no registry, create one: a plain object mapping each scene id to its model component:
   ```ts
   const SCENE_MODELS: Record<string, React.FC<SceneModelProps>> = {
     opening: HeroModel,
     'scene-0': IntuitionModel,
     'scene-0_5': CoinsModel,
     'scene-1': OneDieModel,
     // …one entry per scene id used in the step data
   };
   ```
2. In the stage, look up `SCENE_MODELS[activeScene]`. If it's `undefined`, render a visible fallback box that prints the missing scene id (so a missing mapping is obvious, never blank).
3. Wrap the rendered model in a React **error boundary** that, on a thrown error, shows a visible red fallback with the error message — not a blank panel. A throwing model must never silently disappear.
4. Open the browser console and fix every error that appears on load and on scroll.

**Acceptance A:** scroll the whole article; the right panel **always shows something** (a model or a labeled fallback), never blank. No console errors.

---

## B. The `Die` component — exact spec

Create/replace `src/components/Die.tsx`. This is reused everywhere; get it right.

**Props:**
```ts
interface DieProps {
  value: 1|2|3|4|5|6;
  size?: number;      // px, default 64
  held?: boolean;     // default false
  rolling?: boolean;  // default false (drives animation, see C)
  onClick?: () => void;
}
```

**SVG geometry** (viewBox `0 0 100 100`, scaled to `size`):
- Body: `<rect x="6" y="6" width="88" height="88" rx="18" />`, fill `var(--die-face)`, stroke `var(--die-edge)`, stroke-width `2`.
- Pips: circles, radius `8`, fill `var(--die-pip)`. Pip center coordinates on a fixed 3×3 grid:
  - `TL=(28,28) TR=(72,28) ML=(28,50) MR=(72,50) BL=(28,72) BR=(72,72) C=(50,50)`
- Pips shown per face value:
  - `1 → [C]`
  - `2 → [TL, BR]`
  - `3 → [TL, C, BR]`
  - `4 → [TL, TR, BL, BR]`
  - `5 → [TL, TR, C, BL, BR]`
  - `6 → [TL, TR, ML, MR, BL, BR]`

**Tokens** (add to the stylesheet if missing): `--die-face` (near-white in light, dark surface in dark), `--die-edge` (subtle border), `--die-pip` (near-black in light, near-white in dark), `--accent`.

**Held state:** when `held`, draw a second rounded-rect outline 3px outside the body in `var(--accent)`, and translate the die up by `-4px`. Add `cursor:pointer` when `onClick` is set.

**Acceptance B:** a temporary gallery route renders dice 1–6 at size 64; all pip layouts are correct; held vs not is obvious; looks right in light and dark.

---

## C. Die roll animation — exact

The roll must **feel** like a roll. The engine decides the honest result first; the animation plays over it.

1. **Face cycling (JS):** when a roll starts, set `rolling=true`. For the first **420ms**, every **60ms** set the die's displayed face to a random 1–6 (≈7 swaps). At **420ms**, set the displayed face to the **final engine result** and set `rolling=false`.
2. **Motion (CSS):** while `rolling`, apply class `die--rolling`; on settle apply `die--settle` for 180ms.
   ```css
   @keyframes dieShake {
     0%   { transform: translateY(0) rotate(-8deg) scale(1); }
     50%  { transform: translateY(-6px) rotate(8deg) scale(1.08); }
     100% { transform: translateY(0) rotate(-6deg) scale(1.06); }
   }
   @keyframes dieSettle {
     0%   { transform: scale(1.08) rotate(4deg); }
     60%  { transform: scale(0.96) rotate(0deg); }
     100% { transform: scale(1) rotate(0deg); }
   }
   .die--rolling { animation: dieShake 140ms ease-in-out infinite; }
   .die--settle  { animation: dieSettle 180ms ease-out; }
   ```
3. **Stagger:** in a `DiceSet`, start die `i`'s roll at `i * 70ms` so they don't move in lockstep.
4. **Reduced motion:** if `matchMedia('(prefers-reduced-motion: reduce)').matches`, skip steps 1–2 entirely — set the final face immediately, no classes.

Put the timing logic in a small hook `useDieRoll(finalValue)` returning `{ displayValue, rolling, start() }`. `RollButton`/`DiceSet` call `start()` on click after the engine produces the result.

**Acceptance C:** clicking Roll produces a visible tumble that settles on the result; multiple dice stagger; reduced-motion snaps with no motion.

---

## D. Scene 1 model — fully wired (this is the TEMPLATE every other scene copies)

Create `src/scenes/OneDieModel.tsx`. It receives the active step id and derives **everything** from it (reversible — scrolling up undoes unlocks).

**State shape:**
```ts
interface OneDieState {
  rolls: number[];          // each entry is a face 1..6, in order rolled
  // derived: counts[1..6] from rolls
  forcedSequence?: number[];// set when the prediction step is active (staged "five sixes")
}
```
Tools visible are a pure function of the active step:
```ts
function toolsFor(stepId: string) {
  return {
    showSlider: ['S1.4','S1.5'].includes(stepId),       // rolls slider
    showPrediction: ['S1.6','S1.7'].includes(stepId),   // staged five-sixes + predict
  };
}
```

**Layout (top to bottom in the sticky stage):**
1. The `Die` (size 80), showing the most recent roll (or a resting face before any roll).
2. A `RollButton` labeled "Roll" — disabled while `showSlider` is true.
3. A **histogram** of face counts (see spec below). It starts **empty** and **grows one bar-step per roll**.
4. When `showSlider`: a slider `10 → 1000 → 100000` (log steps). Dragging sets `rolls` to a sampled distribution of that size (use the engine for sampling) and the histogram morphs toward flat; draw a horizontal dashed line at the 1/6 frequency that fades in here. The button hides.
5. When `showPrediction`: set `forcedSequence` so the die shows a sixth six (staged setup, clearly the result of a streak), show three buttons "1–5 / 6 / can't tell"; after the user picks, do **one honest engine roll** and reveal it. Never fake this roll.

**Histogram spec** (hand-rolled SVG, `viewBox 0 0 300 160`):
- 6 bars, one per face, x positions evenly spaced, width ~36, baseline y=140.
- Bar height = `count[face] / maxCount * 120`; animate height changes with a 200ms transition.
- Bar fill = one color per face from a shared `FACE_COLORS[1..6]` array (define once in tokens; reused by every chart).
- X labels 1–6 under the baseline; small y label "frequency".
- New bars/growth animate from the baseline up.

**Step→behavior mapping (exact):**
- `S1.1` (active): Die + Roll visible, histogram empty. User rolls (cap at 10 rolls — disable Roll after 10).
- `S1.2`: no model change (text defines sample space).
- `S1.3`: no model change (text poses the "too few?" question over whatever the user rolled).
- `S1.4`: slider appears, Roll hides.
- `S1.5`: 1/6 dashed line fades in over the (now flatter) histogram.
- `S1.6`: prediction UI appears with the staged streak.
- `S1.7`: after the honest roll, text lands; model holds the result.
- `S1.8`: no model change.

**Coupling rule (do not violate):** this model shows **no narrative sentences** — only the Die, the button(s), the histogram with axis labels, the slider, and the prediction buttons. All prose is the left column.

**Acceptance D (the "one story" test for Scene 1):**
- On `S1.1` the histogram is empty and fills as the user rolls (max 10).
- Scrolling to `S1.4` shows the slider and hides Roll; scrolling back to `S1.1` hides the slider again (reversible).
- The 1/6 line appears only at `S1.5`.
- The prediction roll at `S1.6/7` is a real engine roll.
- No prose text anywhere inside the right panel.

---

## Build order & reporting

Do A → B → C → D in order. After each, run the app and state how its acceptance line was met (screenshot for B, C, D). Commit after each section. When all four acceptances pass, stop and report — the next prompt will spec the Coins and Two-dice models in this same format.
