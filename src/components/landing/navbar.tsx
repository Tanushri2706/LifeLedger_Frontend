"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HeartPulse, Menu, X, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

const links = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "AI Health Vault", href: "#ai-preview" },
  { label: "Hospitals", href: "/hospitals" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const dashboardUrl = user?.role === "doctor" ? "/doctor" : "/dashboard";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-shadow duration-300",
        scrolled ? "glass-calm shadow-[var(--shadow-xs)]" : "bg-background",
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5">
        <Link
          href={isAuthenticated ? dashboardUrl : "/"}
          className="flex min-w-0 items-center gap-2.5"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
            <HeartPulse className="size-5" aria-hidden="true" />
          </span>
          <span className="truncate font-display text-lg font-semibold tracking-tight">
            LifeLedger
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground lg:flex">
          {links.map((link) =>
            link.href === "/hospitals" ? (
              <Link
                key={link.label}
                href="/hospitals"
                className="transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className="transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ),
          )}
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <Button asChild className="shadow-[var(--shadow-glow)]">
              <Link href={dashboardUrl} className="gap-1.5">
                Go to Dashboard
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" className="hidden sm:inline-flex">
                <Link href="/signin">Sign In</Link>
              </Button>
              <Button asChild className="shadow-[var(--shadow-glow)]">
                <Link href="/signup">Get Started</Link>
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="min-h-11 min-w-11 lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-border bg-card px-5 pb-4 lg:hidden">
          <nav className="flex flex-col py-2 text-sm font-medium">
            {links.map((link) =>
              link.href === "/hospitals" ? (
                <Link
                  key={link.label}
                  href="/hospitals"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-2 py-3 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-2 py-3 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
                >
                  {link.label}
                </a>
              ),
            )}
            {isAuthenticated ? (
              <Link
                href={dashboardUrl}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-3 font-semibold text-primary transition-colors hover:bg-surface"
              >
                Go to Dashboard →
              </Link>
            ) : (
              <Link
                href="/signin"
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-3 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground sm:hidden"
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
