"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const themeStorageKey = "jahan-color-theme";
type Theme = "light" | "dark";

function readTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function ThemeToggle({ className }: { className?: string }) {
  function toggleTheme() {
    const nextTheme: Theme = readTheme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.style.colorScheme = nextTheme;
    window.localStorage.setItem(themeStorageKey, nextTheme);
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn("theme-toggle size-11 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground", className)}
      aria-label="Toggle light and dark mode"
      title="Toggle light and dark mode"
      onClick={toggleTheme}
    >
      <Sun className="theme-toggle-sun size-[18px]" aria-hidden />
      <Moon className="theme-toggle-moon size-[18px]" aria-hidden />
    </Button>
  );
}
