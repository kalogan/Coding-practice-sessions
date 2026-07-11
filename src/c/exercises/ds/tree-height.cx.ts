import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'tree-height',
  title: 'Height of a binary tree',
  module: '11 · Data Structures in C',
  order: 1050,
  difficulty: 'medium',
  mode: 'function',
  prompt: `The height of a binary tree is the number of nodes on the longest path from the
root down to a leaf.

Implement tree_height(root): an empty tree (NULL) has height 0, a single node has
height 1, and any other node has height 1 + the taller of its two subtrees.

The struct is defined at the top of the file — write tree_height below it. A hidden
harness builds a few trees and checks your answer.`,
  starter: `#include <stddef.h>  // for NULL

struct TreeNode {
    int val;
    struct TreeNode* left;
    struct TreeNode* right;
};

int tree_height(const struct TreeNode* root) {
    // 1 + the taller of the two subtrees; NULL is height 0
    return 0;
}
`,
  lesson: {
    intro: `Height measures how *deep* a tree goes. Picture standing at the root and asking
"what is the longest chain of nodes down to a dead end?" That length is the height.
An empty tree has height 0; a lone node has height 1; adding a level below it makes
it 2, and so on.

Like summing a tree, this is a recursive question with a \`NULL\` base case. But the
combine step is different: instead of *adding* the two subtree results, you take the
*larger* of them and add one for the current node.`,
    sections: [
      {
        heading: 'Base case and the +1 for the current level',
        body: `The base case is the empty tree: \`if (root == NULL) return 0;\`. A missing node
contributes no levels.

For a real node, the longest downward path goes through *one* of its children — you
cannot walk both left and right on a single path. So you find each subtree's height,
take whichever is bigger, and add 1 to account for the node you are standing on. A
leaf (both children \`NULL\`) gets \`1 + max(0, 0)\` = \`1\`, which is exactly right.`,
      },
      {
        heading: 'Taking the max without a library',
        body: `C has no built-in \`max\` for you here, and you should not reach for \`<math.h>\` —
just compare directly. Compute both child heights into variables, then pick the
larger with a ternary: \`int taller = lh > rh ? lh : rh;\` and return \`1 + taller\`.

Read \`lh > rh ? lh : rh\` as "if \`lh\` is greater than \`rh\`, use \`lh\`, otherwise use
\`rh\`." Storing the two recursive results in \`lh\` and \`rh\` first also avoids calling
each subtree twice, which keeps the work linear in the number of nodes.`,
      },
    ],
    workedExample: `// depth of the DEEPER side, plus one for this node
int tree_height(const struct TreeNode* root) {
    if (root == NULL) return 0;                 // empty -> 0
    int lh = tree_height(root->left);           // height of left subtree
    int rh = tree_height(root->right);          // height of right subtree
    return 1 + (lh > rh ? lh : rh);             // this level + the taller side
}`,
    whyItMatters: `Height (and its cousin, depth) tells you how balanced a tree is — the key to
performance. A balanced binary search tree has height about log(n), so lookups are
fast; a lopsided one degrades into a slow linked list. Self-balancing structures
(AVL, red-black trees) constantly compare subtree heights to decide when to rotate.
Measuring height is the first step toward understanding why balance matters.`,
    commonMistakes: [
      'Adding the two subtree heights instead of taking their max — that measures something, but not height.',
      'Returning `0` for a single leaf; a leaf has height `1` because `1 + max(0, 0) = 1`.',
      'Forgetting the `NULL` base case, so recursion runs off the bottom into `NULL->left`.',
      'Reaching for `fmax` from `<math.h>` — it is not linked here; use a plain `?:` or an `if` comparison.',
    ],
    hint: 'If `root` is `NULL` return `0`. Otherwise compute `lh` and `rh` from the two children, then `return 1 + (lh > rh ? lh : rh);`.',
  },
  harness: `#include <stdio.h>
int main(void) {
    struct TreeNode bl = {2, NULL, NULL};
    struct TreeNode br = {3, NULL, NULL};
    struct TreeNode broot = {1, &bl, &br};
    printf("%d\\n", tree_height(&broot));

    struct TreeNode solo = {7, NULL, NULL};
    printf("%d\\n", tree_height(&solo));

    printf("%d\\n", tree_height(NULL));

    struct TreeNode c3 = {30, NULL, NULL};
    struct TreeNode c2 = {20, &c3, NULL};
    struct TreeNode c1 = {10, &c2, NULL};
    printf("%d\\n", tree_height(&c1));
    return 0;
}`,
  expectedStdout: `2
1
0
3
`,
  reference: `#include <stddef.h>  // for NULL

struct TreeNode {
    int val;
    struct TreeNode* left;
    struct TreeNode* right;
};

int tree_height(const struct TreeNode* root) {
    if (root == NULL) return 0;
    int lh = tree_height(root->left);
    int rh = tree_height(root->right);
    return 1 + (lh > rh ? lh : rh);
}
`,
};

export default exercise;
