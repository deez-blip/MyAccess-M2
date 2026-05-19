"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export interface AccessibilitySettings {
  highContrast: boolean;
  largeCursor: boolean;
  colorBlindAssist: boolean;
  largeText: boolean;
  keyboardTts: boolean;
  enhancedFocus: boolean;
  reducedMotion: boolean;
}

interface AccessibilityContextValue {
  settings: AccessibilitySettings;
  toggleSetting: (key: keyof AccessibilitySettings) => void;
  updateSetting: (key: keyof AccessibilitySettings, value: boolean) => void;
  resetSettings: () => void;
}

const STORAGE_KEY = "a11y_settings";

const DEFAULT_SETTINGS: AccessibilitySettings = {
  highContrast: false,
  largeCursor: false,
  colorBlindAssist: false,
  largeText: false,
  keyboardTts: false,
  enhancedFocus: true,
  reducedMotion: false,
};

const AccessibilityContext = createContext<AccessibilityContextValue | undefined>(
  undefined
);

function getElementSpeechText(element: HTMLElement) {
  const ariaLabel = element.getAttribute("aria-label");
  if (ariaLabel) return ariaLabel;

  const labelledBy = element.getAttribute("aria-labelledby");
  if (labelledBy) {
    const labels = labelledBy
      .split(" ")
      .map((id) => document.getElementById(id)?.textContent?.trim())
      .filter(Boolean);
    if (labels.length) return labels.join(" ");
  }

  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    const fromPlaceholder = element.placeholder?.trim();
    if (fromPlaceholder) return fromPlaceholder;

    if (element.id) {
      const label = document.querySelector(`label[for="${element.id}"]`);
      const labelText = label?.textContent?.trim();
      if (labelText) return labelText;
    }
  }

  const text = element.textContent?.trim();
  if (text) return text;

  return "Élément interactif";
}

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_SETTINGS);
  const [isReady, setIsReady] = useState(false);
  const keyboardNavigationRef = useRef(false);
  const lastSpeechRef = useRef<string>("");
  const lastSpeechAtRef = useRef(0);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<AccessibilitySettings>;
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch {
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isReady) return;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));

    const root = document.documentElement;
    root.dataset.a11yHighContrast = settings.highContrast ? "true" : "false";
    root.dataset.a11yLargeCursor = settings.largeCursor ? "true" : "false";
    root.dataset.a11yColorBlindAssist = settings.colorBlindAssist ? "true" : "false";
    root.dataset.a11yLargeText = settings.largeText ? "true" : "false";
    root.dataset.a11yEnhancedFocus = settings.enhancedFocus ? "true" : "false";
    root.dataset.a11yReducedMotion = settings.reducedMotion ? "true" : "false";
    root.dataset.a11yKeyboardTts = settings.keyboardTts ? "true" : "false";
  }, [isReady, settings]);

  useEffect(() => {
    if (!settings.keyboardTts) {
      window.speechSynthesis?.cancel();
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab" || event.key === "ArrowDown" || event.key === "ArrowUp") {
        keyboardNavigationRef.current = true;
      }
    };

    const handleMouseDown = () => {
      keyboardNavigationRef.current = false;
    };

    const handleFocusIn = (event: FocusEvent) => {
      if (!keyboardNavigationRef.current) return;

      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      const interactiveSelector =
        "a, button, input, select, textarea, [role='button'], [role='link'], [tabindex]:not([tabindex='-1'])";

      if (!target.matches(interactiveSelector)) return;

      const text = getElementSpeechText(target);
      const now = Date.now();
      if (text === lastSpeechRef.current && now - lastSpeechAtRef.current < 400) {
        return;
      }

      lastSpeechRef.current = text;
      lastSpeechAtRef.current = now;

      if (!window.speechSynthesis) return;

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "fr-FR";
      utterance.rate = 1;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("focusin", handleFocusIn);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("focusin", handleFocusIn);
      window.speechSynthesis?.cancel();
    };
  }, [settings.keyboardTts]);

  const toggleSetting = useCallback((key: keyof AccessibilitySettings) => {
    setSettings((current) => ({ ...current, [key]: !current[key] }));
  }, []);

  const updateSetting = useCallback(
    (key: keyof AccessibilitySettings, value: boolean) => {
      setSettings((current) => ({ ...current, [key]: value }));
    },
    []
  );

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  const value = useMemo(
    () => ({ settings, toggleSetting, updateSetting, resetSettings }),
    [settings, toggleSetting, updateSetting, resetSettings]
  );

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error("useAccessibility doit être utilisé dans un AccessibilityProvider");
  }
  return context;
}
