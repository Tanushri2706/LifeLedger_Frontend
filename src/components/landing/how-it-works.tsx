import { Brain, LineChart, Stethoscope, UploadCloud } from "lucide-react";

import { Reveal, SectionHeading } from "./reveal";

const steps = [
  {
    icon: UploadCloud,
    title: "Upload",
    body: "Add a PDF or snap a photo of any report, prescription or discharge summary.",
  },
  {
    icon: Brain,
    title: "AI Understands",
    body: "Values are read, checked against healthy ranges and explained in simple language.",
  },
  {
    icon: LineChart,
    title: "Timeline Updates",
    body: "The record slots into your health timeline and your trends refresh instantly.",
  },
  {
    icon: Stethoscope,
    title: "Connect with Doctors",
    body: "Share a doctor-ready summary and book an appointment with a nearby specialist.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-surface py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow="How it works"
          title="Four steps from paper report to real clarity"
        />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.07}>
              <div className="surface-calm lift h-full p-6">
                <div className="flex items-center justify-between">
                  <span className="grid size-11 place-items-center rounded-lg bg-primary-soft text-primary">
                    <step.icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="font-display text-sm font-semibold text-muted-foreground">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="mt-5 text-base font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
