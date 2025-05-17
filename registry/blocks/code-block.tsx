import { CopyButton } from "@/registry/blocks/copy-button";
import {
  highlightCode,
  stripHighlightMarkers,
} from "@/registry/lib/code-highlights";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

interface CodeBlockProps {
  code: string;
  language?: string;
  meta?: string;
  className?: string;
  showLineNumbers?: boolean;
}

export function CodeBlock({
  code,
  language = "text",
  meta = "",
  className = "",
  showLineNumbers = true,
}: CodeBlockProps) {
  const [html, setHtml] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const codeRef = useRef<HTMLDivElement>(null);
  const [isSmallBlock, setIsSmallBlock] = useState<boolean>(false);

  useEffect(() => {
    async function highlight() {
      setIsLoading(true);
      try {
        const { themeHtml } = await highlightCode(code, language, meta);
        setHtml(themeHtml);
      } catch (error) {
        console.error("Error highlighting code:", error);
        // Fallback to plain pre/code in case of error
        const escapedCode = code
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");

        const fallbackHtml = `<pre class="language-${language}"><code>${escapedCode}</code></pre>`;
        setHtml(fallbackHtml);
      } finally {
        setIsLoading(false);
      }
    }

    highlight();
  }, [code, language, meta]);

  // Check if code block is small after rendering
  useEffect(() => {
    if (codeRef.current) {
      // Get the height of the code block
      const height = codeRef.current.clientHeight;
      // Consider blocks less than 100px as small
      setIsSmallBlock(height < 100);
    }
  }, [isLoading, html]);

  // If loading, just show the code without syntax highlighting to maintain size
  if (isLoading) {
    return (
      <div
        className={`code-block-wrapper relative m-0 overflow-hidden p-0 text-sm ${className}`}
      >
        <pre className='m-0 p-4'>
          <code className='opacity-0'>{code}</code>
        </pre>
      </div>
    );
  }

  return (
    <div
      ref={codeRef}
      className={cn(
        `code-block-wrapper ${
          showLineNumbers && "show-line-numbers"
        } group relative m-0 p-0 text-sm border rounded-md`,
        className
      )}
    >
      {/* Buttons - positioned based on block size */}
      <div
        className={cn(
          "absolute z-10 opacity-0 transition-opacity group-hover:opacity-100 max-sm:opacity-80 sm:opacity-0",
          isSmallBlock
            ? "top-1/2 right-3 flex -translate-y-1/2 space-x-1"
            : "top-3 right-3"
        )}
      >
        <CopyButton content={stripHighlightMarkers(code)} />
      </div>

      <div className='highlight-container w-full overflow-auto'>
        <div
          className='w-full text-sm'
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}
