import { CalendarCheck, FileText, Hospital, LineChart, ShieldCheck, Users } from "lucide-react";

import { Reveal, SectionHeading } from "./reveal";

const features = [
  {
    icon: ShieldCheck,
    title: "Digital Health Vault",
    body: "Lab reports, prescriptions, discharge summaries and scans stored in one encrypted place, organised by member and date.",
  },
  {
    icon: FileText,
    title: "AI Report Analysis",
    body: "Upload a Dr. Lal PathLabs or Thyrocare PDF and get a plain-language summary of what each value means.",
  },
  {
    icon: LineChart,
    title: "Health Timeline",
    body: "See HbA1c, blood pressure and vitamin D move over months instead of guessing from loose papers.",
  },
  {
    icon: Hospital,
    title: "Nearby Hospitals & Doctors",
    body: "Discover verified hospitals, diagnostic labs and specialists around your pin code.",
  },
  {
    icon: CalendarCheck,
    title: "Doctor Appointments",
    body: "Book an OPD slot and carry a one-page history your doctor can read before you sit down.",
  },
  {
    icon: Users,
    title: "Family Health Vault",
    body: "Manage records for parents, spouse and children from a single account, with separate profiles.",
  },
];

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-5 py-20 lg:py-28">
      <SectionHeading
        eyebrow="Core features"
        title="Everything your family's health needs — nothing it doesn't"
        subtitle="Six focused tools built around one idea: your health history should be understandable, portable and private."
      />
      <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, i) => (
          <Reveal key={feature.title} delay={(i % 3) * 0.07}>
            <div className="surface-calm lift h-full p-7">
              <span className="grid size-12 place-items-center rounded-lg bg-accent-soft text-primary">
                <feature.icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-6 text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{feature.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
