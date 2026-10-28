type CodeBlockProps = {
  /** Shown above the code: a file name, "Terminal", "application.yml"... */
  label?: string;
  /** The code, usually a template literal; see `dedent` for what is trimmed. */
  children: string;
};

/**
 * Lets a post write code as an indented template literal inside its JSX:
 * drops the blank first and last lines and the indentation every line shares.
 */
function dedent(code: string): string {
  const lines = code.replace(/^\s*\n/, "").trimEnd().split("\n");
  const indent = Math.min(
    ...lines.filter((l) => l.trim()).map((l) => l.search(/\S/)),
  );
  return lines.map((l) => l.slice(indent)).join("\n");
}

export default function CodeBlock({ label, children }: CodeBlockProps) {
  return (
    <figure className="code-block">
      {label && <figcaption>{label}</figcaption>}
      <pre>
        <code>{dedent(children)}</code>
      </pre>
    </figure>
  );
}
