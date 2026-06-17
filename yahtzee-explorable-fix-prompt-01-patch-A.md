# Fix Prompt 01 — Patch A (completeness additions, for Claude Code)

> Read together with `yahtzee-explorable-fix-prompt-01.md`. These are clarifications and missing pieces that fix-01 under-specified. Each item is keyed to a fix-01 step and follows the same strict priority order (all of this is still Priority 1 unless noted).

---

## Critical — these could re-break the spine if missed

### ⟶ Patch to 1.4 — Progressive reveal must NOT change layout height
Implement the reveal with `opacity` and `transform` **only**. Never use `display:none`, `visibility:collapse`, conditional mount/unmount, or `height:0` for upcoming or past steps. Any of those change the document height, and the scroll / sticky / IntersectionObserver math collapses — this is the most likely way the first build broke and the easiest way to break it again. Every step stays mounted and occupies its full `min-height` at all times; only opacity/transform animate. **The total page height must be identical whether a step is revealed or not.**

### ⟶ New (applies to 1.2–1.3) — Stage state is a pure function of the active step (reversible)
The stage must derive its **entire** state from `(activeScene, activeStep)` idempotently — never from accumulated side effects. Scrolling up must visibly undo unlocks (a slider that appeared in a later step disappears when you scroll back above it); scrolling down re-applies them. Concretely: each scene model receives the active step id as a prop and computes which tools are unlocked and what `setState` is in effect **from that id alone**. Going forward to a step and then back must land on byte-identical state. No append-only unlock list, no one-way flags.

### ⟶ New (applies to 1.2) — Default state on load
On first paint (scroll at top) the stage shows the **Opening** scene (`Hero`), and the first step(s) are already visible without any scrolling. On mount/refresh, run the observer sync immediately so the active scene matches the restored scroll position — browsers restore scroll on refresh, and the stage must not be blank or show the wrong model.

---

## Important

### ⟶ Patch to 1.2 — Reading measure and column proportions
The text column needs a comfortable reading measure: cap line length around 60–66ch inside the track; don't let text stretch across a full half-screen on wide monitors. Suggested grid: text column `minmax(0, 38rem)` with an inner max-width, stage column `1fr`. Add a desktop breakpoint (~1024px) below which the mobile stub overlay shows — two equal cramped columns around 1000px are unusable.

### ⟶ Patch to 1.2 / 1.3 — Smooth stage swap
When the active **scene** changes, crossfade the stage content (~200–300ms) rather than hard-cutting; don't unmount/remount in a way that flashes or resets an in-progress animation. **Within** a scene the model stays mounted across all its steps — only directives fire; there is no swap between steps of the same scene.

### ⟶ Patch to 1.3 — `driven` progress definition
For a `driven` step, define progress `p ∈ [0,1]` as how far that step has travelled through the viewport's center band, clamped and monotonic — e.g. `p = clamp((viewportCenter − stepTop) / stepHeight, 0, 1)`. Bind the scrubbed parameter (e.g. the rolls count in Scene 1) to `p` smoothly, and make sure `p=0` and `p=1` are reachable and stable at the edges with no jump.

### ⟶ New (applies to 1.2 + perf) — Mount/compute discipline
Only the active scene's model is mounted in the stage; previous ones unmount (or keep a tiny ±1 pool). Inactive scenes must not compute: the Monte Carlo worker runs only while Scene 8 is active; the DP oracle loads lazily right before Scene 7; idle scenes hold no timers or animation loops. This also guarantees the "one model at a time" invariant structurally.

---

## Verification additions (extend the 1.5 gate)

Add these to the Priority 1 visual gate; all must pass before Priority 2:
- Scroll **up** through an unlock: the unlocked tool disappears; scroll back down: it returns. State is reversible.
- **Refresh mid-article:** the correct scene is active immediately — no blank stage, no wrong model.
- The scrollbar length does **not** change as steps reveal or hide (proves the layout-height rule).
- `prefers-reduced-motion` on: reveals and rolls are instant; nothing is permanently hidden.
- KaTeX renders correctly even in steps that start faded (render on mount, not gated on opacity).

---

## Accessibility note (applies across Priority 1)

Because steps stay in the DOM (faded, not removed), screen readers can read ahead — that's acceptable and intended. Don't trap focus, and don't steal focus on scroll when a scene unlocks a control. Every control stays keyboard-reachable regardless of reveal state.
