import type { CExercise } from '../types';

const exercise: CExercise = {
  id: 'tree-sum',
  title: 'Sum of a binary tree',
  module: '11 · Data Structures in C',
  order: 1040,
  difficulty: 'medium',
  mode: 'function',
  prompt: `A binary tree node holds a value and two child pointers, left and right, each
of which may be another node or NULL.

Implement tree_sum(root) to add up the values of every node in the tree. An empty
tree (root is NULL) sums to 0.

The struct is defined at the top of the file — write tree_sum below it. A hidden
harness builds a few trees and checks your total.`,
  starter: `struct TreeNode {
    int val;
    struct TreeNode* left;
    struct TreeNode* right;
};

int tree_sum(const struct TreeNode* root) {
    // sum this node plus the sums of the left and right subtrees
    return 0;
}
`,
  lesson: {
    intro: `A *binary tree* is like a linked list that branches. Instead of a single
\`next\`, each node has two pointers, \`left\` and \`right\`, so paths split into subtrees.
Either child can be \`NULL\`, marking the edge of the tree.

Trees are naturally *recursive*: the left child is itself the root of a smaller tree,
and so is the right child. That structure invites a recursive solution — the sum of
a tree is just this node's value plus the sum of its left subtree plus the sum of its
right subtree.`,
    sections: [
      {
        heading: 'The base case stops the recursion',
        body: `Every recursion needs a *base case* — a situation simple enough to answer without
recursing further. For a tree, that case is the empty tree: if \`root\` is \`NULL\`,
there are no values, so the sum is \`0\`. Written out: \`if (root == NULL) return 0;\`.

Without a base case, the function would keep calling itself on \`NULL\` children
forever (and crash trying to read \`NULL->val\`). The \`NULL\` check is what lets the
recursion "bottom out" and start returning real numbers back up the chain.`,
      },
      {
        heading: 'The recursive case combines the subtrees',
        body: `When \`root\` is a real node, the answer is \`root->val\` plus whatever the two
subtrees sum to. You do not hand-walk those subtrees — you *trust the function* to
handle them: \`root->val + tree_sum(root->left) + tree_sum(root->right)\`.

This leap of faith is the heart of recursion. Assume \`tree_sum\` already works for
smaller trees, and your job shrinks to combining three things: this value and the two
child results. The whole traversal can collapse into one line:
\`return root ? root->val + tree_sum(root->left) + tree_sum(root->right) : 0;\`.`,
      },
    ],
    workedExample: `// count how many nodes are in the tree (same recursion shape)
int tree_count(const struct TreeNode* root) {
    if (root == NULL) return 0;              // empty -> 0 nodes
    return 1                                  // this node
         + tree_count(root->left)             // plus the left subtree
         + tree_count(root->right);           // plus the right subtree
}`,
    whyItMatters: `Trees model hierarchy everywhere: file systems, the DOM of a web page,
expression parsers, database indexes (B-trees), and decision trees in ML. The
"base case + combine children" recursion you write here is the template for nearly
every tree operation — searching, measuring depth, copying, serializing. Learn to
trust recursion on one subtree and the rest of the tree world opens up.`,
    commonMistakes: [
      'Omitting the `NULL` base case, so the function recurses into `NULL` children and dereferences `NULL->val`.',
      'Adding only one subtree (`tree_sum(root->left)`) and forgetting the other, halving the tree.',
      'Trying to write a loop instead of trusting recursion — trees branch, so a single `while` cannot cover both children cleanly.',
      'Using `root.val` instead of `root->val` — `root` is a pointer.',
    ],
    hint: 'If `root` is `NULL`, return `0`. Otherwise return `root->val + tree_sum(root->left) + tree_sum(root->right);` — let the function call itself on each child.',
  },
  harness: `#include <stdio.h>
int main(void) {
    struct TreeNode g = {4, NULL, NULL};
    struct TreeNode l = {2, &g, NULL};
    struct TreeNode r = {3, NULL, NULL};
    struct TreeNode root = {1, &l, &r};
    printf("%d\\n", tree_sum(&root));

    struct TreeNode solo = {5, NULL, NULL};
    printf("%d\\n", tree_sum(&solo));

    printf("%d\\n", tree_sum(NULL));
    return 0;
}`,
  expectedStdout: `10
5
0
`,
  reference: `struct TreeNode {
    int val;
    struct TreeNode* left;
    struct TreeNode* right;
};

int tree_sum(const struct TreeNode* root) {
    return root ? root->val + tree_sum(root->left) + tree_sum(root->right) : 0;
}
`,
};

export default exercise;
