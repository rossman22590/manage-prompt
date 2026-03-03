/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        sans:    ["Plus Jakarta Sans", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        display: ["Plus Jakarta Sans", "-apple-system", "sans-serif"],
        serif:   ["Instrument Serif", "Georgia", "serif"],
        mono:    ["JetBrains Mono", "Fira Code", "monospace"],
      },
      fontSize: {
        "display-xl": ["4.5rem",  { lineHeight: "1.05", letterSpacing: "-0.04em", fontWeight: "800" }],
        "display-lg": ["3.75rem", { lineHeight: "1.08", letterSpacing: "-0.03em", fontWeight: "800" }],
        "display-md": ["3rem",    { lineHeight: "1.1",  letterSpacing: "-0.02em", fontWeight: "700" }],
        "display-sm": ["2.25rem", { lineHeight: "1.15", letterSpacing: "-0.02em", fontWeight: "700" }],
      },
      colors: {
        border:     "hsl(var(--border))",
        input:      "hsl(var(--input))",
        ring:       "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary:    { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary:  { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        destructive:{ DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        muted:      { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent:     { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        popover:    { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        card:       { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
      },
      borderRadius: {
        sm:   "calc(var(--radius) - 4px)",
        md:   "calc(var(--radius) - 2px)",
        lg:   "var(--radius)",
        xl:   "calc(var(--radius) + 4px)",
        "2xl":"calc(var(--radius) + 8px)",
        "3xl":"calc(var(--radius) + 16px)",
      },
      boxShadow: {
        "glow-xs":  "0 0 8px hsl(var(--glow) / 0.12)",
        "glow-sm":  "0 0 16px hsl(var(--glow) / 0.18)",
        "glow-md":  "0 0 32px hsl(var(--glow) / 0.20), 0 0 64px hsl(var(--glow) / 0.10)",
        "glow-lg":  "0 0 48px hsl(var(--glow) / 0.25), 0 0 96px hsl(var(--glow) / 0.12)",
        "float":    "0 8px 32px -4px rgba(0,0,0,0.08), 0 2px 8px -2px rgba(0,0,0,0.04)",
        "float-lg": "0 16px 48px -8px rgba(0,0,0,0.12), 0 4px 16px -4px rgba(0,0,0,0.06)",
        "card-hover":"0 20px 60px -12px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.04)",
        "nav":      "0 1px 0 rgba(0,0,0,0.04), 0 4px 20px rgba(0,0,0,0.06)",
        "inner-glow":"inset 0 1px 0 0 rgba(255,255,255,0.06)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@headlessui/tailwindcss"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
  ],
};
