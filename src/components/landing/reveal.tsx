"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
  /** fade, slide and scale only — per the LifeLedger motion direction */
  variant?: "fade" | "slide" | "scale";
  id?: string;
};

const variants = {
  fade: { hidden: { opacity: 0 }, show: { opacity: 1 } },
  slide: { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } },
  scale: { hidden: { opacity: 0, scale: 0.97 }, show: { opacity: 1, scale: 1 } },
};

export function Reveal({ children, delay = 0, className, variant = "slide", id }: RevealProps) {
  return (
    <motion.div
      id={id}
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
      variants={variants[variant]}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
}) {
  return (
    <Reveal
      className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl text-left"}
    >
      {eyebrow ? (
        <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">{eyebrow}</p>
      ) : null}
      <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
      {subtitle ? (
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">{subtitle}</p>
      ) : null}
    </Reveal>
  );
}
