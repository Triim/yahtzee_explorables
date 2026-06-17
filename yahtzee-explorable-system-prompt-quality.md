# System Prompt — Global Quality & Coordination Pass (Yahtzee Explorable, for Claude Code)

> The structural spine (sticky stage, scene swap) is mostly working now. The problem is deeper and it is the whole point of the project: **the left text and the right models are living in separate worlds.** This pass fixes that and raises the quality bar across the board. Keep `yahtzee-explorable-fix-prompt-01.md` + `…-patch-A.md` satisfied (if any spine item regressed, fix it first), then apply everything below. Work **scene by scene**, and pass each scene's "one story" test before moving on. The four spec docs remain authoritative.

---

## Why the current build feels wrong (read this first)

From the running build: the models on the right carry their own narrative captions ("A single die. Roll it.", "4 heads, 1 tails", "Expected distribution"), which duplicate and compete with the left column — so the left text reads as decoration. Charts appear fully formed before the reader has done anything. Models don't gain complexity as you scroll. The left text and right model never refer to the same live thing. **An explorable lives or dies on text↔model coupling, and right now there is none.** Everything below exists to fix that.

---

## LAW 1 — One shared state; text narrates it; the model is a manipulable view of it

For each scene there is **one shared state object**. The left column is the *narration* of that state. The right model is a *manipulable view* of that same state. They are never two parallel things — they are one thing seen two ways.

Consequences, all required:
- **Models carry no narrative prose.** Strip every sentence-like caption from the right panel ("A single die. Roll it.", "Heads or tails…", etc.). The right panel keeps only **functional micro-labels**: axis labels, button labels, numeric readouts, a value like "4 heads". Narration is the left column's job, exclusively.
- **The text refers to what the model currently shows.** When a step says "those ten rolls came out uneven," the model is visibly in a ten-roll, uneven state at that moment. When a step asks "which sum is more common?", the model presents exactly the affordance to find out — nothing more, nothing less.
- **Acting on the model is part of reading.** The reader rolls / holds / toggles, and the very next text block is the comment on what they just saw. By the time a definition appears, the interaction that earns it has already happened.

## LAW 2 — Progressive construction: build from actions, never dump

Nothing appears fully formed. Everything is constructed in front of the reader.
- **Empirical charts accumulate from the reader's actions.** A histogram grows one outcome at a time as they roll/toss. It starts empty (or near-empty), not pre-filled. (Screen 2's binomial bell must not exist before the reader has tossed.)
- **Theoretical overlays appear only when earned.** The smooth/expected curve (e.g. the binomial shape, the 1/6 line, the normal bell) fades in only on the text step that introduces it — drawn *over* the accumulated empirical bars so the reader sees measured meeting predicted.
- **Tools unlock one per step.** At a scene's start only its base affordance exists. Each later step adds exactly one new control (slider, grid, toggle, EV readout), animating in, matched to the text that introduces it. Reaching the step is what reveals the tool; scrolling back hides it again (reversible, per patch-A).

## LAW 3 — Models gain complexity through the scene

Within a scene the model must visibly *complicate* as the reader scrolls, mirroring the math getting harder. Use the per-scene progression below. If a model shows all its controls and charts at once, it's wrong.

---

## Per-scene coordination & progression

For each scene: **base** = what exists at the first step; **unlocks** = added per later step; **builds from** = what the chart accumulates from. (Copy is in `…-article-text-en.md`; here is how the model must behave.)

