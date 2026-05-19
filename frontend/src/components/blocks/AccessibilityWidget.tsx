"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  Accessibility,
  Volume2,
  Eye,
  MousePointer2,
  Focus,
  Type,
  RotateCcw,
  Activity,
} from "lucide-react";
import { useAccessibility } from "@/contexts/AccessibilityContext";

export function AccessibilityWidget() {
  const { settings, toggleSetting, resetSettings } = useAccessibility();
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    const onClickOutside = (event: MouseEvent) => {
      if (!panelRef.current) return;
      if (!panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousedown", onClickOutside);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", onClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="fixed bottom-4 right-4 z-[100]" ref={panelRef}>
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-primary-foreground shadow-lg hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <Accessibility className="h-5 w-5" aria-hidden="true" />
        <span className="text-sm font-medium">Accessibilité</span>
      </button>

      {isOpen && (
        <section
          id={panelId}
          aria-label="Réglages d'accessibilité"
          className="mt-3 w-[min(92vw,360px)] rounded-xl border bg-background p-4 shadow-2xl"
        >
          <h2 className="text-base font-semibold">Mini panneau d&apos;accessibilité</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Active les options selon ton besoin, à tout moment.
          </p>

          <ul className="mt-3 space-y-2">
            <ToggleItem
              icon={<Volume2 className="h-4 w-4" aria-hidden="true" />}
              label="Lecture vocale clavier (TTS)"
              checked={settings.keyboardTts}
              onChange={() => toggleSetting("keyboardTts")}
            />
            <ToggleItem
              icon={<Eye className="h-4 w-4" aria-hidden="true" />}
              label="Contraste renforcé"
              checked={settings.highContrast}
              onChange={() => toggleSetting("highContrast")}
            />
            <ToggleItem
              icon={<MousePointer2 className="h-4 w-4" aria-hidden="true" />}
              label="Gros curseur"
              checked={settings.largeCursor}
              onChange={() => toggleSetting("largeCursor")}
            />
            <ToggleItem
              icon={<Type className="h-4 w-4" aria-hidden="true" />}
              label="Texte agrandi"
              checked={settings.largeText}
              onChange={() => toggleSetting("largeText")}
            />
            <ToggleItem
              icon={<Focus className="h-4 w-4" aria-hidden="true" />}
              label="Focus clavier renforcé"
              checked={settings.enhancedFocus}
              onChange={() => toggleSetting("enhancedFocus")}
            />
            <ToggleItem
              icon={<Activity className="h-4 w-4" aria-hidden="true" />}
              label="Réduire les animations"
              checked={settings.reducedMotion}
              onChange={() => toggleSetting("reducedMotion")}
            />
          </ul>

          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-accent"
              onClick={resetSettings}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Réinitialiser
            </button>
            <button
              type="button"
              className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent"
              onClick={() => setIsOpen(false)}
            >
              Fermer
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

function ToggleItem({
  icon,
  label,
  checked,
  onChange,
}: {
  icon: ReactNode;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-md border p-2">
      <span className="inline-flex items-center gap-2 text-sm">
        {icon}
        {label}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative h-7 w-12 rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring overflow-hidden ${
          checked ? "bg-primary" : "bg-muted"
        }`}
      >
        <span
          className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </li>
  );
}
