/* English translations of every beat, keyed by beat id. Russian stays the
   source of truth in the scene files; this layer overrides it when lang==='en'.
   KaTeX ($…$) is preserved; decimals use a period, not the Russian comma. */
export const BEATS_EN: Record<string, { prompt?: string; payoff?: string }> = {
  /* ---- Intro ---- */
  'INT.1': {
    prompt:
      'Here they are — five dice. You roll, and you may reroll any of them twice to build a better combination: a pair, three of a kind, a straight. Whatever you make, you write into one of thirteen rows. Thirteen turns, and most points wins. Give them a toss.',
    payoff:
      'The rules really are a one-minute affair. But ask “how do I play it better?” and behind a plain die one question rises after another — and arithmetic stops being enough.',
  },
  'INT.2': {
    prompt:
      'But before working out how to play better, it’s worth simply playing — learning the rules by hand. Take the five dice and play your first game.',
  },

  /* ---- Tutorial — play one game ---- */
  'TUT.1': {
    prompt:
      'Before any counting — play. Roll the five dice. You may keep any of them and reroll the rest up to twice more, building a higher combination.',
    payoff:
      'Click a die and it stays put while the others fly again. Two rerolls a turn, and you can stop early if you already like your hand. Just like the real game — no math, just roll.',
  },
  'TUT.2': {
    prompt:
      'Hand assembled — time to record it. Thirteen rows sit on the right; pick one, and the points go in by that row’s rule. Record your first hand.',
    payoff:
      'A row closes forever: once written, you can’t use it again. The top six rows take the sum of their face; the lower ones pay for combinations — three and four of a kind, straights, a full house, five alike. “Chance” takes anything.',
  },
  'TUT.3': {
    prompt:
      'Now play the game out to the end — fill all thirteen rows. Think about where to dump a weak hand and where to save a strong one.',
    payoff:
      'That’s the whole game: thirteen turns, thirteen decisions, each a trade-off between “take it now” and “save the row.” At the end the points add up, and an upper total of 63 earns another +35.',
  },
  'TUT.4': {
    prompt:
      'Game played — here’s your score. Remember it: we’ll come back to this very game more than once as we work out how to play better.',
    payoff:
      'The rules are learned in a single game. But behind every “where do I write this” hid a question: which move is actually best? That — the mathematics of chance hidden behind a die — is what we take up next. We start from the simplest case — not even a die, but a coin: just two outcomes.',
  },

  /* ---- 1 · Probability ---- */
  'B1.1': {
    prompt: 'Flip a coin.',
    payoff:
      'Heads or tails — there is no third option. Each flip gives exactly one of two, not a half and not something else. This short list — everything that can possibly happen — is called the **sample space**: {heads, tails}.',
  },
  'B1.2': {
    prompt:
      "Does heads come up more often than tails, or are they equal? Don't guess — flip a dozen times and watch the bars.",
    payoff:
      'After a dozen flips one bar usually pulls ahead of the other. But that means nothing yet: over a handful of flips, chance itself paints the lead. To see how things really are, you have to flip far more — more than you can by hand.',
  },
  'B1.3': {
    prompt:
      'Hand the flipping to the computer and drag the slider: a thousand, ten thousand, a hundred thousand.',
    payoff:
      'The more flips, the steadier the bars: the fraction of heads settles on one half and stays there. That settling is exactly what we call **probability** — the share an outcome gets when you flip a great many times.\n[[The frequency $f = \\dfrac{\\text{heads}}{\\text{flips}} \\to \\tfrac12$ as the number of flips grows]]\nThis is the **law of large numbers**.',
  },
  'B1.4': {
    prompt:
      'Flip two coins, one after the other. The first flip is a fork in two; from each branch, another fork. Four paths in all.',
    payoff:
      'Four paths — HH, HT, TH, TT — all equal. The first coin knows nothing of the second: however many heads come up in a row, the next fork is still fifty-fifty. Outcomes that don’t affect one another are called **independent** — the past doesn’t nudge the future.',
  },
  'B1.5': {
    prompt:
      'And if between flips you decide something — keep one coin as it landed? Tap an outcome of the first coin and keep it.',
    payoff:
      "The tree rebuilt around your choice — the second fork now grows out of the coin you kept. The toggle shows two worlds: for **independent** coins the second knows nothing of the first, fifty-fifty whatever you keep; for **dependent** ones, what you kept skews the second flip's branches. We'll unfold this “depends / doesn't” fork when we reach the game itself.",
  },
  'B1.6': {
    prompt:
      'A coin has only two outcomes — it soon runs out of things to show. Take a die: six faces instead of two. Roll it.',
    payoff:
      'The sample space is wider — {1, 2, 3, 4, 5, 6} — but everything we learned on the coin carries over word for word.',
  },
  'B1.6e': {
    prompt:
      'Rarely is a single outcome what interests you — usually a whole set: “came up even”, “bigger than four”. Mark such faces on the die.',
    payoff:
      'Any such set of outcomes is an **event**. Probability is attached not to a single face but to an event, and it is read off simply: the share of the marked faces among all six.\n[[“even” — three faces of six, $P = \\tfrac36 = \\tfrac12$]]\nAn outcome is a point; an event is the set of points we aim at.',
  },
  'B1.7': {
    prompt: 'Drag the slider — and, just as with the coin, each face settles onto its own share.',
    payoff:
      'Only now that share is one sixth: six equal faces, $f \\to \\tfrac16$. And these six shares don’t hang apart — together they fill the whole: $\\tfrac16 \\cdot 6 = 1$. The probabilities of all outcomes always sum to 1 — 100% of cases land somewhere.',
  },
  'B1.8': {
    prompt:
      'Add a second die — now we watch the sum of the two. Roll it a couple dozen times, until the shape shows, and watch the sum.',
    payoff:
      'The sums fall unevenly: seven comes up again and again, while two and twelve almost never do. The dice are fair — so where does the skew come from?',
  },
  'B1.9': {
    prompt:
      'Lay every pair out in a grid: each of the 6 faces of the first die meets each of the 6 faces of the second — that’s 6 × 6 = 36 equal cells. Roll onto the grid, then switch to sums and pick one.',
    payoff:
      'In the sums view the secret shows: twelve is built by a single pair 6+6 — that’s 1/36; seven is given by six pairs at once, 6/36 = 1/6, six times as often. More cells simply lead to seven.\n[[$P = \\dfrac{|\\text{favorable cells}|}{|\\text{all cells}|}$]]\nOn the coin we **measured** probability by flipping; here we **counted** cells. The very skill of counting outcomes is **combinatorics**. And here is the link the rest of the article rests on: combinatorics counts the favorable outcomes, we divide by all of them — and out of counting comes probability. We’ll come back to it at every combination.',
  },
  'B1.10': {
    prompt: 'Now roll that pair tens of thousands of times.',
    payoff:
      'The histogram of sums gathers into a tidy hill with a peak at seven and nearly straight slopes down to two and twelve — a triangle. The dice are fair, yet the shape is no longer flat: more roads lead to the middle sums.',
  },
  'B1.11': {
    prompt:
      'Two dice landed in a triangle. What happens to the sum when there are more than two dice?',
  },

  /* ---- Sum of the dice (convolution / generating functions) ---- */
  'SUM.1': {
    prompt:
      'The sum of two dice built up into a triangle peaking at seven. And if there are more dice? Add them one at a time and watch the shape.',
    payoff:
      'One die is flat — six equal faces. Two give a triangle, three a hill, and with every die the slope grows smoother. The shape clearly obeys some rule — it remains to see which.',
  },
  'SUM.1b': {
    prompt:
      'Where does this shape come from? Adding a die means adding a new face, 1…6, to every sum already there. Spread one column at a time and watch where it lands.',
    payoff:
      'Every column of the old distribution fans out into six smaller copies, shifted by 1…6, and the copies from different columns **stack up** into the new ones. That’s the whole mechanism: the new sum is the old one plus the rolled face.\n[[“spread and add” = the **convolution** of distributions]]\nThis convolution is what turns a flat die first into a triangle, then into a hill.',
  },
  'SUM.2': {
    prompt: 'This “spread and add” has a compact notation — through polynomials.',
    payoff:
      'Write a die as $x + x^2 + \\dots + x^6$ — one term per face. Multiplying two such brackets means running over every pair of faces and adding their exponents: the power $x^s$ is the sum, and its coefficient is how many pairs build it. The same spread-and-add, just in letters.\n[[$(x + x^2 + \\dots + x^6)^n$]]\nSuch a polynomial is a **generating function**: its powers are the sums, its coefficients the counts.',
  },
  'SUM.3': {
    prompt: 'Build up to five dice and look at the shape of the bars.',
    payoff:
      'The sum of five dice lives on $5\\dots30$, symmetric about $17.5$, peaking at 17 and 18. The bars themselves gather into a smooth bell — this is the **normal distribution**.\n[[almost everything sits within one step $\\sigma$ (a spread measure) $\\approx 3.8$ of the center: sums 14…21 take about two thirds of all rolls, while the edges 5 and 30 almost never come up]]\nAnd it isn’t about the die itself: when you add up many small independent bits of chance, their sum always leans toward a bell. This is the **central limit theorem**.',
  },
  'SUM.4': {
    prompt:
      'But the sum has a blind spot: it erases which faces actually came up. 6·6·1·1·1 and 3·3·3·3·3 both give 15. And the game cares not about the sum but about the hand itself — which faces and how many of each. That’s what we take up next.',
  },

  /* ---- Where 252 comes from (combinatorics apparatus + stars & bars) ---- */
  'CNT.1': {
    prompt:
      'To get from 7776 down to 252 we need to count. Let’s build the tool from scratch on balls and boxes. You’ve already met the first rule: drag the number of shapes and colors.',
    payoff:
      'Each independent choice multiplies the options: a shape and a color give “shapes × colors”. Two dice — 6×6, five — $6^5$.\n[[the product rule: independent choices multiply]]\nThe whole apparatus grows from it.',
  },
  'CNT.2': {
    prompt:
      'How many ways are there to line up five distinct items in a row of places? Seat them one at a time and watch how many candidates each place has.',
    payoff:
      'The first place takes all five candidates, the second only four, and so on. Multiply the descending numbers:\n[[$5! = 5\\cdot4\\cdot3\\cdot2\\cdot1 = 120$]]\nThe number of ways to order $n$ distinct items is the **factorial** $n!$, and the orderings themselves are **permutations**.',
  },
  'CNT.3': {
    prompt:
      'And if order doesn’t matter — how many ways are there just to CHOOSE some of the five? Mark a few.',
    payoff:
      'Choosing 2 of 5 in order is $5\\cdot4=20$ ways, but “first-second” and “second-first” give the same set, so we divide by $2!$.\n[[$\\binom{5}{2} = \\dfrac{5\\cdot4}{2!} = 10$]]\nAn unordered choice is a **combination** $\\binom{n}{k}$ — “$n$ choose $k$”.',
  },
  'CNT.4': {
    prompt:
      'One more case: some items are identical. Swap two identical balls and nothing changes. Drag how many balls are red.',
    payoff:
      'Five places give $5! = 120$ layouts, but swapping identical balls among themselves is indistinguishable. Divide by the permutations within each color:\n[[$\\dfrac{5!}{3!\\,2!} = \\dfrac{120}{12} = 10$]]\nThese are **permutations with repeats**.',
  },
  'CNT.5': {
    prompt:
      'Now the key trick. A hand is which faces and how many: drag five stars across six face-boxes.',
    payoff:
      'Write the layout as one row: stars in the boxes, with five dividers between the six boxes. ★★|·|★|★|·|★ is the hand “two ones, a three, a four, a six”.\n[[any hand ↔ one row of 5 stars and 5 bars]]\nThis trick is **stars and bars**.',
  },
  'CNT.6': {
    prompt:
      'The row always has 10 positions: 5 stars and 5 bars. The whole hand is just a choice — which 5 of the 10 positions go to stars. Choose.',
    payoff:
      'And an unordered choice we already know how to count — it’s a combination:\n[[$\\binom{10}{5} = \\dfrac{10\\cdot9\\cdot8\\cdot7\\cdot6}{5!} = 252$]]\nThat’s where 252 comes from — not from the ceiling, but built by hand. In general “$k$ balls in $m$ boxes” is $\\binom{m+k-1}{k}$, here $\\binom{6+5-1}{5}$.',
  },
  'CNT.7': {
    prompt:
      'So 252 hands are counted. But counting doesn’t make them equal: different hands hide different numbers of arrangements. Let’s see exactly how many.',
  },

  /* ---- Counting hands (multiset / stars & bars / multinomial) ---- */
  'MUL.1': {
    prompt:
      'We’ve counted 252 hands. But how many orderings hide behind a single hand? Pick a hand — and let’s count how many ways it can be laid out across the positions.',
    payoff:
      'This is exactly permutations with repeats, applied to a hand. Five dice across five places — $5! = 120$ layouts, but identical faces can’t be told apart, so we divide by the permutations within each repeat. That gives the **multinomial coefficient**:\n[[$\\dfrac{5!}{n_1!\\,n_2!\\,\\cdots\\,n_6!}$, where $n_k$ is how many dice show face $k$]]\nAll-different gives $120$ orderings; a pair — $120/2! = 60$; a full house — $120/(3!\\,2!) = 10$; five of a kind — $120/5! = 1$. Five fives is exactly one ordering: shuffle them however you like, nothing changes. But five ones is a **different** ordering; the “Yahtzee” category gathers all six such hands — 6 orderings of 7776.',
  },
  'MUL.2': {
    prompt: 'The same hand, written in stars and bars — recognize it?',
    payoff:
      'Here it is in that very notation: stars are the dice, bars the borders between faces. Each of the 252 hands answers to its own row, and vice versa. The hands are counted and tidily filed — yet behind them, as we just saw, hides a varying number of orderings. Which begs the question: are they equal in chance?',
  },
  'MUL.3': {
    prompt:
      'Since different hands have different numbers of orderings behind them, their chances should differ too. Don’t guess: roll many times and watch how often each comes up.',
    payoff:
      'The frequencies diverge by a lot: all-different comes up again and again, while five fives almost never does. Each hand weighs exactly as many orderings as map to it: five fives is 1 of 7776, all-different is 120 — a hundred and twenty times as often. Add the weights of all 252 hands and you get 7776 back. Same story as the sum on the 6×6 grid: more roads led to seven. That’s why **chances are computed over the 7776 equally likely orderings**, while the 252 hands are handy labels, not equal shares.',
  },
  'MUL.4': {
    prompt:
      'So a hand has two faces: 252 states — to think and to choose; 7776 orderings — to compute chances. With that distinction, let’s work out what a hand is worth. Time for the rules of Yahtzee.',
  },

  /* ---- Is the die fair? (chi-square / hypotheses / Bayes) ---- */
  'FAIR.1': {
    prompt:
      'Side-quest. All along we took the die on faith: six equally likely faces. But what if it’s loaded — how would you even tell? Secretly pick a die and pile up some rolls.',
    payoff:
      'Over a handful of rolls the bias is invisible — chance is noisy, just as on the first coin flips. We need a measure: how far the observed face frequencies stray from the expected $n/6$. While the count is small, even a fair die wanders.',
  },
  'FAIR.2': {
    prompt: 'That measure of discrepancy comes from one test. Pile up more — and watch it.',
    payoff:
      'It’s the **chi-square test** — the sum of squared deviations of observed $O$ from expected $E$, normalized by the expectation:\n[[$\\chi^2 = \\sum \\dfrac{(O-E)^2}{E}$]]\nIt has a threshold. [[11.07 is not magic: it’s the cutoff for six faces (five degrees of freedom) at the 5% level. An accumulated deviation above it happens to a fair die less than 5% of the time; below it is ordinary spread.]] Cross it, and the die is under suspicion.',
  },
  'FAIR.B1': {
    prompt:
      'A threshold answers yes/no. But confidence can be accumulated as a number — and it has to start from what you believe before any roll. The die might be loaded, might not; say the chance of loading is 1 in 10. Set that prior.',
    payoff:
      'This is your **prior belief** — P(loaded) before a single roll. Here it’s 0.1: loading is possible but unlikely. The estimate starts there, and observations will move it.',
  },
  'FAIR.B2': {
    prompt: 'Roll. Each outcome nudges the belief a little — watch which way.',
    payoff:
      'If a loaded die loves sixes, then a rolled six is an argument for loading, while even rolls argue against. How strong the argument is comes from the **likelihood**: the probability of exactly this outcome under a fair die versus a loaded one. One roll decides little; the argument accrues over many.',
  },
  'FAIR.B3': {
    prompt: 'How exactly does the belief update? Keep rolling and watch the bar.',
    payoff:
      'New belief = (how likely the observation is under loading × old belief) ÷ (how likely it is overall). That is **Bayes’ rule**:\n[[$P(\\text{loaded}\\mid D) = \\dfrac{P(D\\mid \\text{loaded})\\,P(\\text{loaded})}{P(D)}$]]\nThe more sixes above normal, the higher the posterior belief; the more even the rolls, the lower. The bar crawls on its own with each observation, starting from your prior.',
  },
  'FAIR.4': {
    prompt:
      'Chi-square answered harshly: fair or not. Bayes answers more softly — how sure you now are, a number from 0 to 1 that grows with every roll. And so the circle closes: we not only compute chances from a fair die, we can also test the fairness itself.',
  },

  /* ---- 2 · Five dice ---- */
  'B2.1': {
    prompt:
      'We laid two dice out over thirty-six cells. Take five — exactly as many as the game itself. How many arrangements are there at all? Start with one die and add them one at a time.',
    payoff:
      'One die has six outcomes. Add a second — each of its six outcomes pairs with each of the first six, making 6 × 6 = 36. A third multiplies by six again, and so on — this is the **product rule**.\n[[$6 \\times 6 \\times 6 \\times 6 \\times 6 = 6^5 = 7776$ arrangements]]\nAnd here the old trick breaks: 36 pairs fit in one little 6×6 table, but a table for five dice would need five axes. Listing 7776 arrangements by hand is pointless — we need to count.',
  },
  'B2.2': {
    prompt: 'But look closely at your hand. Does it matter which die is first and which is third?',
    payoff:
      '3·1·6·1·4 and 1·6·4·1·3 are the same hand: the same faces, just laid out differently. However you shuffle them, all that matters is which numbers came up and how many of each.',
  },
  'B2.3': {
    prompt: "Since order doesn't matter, let's count not arrangements but distinct hands.",
    payoff:
      '7776 ordered arrangements collapse into just 252 distinct hands. Such a hand — “which faces and how many of each, without order” — is called a **multiset**, and for us it’s simply a **state**: the hand has become a single object. We threw away the excess — order — and kept only what affects the game. Where exactly 252 comes from, we’ll count carefully a little later.',
  },
  'B2.4': {
    prompt:
      'Now the hand is a tidy object, and there are 252 of them. But where did that number come from? Let’s build the count from the ground up — on balls and boxes.',
  },

  /* ---- 3 · Rules & combinations ---- */
  'B3.1': {
    prompt:
      "For a hand to have a price, you need rules. Roll — and let's see where it can be recorded.",
    payoff:
      'A game is thirteen turns. On a turn you roll five dice and may reroll any of them twice. At the end you record the hand in one of thirteen rows — and it closes forever. The card splits in two: an upper and a lower section.',
  },
  'B3.2': {
    prompt:
      "The upper section couldn't be simpler: six rows, from ones to sixes. The rule is the same for all of them: a row takes the sum of the dice of its own face, and only those. Cycle the faces — the rows are built identically.",
    payoff:
      'Take sixes to count — any face works the same. How easy is it to catch at least one? It’s easier to count **the complement** — “no six at all”. Each of the five dice has 5 non-sixes, so by the product rule the arrangements with no six are:\n$$5\\cdot5\\cdot5\\cdot5\\cdot5 = 5^5 = 3125$$\nThen comes the same link as on the 6×6 grid: we counted the unfavorable outcomes with combinatorics, divide by all 7776 — and get the probability:\n$$P(0) = 3125/7776 \\approx 0.40, \\qquad P(\\ge 1) = 1 - 3125/7776 \\approx 0.60$$\nThe upper section has a reward: score 63 across the six rows for a +35 bonus. The 63 is the “average” quota, three dice per face: $3\\cdot(1+2+3+4+5+6)=63$. Remember it; it comes back.',
  },
  'B3.2A': {
    prompt:
      'And how many sixes come up in a roll — 0, 1, 2, 3, 4 or 5? That’s no longer yes/no but a whole random variable. Roll and pile up the bars — feel the shape first.',
    payoff:
      'The bars don’t grow at random: zero or one six come up most often, two less so, all five almost never. Once enough rolls land, the histogram settles into the same shape every time — the **binomial distribution** $B(5,\\ 1/6)$:\n$$P(k) = \\binom{5}{k}\\left(\\tfrac16\\right)^{k}\\left(\\tfrac56\\right)^{5-k}$$\nRead it: $\\binom{5}{k}$ — how many ways to choose which $k$ of the five dice are sixes; $\\left(\\tfrac16\\right)^{k}$ — that they are sixes; $\\left(\\tfrac56\\right)^{5-k}$ — that the rest aren’t. And $B(n,p)$ just means “$n$ independent tries, each a success with probability $p$”.',
  },
  'B3.2B': {
    prompt: 'And how many sixes on average? Roll a few times and watch the running mean.',
    payoff:
      'Give each die an **indicator**: 1 if it shows a six, else 0. The mean of one indicator is exactly its share, $1/6$. The running mean number of sixes settles on $5/6 \\approx 0.83$ — which is exactly the sum of five means:\n$$E = \\tfrac16 + \\tfrac16 + \\tfrac16 + \\tfrac16 + \\tfrac16 = 5\\cdot\\tfrac16 = \\tfrac56$$\nThe mean of a sum equals the sum of the means — without even knowing the full distribution. This is the **linearity of expectation**, and it becomes the main working tool ahead.',
  },
  'B3.3': {
    prompt:
      'The lower section is combinations. The first and easiest: three of a kind. It scores the sum of all five dice. Roll the whole hand again — no holding — until three of a kind come up on their own.',
    payoff:
      'How often do three of a kind show up on their own? Count the favorable hands. Exactly three alike: face of the triple — 6, which three dice of five — $C(5,3)=10$, the other two dice — any of the five other faces, $5^2=25$. That gives\n$$6\\cdot10\\cdot25 = 1500.$$\nAdd the rare hands with even more matches — 1656 of 7776 in all, about 21%: roughly every fifth roll.',
  },
  'B3.4': {
    prompt: 'Four of a kind. Again the sum of all the dice.',
    payoff:
      'By the same trick: exactly four $= 6\\cdot C(5,4)\\cdot 5 = 150$; plus all five — 6. That’s 156 out of 7776, about 2%. An order of magnitude rarer than a triple: one extra matching die costs dearly.',
  },
  'B3.5': {
    prompt: 'Three of a kind plus a pair — a full house, exactly 25 points.',
    payoff:
      'Face of the triple (6) · $C(5,3)=10$ · face of the pair, necessarily different (5) $= 300$ out of 7776, about 3.9%.',
  },
  'B3.6': {
    prompt:
      'Five in a row — a large straight, 40 points. A run happens with only two sets: 1·2·3·4·5 or 2·3·4·5·6.',
    payoff:
      'Each set arranges across the positions in $5! = 120$ ways, and there are two sets: 240 out of 7776, about 3.1%.',
  },
  'B3.7': {
    prompt:
      'Four in a row — a small straight, 30 points. Here there are three windows: 1–4, 2–5, 3–6.',
    payoff:
      "The windows overlap, so you can't just add them. 480 per window, but hands with five in a row fall into two windows at once — subtract those: $3\\cdot480 - 240 = 1200$ out of 7776, about 15%. This is **inclusion–exclusion**: add up, then remove the double count.",
  },
  'B3.8': {
    prompt: 'And the summit — five of a kind, a Yahtzee, 50 points. Try to build one in a turn.',
    payoff:
      'There are only six favorable hands — one per face. So any Yahtzee in a single roll is $6/7776 \\approx 0.077\\%$ (the same as $1/1296$). A specific five of a kind — say five sixes — is six times rarer still: $1/7776$. The rarest combination; that’s why it scores 50 and earns a +100 bonus for every repeat.',
  },
  'B3.9': {
    prompt: 'The last row is Chance. No conditions: write the sum of anything.',
    payoff:
      "Its probability is one — it always applies. It's insurance: here you dump a hand you can't squeeze anything else out of.",
  },
  'B3.10': {
    prompt:
      'Now every hand has a price. But all of this is from a single roll. And you get three rolls, with rerolls between them. What comes up if you keep some of the dice?',
  },

  /* ---- 4 · Rerolls ---- */
  'B4.1': {
    prompt:
      "It's not one roll: a turn has three, and between them you can reroll any dice. Roll, click the ones you want to keep, and reroll the rest.",
    payoff:
      "The moment you keep something, the next hand is no longer arbitrary — it grows on top of what you saved. With two coins the tree's branches didn't affect one another. Now you choose which branch to grow from — and the tree has stopped being independent.",
  },
  'B4.2': {
    prompt: 'Keep two threes and see what is most likely to come.',
    payoff:
      "The distribution on the right is the future given what you kept. What's the chance of adding a third three in one reroll of three dice? From the complement: $1 - (5/6)^3 = 91/216 \\approx 0.42$. Almost half.",
  },
  'B4.3': {
    prompt: 'But you get two rerolls. Keep the same — and reroll twice.',
    payoff:
      'With the second reroll the chance grows: what didn’t work now, you can still get on the next step. The value of what you hold is built from the values of what may come next. Each reroll is a step along a little tree, and its branches depend on your choice.',
  },
  'B4.4': {
    prompt:
      'Here the choice really costs. Your hand 6·6·2·3·4 has two targets at once: the pair of sixes begs to chase four of a kind, while 2·3·4 begs to become a straight. But you can’t hold both. Try each hold.',
    payoff:
      'Hold the sixes — getting at least one more of three rerolled dice is $1 - (5/6)^3 \\approx 0.42$, but you break 2·3·4 doing it. Hold 2·3·4 to chase the straight — and you lose the pair. That’s the real price of the choice: every chase is paid for with what you already had. Which hold is better, one distribution won’t say — you need a price for the hand.',
  },
  'B4.5': {
    prompt: 'Everything we just computed has a name.',
    payoff:
      'It’s **conditional probability**: the probability of a target $B$ given what you kept, $A$. Take the two threes concretely. $A$ — “I hold two threes”, $B$ — “got a third”. Of all the rolls of the three rerolled dice, take only those with at least one three — their share is the answer:\n[[$P(B\\mid A) = 1-(5/6)^3 = 91/216 \\approx 0.42$]]\nFormally $P(B\\mid A) = P(A\\cap B)/P(A)$ — we shrink the world to the cases of $A$ and look at the share of $B$ in it. But which hold is better, the distribution won’t say: it shows what’s likely, not what’s profitable. And profit can’t be measured until a hand has a single price.',
  },
  'B4.5A': {
    prompt:
      'A single roll gives any Yahtzee six favorable arrangements of 7776 (one per face): 6/7776 = 1/1296. But you get three rolls a turn and the right to keep dice. Chase a Yahtzee optimally over many turns.',
    payoff:
      'With rerolls a Yahtzee comes up in about **4.6%** of turns — nearly sixty times more often than 1/1296 for a single roll. Three attempts and the right to hold what you need turn the almost-impossible into merely rare. (This is an honest simulation; the numbers wobble a little from run to run.)',
  },
  'B4.5B': {
    prompt: 'And how many turns to wait for the first Yahtzee? Play a few hundred races and build up the distribution of which turn it first lands on.',
    payoff:
      'A Yahtzee comes up for about one turn in 22 ($p \\approx 4.6\\% \\approx 1/22$). If each turn is an independent attempt with chance $p$, the number of turns until the first success follows the **geometric distribution**:\n[[$P(k) = (1-p)^{k-1}\\,p$, averaging $E = 1/p$]]\nThe mean of a geometric distribution is just $1/p$ — about 22 turns, less than two games. (For a single roll, $p=1/1296$, you’d wait 1296 rolls.)',
  },
  'B4.6': {
    prompt:
      "To compare rolls not by probability but by payoff, a hand needs one number — its expected value. That's where we're headed.",
  },

  /* ---- 5 · Random variable ---- */
  'B5.1': {
    prompt:
      'The same hand 4·4·4·2·1 is worth different amounts in different rows. Tap a few rows in the table — see the points it gives in each.',
    payoff:
      "The score is a function of the hand and the row: $\\text{score} = f(\\text{hand}, \\text{row})$. And before you've rolled, the hand is random — and so are the future points: a number that depends on what comes up. Such a quantity is called a **random variable**.",
  },
  'B5.2': {
    prompt:
      'Your hand is 4·4·4·2·1 — three fours. Score the triple now, or reroll the two lowest dice? Compare the two paths.',
    payoff:
      'You don’t lose the triple either way — three fours stay, the whole question is the sum. Step by step:\n[[now: $4+4+4+2+1 = 15$ for sure]]\n[[reroll: hold $12$, two dice average $2\\cdot3.5 = 7$ → $12 + 7 = 19$]]\nNineteen on average against fifteen for sure — plus a shot at a fourth four. Rerolling is better.',
  },
  'B5.3': {
    prompt:
      'The same fork 6·6·2·3·4, but now by the money. Which is better to keep: the pair of sixes toward four of a kind, or 2·3·4 toward a large straight? Compare the values.',
    payoff:
      'The eye clings to the big sixes, but four of a kind from them is rare: usually you keep only 12 for “sixes,” and the whole try is worth about 13. Meanwhile 2·3·4 is three in a row — one die short of a small straight:\n[[catch a one or a five: $1 - (4/6)^2 \\approx 0.56$]]\n[[$0.56\\cdot30 \\approx 17$ per reroll, and there are two, with a large straight worth 40 in sight]]\nKeep 2·3·4, not the sixes. The eye clings to the big dice; value looks at the whole hand.',
  },
  'B5.4': {
    prompt: 'What we computed both times is precisely the answer to “which is more profitable.”',
    payoff:
      'This is **expected value** — each outcome times its probability, all summed:\n[[$E[X] = \\sum x\\cdot P(x)$]]\nThe simplest example is the price of one die: each face 1…6 comes up with share $1/6$, so we sum $x\\cdot P(x)$:\n[[$1\\cdot\\tfrac16 + 2\\cdot\\tfrac16 + \\dots + 6\\cdot\\tfrac16 = \\dfrac{1+2+3+4+5+6}{6} = 3.5$]]\nThose 3.5 per die are exactly what we plugged into the rerolls. And when we weighed holds, we computed $E[\\text{points}\\mid\\text{kept}]$ — a **conditional expectation**, and that drives the choice. But expectation picks the best move in a single roll. A game is thirteen turns, and each row closes forever. Is looking at one turn enough?',
  },
  'B5.5': {
    prompt:
      "The best move now and the best move for the whole game are not the same thing. Let's see where they diverge.",
  },

  /* ---- 6 · Linearity & greed ---- */
  'B6.1': {
    prompt:
      'The game’s total is the sum of thirteen rows. And the average of a sum is simple: the average of a sum equals the sum of the averages.',
    payoff:
      'This is the same linearity of expectation that averaged the sixes — only now for all thirteen rows at once. It always holds, even when the rows are linked:\n[[$E[\\sum X_i] = \\sum E[X_i]$]]\nThe bars themselves are what each row brings on average over a game under sensible play. The upper rows read easily: you aim for about three dice per face (the same logic as the 63 threshold), so sixes pull toward twenty while ones stay modest — around two. The lower rows are worth their face value times how often the hand actually gets there. From it a recipe suggests itself: fill each row to its maximum, and the total will be maximal.',
  },
  'B6.1W': {
    prompt:
      'Meet the **greedy** player. He has one rule: squeeze out the most points right now, every turn. Play a whole game as him and watch the score climb.',
    payoff:
      'You can see how he thinks: early rolls get dumped wherever the points are highest now, and toward the end only awkward rows remain — so the score curve flattens noticeably near the finish. Every single turn he played “best of all.” Remember this total — we’ll compare it to the average.',
  },
  'B6.2': {
    prompt:
      'One game is luck. Run the greedy player many times and compare his average score with the optimum.',
    payoff:
      'The greedy player falls short of the optimum systematically. Strange — he takes the maximum every turn. So “maximum each turn” and “maximum over the game” are not the same thing. The recipe broke; let’s find exactly where.',
  },
  'B6.3': {
    prompt:
      'The first crack is the bonus. Remember the threshold of 63 in the upper section? It pays +35, but only whole, as a step. Bring the greedy player to 62 and to 63.',
    payoff:
      'Sixty-two — zero bonus; sixty-three — a full +35 at once. That’s not a linear contribution but a **threshold**. This is why the upper rows are linked: scoring “sixes” with a single six is harmless locally, yet in the total it can cost all thirty-five points.',
  },
  'B6.4': {
    prompt:
      'The second crack: rows are one-time. Dump a good hand into “Chance” early — and hit a zero later.',
    payoff:
      'Once recorded, a row is closed forever. You toss a fine hand into “Chance” for quick points, and at the end a Yahtzee hand arrives — with nowhere to put it but a zero. Turns are linked in time: a slot spent now is unavailable later.',
  },
  'B6.5': {
    prompt: 'Put both cracks together.',
    payoff:
      'The bonus threshold links the rows, irreversibility links the turns — so the game doesn’t break into thirteen separate problems, and “maximum each turn” doesn’t equal “maximum over the game.” **A local optimum ≠ the global one.** To choose the right move now, you must know the value of everything that comes after.',
  },
  'B6.6': {
    prompt:
      'So every position in the game has its own value — the best you can achieve from it. Let’s learn to compute it.',
  },

  /* ---- 7 · Value of a position ---- */
  'B7.1': {
    prompt:
      "What fully describes your position mid-game? Not the dice — they'll change. Rather what stays: which rows are closed, how much you've gathered in the upper section toward 63, and a couple of flags. Close a couple of rows.",
    payoff:
      'This is the **game state**. The same word as for a hand: back then we folded five dice into a single state by discarding the order. Now we fold the whole game the same way — keeping only what affects the future.',
  },
  'B7.2': {
    prompt: 'Let’s give each state a number.',
    payoff:
      'The **value of a state** $V(s)$ is the best average number of points you can still gather from here to the end, playing optimally. Not “how much you’ve already scored,” but “how much lies ahead under perfect play.”',
  },
  'B7.3': {
    prompt:
      'How do you compute such a number? The game alternates between two kinds of moment — your choice and a roll. Grow the tree branch by branch.',
    payoff:
      'After a roll the move is yours — the node’s value is the **maximum** over your moves. Before a roll, chance decides — the value is **averaged** over outcomes, $\\sum p\\cdot V$. A choice node is a maximum, a chance node is an average. The same tree, only now each node holds a value.',
  },
  'B7.4': {
    prompt: 'We start counting from the end — there the value is obvious. Run the count and watch the values fill in right to left, from the last turn back to the start.',
    payoff:
      'On the last, thirteenth turn one empty row remains: its value is the best you can record there, averaged over chance. One step back, to the twelfth: for each outcome you choose a row **knowing the already-computed value of the thirteenth**, and take the maximum; then average over the roll. Leaning each time on the finished turn ahead, you back up from the end to the start and fill in the values of all positions.',
  },
  'B7.5': {
    prompt: 'Reaching the very start, we get a single number.',
    payoff:
      'The value of the starting position is about **254.6** points. This is the ceiling of the solitaire game: on average you can’t do better. And every move is now chosen simply — the one that leads to the position of greatest value.',
  },
  'B7.6': {
    prompt:
      'So there is one perfect solitaire game and its average. But “average” is about thousands of games at once. How do different strategies look across that thousand?',
  },

  /* ---- 8 · Strategies ---- */
  'B8.1': {
    prompt:
      'We have a perfect strategy and its average, 254.6. But play one strong game against one greedy game — and sometimes the greedy one wins. Play.',
    payoff:
      'One game says almost nothing: chance is louder than strategy. To see who is really stronger, you must play not once but a thousand times.',
  },
  'B8.2': {
    prompt: 'Run both strategies over a thousand games each and watch their averages.',
    payoff:
      'The averages stop jumping and settle into place — the strong one higher. This is the law of large numbers again, now as a working tool: computing not by formula but by running a multitude of random games. This approach is called the **Monte Carlo method**.',
  },
  'B8.3': {
    prompt: 'Gather the totals of thousands of games into a histogram.',
    payoff:
      'A familiar shape — the bell. It’s the very normal distribution that rose on the sum of five dice; now a whole game’s total falls this way. The bell has a center — μ, the mean.',
  },
  'B8.4': {
    prompt: 'Take two strategies with different temperaments. Compare them.',
    payoff:
      'The widths differ: one keeps tight around the mean, the other scatters wide. This measure of spread is called **variance** (and its root is σ). Now a strategy has not one number but two: where the center is (μ) and how wide it is (σ). That’s its signature.',
  },
  'B8.5': {
    prompt: 'But the bell is an idealization. Look at the right edge.',
    payoff:
      'On the right the total stretches into a long tail — farther than a smooth bell would allow. It’s pulled by the Yahtzee bonuses, +100 for each repeat. The far edge is thirteen Yahtzees in a row, a maximum of 1575. *(This is a demo, not your roll.)* Almost all of the maximum, 1200 of 1575, is twelve hundred-point bonuses.',
  },
  'B8.6': {
    prompt:
      'Every game’s total now has its own signature (μ, σ). But that signature is built from the decisions on each turn. Let’s work out how to make them: what’s easier to roll — and where to put that hand afterward.',
  },

  /* ---- 11 · Strategies (what's easy to roll / how to close 13) ---- */
  'STR.A1': {
    prompt:
      'You’ve seen how often combinations show up on a single roll. But you don’t play with one roll — you get three, with rerolls between them. Pick a combination.',
    payoff:
      'From a single roll the odds are modest:\n[[Yahtzee — 0.08% · four of a kind — 2% · full house — 3.9% · large straight — 3.1% · small — 15% · three of a kind — 21%]]\nBut these aren’t the numbers you play by.',
  },
  'STR.A2': {
    prompt:
      'Over a whole turn, rerolling wisely, the chance is far higher. Run it — the model plays turn by turn, aiming for the combination, and counts how often it gets there.',
    payoff:
      'A Yahtzee over a turn comes up for about one player in 22 — around **4.6%**. On a single roll it was 0.08%: over a turn it’s fifty times more often, and still rare. The other combinations jump over a turn too — the model counts each by the same honest rerolling.',
  },
  'STR.A3': {
    prompt: 'Rank the combinations by difficulty — by the chance of making them over a turn.',
    payoff:
      'Three of a kind and a pair are almost free, picked up in passing. A small straight and a full house sit in the middle. A large straight, four of a kind, and especially a Yahtzee are costly: you have to chase them and guard a whole turn for them. That’s the answer to “what’s easier to roll”: [[cheap combinations you take incidentally, expensive ones you plan for.]]',
  },
  'STR.A4': {
    prompt:
      'Since some combinations are cheap and others dear, the central question of a game arises: which hand goes into which of the thirteen rows?',
  },
  'STR.B1': {
    prompt:
      'Thirteen rows, thirteen turns — each closed exactly once. So the question isn’t “is the hand good” but “where to record it.” Here’s a hand — pick a row.',
    payoff:
      'The same hand is worth different amounts in different rows — and each filled row is gone for good. [[A good move picks not the most points now, but the one that leaves everything remaining worth more.]]',
  },
  'STR.B2': {
    prompt: 'Late on, a junk hand arrives and the good rows are already gone. What now? Take a zero on purpose.',
    payoff:
      'Sometimes the best move is to write a zero. Burning an unreachable row (a Yahtzee you can no longer make, say) with a zero is cheaper than spoiling a good row with it or leaving a hole for later. [[A sacrifice is part of the plan, not a defeat.]]',
  },
  'STR.B3': {
    prompt: 'Another goal hides inside the game — the upper bonus. Push the upper section to 63.',
    payoff:
      'Thirty-five points wait past the threshold of 63, which is about three dice on each face:\n[[$3\\cdot(1+2+3+4+5+6) = 63 \\Rightarrow +35$]]\nThat’s why early sixes and fives are often saved for the upper section rather than dumped into “chance”: falling a couple of points short costs all thirty-five.',
  },
  'STR.B4': {
    prompt:
      'These forks give rise to characters — each defined by what it optimizes. Run the championship: let all five play fifteen hundred games each.',
    payoff:
      'The championship isn’t looking for “the best” — it’s an **instrument** that reads off each role’s signature.\n[[A character’s signature is a point (μ, σ): where the center is and how wide the spread.]]\nScroll on — meet the five one at a time.',
  },
  'STR.C1': {
    prompt: 'First — the EV-maximizer. Each turn it takes the most points.',
    payoff:
      'Its signature sits farthest right in μ: the solitaire optimum, the highest mean. The spread is sizeable, though — it grabs the max in lucky games and flops alike. In solitaire it can’t be beaten.',
  },
  'STR.C2': {
    prompt: 'The conservator. It banks sure points and leaves no holes.',
    payoff:
      'Its point is the lowest in σ — a narrow, reliable signature. The mean is moderate, but flops are rare.',
  },
  'STR.C3': {
    prompt: 'The bonus hunter. Everything is tuned to the 63 threshold and its +35.',
    payoff:
      'A split signature: hit the bonus and it slides up-right, miss it and it drops left. So the spread is wider than the conservator’s.',
  },
  'STR.C4': {
    prompt: 'The Yahtzee hunter. It burns turns chasing big combos.',
    payoff:
      'The widest spread — high in σ, lowish in μ. Feast or famine: a fat right tail at the cost of frequent flops.',
  },
  'STR.C5': {
    prompt: 'And the random one — it writes a hand wherever, with no plan.',
    payoff:
      'Bottom-left: lowest in μ, everything bunched near the floor. It optimizes nothing — the baseline against which the value of a plan shows.',
  },
  'STR.B5': {
    prompt: 'Now all five on one field.',
    payoff:
      'Here is the whole cloud of signatures. In solitaire they can be ranked — the EV-maximizer farthest right. The roles become incomparable only once the goal shifts from “more points” to “more than the opponent.” It is from this cloud that an adaptive player then chooses.',
  },
  'STR.B6': {
    prompt: 'And which signature is best — depends on what you’re playing against.',
  },

  /* ---- 9 · The opponent ---- */
  'B9.1': {
    prompt:
      "Until now you played alone against the card. Seat an opponent beside you: he rolls his dice, you roll yours. You don't affect his chance at all, nor he yours. Play a turn side by side.",
    payoff:
      "Notice: the dice mathematics hasn't changed one iota — the same probabilities and values as before. Something else has changed — and it's the most important thing in the whole game.",
  },
  'B9.2': {
    prompt:
      'Alone, the goal was the most points on average. Against an opponent the goal is different: not more points, but more than his. Toggle the goal and watch the recommended move.',
    payoff:
      'The same roll, the same card — yet the best move changed. The **objective function** changed: what we call “good.” All the mathematics stayed put — only the criterion it’s turned to has changed.',
  },
  'B9.3': {
    prompt:
      "You're behind by 30, one turn left. Cautious play won't save you — on average you'll land below the opponent. Crank up the risk.",
    payoff:
      'Widen the spread. Yes, the mean drops — but you don’t need the mean, you need to leap ahead. A wide distribution drives more mass past the opponent’s line: the chance of overtaking grows even as μ falls. Behind — raise σ.',
  },
  'B9.4': {
    prompt: "Now the reverse — you're leading. The same move? Narrow the risk.",
    payoff:
      'No. Narrow the spread. You don’t need a record — you need to keep the opponent from leaping over by chance. A narrow, reliable distribution closes out the game. Leading — lower σ. The very spread σ that once told the strategy-characters apart has now become a weapon, and its direction depends on whether you’re ahead or behind.',
  },
  'B9.5': {
    prompt:
      'How predictable is the opponent’s total at all? It depends on how many turns he has left. Slide the number of remaining turns.',
    payoff:
      'Early in the game the opponent’s total is blurred by a wide funnel — many random turns still lie ahead. The fewer turns remain, the narrower the funnel:\n[[$\\sigma \\propto \\sqrt{\\text{turns left}}$]]\nThe spread falls roughly like the square root of the turns left. That’s why you only truly read the opponent near the end.',
  },
  'B9.6': {
    prompt: 'Strictly speaking, the goal isn’t to “overtake one rival” but to place higher.',
    payoff:
      'The exact goal is **expected rank**, your average place in the final standings. And real game theory — with bluffing and coalitions — begins only at three players: there you can band together against the leader. With two it’s simpler: overtake, and that’s it.',
  },
  'B9.7': {
    prompt:
      'Reading the opponent’s funnel, tuning your own risk as the game goes — let’s bring it together into one live game.',
  },

  /* ---- 10 · Synthesis ---- */
  'B10.1': {
    prompt:
      'Bring it all into one live game against an opponent — with the full kit: real dice and holds, the value of every category, live odds of completing each combination, a running optimum score on the same rolls, the move tree and the opponent funnel. Play a few turns.',
    payoff:
      'Each of your moves is no longer “take the most points.” It’s a function of three things: where you are now (the state), how many turns are left, and what the goal is. Such a strategy-function is called a **policy**:\n[[$\\pi(\\text{state}, \\text{turns left}, \\text{goal})$]]\nThe engine computes the expectation for each category every turn and points to the best move, and alongside it tracks the optimum on the same rolls — so you can see how far behind the best play you are and exactly where you left points. You still decide.',
  },
  'B10.2': {
    prompt: 'And it splits the game in two of its own accord.',
    payoff:
      'Early on the opponent’s funnel is wide, nothing to read — you play almost as in solitaire, for the maximum average. By the end the funnel narrows, the opponent is read — and you tune your risk to him: behind, you widen; ahead, you tighten. Strategy has become a function of the position.',
  },
  'B10.3': {
    prompt:
      'And what even measures one strategy’s “probability of winning” over another? The very thing it all started with. Drag N.',
    payoff:
      'You run thousands of games and take the share you won:\n[[$\\hat P(\\text{win}) = \\frac{1}{N}\\sum_{i} \\mathbf{1}[\\text{win}_i]$]]\nAs N grows the estimate settles on the true probability — this is the same Monte-Carlo method, and it rests on the very law of large numbers it all began with: the share of games won steadies exactly as the share of heads once did.',
  },
  'B10.4': {
    prompt: 'And here is the honest upshot of all this mathematics.',
    payoff:
      'The perfect strategy beats the best human players only by a hair. Over 23 million real games the optimum proved about fifty times more accurate than the best humans — yet that is only around four extra wins per hundred games. Not because the mathematics is weak, but because the spread is enormous: the mountain of chance is far taller than the gap in skill. Yahtzee is a game where luck decides almost everything.',
  },
  'B10.5': {
    prompt:
      'For most of the game you play against the shape of chance. Then against the rules. Then against your own future decisions. And only at the end — against the one who changes a single thing: the criterion of victory. All of it was hiding behind five dice and thirteen rows.',
  },
}
