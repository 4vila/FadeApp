"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const SLIDES = [
  {
    src: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200&q=80",
    alt: "Interior de barbearia",
  },
  {
    src: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=1200&q=80",
    alt: "Barbeiro em atendimento",
  },
  {
    src: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=1200&q=80",
    alt: "Barbearia moderna",
  },
  {
    src: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200&q=80",
    alt: "Cadeira de barbearia",
  },
];

const INTERVAL_MS = 5000;

export function HeroSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, INTERVAL_MS);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="absolute inset-0">
      {SLIDES.map((slide, i) => (
        <div
          key={slide.src}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === index ? "opacity-100 z-0" : "opacity-0 z-[-1]"
          }`}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            className="object-cover"
            sizes="100vw"
            priority={i === 0}
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        </div>
      ))}
      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-1.5 w-6 rounded-full transition-colors ${
              i === index ? "bg-primary" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
