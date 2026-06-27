import Prism from 'prismjs';
import 'prismjs/components/prism-python';

// Returns Prism-highlighted HTML for the overlay <pre>. A trailing newline keeps
// the last line rendered so the highlight layer stays aligned with the textarea.
export function highlight(code: string, language: string): string {
  const isPy = language === 'python';
  const grammar = isPy ? Prism.languages.python : Prism.languages.javascript;
  return Prism.highlight(code + '\n', grammar, isPy ? 'python' : 'javascript');
}
