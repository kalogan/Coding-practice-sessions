import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'is-prime',
  title: 'Is it prime?',
  module: '3 · Loops',
  order: 260,
  difficulty: 'medium',
  mode: 'function',
  prompt: `Implement is_prime(n): return 1 if n is a prime number, or 0 if it is not.

A prime is a whole number greater than 1 whose only divisors are 1 and itself. Numbers
below 2 are not prime. Test candidate divisors with a loop and bail out early the moment
you find one. You may NOT use the math library (no sqrt).`,
  starter: `int is_prime(int n) {
    // return 1 if prime, 0 otherwise
    return 0;
}
`,
  lesson: {
    intro: `A number is *prime* if it's at least 2 and nothing except 1 and itself divides
it evenly. To decide, we try potential divisors and ask: does any of them go in with no
remainder? If even one does, \`n\` is not prime and we can stop immediately.

Two tools make this efficient: an *early return* the moment we find a divisor, and a
clever loop bound that avoids checking far more numbers than necessary.`,
    sections: [
      {
        heading: 'Early return: stop as soon as you know',
        body: `First rule out the small cases: \`if (n < 2) return 0;\` — 0 and 1 (and
negatives) aren't prime.

Then loop candidate divisors \`i\` starting at 2. If \`n % i == 0\`, then \`i\` divides
\`n\` evenly, so \`n\` is composite — \`return 0;\` right there, no need to check the
rest. If the loop finishes without ever finding a divisor, \`n\` survived every test, so
\`return 1;\`. Returning early is both faster and clearer than setting a flag.`,
      },
      {
        heading: 'Why i * i <= n instead of i < n',
        body: `You don't need to test divisors all the way up to \`n\`. Divisors come in
pairs: if \`i\` divides \`n\`, so does \`n / i\`, and one member of every pair is at most
the square root of \`n\`. So once \`i\` passes \`sqrt(n)\`, any remaining divisor would
already have been caught as the smaller partner.

We can't call \`sqrt\` (no math library here), and we don't need to: the condition
\`i * i <= n\` says exactly "i is still at or below the square root of n" using only
integer multiplication. That turns a check of ~n divisors into ~sqrt(n) of them.`,
      },
    ],
    workedExample: `// is n divisible by any i in 2 .. sqrt(n)?
if (n < 2) return 0;
for (int i = 2; i * i <= n; i++) {
    if (n % i == 0) return 0;   // found a divisor: composite
}
return 1;                        // no divisor found: prime`,
    whyItMatters: `Primality testing underpins cryptography (RSA keys are built from large
primes) and lots of number-theory code. But the transferable lessons are broader: an
*early return* to quit the instant the answer is decided, and shrinking a search from
linear to square-root by reasoning about the problem instead of brute-forcing it.`,
    commonMistakes: [
      'Forgetting the `n < 2` guard, so 0, 1, or negatives are wrongly reported prime.',
      'Looping `i < n` (correct but needlessly slow) — or worse, `i <= n`, so `n % n == 0` flags every number as composite.',
      'Returning 1 inside the loop on the first non-divisor, before all candidates are checked.',
      'Reaching for `sqrt()` from `<math.h>` instead of the integer test `i * i <= n`.',
    ],
    hint: 'Guard `if (n < 2) return 0;`, then `for (int i = 2; i * i <= n; i++) if (n % i == 0) return 0;`, and finally `return 1;`.',
  },
  harness: `#include <stdio.h>
int main(void) {
    printf("%d\\n", is_prime(2));
    printf("%d\\n", is_prime(15));
    printf("%d\\n", is_prime(17));
    printf("%d\\n", is_prime(1));
    printf("%d\\n", is_prime(97));
    return 0;
}`,
  expectedStdout: `1
0
1
0
1
`,
  reference: `int is_prime(int n) {
    if (n < 2) return 0;
    for (int i = 2; i * i <= n; i++) {
        if (n % i == 0) return 0;
    }
    return 1;
}
`,
};

export default exercise;
