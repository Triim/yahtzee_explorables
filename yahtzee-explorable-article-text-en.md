# Yahtzee Explorable — Full Article Text (EN)

This is the **reader-facing left-column text** — finished draft prose for every scene. Pairs with `yahtzee-explorable-spec.md` (models, unlocks) and `yahtzee-explorable-skeleton.md` (structure). This English version supersedes the earlier Russian draft for article copy and adds the **Opening** section.

**Step markup:** `[id · register · right-panel directive]`, then the text the reader sees. `//` marks a soft break (new paragraph/beat) within a step. Formulas are LaTeX (KaTeX).

---

## Opening
*Right panel: `Hero` — a single die the reader can roll, no stakes, ambient. The first interaction is consequence-free play, pre-teaching the roll.*

**[INT.1 · free · activate(Hero)]**
A pair of dice. You've held them a hundred times. Yahtzee is just five of them, thirteen turns, and a scorecard — a game simple enough to teach a child in a minute.

**[INT.2]**
But stay with it a while, and the simple game starts asking quiet questions that plain arithmetic can't answer. And every time you outgrow one piece of math, the game calmly hands you the next.

**[INT.3]**
So this isn't really a guide to winning Yahtzee. It's a story about how a game this small keeps forcing you to invent harder and harder mathematics — until, near the very end, it changes what "winning" even means.

**[INT.4]**
One thing before we begin. The piece on the right is the point — roll it, drag it, poke at it. The words on the left are only here to nudge. And nothing here is rigged: when you roll, you really roll.

**[INT.5 · transition]**
We'll build the whole thing up from a single die. But before the first die — humor me with three quick guesses.

---

## Scene 0 — Intuition
*Right panel: `IntuitionNotebook` (locks in the three answers for the whole article).*

**[S0.1 · free · activate(IntuitionNotebook)]**
Let's not start with math. Let's start with three guesses — answer on instinct, we'll check them later. // You roll two dice. Which comes up more often: a sum of **7** or a sum of **12**?

**[S0.2 · free]**
Second. A six hasn't shown up in ten rolls. Is its chance of landing now higher, lower, or the same as ever?

**[S0.3 · free]**
And third. You're holding four sixes; the fifth die shows something else, and you have one reroll left. Worth the risk for that fifth six?

**[S0.4 · transition]**
Got your answers? Good. We'll come back to every one of them — and by the end you may answer differently. For now, let's pick up the simplest random object there is and see what it can do.

---

## Scene 0.5 — Coins (warm-up)
*Right panel: `Coins` (N=5), toss + hold/reroll, binomial bars, a panel showing the closed-form formula.*

**[S05.1 · free · activate(Coins)]**
Not a die yet — a coin. Heads or tails, nothing simpler. Toss five at once.

**[S05.2 · definition]**
On average, heads and tails split evenly. But "on average" is about thousands of tosses, not these five — which landed however they landed, rarely exactly half and half.

**[S05.3 · free · setState(S1=2, S2=1)]**
Let's add a drop of difficulty. Say heads is worth twice a tail, and you may score only one of the two boxes now — the other you'll take later, with whatever's left. Which do you take?

**[S05.4 · formula]**
Here the math has nowhere to hide — we can write it out in full. Take the expensive box only if its face came up more than a threshold: $h^\* \approx \dfrac{S_1}{S_1+S_2}$. Below that, hold off. Sometimes it pays to refuse points now for something better later. Remember this — the whole game ahead is about it.

**[S05.5 · transition]**
A coin is too simple to hide its answer behind calculation. Put a die in its place, and the closed-form formulas run out fast. Let's start with one die.

---

## Scene 1 — One die
*Right panel: `Die` + `RollButton` + `Histogram`; unlocks `RollsSlider`, then the prediction prompt.*

**[S1.1 · free · activate(Die)]**
Here it is. Press, and it lands on one of its faces. You have ten rolls; spend them however you like.

**[S1.2 · definition]**
What can come up, you already see: one of six faces, no more, no less. That's everything that can possibly happen — the sample space: $\Omega=\{1,2,3,4,5,6\}$.

**[S1.3 · question]**
But those ten rolls came out uneven — one face got three, another got none. Is the die crooked? Or are ten rolls just too few to tell?

