"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <button
      type="button"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-xl",
        "border border-border/60 bg-card text-muted-foreground",
        "transition-all duration-200",
        "hover:border-primary/40 hover:bg-primary/[0.04] hover:text-primary",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        "active:scale-95"
      )}
    >
      {mounted && theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
    </button>
  );
};
