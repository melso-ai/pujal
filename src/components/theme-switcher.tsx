"use client";

import { useEffect, useSyncExternalStore, type ComponentType } from "react";
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";

import { DARK_QUERY, THEME_KEY as KEY } from "@/lib/theme";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark" | "system";

const CHANGE = "pujal:theme";

const OPTIONS: readonly { value: Theme; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { value: "light", label: "Clar", icon: SunIcon },
  { value: "dark", label: "Fosc", icon: MoonIcon },
  { value: "system", label: "Sistema", icon: MonitorIcon },
];

function read(): Theme {
  try {
    const t = localStorage.getItem(KEY);
    return t === "light" || t === "dark" ? t : "system";
  } catch {
    return "system";
  }
}

function apply(theme: Theme) {
  const dark = theme === "dark" || (theme === "system" && matchMedia(DARK_QUERY).matches);
  document.documentElement.classList.toggle("dark", dark);
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE, onChange);
  };
}

function setTheme(theme: Theme) {
  try {
    if (theme === "system") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, theme);
  } catch {}
  apply(theme);
  window.dispatchEvent(new Event(CHANGE));
}

export function ThemeSwitcher({ className }: { className?: string }) {
  // The stored choice only exists in the browser, so nothing reads as selected on the server.
  const theme = useSyncExternalStore<Theme | null>(subscribe, read, () => null);

  useEffect(() => {
    if (theme !== "system") return;
    const media = matchMedia(DARK_QUERY);
    const follow = () => apply("system");
    media.addEventListener("change", follow);
    return () => media.removeEventListener("change", follow);
  }, [theme]);

  return (
    <div
      role="radiogroup"
      aria-label="Tema"
      className={cn("inline-flex w-fit items-center gap-0.5 rounded-full bg-sidebar-accent p-0.5", className)}
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const selected = theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={label}
            title={label}
            onClick={() => setTheme(value)}
            className={cn(
              "flex size-6 items-center justify-center rounded-full outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/30",
              selected
                ? "bg-background text-foreground shadow-[var(--surface-shadow)]"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="size-3.5" />
          </button>
        );
      })}
    </div>
  );
}
