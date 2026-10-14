"use client";

import { Sun, Moon, Laptop, Check } from "lucide-react";
import { useTheme, type Theme } from "@/providers/theme-provider";
import { cn } from "@/lib/utils";

interface ThemeOption {
  value: Theme;
  label: string;
  description: string;
  icon: typeof Sun;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    value: "light",
    label: "Light",
    description: "Clean daylight theme with crisp contrast",
    icon: Sun,
  },
  {
    value: "dark",
    label: "Dark",
    description: "Dimmed theme optimized for low-light environments",
    icon: Moon,
  },
  {
    value: "system",
    label: "System",
    description: "Automatically matches your device preference",
    icon: Laptop,
  },
];

export function AppearanceCard() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm sm:p-8">
      <div className="mb-6 space-y-1">
        <h2 className="font-display text-lg sm:text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Sun className="size-5 text-primary" />
          Appearance
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Customize how LifeLedger looks across your devices and workspace.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        {THEME_OPTIONS.map((opt) => {
          const isSelected = theme === opt.value;
          const Icon = opt.icon;

          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTheme(opt.value)}
              className={cn(
                "relative flex flex-col items-start p-4 rounded-2xl border text-left transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                isSelected
                  ? "border-primary bg-primary-soft/40 shadow-sm"
                  : "border-border/80 bg-surface/60 hover:border-border hover:bg-surface"
              )}
              aria-pressed={isSelected}
            >
              <div className="flex w-full items-center justify-between mb-3">
                <div
                  className={cn(
                    "flex size-9 items-center justify-center rounded-xl",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="size-4" />
                </div>
                {isSelected && (
                  <div className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-3" />
                  </div>
                )}
              </div>

              <span className="font-semibold text-sm text-foreground mb-1">
                {opt.label}
              </span>
              <span className="text-xs text-muted-foreground leading-relaxed">
                {opt.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
