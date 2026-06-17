# Formulas in Yahtzee Explorable Explanation

All KaTeX formulas used throughout the article, organized by scene.

## Scene 0.5: Coins

**Threshold heuristic:**
$$h^* = \frac{S_2}{S_1+S_2}$$

Take box 1 (worth $S_1$) only if heads count exceeds threshold. Below threshold, reroll.

---

## Scene 1: One Die

**Sample space:**
$$\Omega = \{1,2,3,4,5,6\}$$

**Law of large numbers (frequency → probability):**
$$f_i = \frac{n_i}{N} \to P$$

**Independence:**
$$P(A \cap B) = P(A) \cdot P(B)$$

---

## Scene 2: Two Dice

**Probability formula (counting):**
$$P(A) = \frac{|A|}{|\Omega|}$$

Example: $P(7) = \frac{6}{36}$, $P(12) = \frac{1}{36}$

---

## Scene 3: Five Dice

**Multisets (stars and bars):**
$$\binom{6+5-1}{5} = 252$$

7776 ordered rolls collapse into 252 unique hands (states).

---

## Scene 4: Reroll

**Conditional probability:**
$$P(B|A) = \frac{P(A \cap B)}{P(A)}$$

The distribution of the reroll depends on which dice you keep (condition A).

---

## Scene 5: Expected Value

**Definition:**
$$E[X] = \sum_x x \cdot P(X=x)$$

Weighted average of outcomes by their probability.

---

## Scene 6: Full Turn

**Optimal play (value function):**
$$\text{state} \in \{0,1\}^{13}$$
(Each of 13 boxes is filled or open)

**Bellman recursion:**
$$V(s) = \max_{\text{box}} \left( \text{score}(\text{hand}, \text{box}) + V(s') \right)$$

Best expected score from state $s$ = best choice of box + value of resulting state.

---

## Scene 7: States & DP

Backward induction from turn 13 to turn 1.

**Optimal expected score (oracle):**
$$V_{\text{empty}} = 254.589$$

Starting with no boxes filled, optimal play yields ~254.6 points.

---

## Scene 8: Strategies

No formula; empirical comparison via Monte Carlo.

---

## Scene 9: Opponent

**Game-theoretic value (indicator function):**
$$V(\text{hand}, \text{opponent score}) = \mathbb{1}[\text{my score} > \text{opponent}]$$

Value is 1 (win) or 0 (lose/tie), depending on whether my score beats theirs.

---

## Scene 10: Capstone

No formulas; reflective summary.

---

## Summary

| Scene | Key Formulas | Concept |
|-------|-------------|---------|
| 0.5 | Threshold | Reroll heuristic |
| 1 | LLN, Independence | Frequency → Probability |
| 2 | Counting | P(A) = \|A\| / \|\Omega\| |
| 3 | Multisets | 252 states |
| 4 | Conditional prob | P(B\|A) |
| 5 | Expected value | E[X] = Σ x·P(X=x) |
| 6 | Bellman recursion | V(s) = max(score + V(s')) |
| 7 | DP oracle | V_empty = 254.589 |
| 8 | Empirical | Strategy gap |
| 9 | Game theory | V depends on opponent |
| 10 | — | Summary |

All formulas are rendered via KaTeX in the Formula.tsx component.
