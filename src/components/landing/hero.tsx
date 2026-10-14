"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, PlayCircle, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-vault.jpg";
import { useAuth } from "@/hooks/use-auth";

export function Hero() {
  const { user, isAuthenticated } = useAuth();
  const imgSrc = typeof heroImage === "string" ? heroImage : heroImage.src;
  const dashboardUrl = user?.role === "doctor" ? "/doctor" : "/dashboard";

  return (
    <section id="top" className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-48 h-[32rem] bg-primary-soft blur-3xl opacity-70"
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 py-20 lg:grid-cols-[1.05fr_1fr] lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-[var(--shadow-xs)]">
            <Sparkles className="size-3.5 text-accent" aria-hidden="true" />
            Built for Indian families
          </span>
          <h1 className="mt-6 text-4xl leading-[1.08] font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            India&apos;s <span className="text-gradient-brand">AI Personal Health</span>{" "}
            Intelligence Platform
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Securely store every lab report and prescription, understand your family&apos;s complete
            health history in plain language, and find trusted hospitals and doctors near you — all
            in one calm, private vault.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="min-h-12 px-6 text-base shadow-[var(--shadow-glow)]"
            >
              <Link href={isAuthenticated ? dashboardUrl : "/signup"}>
                {isAuthenticated ? "Go to Your Dashboard" : "Start Your Health Vault"}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="min-h-12 bg-card px-6 text-base" asChild>
              <a href="#how-it-works">
                <PlayCircle className="size-4" aria-hidden="true" />
                See How It Works
              </a>
            </Button>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Free to start · Encrypted storage · No records ever sold
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <img
            src={imgSrc}
            alt="LifeLedger digital health timeline with AI insight cards and a health score"
            width={1280}
            height={1024}
            className="float-slow w-full rounded-3xl shadow-[var(--shadow-float)]"
          />
        </motion.div>
      </div>
    </section>
  );
}
