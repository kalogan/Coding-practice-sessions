export function CodePanel({ code }: { code: string }) {
  return (
    <details className="code-panel" open>
      <summary>The real code</summary>
      <pre>
        <code>{code}</code>
      </pre>
    </details>
  );
}
