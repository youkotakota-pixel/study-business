"use client";

import { useEffect, useId, useRef } from "react";
import mermaid from "mermaid";

type MermaidDiagramProps = {
  chart: string;
};

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const id = useId().replace(/:/g, "");

  useEffect(() => {
    let cancelled = false;

    async function render() {
      mermaid.initialize({
        startOnLoad: false,
        theme: "neutral",
        securityLevel: "strict",
        fontFamily: "var(--font-geist-sans), sans-serif",
      });

      if (!containerRef.current || cancelled) return;

      try {
        const { svg } = await mermaid.render(`mermaid-${id}`, chart.trim());
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch {
        if (!cancelled && containerRef.current) {
          containerRef.current.textContent = "図の表示に失敗しました";
        }
      }
    }

    void render();

    return () => {
      cancelled = true;
    };
  }, [chart, id]);

  return (
    <div
      ref={containerRef}
      className="mermaid-shell overflow-x-auto rounded-xl border bg-card p-3 [&_svg]:mx-auto [&_svg]:max-w-none"
      aria-label="図"
    />
  );
}
