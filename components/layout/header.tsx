"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../../public/images/logo.png";
import { ThemeToggle } from "../core/theme-toggle";

const navLinks = [
  { name: "Docs",      href: "https://support.myapps.ai", external: true },
  { name: "Pricing",   href: "#pricing" },
  { name: "Support",   href: "https://support.myapps.ai", external: true },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-5xl px-4 pt-4"
      >
        <nav
          aria-label="Global"
          className={cn(
            "flex items-center justify-between rounded-2xl px-4 py-2.5 transition-all duration-500",
            "border nav-glass",
            scrolled
              ? "border-border/80 shadow-nav"
              : "border-transparent"
          )}
        >
          {/* Logo */}
          <Link href="/" prefetch={false} className="group flex items-center gap-2">
            <motion.div
              whileHover={{ rotate: [0, -8, 8, 0] }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20"
            >
              <Image src={logo} alt="" width={18} height={18} className="object-contain" />
            </motion.div>
            <span className="text-[15px] font-bold tracking-tight text-foreground">
              AI Tutor
            </span>
            <span className="font-mono text-[10px] font-bold text-primary bg-primary/10 ring-1 ring-primary/20 px-1.5 py-0.5 rounded-md">
              API
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="group relative px-3.5 py-2 rounded-xl text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                {item.name}
                <span className="absolute bottom-1 left-1/2 h-px w-0 -translate-x-1/2 bg-primary transition-all duration-300 group-hover:w-4" />
              </Link>
            ))}
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            <Link
              href="/workflows"
              prefetch={false}
              className={cn(
                "relative hidden md:inline-flex items-center overflow-hidden rounded-xl px-4 py-2",
                "bg-primary text-primary-foreground text-[13px] font-semibold",
                "shadow-glow-xs hover:shadow-glow-sm",
                "transition-all duration-300 hover:brightness-110 active:scale-[0.97]"
              )}
            >
              <span className="relative z-10">Start building</span>
              <span
                className="pointer-events-none absolute inset-0 -z-0 opacity-0 hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
                }}
              />
            </Link>

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex md:hidden h-8 w-8 items-center justify-center rounded-lg border border-border/60 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {mobileOpen ? (
                  <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" d="M4 8h16M4 16h16" />
                )}
              </svg>
            </button>
          </div>
        </nav>

        {/* Mobile dropdown */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="md:hidden mt-2 overflow-hidden rounded-2xl border border-border/60 nav-glass"
            >
              <div className="p-3 space-y-1">
                {navLinks.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    {item.name}
                  </Link>
                ))}
                <Link
                  href="/workflows"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-xl px-4 py-2.5 text-sm font-semibold text-primary bg-primary/10"
                >
                  Start building
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </header>
  );
}
