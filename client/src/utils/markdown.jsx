/*
 * Minimal markdown renderer for AI replies.
 *
 * Supports: paragraphs, **bold**, *italic*, `code`, ```fenced blocks```,
 * > blockquotes, and - / 1. lists.
 *
 * SECURITY: this returns React ELEMENTS and never touches
 * dangerouslySetInnerHTML, so any HTML in the model's output is displayed as
 * literal text and can never execute. That property is why hand-rolling this is
 * safe; the usual danger with markdown is piping generated HTML into the DOM.
 */

const INLINE = /(\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`\n]+`)/g;

// Parses bold / italic / inline-code inside a single line of text.
export const renderInline = (text, keyPrefix = "i") => {
  const parts = String(text).split(INLINE).filter(Boolean);
  return parts.map((part, i) => {
    const key = `${keyPrefix}-${i}`;
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={key} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={key} className="rounded bg-[var(--surface-subtle)] px-1.5 py-0.5 font-mono text-[0.9em]">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={key}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
};

const isUl = (l) => /^\s*[-*]\s+/.test(l);
const isOl = (l) => /^\s*\d+\.\s+/.test(l);

export const Markdown = ({ content = "", className = "" }) => {
  const lines = String(content).replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let i = 0;
  let k = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (/^\s*```/.test(line)) {
      const code = [];
      i++;
      while (i < lines.length && !/^\s*```/.test(lines[i])) code.push(lines[i++]);
      i++; // consume closing fence
      blocks.push(
        <pre
          key={`b${k++}`}
          className="my-2 overflow-x-auto rounded-lg bg-[var(--surface-subtle)] p-3 font-mono text-xs leading-relaxed"
        >
          <code>{code.join("\n")}</code>
        </pre>
      );
      continue;
    }

    // Blockquote (consecutive "> " lines)
    if (/^\s*>\s?/.test(line)) {
      const quote = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
        quote.push(lines[i].replace(/^\s*>\s?/, ""));
        i++;
      }
      blocks.push(
        <blockquote
          key={`b${k++}`}
          className="my-2 border-l-2 border-[var(--accent)] pl-3 italic text-[var(--text-muted)]"
        >
          {renderInline(quote.join(" "), `q${k}`)}
        </blockquote>
      );
      continue;
    }

    // Lists
    if (isUl(line) || isOl(line)) {
      const ordered = isOl(line);
      const items = [];
      while (i < lines.length && (ordered ? isOl(lines[i]) : isUl(lines[i]))) {
        items.push(lines[i].replace(ordered ? /^\s*\d+\.\s+/ : /^\s*[-*]\s+/, ""));
        i++;
      }
      const Tag = ordered ? "ol" : "ul";
      blocks.push(
        <Tag
          key={`b${k++}`}
          className={`my-2 space-y-1 pl-5 ${ordered ? "list-decimal" : "list-disc"}`}
        >
          {items.map((it, idx) => (
            <li key={idx}>{renderInline(it, `l${k}-${idx}`)}</li>
          ))}
        </Tag>
      );
      continue;
    }

    // Blank line
    if (!line.trim()) { i++; continue; }

    // Paragraph: gather until a blank line or a new block starts
    const para = [];
    while (
      i < lines.length && lines[i].trim() &&
      !/^\s*```/.test(lines[i]) && !/^\s*>\s?/.test(lines[i]) &&
      !isUl(lines[i]) && !isOl(lines[i])
    ) {
      para.push(lines[i++]);
    }
    blocks.push(
      <p key={`b${k++}`} className="whitespace-pre-wrap leading-relaxed">
        {renderInline(para.join("\n"), `p${k}`)}
      </p>
    );
  }

  return <div className={`space-y-2 ${className}`}>{blocks}</div>;
};

export default Markdown;
