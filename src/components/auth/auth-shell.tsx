"use client";

import Link from "next/link";
import { HeartPulse, Lock, ShieldCheck, CloudCog } from "lucide-react";
import type { ReactNode } from "react";

import authIllustration from "@/assets/auth-illustration.jpg";
import { Reveal } from "@/components/landing/reveal";

const trust = [
  { icon: Lock, label: "End-to-end encrypted", note: "AES-256 at rest, TLS in transit" },
  { icon: ShieldCheck, label: "Private by default", note: "Only you decide who can view" },
  { icon: CloudCog, label: "Secure cloud storage", note: "Backed up across Indian regions" },
];

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const imgSrc = typeof authIllustration === "string" ? authIllustration : authIllustration.src;

  return (
    <main id="main-content" className="min-h-dvh bg-surface bg-aurora-soft">
      <div className="mx-auto grid min-h-dvh w-full max-w-6xl grid-cols-1 lg:grid-cols-2">
        {/* form column */}
        <div className="flex flex-col px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
              <HeartPulse className="size-5" aria-hidden="true" />
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">LifeLedger</span>
          </Link>

          <div className="flex flex-1 items-center py-10">
            <Reveal className="w-full">
              <div className="mx-auto w-full max-w-md">
                <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                  {title}
                </h1>
                <p className="mt-3 text-base leading-relaxed text-muted-foreground">{subtitle}</p>
                <div className="mt-8">{children}</div>
                {footer ? <div className="mt-8">{footer}</div> : null}
              </div>
            </Reveal>
          </div>

          <p className="text-xs leading-relaxed text-muted-foreground">
            By continuing you agree to LifeLedger&apos;s Terms and Privacy Policy. Your health records
            are never sold or shared without your consent.
          </p>
        </div>

        {/* illustration column */}
        <aside className="relative hidden overflow-hidden lg:block">
          <img
            src={imgSrc}
            alt="Illustration of a stethoscope, a secured health report and a privacy shield"
            loading="lazy"
            width={1024}
            height={1280}
            className="absolute inset-0 size-full object-cover"
          />
          <div className="relative flex h-full flex-col justify-end p-8">
            <div className="glass-ai p-6">
              <p className="font-display text-lg font-semibold tracking-tight">
                Your family&apos;s health history, safely in one place.
              </p>
              <ul className="mt-5 space-y-4">
                {trust.map((item) => (
                  <li key={item.label} className="flex items-start gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-card text-primary shadow-[var(--shadow-xs)]">
                      <item.icon className="size-4.5" aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block text-sm font-medium">{item.label}</span>
                      <span className="block text-xs text-muted-foreground">{item.note}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

export function TrustRowMobile() {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground lg:hidden">
      {trust.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5">
          <item.icon className="size-3.5 text-primary" aria-hidden="true" />
          {item.label}
        </li>
      ))}
    </ul>
  );
}
