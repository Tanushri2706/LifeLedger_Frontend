import { Quote } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { Reveal, SectionHeading } from "./reveal";

const testimonials = [
  {
    quote:
      "My mother's reports were spread across three hospitals in Nagpur. Now everything sits in one timeline and I can show her cardiologist her full history in seconds.",
    name: "Ananya Deshmukh",
    role: "Product designer, Pune · caring for elderly parents",
  },
  {
    quote:
      "I get lab tests every three months for my thyroid. The AI summary tells me what changed since last time instead of me comparing numbers on my own.",
    name: "Rohit Verma",
    role: "Bank manager, Lucknow · frequent lab tests",
  },
  {
    quote:
      "Two kids, two grandparents, one account. When my son had fever in Bengaluru, I pulled up his allergy list on my phone at the clinic.",
    name: "Fatima Sheikh",
    role: "Teacher, Bengaluru · family health records",
  },
];

const faqs = [
  {
    q: "Who can see my medical records?",
    a: "Only you. Records are private by default, encrypted at rest and in transit. Doctors see a report only when you share it, for as long as you allow, and every access is logged for you to review.",
  },
  {
    q: "Will my data ever be sold or shared with insurers?",
    a: "No. We do not sell, rent or share your health data with insurers, employers or advertisers. LifeLedger earns from subscriptions, never from your records.",
  },
  {
    q: "How accurate is the AI analysis?",
    a: "The AI explains values against standard reference ranges and highlights what may need attention. It can make mistakes, so it is informational support only — not a medical diagnosis. Always confirm with a registered medical practitioner.",
  },
  {
    q: "Can my parents use it if they are not comfortable with apps?",
    a: "Yes. You can manage their profile from your own account, upload their reports and share summaries with their doctor. Explanations are written in simple language with large, readable type.",
  },
  {
    q: "What if I want to leave?",
    a: "You can export every record and delete your vault permanently at any time. Deletion removes your documents and derived AI summaries from our systems.",
  },
];

export function Testimonials() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-20 lg:py-28">
      <SectionHeading
        eyebrow="Trusted by families"
        title="Real families, calmer health decisions"
      />
      <div className="mt-14 grid gap-5 lg:grid-cols-3">
        {testimonials.map((t, i) => (
          <Reveal key={t.name} delay={i * 0.08}>
            <figure className="surface-calm lift flex h-full flex-col p-7">
              <Quote className="size-6 text-accent" aria-hidden="true" />
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-foreground">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-6 border-t border-border pt-4">
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{t.role}</p>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function Faq() {
  return (
    <section className="bg-surface py-20 lg:py-28">
      <div className="mx-auto max-w-3xl px-5">
        <SectionHeading
          eyebrow="FAQ"
          title="Privacy, security and honest AI"
          subtitle="The questions families ask us most before trusting us with their records."
        />
        <Reveal delay={0.08} className="mt-12">
          <Accordion type="single" collapsible className="surface-calm divide-y divide-border px-6">
            {faqs.map((faq) => (
              <AccordionItem key={faq.q} value={faq.q} className="border-none">
                <AccordionTrigger className="py-5 text-left text-base font-medium hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
