import { CalendarCheck, FlaskConical, Pill, Stethoscope } from "lucide-react";

import { Reveal, SectionHeading } from "./reveal";

const events = [
  {
    icon: FlaskConical,
    date: "12 Mar 2026",
    title: "CBC + Diabetic Panel",
    place: "Dr. Lal PathLabs, Pune",
    note: "HbA1c 6.4% · Haemoglobin 11.2 g/dL",
    tone: "primary" as const,
  },
  {
    icon: Pill,
    date: "14 Mar 2026",
    title: "Prescription — Dr. Meera Iyer",
    place: "Deenanath Mangeshkar Hospital, Erandwane",
    note: "Iron + Vitamin D3 sachets, 8 weeks",
    tone: "accent" as const,
  },
  {
    icon: CalendarCheck,
    date: "02 Apr 2026",
    title: "Follow-up appointment",
    place: "Deenanath Mangeshkar Hospital, Erandwane",
    note: "Fasting sugar review before visit",
    tone: "primary" as const,
  },
  {
    icon: Stethoscope,
    date: "18 May 2026",
    title: "Annual health check — Papa",
    place: "Ruby Hall Clinic, Pune",
    note: "BP 128/82 · ECG normal",
    tone: "accent" as const,
  },
];

export function TimelinePreview() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-20 lg:py-28">
      <SectionHeading
        eyebrow="Health timeline"
        title="Every report, prescription and visit in one story"
        subtitle="Instead of hunting through WhatsApp and old folders, your family's health reads as a clean chronology."
      />

      <div className="mx-auto mt-14 max-w-2xl">
        <ol className="relative space-y-5 border-l border-border pl-7 sm:pl-9">
          {events.map((event, i) => (
            <Reveal key={event.title} delay={i * 0.08}>
              <li className="relative">
                <span
                  className={`absolute -left-[2.4rem] grid size-8 place-items-center rounded-full border border-border bg-card sm:-left-[3.1rem] ${
                    event.tone === "primary" ? "text-primary" : "text-accent"
                  }`}
                >
                  <event.icon className="size-4" aria-hidden="true" />
                </span>
                <div className="surface-calm lift p-5">
                  <p className="text-xs font-medium tracking-wide text-muted-foreground">
                    {event.date}
                  </p>
                  <h3 className="mt-1.5 text-base font-semibold">{event.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{event.place}</p>
                  <p className="mt-3 rounded-md bg-surface px-3 py-2 text-sm text-foreground">
                    {event.note}
                  </p>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
