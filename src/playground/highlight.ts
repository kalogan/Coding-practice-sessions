import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-c';

// Returns Prism-highlighted HTML for the overlay <pre>. A trailing newline keeps
// the last line rendered so the highlight layer stays aligned with the textarea.
export function highlight(code: string, language: string): string {
  const grammar = Prism.languages[language] ?? Prism.languages.javascript;
  const lang = Prism.languages[language] ? language : 'javascript';
  return Prism.highlight(code + '\n', grammar, lang);
}
