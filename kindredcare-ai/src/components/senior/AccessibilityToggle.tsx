"use client";

import { useEffect, useState, useLayoutEffect } from "react";
import { cn } from "@/lib/utils/cn";

const STORAGE_KEY_TEXT = "kc.senior.text";
const STORAGE_KEY_CONTRAST = "kc.senior.contrast";

function applyAccessibility(textLarge: boolean, contrastHigh: boolean) {
  const html = document.documentElement;
  if (textLarge) html.dataset.seniorText = "large";
  else delete html.dataset.seniorText;
  if (contrastHigh) html.dataset.seniorContrast = "high";
  else delete html.dataset.seniorContrast;
}

export function AccessibilityProvider({ initialContrast = false }: { initialContrast?: boolean }) {
  useEffect(() => {
    const text = localStorage.getItem(STORAGE_KEY_TEXT) === "large";
    const contrast = localStorage.getItem(STORAGE_KEY_CONTRAST);
    const contrastHigh = contrast === null ? initialContrast : contrast === "high";
    applyAccessibility(text, contrastHigh);
  }, [initialContrast]);
  return null;
}

export function AccessibilityToggle({ initialContrast = false }: { initialContrast?: boolean }) {
  const [textLarge, setTextLarge] = useState(false);
  const [contrastHigh, setContrastHigh] = useState(initialContrast);

  // useLayoutEffect runs only on the client; this component is loaded with ssr:false
  // so there is no hydration mismatch.
  useLayoutEffect(() => {
    const t = localStorage.getItem(STORAGE_KEY_TEXT) === "large";
    const c = localStorage.getItem(STORAGE_KEY_CONTRAST);
    const ch = c === null ? initialContrast : c === "high";
    setTextLarge(t);
    setContrastHigh(ch);
    applyAccessibility(t, ch);
  }, [initialContrast]);

  function toggleText() {
    const next = !textLarge;
    setTextLarge(next);
    localStorage.setItem(STORAGE_KEY_TEXT, next ? "large" : "normal");
    applyAccessibility(next, contrastHigh);
  }

  function toggleContrast() {
    const next = !contrastHigh;
    setContrastHigh(next);
    localStorage.setItem(STORAGE_KEY_CONTRAST, next ? "high" : "normal");
    applyAccessibility(textLarge, next);
  }

  return (
    <div
      className="grid grid-cols-2 gap-3"
      role="group"
      aria-label="Display preferences"
    >
      <button
        type="button"
        onClick={toggleText}
        aria-pressed={textLarge}
        className={cn(
          "rounded-2xl border-2 px-4 py-3 font-bold text-senior-base transition-colors",
          "focus:outline-none focus:ring-4 focus:ring-blue-300",
          textLarge
            ? "bg-blue-700 text-white border-blue-700"
            : "bg-white text-blue-700 border-blue-300 hover:bg-blue-50",
        )}
      >
        <span className="text-2xl mr-2" aria-hidden="true">🅰️</span>
        Big text
      </button>
      <button
        type="button"
        onClick={toggleContrast}
        aria-pressed={contrastHigh}
        className={cn(
          "rounded-2xl border-2 px-4 py-3 font-bold text-senior-base transition-colors",
          "focus:outline-none focus:ring-4 focus:ring-blue-300",
          contrastHigh
            ? "bg-gray-900 text-white border-gray-900"
            : "bg-white text-gray-800 border-gray-400 hover:bg-gray-50",
        )}
      >
        <span className="text-2xl mr-2" aria-hidden="true">🌓</span>
        High contrast
      </button>
    </div>
  );
}
