import { CodeBlock } from "@/registry/blocks/code-block";
import type { ReactNode } from "react";

interface CodeSnippetProps {
  code?: string;
  children?: ReactNode;
  language?: string;
  highlightLines?: string;
  showLineNumbers?: boolean;
  className?: string;
}

export const CodeSnippet = ({
  code,
  children,
  language = "python",
  showLineNumbers,
  className,
}: CodeSnippetProps) => {
  let content: string;

  if (code) {
    // Use the code prop if available
    content = code;
  } else if (typeof children === "string") {
    // Use children as string if available
    content = children;
  } else {
    // Fallback
    content = "// No code provided";
  }

  // Clean up content if it's a string
  if (typeof content === "string") {
    // Trim common whitespace (dedent)
    const lines = content.split("\n");
    const nonEmptyLines = lines.filter((line) => line.trim().length > 0);

    if (nonEmptyLines.length > 0) {
      const minIndent = Math.min(
        ...nonEmptyLines.map((line) => /^\s*/.exec(line)?.[0].length ?? 0)
      );

      content = lines
        .map((line) => line.slice(minIndent))
        .join("\n")
        .trim();
    }
  }

  return (
    <CodeBlock
      className={className}
      code={content}
      language={language}
      showLineNumbers={showLineNumbers}
    />
  );
};
