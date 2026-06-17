# Build Prompt — Yahtzee Explorable (for Claude Code)

> **How to use:** Place this file together with `yahtzee-explorable-skeleton.md`, `yahtzee-explorable-article-text-en.md`, `yahtzee-explorable-spec.md`, and `yahtzee-explorable-architecture.md` in an empty repo, open it in VS Code, and give Claude Code this prompt as the initial instruction. Work through the steps in order; treat each step's "Done when" as a gate before moving on.

---

## What you're building

An interactive **explorable explanation** about the dice game Yahtzee: a scrollytelling longread where the **left column scrolls** (short text) and a **sticky right panel** holds interactive models that change as the reader scrolls. The article uses the game as a narrative to walk the reader from school-level probability up to dynamic programming and decision theory. It is desktop-first.

**Read these four documents first; they are the source of truth and they agree with each other:**
- `yahtzee-explorable-skeleton.md` — structure, the math vertical, scene map, registers, exact numbers, build phases. **Authoritative on structure.**
- `yahtzee-explorable-article-text-en.md` — the exact reader-facing left-column copy, scene by scene, with step ids, registers, and right-panel directives. **Authoritative on copy and step wiring.**
- `yahtzee-explorable-spec.md` — per-scene model behavior, component vocabulary, unlocks, transitions. **Authoritative on what each model does.** (Note: copy in this file is the older Russian draft; use the EN article-text file for actual text.)
- `yahtzee-explorable-architecture.md` — stack, layer split, Scene/Step contract, oracle, worker, layout. **Authoritative on technical approach.**

Do not invent structure or numbers — pull them from these docs. Specific values to honor exactly: 252 distinct rolls, 462 keeper sets, 1680 per-turn states, 786,432 → 310,656 score states, optimal expected score ≈ 254.589, theoretical maximum 1575 = 140 + 50 + 1200 + 185, upper bonus +35 at 63, Yahtzee bonus +100 each.

---

## Non-negotiable constraints

1. **Stack:** Vite + React + TypeScript. Minimal CSS with CSS variables for tokens — no heavy UI framework.
2. **No scroll-hijacking.** Native scroll + `position: sticky` for the right panel. Scene changes driven by `IntersectionObserver` on text steps.
3. **Hand-rolled SVG only** for all visuals (dice, histograms, grid, state graph, charts, cone). No chart libraries (no recharts/chart.js). `d3-scale` is allowed for scale math only; rendering stays hand-written SVG.
4. **Hard split: engine vs presentation.** `src/engine/` is pure TypeScript, no React/DOM imports. Same engine code runs in the worker and the offline build script.
5. **DP is precomputed offline** by a Node build script → shipped as a data table (the "oracle"). At runtime you only look it up; never solve DP in the browser on the fly.
6. **Monte Carlo runs in a web worker** so scrolling never blocks.
7. **Desktop-first.** Below a breakpoint, show a stub overlay ("open on a computer"); do not build a real mobile layout.
8. **Minimalist, clean visual tone:** generous whitespace, one accent color, one clean type style, unified SVG line/fill language, restrained motion. Dark theme via CSS variables.
9. **KaTeX** for all formulas (LaTeX in the copy).
10. **Three interaction registers** per the docs — `free` (honest play), `driven` (scroll scrubs a parameter), `showcase` (staged demo, clearly labeled, never a rigged "you rolled this"). The integrity rule is a requirement: an honest roll is always honest.
11. **State is in-memory** (React state/context). No `localStorage`/`sessionStorage`.

---

## Steps