**[S1.4 · driven · unlock(RollsSlider)]**
Let's check. Drag the slider — make it not ten rolls but a thousand. Then a hundred thousand.

**[S1.5 · formula]**
The more rolls, the flatter the bars: each face's frequency settles toward one-sixth and stays there. That settling point is the probability — the number a frequency converges to. $f_i = n_i/N \to P$. This is the law of large numbers.

**[S1.6 · free · setState(five sixes) · unlock(PredictionPrompt)]**
Now watch. Six sixes in a row — rare, but it happens. What do you think the seventh will be?

**[S1.7 · definition]**
Whatever lands — the die doesn't care. It doesn't remember the six rolls before; the seventh starts from a blank slate. The rolls are independent: $P(A\cap B)=P(A)\,P(B)$. (Remember your second guess? There's your answer.)

**[S1.8 · transition]**
We've taken one die down to the bottom. What changes with two?

---

## Scene 2 — Two dice
*Right panel: `DiceSet(2)` + `Histogram` (by sum); unlock `Grid6x6`.*

**[S2.1 · free · activate(DiceSet2)]**
Two dice — and now we care not about each one, but about their sum. Roll, and watch which sums show up most.

**[S2.2 · question]**
Strange: the sums don't come out evenly. Seven keeps appearing, while two and twelve almost never do. But the dice are fair. So where's the bias from?

**[S2.3 · free · unlock(Grid6x6)]**
Let's lay it all out. Here are all thirty-six pairs that can come up. Pick a sum — and see how many ways it can be made.

**[S2.4 · formula · aside]**
Seven is made by six pairs; twelve by a single one. That's the bias: $P(A)=|A|/|\Omega|$. // Notice: this is the same probability we just measured by rolling. There we **measured** it; here we **counted** it. Two faces of one idea — and they agree.

**[S2.5 · transition]**
Thirty-six pairs you can still draw. But what about five dice?

---

## Scene 3 — Five dice
*Right panel: `DiceSet(5)` + `StateCounter`; unlock `UnorderedToggle`.*

**[S3.1 · free · activate(DiceSet5)]**
Five dice. Counting pairs won't work anymore — there are $6^5 = 7776$ ways for them to fall.

**[S3.2 · question]**
You can't draw a 7776-cell table in five dimensions. And yet these outcomes have to be described somehow. How?

**[S3.3 · free · unlock(UnorderedToggle)]**
The trick: the order of the dice doesn't matter — only which faces showed. Sort them. $(6,1,5,1,2)$ and $(1,1,2,5,6)$ are the same thing, however you shuffle them.

**[S3.4 · definition]**
Stop telling order apart, and 7776 outcomes collapse into just 252 states: $\binom{6+5-1}{5}=252$. This is a multiset — the most economical description of a hand. From here on, a "hand" isn't five dice in places; it's one state.

**[S3.5 · transition]**
Now the hand is a clean object you can work with. And here, for the first time, the real question of the game appears: what do you keep?

---

## Scene 3.5 — A zoo of combinations
*Right panel: `DiceSet(5)` + `CategoryProbBars`; unlock `RollModeToggle`.*

**[S35.1 · definition · activate(CategoryProbBars)]**
In Yahtzee a hand is worth something only if it forms a combination. And a combination is just a question you ask the hand: are there three of a kind here? four? a straight? a full house?

**[S35.2 · free]**
Which combination is easier to get? Don't guess — look at the odds from a single roll.

**[S35.3 · free · unlock(RollModeToggle)]**
But you don't get one roll: you can reroll twice and keep what you need. Turn that on — and the odds jump.

**[S35.4 · definition]**
Four of a kind turns out likelier than a small straight, and Yahtzee rarest of all by an order of magnitude. And above all: rerolls change the whole picture. What was nearly impossible becomes quite real.

**[S35.5 · transition]**
Except "likelier" isn't yet "better." Before we price combinations against each other, let's settle the reroll itself: what's even worth keeping?

---

## Scene 4 — The reroll
*Right panel: `HoldReroll`; unlock `ConditionalDist`.*

**[S4.1 · free · activate(HoldReroll)]**
Here's a hand. Click the dice you want to keep — the rest go back for a reroll.

**[S4.2 · definition · unlock(ConditionalDist)]**
The moment you keep something, the future stops being blind chance: here's the distribution of what will likely come up — given your choice.

**[S4.3 · formula]**
This is conditional probability — the probability of a future given a present: $P(B\mid A)=\dfrac{P(A\cap B)}{P(A)}$. Change what you keep, and the whole distribution on the right changes with it.

**[S4.4 · aside]** *(optional depth)*
And under the hood, each reroll is a step along a small chain: the value of what you hold is built from the values of what could arrive: $\text{keep}[K]=\frac{1}{6}\sum_d \text{keep}[K\cup\{d\}]$.

**[S4.5 · transition]**
We have the distribution. But which choice is better — it won't say. And it can't: we have no goal yet to choose toward.

---

## Scene 5 — Score and expectation
*Right panel: `HoldReroll` + `ScoreReadout`; unlock `EVReadout`.*

**[S5.1 · definition · activate(ScoreReadout)]**
Let's give the hand a price. In Yahtzee every hand turns into points by a category's rule — so points are just a function of the hand: $\text{score}=f(\text{hand})$.

**[S5.2 · free]**
And now the choice stops being obvious. You're holding a fat six — surely that's the one to protect. Try it — keep it. Then try it the other way.

**[S5.3 · free · unlock(EVReadout)]**
We'll compare not probabilities but the average haul — how many points each choice brings on average.

**[S5.4 · formula]**
This is the expected value: $E[X]=\sum_x x\,P(X=x)$ — each outcome weighted by its probability. And again and again the "obvious" move loses to the unobvious one by expectation. The eye deceives; the number doesn't.

**[S5.5 · transition]**
Expectation picks the best move in this roll. But a turn has three rolls, a game has thirteen turns, and every box you fill is closed for good. Is expectation alone enough?

---

## Scene 6 — The turn and the bonus
*Right panel: `Scorecard` + `BonusTracker`, full turn; demo of greedy failure.*

**[S6.1 · free · activate(FullTurn)]**
Let's play a full turn by the rules: up to three rolls, keep what you like between them, then write down one category.

**[S6.2 · definition]**
There's a reward-with-a-catch hidden in the table. The upper section pays +35 — but only if you reach 63 in it. That's exactly what six threes-of-a-kind add up to: $63 = 3\cdot(1+2+\dots+6)$.

**[S6.3 · question]**
And here's where greed trips. A player who grabs the most points every turn, here and now, easily falls short of 63 — and loses the whole bonus. Locally he played perfectly; in total he lost.

**[S6.4 · definition]**
There's a second reward, a bigger one: +100 for every extra Yahtzee. Remember it — it'll come back and pull off something spectacular.

**[S6.5 · transition]**
So the best move depends not only on what's in your hand now, but on what comes later. How do you choose the present for the sake of the future?

---

## Scene 7 — The whole game as states
*Right panel: `StateGraph` (cold/hot nodes) + `ValuePanel`; driven — backward induction.*

**[S7.1 · definition · activate(StateGraph)]**
Let's rise above the single turn and look at the whole game. All of it is states and the transitions between them. And the states come in two kinds — two colors.

**[S7.2 · definition]**
In a cold node, chance moves — this is right after a roll, nothing is up to you, and value is averaged over all outcomes: $E=\sum_i p_i E_i$. In a hot node, you move — keep or write — and here you take the best: $E=\max_i E_i$. The whole game is a ribbon of cold and hot circles.

**[S7.3 · driven]**
To know what to do now, we count from the end. To each state we assign a value — the best future reachable from it.

**[S7.4 · formula]**
The result is a simple but overturning rule: you don't pick the best roll, you pick the move that leads to the best future. $V(s)=\max_a E[V(s')]$. Under such play the average finish is about 254.6 points — the ceiling of any solitaire strategy.

