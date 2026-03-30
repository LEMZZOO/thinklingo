'use client';

import { useRef, useEffect, useState, useLayoutEffect } from 'react';

// Use useLayoutEffect in browser, useEffect in SSR
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

interface FitTextProps {
  text: string;
  maxFontSize?: number;
  minFontSize?: number;
  className?: string;
}

export function FitText({ 
  text, 
  maxFontSize = 60, 
  minFontSize = 16, 
  className = "" 
}: FitTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [fontSize, setFontSize] = useState(maxFontSize);
  
  const isSingleWord = !text.includes(' ') && !text.includes('-');

  useIsomorphicLayoutEffect(() => {
    const container = containerRef.current;
    const textNode = textRef.current;
    if (!container || !textNode) return;

    // Reset font size to max when text changes
    textNode.style.fontSize = `${maxFontSize}px`;
    
    let currentSize = maxFontSize;
    
    // We check if the scrollWidth (actual text width) is larger than clientWidth (container usable width).
    // We also check scrollHeight if it's a phrase wrapping too many lines, but mainly width is the issue for single words.
    while (
      (textNode.scrollWidth > container.clientWidth || textNode.scrollHeight > container.clientHeight) && 
      currentSize > minFontSize
    ) {
      currentSize -= 1;
      textNode.style.fontSize = `${currentSize}px`;
    }
    
    setFontSize(currentSize);

  }, [text, maxFontSize, minFontSize]);

  useEffect(() => {
    const handleResize = () => {
       // Force re-evaluation on window resize
       setFontSize(maxFontSize);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [maxFontSize]);

  return (
    <div 
      ref={containerRef} 
      className={`w-full h-full flex items-center justify-center ${className}`}
    >
      <span 
        ref={textRef}
        className="font-black leading-tight text-center"
        style={{ 
          fontSize: `${fontSize}px`, 
          whiteSpace: isSingleWord ? 'nowrap' : 'normal',
          wordBreak: 'normal',
          overflowWrap: 'normal',
          hyphens: 'none',
          lineHeight: '1.1'
        }}
      >
        {text}
      </span>
    </div>
  );
}
