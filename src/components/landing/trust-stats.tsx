import { Brain, Lock, History, MapPin } from "lucide-react";

import { Reveal } from "./reveal";

const stats = [
  {
    icon: Lock,
    title: "Secure cloud storage",
    body: "Reports encrypted at rest and in transit, private to you by default.",
  },
  {
    icon: Brain,
    title: "AI-powered health summaries",
    body: "Every report explained in simple language you can actually act on.",
  },
  {
    icon: History,
    title: "Timeline-based medical history",
    body: "Years of scattered files organised into one chronological ledger.",
  },
  {
    icon: MapPin,
    title: "Nearby healthcare discovery",
    body: "Find hospitals, labs and specialists close to you when it matters.",
  },
];

export function TrustStats() {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Reveal key={stat.title} delay={i * 0.06} variant="scale">
            <div className="surface-calm lift h-full p-6">
              <span className="grid size-11 place-items-center rounded-lg bg-primary-soft text-primary">
                <stat.icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-base font-semibold">{stat.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{stat.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
