"use client";

import { useRef, useEffect, useState, type ReactNode } from "react";

interface AnimateOnScrollProps {
  children: ReactNode;
  /** Delay in ms before starting the animation (e.g. for stagger effect) */
  delay?: number;
  /** Optional class name for the wrapper */
  className?: string;
}

export function AnimateOnScroll({ children, delay = 0, className = "" }: AnimateOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          timeoutId = setTimeout(() => setVisible(true), delay);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -20px 0px" }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-500 ease-out ${
        visible
          ? "translate-y-0 scale-100 opacity-100"
          : "translate-y-6 scale-[0.98] opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}
