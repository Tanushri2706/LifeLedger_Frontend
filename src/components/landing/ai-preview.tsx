import { AlertTriangle, ArrowRight, FileText, HeartPulse, Salad, Sparkles } from "lucide-react";

import { Reveal, SectionHeading } from "./reveal";

const reportRows = [
  { label: "Haemoglobin", value: "11.2 g/dL", flag: "Low" },
  { label: "HbA1c", value: "6.4 %", flag: "Borderline" },
  { label: "Vitamin D", value: "14 ng/mL", flag: "Low" },
  { label: "TSH", value: "2.8 µIU/mL", flag: "Normal" },
];

const suggestions = [
  "Add iron-rich foods — palak, rajma, dates — with lemon for absorption",
  "15 minutes of morning sunlight daily for vitamin D",
  "Swap evening chai-biscuit with roasted chana to steady sugar",
];

export function AiPreview() {
  return (
    <section id="ai-preview" className="bg-surface py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow="AI Health Vault"
          title="A confusing lab report becomes a clear picture"
          subtitle="LifeLedger reads your report, explains it in plain language, and shows you what deserves attention."
        />

        <div className="mt-14 grid items-stretch gap-6 lg:grid-cols-[0.85fr_auto_1.15fr]">
          <Reveal>
            <div className="surface-calm h-full p-6">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-lg bg-secondary text-muted-foreground">
                  <FileText className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">CBC + Diabetic Panel.pdf</p>
                  <p className="text-xs text-muted-foreground">
                    Dr. Lal PathLabs, Pune · 12 Mar 2026
                  </p>
                </div>
              </div>
              <dl className="mt-6 divide-y divide-border">
                {reportRows.map((row) => (
                  <div key={row.label} className="flex items-center justify-between gap-3 py-3">
                    <dt className="text-sm text-muted-foreground">{row.label}</dt>
                    <dd className="flex items-center gap-2 text-sm font-medium">
                      {row.value}
                      <span
                        className={
                          row.flag === "Normal"
                            ? "rounded-sm bg-success/12 px-1.5 py-0.5 text-[11px] font-semibold text-success"
                            : "rounded-sm bg-warning/18 px-1.5 py-0.5 text-[11px] font-semibold text-warning-foreground"
                        }
                      >
                        {row.flag}
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>

          <Reveal delay={0.1} variant="fade" className="hidden place-self-center lg:block">
            <span className="grid size-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-glow)]">
              <ArrowRight className="size-5" aria-hidden="true" />
            </span>
          </Reveal>

          <Reveal delay={0.16} variant="scale">
            <div className="glass-ai h-full p-7">
              <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.16em] text-primary uppercase">
                <Sparkles className="size-3.5" aria-hidden="true" />
                AI Summary
              </p>
              <p className="mt-4 text-sm leading-relaxed text-foreground">
                Your blood count shows mild anaemia and your vitamin D is low. Sugar control is
                slightly above the healthy range — early enough to fix with diet and daily walking.
                Thyroid looks normal.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-card/70 p-4">
                  <p className="text-xs font-medium text-muted-foreground">Health Score</p>
                  <p className="mt-1 flex items-baseline gap-1.5 font-display text-2xl font-semibold">
                    72<span className="text-sm text-muted-foreground">/100</span>
                    <HeartPulse className="size-4 text-primary" aria-hidden="true" />
                  </p>
                </div>
                <div className="rounded-lg bg-card/70 p-4">
                  <p className="text-xs font-medium text-muted-foreground">Risk Level</p>
                  <p className="mt-1 inline-flex items-center gap-1.5 font-display text-2xl font-semibold">
                    Moderate
                    <AlertTriangle className="size-4 text-warning" aria-hidden="true" />
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <p className="inline-flex items-center gap-2 text-sm font-semibold">
                  <Salad className="size-4 text-accent" aria-hidden="true" />
                  Lifestyle suggestions
                </p>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
                  {suggestions.map((tip) => (
                    <li key={tip} className="flex gap-2.5">
                      <span
                        className="mt-2 size-1.5 shrink-0 rounded-full bg-accent"
                        aria-hidden="true"
                      />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              <p className="mt-6 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
                AI analysis is for informational purposes only and is not a medical diagnosis.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