**[S7.5 · aside]** *(optional)*
It also shows what an extra reroll, or a peek at the next outcome, is worth: exactly the difference in value before and after. That's the value of information — and it can be computed.

**[S7.6 · transition]**
So we have perfect solitaire play. But what kinds of strategies are there at all — and how do different approaches look not over one game, but over a thousand?

---

## Scene 8 — Strategies and the tournament
*Right panel: `RolesPanel` + `ChampionshipRunner` (web-worker) + `ScoreHistogram` (+`NormalOverlay`, +`TailMarker`) + `ShowcasePlayer`.*

**[S8.1 · definition · activate(RolesPanel)]**
Let's assemble a few characters. The Conservative guards sure points. The EV-Maximizer always presses on the average. The Bonus Hunter chases 63. The Yahtzee Hunter gambles for fifties. The Comeback Player goes all in.

**[S8.2 · driven]**
Let's pit them against each other — not in one game, where luck decides everything, but in a thousand. Run it, and watch each one's average settle. This is the law of large numbers again, only now as a working tool: the Monte Carlo method, $\hat P=\frac1N\sum \mathbb 1[\cdot]$.

**[S8.3 · formula]**
The results of thousands of games fall into a familiar shape — a bell. This is the normal distribution $\mathcal N(\mu,\sigma^2)$, and each strategy has its own signature: where the center $\mu$ sits and how wide the spread $\sigma$ is.

