import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { MermaidDiagram } from "@/components/mermaid-diagram";

const components: Components = {
  h1: ({ children }) => (
    <h1 className="mb-4 text-xl font-semibold tracking-tight">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-8 mb-3 text-lg font-semibold tracking-tight">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-6 mb-2 text-base font-semibold">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="mb-4 text-[15px] leading-7 text-foreground/90">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="mb-4 list-disc space-y-2 pl-5 text-[15px] leading-7">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-4 list-decimal space-y-2 pl-5 text-[15px] leading-7">{children}</ol>
  ),
  li: ({ children }) => <li className="text-foreground/90">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  code: ({ className, children }) => {
    const language = className?.replace("language-", "") ?? "";
    const text = String(children).replace(/\n$/, "");

    if (language === "mermaid") {
      return <MermaidDiagram chart={text} />;
    }

    return (
      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">{children}</code>
    );
  },
  pre: ({ children }) => <div className="mb-4">{children}</div>,
};

type ArticleContentProps = {
  body: string;
};

export function ArticleContent({ body }: ArticleContentProps) {
  return (
    <article className="prose-mobile">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {body}
      </ReactMarkdown>
    </article>
  );
}