### Step 0 — Orient
Read all four docs end to end. Produce a short written plan: the component list (from the spec's vocabulary), the engine module list, and the phase order. Flag any contradiction you find before writing code.
**Done when:** you've posted the plan and confirmed the four numbers above appear in your plan as test anchors.

### Step 1 — Project setup (VS Code)
Scaffold a Vite React-TS project. Add dependencies: `katex`, `vitest` (+ jsdom), and optionally `d3-scale`. Set up the folder structure from the architecture doc (`engine/`, `worker/`, `scenes/`, `components/`, `scaffolding/`, `state/`, `styles/`, `data/`). Configure path aliases, a base `tsconfig`, ESLint/Prettier, and confirm the dev server runs with a placeholder page.
**Done when:** `npm run dev` serves a blank styled shell and `npm run test` runs (even with zero tests).

### Step 2 — Layout shell + Scene/Step scaffolding
Build the two-column layout: scrolling left column, sticky right panel, plus the `rich` variant (model + linked chart stacked in the right column). Implement the typed `Scene`/`Step`/`Directive`/`Register` contract from the architecture doc and a single `IntersectionObserver` hook that tracks the active step and fires its directive (`activate` / `unlock` / `setState` / `showcase`). Add the mobile stub overlay. Define the design tokens (CSS variables: bg, text, border, one accent; spacing; type scale) and wire KaTeX rendering for formula steps.
**Done when:** a throwaway 3-step demo scene swaps the right panel on scroll with native scrolling, no hijacking, and a formula renders.

### Step 3 — Math engine (pure TS, built to the end-state)
Implement `engine/` modules: `outcomes`, `distributions` (incl. binomial + normal overlay params), `combinatorics` (252 multisets, 462 keeper sets), `conditional` (reroll distribution + the `keep[K]` recurrence), `scoring` (all 13 categories as predicates, upper/Yahtzee bonuses, `score = f(hand)`), `ev`, and `types`. Design `State` for the full game now (don't let early scenes shape it). Keep it React-free.
**Done when:** unit tests pass for the anchors: 252 multisets, sum-distribution of two dice (7 → 6/36), and a couple of category probabilities.

### Step 4 — DP oracle (offline build script)
Write a Node script that uses `engine/` to solve the game by backward induction (cold node = weighted sum, hot node = max), reducing score states (786,432 → 310,656) and using the keeper/roll DP recurrences from the architecture doc. Emit a compact data file to `src/data/`. **Verify the optimal expected score ≈ 254.589** as a correctness gate. If the full table is too large to ship to the browser, emit a reduced oracle covering only the states the demonstration scenes (7–10) need, and document the cutoff.
**Done when:** the script reproduces ≈ 254.589 and writes a loadable oracle; runtime can look up `V`/policy for a state.

### Step 5 — Monte Carlo worker
Implement `montecarlo.worker.ts` importing `engine/`. It plays N games for a given policy/role and streams back final-score histograms and `(μ, σ)` signatures without blocking the UI.
**Done when:** the worker runs thousands of games off the main thread and a test harness shows a converging mean (LLN sanity check).

### Step 6 — Shared SVG component kit
Build the reusable hand-rolled SVG widgets from the vocabulary, in one visual language: `Die`, `RollButton`, `DiceSet`, `Histogram`, `RollsSlider`, `Grid6x6`, `UnorderedToggle`, `StateCounter`, `CategoryProbBars`, `RollModeToggle`, `HoldReroll`, `ConditionalDist`, `ScoreReadout`, `EVReadout`, `Scorecard`, `BonusTracker`, `StateGraph` (cold/hot nodes), `ValuePanel`, `ScoreHistogram` (+`NormalOverlay`, +`TailMarker`), `WinRegionChart`, `PredictionCone`, `Hero`, plus the panel-level `RolesPanel`, `ChampionshipRunner`, `OpponentPanel`, `ObjectiveToggle`, `ShowcasePlayer`, `AdaptiveHUD`, `IntuitionNotebook`. Each is theme-aware and accessible (`role="img"`, `title`/`desc`; real `<button>`s).
**Done when:** a component gallery page renders every widget in light and dark themes.

### Step 7 — Phase 1 scenes (Opening, 0, 0.5, 1, 2, 3, 3.5, 4, 5)
Assemble the first scenes: wire each step's copy (from the EN article-text file) to its directive and the right-panel model. This is the releasable minimum: one-die LLN, two-dice combinatorics, five-dice state, combinations zoo, reroll/conditional, scoring/EV. Honor the pose-before-tell rhythm (question step → interaction → definition step).
**Done when:** you can scroll Opening → Scene 5 end to end; every `free` interaction is honest; the `driven` slider in Scene 1 scrubs on scroll.

### Step 8 — Phase 2 scenes (6, 7)
Full turn with `Scorecard`/`BonusTracker` and a demonstrated greedy-loses-the-bonus case; the `StateGraph` with cold/hot nodes, the driven backward-induction reveal, and `ValuePanel` reading the oracle. Surface ≈ 254.6 from the oracle, not a hardcoded guess.
**Done when:** Scene 7's value panel reads real oracle values and the cold/hot node distinction is visually clear.

### Step 9 — Phase 3 scenes (8, 9, 10)
Roles + `ChampionshipRunner` (worker-driven Monte Carlo) → `ScoreHistogram` with `NormalOverlay` and the real heavy `TailMarker`; the `showcase(13xYahtzee)` run to 1575 (clearly labeled as a demo, no fake roll button); the opponent scene with `ObjectiveToggle`, `WinRegionChart`, and the `PredictionCone` (spread ∝ √(turns left)); the adaptive HUD finale with live cone + win-region per move; and the honest capstone copy.
**Done when:** the championship renders converging histograms, the 1575 showcase is unmistakably a demonstration, and the objective toggle visibly changes the recommended move.

### Step 10 — Content + formula integration pass
Confirm every step from the EN article-text file is present, in order, with the correct register and directive, and that formulas render via KaTeX exactly where marked. Verify the cross-scene callbacks fire (intuition guesses recalled; LLN→Monte Carlo; state→V; frequency↔counted probability; bonus→tail→1575).
**Done when:** a full read-through matches the article-text file step for step.

### Step 11 — Registers + integrity pass
Audit every interaction: `free` results are real and unmanipulated; `driven` panels disable free input and bind to scroll progress; `showcase` is visually and textually fenced off ("demonstration") with no roll-imitating control. Confirm the Scene 1 "six sixes then predict" beat stages the setup but rolls the prediction honestly.
**Done when:** no scene presents a staged outcome as the user's own roll.

### Step 12 — Performance pass
Mount/compute only the active scene; pause or unmount others. Lazy-load the oracle before Scene 7. Keep all Monte Carlo in the worker and render results progressively. Memoize pure engine computations by input. Confirm scrolling stays smooth with the oracle loaded and a championship running.
**Done when:** no main-thread jank on scroll while a tournament runs.

### Step 13 — Accessibility + responsiveness pass
Native scroll/sticky verified with keyboard and screen reader; every SVG has `title`/`desc`; controls are real elements; focus order is sane. The mobile stub appears below the breakpoint.
**Done when:** keyboard-only navigation works and the mobile stub shows on a narrow viewport.

### Step 14 — Testing & debugging
Engine unit tests (vitest) against the anchors: 252 multisets; two-dice sum distribution; representative category probabilities (one-roll vs best-of-three); oracle ≈ 254.589; max-score construction = 1575; bonus thresholds. Add a Monte Carlo convergence test. Then manual QA per scene: scroll-trigger boundaries, directive firing, formula rendering, theme switching, and a numbers cross-check against the four docs. Run `npm run build` and fix type/build errors.
**Done when:** all unit tests pass, the production build succeeds, and every documented number matches what the app shows.

### Step 15 — Final verification checklist
Confirm none of the tech inverses were violated: no scroll-hijacking; no chart library; no on-the-fly browser DP; no faked showcase rolls; no real mobile layout; no browser storage; engine has zero React imports. Produce a short report of what's implemented per scene and any reduced-oracle cutoff taken in Step 4.
**Done when:** the checklist is clean and the report is written.

---

## Working style

Build incrementally and commit per phase (Phase 1 / 2 / 3). After each step, briefly state what you did and how the "Done when" was met. Keep the engine pure and the four anchor numbers as your correctness compass — if any of them drifts, stop and debug before continuing. If a doc is ambiguous, prefer the skeleton for structure, the article-text-en file for copy, the spec for model behavior, and the architecture file for technique; ask only if they genuinely conflict.
