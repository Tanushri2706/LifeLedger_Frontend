"use client";

import Link from "next/link";
import { ArrowRight, HeartPulse } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

import { Reveal } from "./reveal";

const footerLinks = [
  { label: "Privacy", href: "#" },
  { label: "Security", href: "#" },
  { label: "Support", href: "#" },
  { label: "Terms", href: "#" },
  { label: "Contact", href: "#" },
];

export function FinalCta() {
  const { user, isAuthenticated } = useAuth();
  const dashboardUrl = user?.role === "doctor" ? "/doctor" : "/dashboard";

  return (
    <section className="mx-auto max-w-6xl px-5 py-20 lg:py-24">
      <Reveal variant="scale">
        <div
          className="rounded-3xl px-6 py-14 text-center shadow-[var(--shadow-glow)] sm:px-14"
          style={{ backgroundImage: "var(--gradient-brand)" }}
        >
          <h2 className="text-3xl font-semibold tracking-tight text-primary-foreground sm:text-4xl">
            Take control of your health journey.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-primary-foreground/85 sm:text-base">
            Add your first report in under two minutes. No card, no clinic visit, no paperwork.
          </p>
          <Button asChild size="lg" variant="secondary" className="mt-9 min-h-12 px-6 text-base">
            <Link href={isAuthenticated ? dashboardUrl : "/signup"}>
              {isAuthenticated ? "Go to Your Dashboard" : "Start Your Health Vault"}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </Reveal>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <a href="#top" className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
              <HeartPulse className="size-5" aria-hidden="true" />
            </span>
            <span className="font-display text-base font-semibold">LifeLedger</span>
          </a>
          <nav className="flex flex-wrap gap-x-7 gap-y-3 text-sm text-muted-foreground">
            {footerLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} LifeLedger · Connecting You to Better Healthcare</p>
          <p>Informational support only — always consult a registered medical practitioner.</p>
        </div>
      </div>
    </footer>
  );
}
