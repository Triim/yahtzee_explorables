# Detailed Build — Part 2: Beats, interaction, and the roll animation (for Claude Code)

> This replaces the scroll paradigm. Right now one model spans many screens of text you scroll past without interacting — there is no dramaturgy. Fix it exactly as written. Build A→B→C, verify each, then D. Do **not** touch `src/engine/`.

---

## The core problem (read once)

The unit is currently a "text step": you scroll a lot, the model just sits there, you rarely interact. Wrong. The unit must become a **beat**: one short line → a **required action on the model** → the model responds and a payoff line appears → continue. One beat = one screen, with a real stop. Far fewer beats per scene. The interaction is the gate — you cannot skim past it.

---

## A. Replace "steps" with "beats"

### A1. Beat data type
```ts
interface Beat {
  id: string;            // 'B1.1'
  scene: string;         // 'scene-1'
  prompt: string;        // the ONE line shown first (question / instruction / thought)
  payoff?: string;       // revealed AFTER the gated interaction (definition / punchline)
  modelState: unknown;   // what the model shows for this beat
  gate?: GateSpec;       // if present, the beat is locked until satisfied
}
interface GateSpec {
  kind: 'roll' | 'slider' | 'choice' | 'hold' | 'toggle';
  // satisfied when: rolled ≥ N times / slider moved past threshold / a choice made / etc.
  needed?: number;       // e.g. min rolls
}
```

### A2. Layout — one beat per viewport, with stops
- The article is a vertical stack of **beat sections**, each `min-height: 100vh`, centered content.
- Container: `scroll-snap-type: y proximity;` each section `scroll-snap-align: center;`. Scrolling now rests on one beat at a time — meaningful stops, no empty gaps.
- Inside a beat: **left** = `prompt` (and, once the gate is satisfied, `payoff` fades in beneath it); **right** = the scene's model in `modelState`.
- The model is shared per scene (one mount), its state set by the active beat. Across beats of the same scene the model persists and updates; it swaps only at scene changes (crossfade).
- **Delete the old ~85vh empty text steps.** No beat is taller than one viewport.

### A3. Interaction gating (this is what creates dramaturgy)
- A beat with a `gate` does **not** reveal its `payoff` and does **not** show the "continue" cue until the gate is satisfied.
- Until then, show the interaction prominently and a subtle prompt-cue (e.g. a pulse on the Roll button, or "roll to continue" microcopy under the model — microcopy only, not narration).
- Once satisfied: the `payoff` line fades in on the left, and a small downward "continue" chevron appears, inviting the snap to the next beat.
- Pure-read beats (no gate) always show the chevron.
- Use native scroll + the chevron; do **not** lock or hijack the wheel. Gating is by *revealing payoff/continue*, not by trapping scroll.

### A4. Far fewer beats
Each scene gets **3–5 beats**, not 8. Collapse adjacent "question + definition" pairs into a single beat using the call-and-response pattern in B. Cut filler lines entirely.

---

## B. The call-and-response pattern (the rule for every beat)

A good beat is three moments in one screen:
1. **Prompt** (left): one line — a question, instruction, or thought.
2. **Interaction** (right): the reader does the one required thing; the model **visibly responds**.
3. **Payoff** (left, appears after step 2): the definition / punchline that the interaction just earned.

The reader cannot reach the payoff by reading alone — the model is the gate. This is the whole point: phrase → you act → the model answers and the idea lands.

---

## C. Reauthor Scene 1 into 3 beats (the template every scene copies)

Replace Scene 1's eight steps with exactly these three beats. This is the reference for collapsing all other scenes.

**Beat B1.1 — sample space (gate: roll ≥ 6)**
- prompt: "Press it. You've got ten rolls."
- model: `Die` + `RollButton`, histogram starts empty and grows one bar-step per roll (cap 10).
- gate: `{kind:'roll', needed:6}`.
- payoff (after ≥6 rolls): "Six faces, each can land — that's the whole sample space, $\Omega=\{1,2,3,4,5,6\}$. But your bars came out uneven."