**[S8.4 · definition]**
But the bell is an idealization — a convenient fairy tale about the middle. The real finish doesn't sit so smoothly: a long tail trails off to the right.

**[S8.5 · showcase · showcase(13xYahtzee)]**
Look at the very edge of that tail. Thirteen Yahtzees in a row, the whole table closed at maximum — 1575 points. Watch. // *(This is a demonstration, not your roll — it doesn't happen.)* // Almost all of that maximum, 1200 of the 1575, is those Yahtzee bonuses from the last chapter. And the chance of it — about one in a hundred quadrillion.

**[S8.6 · transition]**
Each strategy now has its signature $(\mu,\sigma)$. But which one is best? And, for that matter — best for what?

---

## Scene 9 — The opponent
*Right panel (`rich`): `OpponentPanel` + `ObjectiveToggle` + `WinRegionChart` + `PredictionCone`.*

**[S9.1 · definition · activate(OpponentPanel)]**
Sit a second player at the table. They roll their dice, you roll yours, and here's what to grasp right away: you never touch their dice. They don't make your randomness any different.

**[S9.2 · free · unlock(ObjectiveToggle)]**
What they do change is one thing — your goal. Switch it: maximize the average score, or maximize the probability of winning. And watch how, with the very same math, the best move changes.

**[S9.3 · definition · unlock(WinRegionChart)]**
The logic is simple. Behind — widen your spread: let the average score drop, but get more chances to leap past your opponent. Ahead — the opposite: narrow it and calmly close out the win.

**[S9.4 · driven · unlock(PredictionCone)]**
And how many turns does it take to tell where the opponent will land? Early on — almost impossible; their finish is a wide cloud. But the cloud shrinks as the game goes — the spread falls like $\sqrt{\text{turns left}}$ — and by the end becomes nearly a point. That's when you decide.

**[S9.5 · definition]**
Strictly speaking, the goal is your expected rank in the standings. And real game theory never showed up here: in a duel the opponent only changes what counts as winning. It would arrive only with a third player — where alliances become possible.

**[S9.6 · transition]**
Enough watching from the side. Play it yourself — with every instrument in hand.

---

## Scene 10 — The adaptive finale and the capstone
*Right panel (`rich`): `AdaptiveHUD` with live `PredictionCone` and `WinRegionChart` on every move.*

**[S10.1 · free · activate(AdaptiveHUD)]**
Your game on the left, the opponent on the right, and for every move two readouts in front of you: the cone of their possible finish and your winning mass.

**[S10.2 · definition]**
For the first third, just read them — where they're leaning, what score they're heading for. For the last third, decide by the instruments: narrow your game or widen it. Your strategy has now become a function of the state itself: of how many turns are left and where the target sits.

**[S10.3 · capstone]**
And here's the honest bottom line of all this math. When twenty-three million real games were analyzed, it turned out: perfect play is fifty times more accurate than the best humans — and beats them by just four games in a hundred. Yahtzee is almost entirely about luck, and the edge of skill shows only over a very long run.

**[S10.4 · transition (finale)]**
But look at the road we've traveled. For almost the whole game you played against a probability distribution. Then against the constraints of the rules. Then against your own future decisions. And only at the very end did an opponent appear who touched none of your dice — they only changed what counts as winning. // Go back to your three guesses from the start. What would you answer now?
