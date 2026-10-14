"use client";

import {
  Activity,
  Bell,
  CalendarDays,
  FileText,
  HeartPulse,
  Moon,
  QrCode,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Sun,
  Upload,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

/* ---------- helpers ---------- */

function Section({
  id,
  eyebrow,
  title,
  description,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-border/70 py-16 md:py-24">
      <div className="mb-10 max-w-2xl">
        <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">{eyebrow}</p>
        <h2 className="mt-3 text-2xl font-semibold text-foreground md:text-3xl">{title}</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          {description}
        </p>
      </div>
      {children}
    </section>
  );
}

function Swatch({
  name,
  token,
  hex,
  className,
  note,
}: {
  name: string;
  token: string;
  hex?: string;
  className: string;
  note?: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl bg-card shadow-soft">
      <div className={`h-24 w-full ${className}`} />
      <div className="space-y-1 p-4">
        <p className="text-sm font-semibold text-foreground">{name}</p>
        <p className="font-mono text-[11px] text-muted-foreground">{token}</p>
        {hex ? <p className="font-mono text-[11px] text-muted-foreground">{hex}</p> : null}
        {note ? <p className="pt-1 text-xs text-muted-foreground">{note}</p> : null}
      </div>
    </div>
  );
}

/* ---------- page ---------- */

export default function StyleGuidePage() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    return () => document.documentElement.classList.remove("dark");
  }, [dark]);

  const nav = [
    ["color", "Colour"],
    ["type", "Typography"],
    ["buttons", "Buttons"],
    ["cards", "Cards"],
    ["inputs", "Inputs"],
    ["spacing", "Spacing"],
    ["icons", "Icons"],
    ["motion", "Motion"],
  ] as const;

  return (
    <div className="min-h-dvh bg-surface">
      <header className="sticky top-0 z-30 glass-calm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-glow">
              <HeartPulse className="size-5" strokeWidth={1.8} />
            </span>
            <div className="leading-tight">
              <p className="font-display text-sm font-semibold text-foreground">LifeLedger</p>
              <p className="text-[11px] text-muted-foreground">Design foundation · v1</p>
            </div>
          </div>
          <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
            {nav.map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                className="rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {label}
              </a>
            ))}
          </nav>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto"
            onClick={() => setDark((d) => !d)}
          >
            {dark ? (
              <Sun className="size-4" strokeWidth={1.8} />
            ) : (
              <Moon className="size-4" strokeWidth={1.8} />
            )}
            {dark ? "Light" : "Dark"} mode
          </Button>
        </div>
      </header>

      <main id="main-content" className="mx-auto max-w-6xl px-6 pb-24">
        {/* Hero */}
        <div className="animate-slide-up py-16 md:py-24">
          <Badge variant="secondary" className="mb-5 gap-1.5">
            <Sparkles className="size-3.5" strokeWidth={1.8} /> Phase 1 — Brand & Design Foundation
          </Badge>
          <h1 className="max-w-3xl text-4xl leading-[1.08] font-semibold text-foreground md:text-6xl">
            A calm, clinical design system for{" "}
            <span className="text-gradient-brand">personal health intelligence</span>.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Every LifeLedger screen is assembled from these tokens — soft-slate surfaces, generous
            whitespace, 20px cards, 12px buttons and motion that never distracts from a lab result.
          </p>
        </div>

        {/* Colour */}
        <Section
          id="color"
          eyebrow="01 — Colour"
          title="Palette"
          description="Blue carries trust and every primary action. Cyan marks AI intelligence. Slate carries structure. Red is reserved exclusively for emergency actions and is never used for ordinary errors or emphasis."
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Swatch
              name="Primary"
              token="bg-primary"
              hex="#2563EB"
              className="bg-primary"
              note="Primary CTAs, links, focus rings"
            />
            <Swatch
              name="Secondary brand"
              token="bg-brand"
              hex="#3B82F6"
              className="bg-brand"
              note="Gradients, charts, hover states"
            />
            <Swatch
              name="Accent"
              token="bg-accent"
              hex="#06B6D4"
              className="bg-accent"
              note="AI insights, highlights"
            />
            <Swatch
              name="Foreground"
              token="bg-foreground"
              hex="#0F172A"
              className="bg-foreground"
              note="Headings and body copy"
            />
            <Swatch
              name="Background"
              token="bg-background"
              hex="#FFFFFF"
              className="bg-background border-b border-border"
            />
            <Swatch
              name="Surface"
              token="bg-surface"
              hex="#F8FAFC"
              className="bg-surface border-b border-border"
              note="Page canvas, soft slate"
            />
            <Swatch
              name="Muted"
              token="bg-muted"
              className="bg-muted border-b border-border"
              note="Inactive fills"
            />
            <Swatch
              name="Border"
              token="bg-border"
              hex="#E2E8F0"
              className="bg-border"
              note="1px hairlines only"
            />
            <Swatch
              name="Primary soft"
              token="bg-primary-soft"
              className="bg-primary-soft"
              note="Tinted badges, selected rows"
            />
            <Swatch
              name="Accent soft"
              token="bg-accent-soft"
              className="bg-accent-soft"
              note="AI card washes"
            />
            <Swatch
              name="Success"
              token="bg-success"
              className="bg-success"
              note="Normal ranges, verified"
            />
            <Swatch
              name="Warning"
              token="bg-warning"
              className="bg-warning"
              note="Borderline values, reminders"
            />
            <Swatch
              name="Emergency"
              token="bg-emergency"
              className="bg-emergency"
              note="Emergency QR & SOS only"
            />
            <Swatch
              name="Brand gradient"
              token="--gradient-brand"
              className="bg-[image:var(--gradient-brand)]"
              note="Hero words, illustrations"
            />
            <Swatch
              name="AI wash"
              token="--gradient-ai"
              className="bg-[image:var(--gradient-ai)]"
              note="Glass insight cards"
            />
            <Swatch
              name="Muted foreground"
              token="text-muted-foreground"
              hex="#64748B"
              className="bg-muted-foreground"
              note="Secondary text, captions"
            />
          </div>
        </Section>

        {/* Typography */}
        <Section
          id="type"
          eyebrow="02 — Typography"
          title="Type scale"
          description="Sora for headings gives geometric confidence; Inter carries long medical copy at high legibility. Headings tighten to -0.02em tracking; body lines stay relaxed for readability."
        >
          <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
            <Card className="p-2">
              <CardContent className="space-y-7 p-6">
                {[
                  ["Display / 60", "text-6xl", "Sora 600"],
                  ["H1 / 40", "text-4xl", "Sora 600"],
                  ["H2 / 30", "text-3xl", "Sora 600"],
                  ["H3 / 24", "text-2xl", "Sora 600"],
                  ["H4 / 20", "text-xl", "Sora 500"],
                ].map(([label, cls, font]) => (
                  <div
                    key={label}
                    className="border-b border-border/60 pb-5 last:border-0 last:pb-0"
                  >
                    <p className={`font-display ${cls} font-semibold text-foreground`}>
                      Your health, understood
                    </p>
                    <p className="mt-2 font-mono text-[11px] text-muted-foreground">
                      {label} · {cls} · {font}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="p-2">
              <CardContent className="space-y-6 p-6">
                <div>
                  <p className="text-lg leading-relaxed text-foreground">
                    Lead / 18 — Your CBC report from Dr. Lal PathLabs has been summarised.
                  </p>
                  <p className="mt-2 font-mono text-[11px] text-muted-foreground">
                    text-lg · Inter 400
                  </p>
                </div>
                <div>
                  <p className="text-base leading-relaxed text-foreground">
                    Body / 16 — Haemoglobin is 12.4 g/dL, slightly below the reference range for
                    adult men. Your last three readings show a gentle downward trend.
                  </p>
                  <p className="mt-2 font-mono text-[11px] text-muted-foreground">
                    text-base · Inter 400
                  </p>
                </div>
                <div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Small / 14 — Uploaded 12 Mar 2026 · Dr. Lal PathLabs, Pune
                  </p>
                  <p className="mt-2 font-mono text-[11px] text-muted-foreground">
                    text-sm · Inter 400
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
                    Overline / 12
                  </p>
                  <p className="mt-2 font-mono text-[11px] text-muted-foreground">
                    text-xs · Inter 600 · 0.18em tracking
                  </p>
                </div>
                <div>
                  <p className="font-mono text-sm text-foreground">Mono / 14 — HbA1c 5.6%</p>
                  <p className="mt-2 font-mono text-[11px] text-muted-foreground">
                    font-mono · lab values, tokens
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </Section>

        {/* Buttons */}
        <Section
          id="buttons"
          eyebrow="03 — Buttons"
          title="Button styles"
          description="12px radius, no hard borders, soft lift on hover. One primary action per view. Emergency red appears only on SOS and QR-share actions."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Variants</CardTitle>
                <CardDescription>Hierarchy from primary to quiet.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center gap-3">
                <Button>Upload report</Button>
                <Button variant="secondary">View timeline</Button>
                <Button variant="outline">Cancel</Button>
                <Button variant="ghost">Skip</Button>
                <Button variant="link">Learn more</Button>
                <Button className="bg-emergency text-emergency-foreground hover:bg-emergency/90">
                  Emergency QR
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sizes, icons & states</CardTitle>
                <CardDescription>Icons sit left, 16px, 1.8 stroke.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center gap-3">
                <Button size="sm">
                  <Upload className="size-4" strokeWidth={1.8} /> Small
                </Button>
                <Button>
                  <Sparkles className="size-4" strokeWidth={1.8} /> Ask AI
                </Button>
                <Button size="lg" className="shadow-glow">
                  <ShieldCheck className="size-4" strokeWidth={1.8} /> Large
                </Button>
                <Button size="icon" variant="outline" aria-label="Notifications">
                  <Bell className="size-4" strokeWidth={1.8} />
                </Button>
                <Button disabled>Disabled</Button>
              </CardContent>
            </Card>
          </div>
        </Section>

        {/* Cards */}
        <Section
          id="cards"
          eyebrow="04 — Cards"
          title="Card styles"
          description="20px radius, white on soft slate, hairline border plus a soft shadow instead of a hard outline. Glassmorphism is permitted only on highlighted AI insight cards."
        >
          <div className="grid gap-5 md:grid-cols-3">
            <div className="surface-calm p-6">
              <span className="flex size-10 items-center justify-center rounded-md bg-primary-soft text-primary">
                <FileText className="size-5" strokeWidth={1.8} />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-foreground">Standard card</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Default container for records, vitals and settings.{" "}
                <code className="font-mono text-xs">surface-calm</code>
              </p>
            </div>

            <div className="glass-ai animate-scale-in p-6">
              <span className="flex size-10 items-center justify-center rounded-md bg-accent/15 text-accent">
                <Sparkles className="size-5" strokeWidth={1.8} />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-foreground">AI insight card</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Subtle glass + cyan wash. Reserved for AI summaries only.{" "}
                <code className="font-mono text-xs">glass-ai</code>
              </p>
            </div>

            <div className="surface-soft p-6 shadow-xs">
              <span className="flex size-10 items-center justify-center rounded-md bg-card text-muted-foreground shadow-soft">
                <Activity className="size-5" strokeWidth={1.8} />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-foreground">Quiet card</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Low-emphasis grouping inside dense screens.{" "}
                <code className="font-mono text-xs">surface-soft</code>
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            <div className="surface-calm p-5 shadow-xs">
              <p className="font-mono text-[11px] text-muted-foreground">shadow-xs</p>
            </div>
            <div className="surface-calm p-5 shadow-soft">
              <p className="font-mono text-[11px] text-muted-foreground">shadow-soft</p>
            </div>
            <div className="surface-calm p-5 shadow-lift">
              <p className="font-mono text-[11px] text-muted-foreground">shadow-lift</p>
            </div>
          </div>
        </Section>

        {/* Inputs */}
        <Section
          id="inputs"
          eyebrow="05 — Inputs"
          title="Input styles"
          description="12px radius, muted placeholder, primary focus ring. Labels always visible — never placeholder-only, since health data must stay unambiguous."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardContent className="space-y-5 p-6">
                <div className="space-y-2">
                  <Label htmlFor="sg-name">Full name</Label>
                  <Input id="sg-name" placeholder="Ananya Sharma" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sg-phone">Mobile number</Label>
                  <Input id="sg-phone" inputMode="tel" placeholder="+91 98765 43210" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sg-blood">Blood group</Label>
                  <Select>
                    <SelectTrigger id="sg-blood">
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="o+">O+</SelectItem>
                      <SelectItem value="b+">B+</SelectItem>
                      <SelectItem value="a+">A+</SelectItem>
                      <SelectItem value="ab-">AB−</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-5 p-6">
                <div className="space-y-2">
                  <Label htmlFor="sg-notes">Notes for your doctor</Label>
                  <Textarea
                    id="sg-notes"
                    rows={4}
                    placeholder="Mild breathlessness while climbing stairs since last week."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sg-err">Allergy (error state)</Label>
                  <Input
                    id="sg-err"
                    aria-invalid
                    className="border-destructive focus-visible:ring-destructive/30"
                    defaultValue="Penicilin"
                  />
                  <p className="text-xs text-destructive">
                    Please check the spelling of this medicine.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sg-dis">ABHA ID (disabled)</Label>
                  <Input id="sg-dis" disabled defaultValue="12-3456-7890-1234" />
                </div>
              </CardContent>
            </Card>
          </div>
        </Section>

        {/* Spacing */}
        <Section
          id="spacing"
          eyebrow="06 — Spacing & radius"
          title="Spacing system"
          description="A 4px base scale. Components use 4–24, section padding uses 64–96, and page gutters stay at 24 on mobile. Whitespace is the product's main visual signal of calm."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Scale (4px base)</CardTitle>
                <CardDescription>Tailwind step → pixels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 p-6 pt-0">
                {[
                  ["1", 4],
                  ["2", 8],
                  ["3", 12],
                  ["4", 16],
                  ["6", 24],
                  ["8", 32],
                  ["12", 48],
                  ["16", 64],
                  ["24", 96],
                ].map(([step, px]) => (
                  <div key={step} className="flex items-center gap-4">
                    <span className="w-14 font-mono text-[11px] text-muted-foreground">
                      {step} / {px}px
                    </span>
                    <span
                      className="h-3 rounded-xs bg-primary/80"
                      style={{ width: `${px as number}px` }}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Radius</CardTitle>
                <CardDescription>Cards 20px · buttons and inputs 12px</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4 p-6 pt-0">
                {[
                  ["rounded-sm", "8px"],
                  ["rounded-md", "12px"],
                  ["rounded-lg", "16px"],
                  ["rounded-xl", "20px"],
                  ["rounded-2xl", "24px"],
                  ["rounded-full", "pill"],
                ].map(([cls, px]) => (
                  <div key={cls} className="text-center">
                    <div className={`size-20 bg-primary-soft ${cls}`} />
                    <p className="mt-2 font-mono text-[11px] text-muted-foreground">{px}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </Section>

        {/* Icons */}
        <Section
          id="icons"
          eyebrow="07 — Iconography"
          title="Icon style"
          description="Lucide line icons only, 1.8 stroke weight, 16–24px, currentColor. Icons are paired with text labels for clinical clarity and never used alone to convey meaning."
        >
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {[
              [HeartPulse, "Vitals"],
              [FileText, "Reports"],
              [Sparkles, "AI insight"],
              [Upload, "Upload"],
              [CalendarDays, "Timeline"],
              [Stethoscope, "Doctor"],
              [QrCode, "Emergency QR"],
              [ShieldCheck, "Privacy"],
              [Activity, "Trends"],
              [Bell, "Reminders"],
            ].map(([Icon, label]) => {
              const I = Icon as typeof HeartPulse;
              return (
                <div
                  key={label as string}
                  className="surface-calm flex flex-col items-center gap-3 p-5"
                >
                  <I className="size-6 text-primary" strokeWidth={1.8} />
                  <p className="text-xs text-muted-foreground">{label as string}</p>
                </div>
              );
            })}
          </div>
        </Section>

        {/* Motion */}
        <Section
          id="motion"
          eyebrow="08 — Motion"
          title="Animation direction"
          description="Fade, slide and scale only — no bounce, spin, parallax or attention-seeking loops. 160–420ms with a calm ease-out curve, and everything collapses under reduced-motion."
        >
          <div className="grid gap-5 md:grid-cols-3">
            {[
              ["Fade", "animate-fade-in", "240ms · opacity only. Content swaps, tab panels."],
              ["Slide up", "animate-slide-up", "420ms · 14px travel. Section reveals, lists."],
              ["Scale in", "animate-scale-in", "240ms · 0.97 → 1. Dialogs, AI insight cards."],
            ].map(([name, cls, note]) => (
              <MotionDemo key={name} name={name} cls={cls} note={note} />
            ))}
          </div>
          <div className="surface-calm mt-5 p-6">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Tokens:{" "}
              <code className="font-mono text-xs text-foreground">--duration-fast 160ms</code> ·{" "}
              <code className="font-mono text-xs text-foreground">--duration-base 240ms</code> ·{" "}
              <code className="font-mono text-xs text-foreground">--duration-slow 420ms</code> ·{" "}
              <code className="font-mono text-xs text-foreground">
                --ease-calm cubic-bezier(0.22, 1, 0.36, 1)
              </code>
            </p>
          </div>
        </Section>
      </main>
    </div>
  );
}

function MotionDemo({ name, cls, note }: { name: string; cls: string; note: string }) {
  const [key, setKey] = useState(0);
  return (
    <div className="surface-calm p-6">
      <div className="flex h-28 items-center justify-center rounded-lg bg-surface">
        <div
          key={key}
          className={`${cls} rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground`}
        >
          {name}
        </div>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{note}</p>
      <Button variant="ghost" size="sm" className="mt-3 -ml-2" onClick={() => setKey((k) => k + 1)}>
        Replay
      </Button>
    </div>
  );
}