**Beat B1.2 — law of large numbers (gate: slider moved)**
- prompt: "Crooked die, or too few rolls? Drag it up."
- model: the `RollsSlider` (10 → 1000 → 100000, log). Dragging resamples (engine) and the histogram flattens; a dashed 1/6 line draws on as it flattens.
- gate: `{kind:'slider'}` (satisfied once dragged past ~1000).
- payoff: "They flatten toward one-sixth. The frequency converges to the probability: $f_i=n_i/N\to P$ — the law of large numbers."

**Beat B1.3 — independence (gate: make a prediction)**
- prompt: "Six sixes in a row. What comes next?"
- model: staged streak of five/six sixes (clearly the result of a streak), three choice buttons (1–5 / six / can't tell). After the pick, do **one honest engine roll** and reveal it.
- gate: `{kind:'choice'}`.
- payoff: "The die has no memory — the next roll starts from nothing. Rolls are independent: $P(A\cap B)=P(A)P(B)$. (Remember your second guess?)"
- last beat hands to Scene 2 (next scene's first beat).

**Acceptance C:** Scene 1 is exactly three screens; each requires an action before its payoff and the continue chevron appear; you physically cannot get to Scene 2 by skimming without rolling, dragging, and predicting. No prose inside the model — only the die, button, histogram with axis labels, slider, choice buttons, and at most a one-line microcopy cue.

---

## D. Redo the roll animation (the current one is bad)

The current animation is a jittery shake — replace it with a real throw: a wind-up, an arc with real spin and deceleration, and a landing bounce.

**Timeline (single run, 600ms total):**
- Face cycling (JS): every **55ms** set a random face; stop and set the **engine's final face at 480ms**.
- Transform (CSS), applied via class `die--throwing`:
```css
@keyframes dieThrow {
  0%   { transform: translateY(0)    rotate(0deg)   scale(1);    }
  12%  { transform: translateY(3px)  rotate(0deg)   scale(0.9);  } /* wind up */
  45%  { transform: translateY(-16px) rotate(300deg) scale(1.05); } /* toss + spin up */
  80%  { transform: translateY(0)    rotate(520deg) scale(1.0);  } /* coming down */
  90%  { transform: translateY(0)    rotate(540deg) scale(1.12); } /* impact */
  96%  { transform: translateY(0)    rotate(540deg) scale(0.96); } /* squash */
  100% { transform: translateY(0)    rotate(540deg) scale(1);    } /* settle */
}
.die--throwing { animation: dieThrow 600ms cubic-bezier(0.2,0.7,0.2,1) both; }
```
- **Shadow** (a soft ellipse under the die, separate element) sells the throw:
```css
@keyframes dieShadow {
  0%,100% { transform: scaleX(1);    opacity: 0.18; }
  45%     { transform: scaleX(0.7);  opacity: 0.10; } /* die lifted */
  90%     { transform: scaleX(1.18); opacity: 0.24; } /* impact */
}
.die--throwing + .die-shadow { animation: dieShadow 600ms cubic-bezier(0.2,0.7,0.2,1) both; }
```
- **Stagger** in a `DiceSet`: die `i` starts at `i * 70ms`.
- **Reduced motion:** if `prefers-reduced-motion: reduce`, skip all of the above — set the final face instantly, no transform, no face cycling.

The feel comes from three things, all required: real multi-turn rotation (540°), ease-out **deceleration** (the cubic-bezier), and the up-down **arc + landing bounce**. Do not use an `infinite` shake.

**Acceptance D:** a roll reads as a die being thrown and landing — it lifts, spins down, and bounces to rest on the result; multiple dice stagger; reduced-motion snaps instantly.

---

## E. Then apply the beat pattern to the other scenes

Only after Scene 1 (A–D) is verified: collapse each remaining scene's steps into 3–5 beats using the B pattern (prompt → gated interaction → payoff), one viewport each, snap stops. Report the new beat count per scene before implementing, so it can be checked. Do one scene at a time; the next prompt will hand you the next scene's beat breakdown.
