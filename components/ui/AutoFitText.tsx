"use client";

import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";

interface AutoFitTextProps {
  children: string;
  className?: string;
  containerClassName?: string;
  maxFontSize?: number;
  minFontSize?: number;
}

export function AutoFitText({
  children,
  className,
  containerClassName,
  maxFontSize = 24,
  minFontSize = 12,
}: AutoFitTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [fontSize, setFontSize] = useState(maxFontSize);

  const fitText = useCallback(() => {
    const container = containerRef.current;
    const text = textRef.current;
    if (!container || !text) return;

    let size = maxFontSize;
    text.style.fontSize = `${size}px`;

    while (size > minFontSize && text.scrollWidth > container.clientWidth) {
      size -= 1;
      text.style.fontSize = `${size}px`;
    }

    setFontSize(size);
  }, [maxFontSize, minFontSize]);

  useEffect(() => {
    fitText();
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(fitText);
    observer.observe(container);
    return () => observer.disconnect();
  }, [children, fitText]);

  return (
    <div
      ref={containerRef}
      className={cn("flex w-full min-w-0 items-center overflow-hidden", containerClassName)}
    >
      <span
        ref={textRef}
        className={cn("inline-block max-w-full whitespace-nowrap tabular-nums leading-tight", className)}
        style={{ fontSize }}
      >
        {children}
      </span>
    </div>
  );
}