- **Opening (`Hero`).** Base: one die you can roll, tactile, **no caption**, no chart. It exists only to let the reader feel a roll. The left text carries all meaning. (Fix the current mismatch: remove "A single die. Roll it." and let the Hero be silent.)
- **Scene 0 (Intuition).** The three questions live in the **left column** with inline answer chips; the right panel is a quiet notebook that records the locked-in answers. Left asks, right remembers — that's the coupling.
- **Scene 0.5 (Coins).** Base: 5 coins + Toss, empty tally. Builds from: each toss adds to an empirical heads-count tally. Unlocks: the binomial **expected** overlay appears at the definition step (not before); then the 2-category scoring choice; then the threshold readout `h*` bound to live counts. **Remove the pre-rendered "Expected distribution" — it must build.**
- **Scene 1 (One die).** Base: die + Roll, empty histogram, 10-roll cap. Builds from: each roll adds a bar. Unlocks: at the "too few rolls?" step → the rolls **slider** (driven: scrubbing scrolls N from 10→100k and the histogram flattens toward a 1/6 line that fades in here); at the prediction step → a staged "five sixes" setup (clearly staged) + an honest next roll.
- **Scene 2 (Two dice).** Base: 2 dice + sum histogram building from rolls. Unlocks: the **6×6 grid**; selecting a sum highlights its grid cells **and** the matching histogram bar together (same color), with the 6/36 count shown when counted.
- **Scene 3 (Five dice).** Base: 5 dice, ordered count climbing toward 7776. Unlocks: the **sort/unordered toggle** → animate 7776 collapsing to 252 (show the collapse, don't just print the number).
- **Scene 3.5 (Combinations).** Base: an example hand + category bars in **one-roll** mode, animating in. Unlocks: the **one-roll↔three-roll toggle** → bars animate to the new (higher) values. Bars share the die-face color language.
- **Scene 4 (Reroll).** Base: a hand + click-to-hold. Builds from: holding/releasing dice updates the **conditional distribution** live. Pose-before-tell: the reader holds, then the definition lands.
- **Scene 5 (EV).** Base: hand + score readout. Unlocks: **EV per keep-option**, updating live as the reader changes what they hold; the counterintuitive "obvious six is wrong" is shown by the numbers, not asserted.
- **Scene 6 (Turn + bonus).** Base: full 3-roll turn + scorecard + bonus tracker. The greedy-loses-the-bonus case is playable or clearly demonstrated (the 63 tracker reacts).
- **Scene 7 (DP).** Base: the state graph with cold/hot nodes. Driven: backward-induction reveal animates values propagating from the end backward; the V panel reads the **oracle** (≈254.6 from data, not hardcoded).
- **Scene 8 (Championship).** Base: roles + Run. Builds from: Monte Carlo (worker) streams games; the score histogram **grows** as games accumulate; the **normal overlay** fades in once the bell is evident; the **tail marker** shows the heavy right tail; the **1575 showcase** is unmistakably staged.
- **Scene 9 (Opponent).** Base: two parallel players. Unlocks: **objective toggle** (the recommended move visibly changes live); **win-region chart**; **prediction cone** (driven — narrows over turns as √(turns left)).
- **Scene 10 (Adaptive).** Base: play, with live cone + win-region updating every move; then the honest capstone.

---

## Animation & feel (this is not optional polish — it's the product)

- **Dice roll.** A roll must *feel* like a roll. ~550–700ms: rapid random face cycling + a small tumble (rotation + translate jitter) + a scale pop, settling with a slight ease-out overshoot; the shadow shifts with the motion. Multiple dice stagger ~60–100ms. The result is the engine's honest outcome; the motion is cosmetic over it. `prefers-reduced-motion` → snap, no motion.
- **Bars build in.** New histogram bars grow from the baseline; theoretical overlays draw on with a short fade/stroke animation.
- **Tool unlocks** fade/slide in (~200ms) when their step activates; **scene swaps** crossfade (~250ms) with no flash/reset.
- **DP propagation** animates values flowing backward through the graph.
- **Micro-interactions:** hover/active states on dice and controls; held dice lift; buttons have real pressed states. Restrained, never decorative.

## Visual quality

- **Redesign the die.** Clean rounded-square SVG, correct centered pip layouts 1–6, consistent sizing, subtle depth, theme-aware. The current die looks crude — fix the geometry and weight.
- **One visual language across model and charts.** One color per die face used in `Die`, `Histogram`, `Grid6x6`, `CategoryProbBars`; shared scales, margins, type. Charts sit in the stage grouped with their model (one card, aligned widths), not floating apart.
- **Minimalist tokens:** generous whitespace, one accent, one type style, calm fills. Center the model in the stage; don't let it drift to a corner.

---

## Broken-model audit

Go scene by scene and confirm each model actually works end to end: dice roll and animate; coins toss; histograms accumulate; the grid highlights; sort collapses; hold/reroll updates the conditional distribution; EV updates; the bonus tracker reacts; the state graph reads the oracle; the championship streams; toggles change recommendations; the cone narrows. Fix every model that doesn't respond (the reader reported at least one fully broken model). Report which were broken and what fixed them.

---

## Acceptance — the "one story" test (per scene, before moving on)

A scene passes only when **all** are true:
1. Scrolling the scene reads as **one continuous experience** — you can't tell where narration ends and interaction begins.
2. The model has **no narrative prose**; the left text is the only narration, and it clearly refers to what the model currently shows.
3. The model **starts minimal and gains** tools/charts step by step as you scroll; nothing is shown fully-formed up front.
4. Charts **build from the reader's actions**; theoretical overlays appear only when the text earns them.
5. Acting on the model (roll/hold/toggle) visibly does something, and the next text block is plainly about what just happened.
6. Animations make interactions **feel** real (the roll especially); reduced-motion still works.

Do Opening + Scenes 0, 0.5, 1, 2 first and show them — those four set the pattern the rest follow. Commit per scene. Don't touch `src/engine/`.
