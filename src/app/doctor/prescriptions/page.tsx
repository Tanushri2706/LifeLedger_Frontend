"use client";

import { CheckCircle2, FileUp, Pill, Plus, Trash2, Upload } from "lucide-react";
import { useState } from "react";

import { DoctorPageHeader, DoctorShell } from "@/components/doctor/doctor-shell";
import { doctorPatients } from "@/components/doctor/doctor-bits";
import { WidgetCard } from "@/components/dashboard/widgets";
import { MedicalDisclaimer } from "@/components/vault/vault-bits";
import { Reveal } from "@/components/landing/reveal";
import { Button } from "@/components/ui/button";
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

type Medicine = { id: number; name: string; dosage: string; duration: string };

export default function DoctorPrescriptionsPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([
    { id: 1, name: "Metformin 500 mg", dosage: "1-0-1 after meals", duration: "30 days" },
  ]);
  const [file, setFile] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <DoctorShell>
        <Reveal>
          <div className="surface-calm mx-auto mt-10 max-w-lg p-8 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-lg bg-accent-soft text-accent-strong">
              <CheckCircle2 className="size-7" aria-hidden="true" />
            </span>
            <h1 className="mt-5 font-display text-2xl font-semibold">Prescription shared</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              It has been added to the patient&apos;s LifeLedger vault and timeline. They will get a
              notification right away.
            </p>
            <Button className="mt-6" onClick={() => setDone(false)}>
              <Plus className="size-4" aria-hidden="true" />
              Write another
            </Button>
          </div>
        </Reveal>
      </DoctorShell>
    );
  }

  return (
    <DoctorShell>
      <Reveal>
        <DoctorPageHeader
          title="Prescription upload"
          subtitle="Write a digital prescription or upload a signed copy. It appears in the patient's vault instantly."
        />
      </Reveal>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Reveal delay={0.05} className="xl:col-span-2">
          <WidgetCard title="Write prescription" icon={Pill}>
            <div className="grid gap-4">
              <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
                <div className="grid gap-2">
                  <Label>Patient</Label>
                  <Select defaultValue={doctorPatients[0]!.id}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctorPatients.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} · {p.age} yrs
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="diagnosis">Diagnosis</Label>
                  <Input id="diagnosis" className="h-11" placeholder="e.g. Pre-diabetes" />
                </div>
              </div>

              <div className="grid gap-3">
                <Label>Medicines</Label>
                {medicines.map((m, i) => (
                  <div
                    key={m.id}
                    className="grid gap-2 rounded-lg border border-border bg-card p-4 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_120px_auto] sm:items-center"
                  >
                    <Input
                      defaultValue={m.name}
                      placeholder="Medicine name & strength"
                      aria-label={`Medicine ${i + 1} name`}
                    />
                    <Input
                      defaultValue={m.dosage}
                      placeholder="Dosage e.g. 1-0-1"
                      aria-label={`Medicine ${i + 1} dosage`}
                    />
                    <Input
                      defaultValue={m.duration}
                      placeholder="Duration"
                      aria-label={`Medicine ${i + 1} duration`}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Remove medicine"
                      onClick={() => setMedicines((prev) => prev.filter((x) => x.id !== m.id))}
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="secondary"
                  className="justify-self-start"
                  onClick={() =>
                    setMedicines((prev) => [
                      ...prev,
                      { id: Date.now(), name: "", dosage: "", duration: "" },
                    ])
                  }
                >
                  <Plus className="size-4" aria-hidden="true" />
                  Add medicine
                </Button>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="advice">Advice for the patient</Label>
                <Textarea
                  id="advice"
                  rows={3}
                  placeholder="30 min brisk walk daily, reduce refined carbs, repeat HbA1c after 3 months."
                />
              </div>

              <div className="grid gap-2 sm:max-w-xs">
                <Label htmlFor="followup">Follow-up date</Label>
                <Input id="followup" type="date" className="h-11" />
              </div>

              <Button size="lg" className="mt-1 justify-self-start" onClick={() => setDone(true)}>
                <Upload className="size-4" aria-hidden="true" />
                Share with patient
              </Button>
            </div>
          </WidgetCard>
        </Reveal>

        <Reveal delay={0.1}>
          <WidgetCard title="Or upload a signed copy" icon={FileUp}>
            <label className="flex cursor-pointer flex-col items-center rounded-lg border-2 border-dashed border-border bg-surface px-5 py-10 text-center transition-colors hover:border-primary/50">
              <span className="grid size-12 place-items-center rounded-lg bg-primary-soft text-primary">
                <FileUp className="size-5" aria-hidden="true" />
              </span>
              <span className="mt-4 text-sm font-semibold">Drop PDF or image here</span>
              <span className="mt-1 text-xs text-muted-foreground">
                PDF, JPG or PNG · up to 10 MB
              </span>
              <input
                type="file"
                className="sr-only"
                accept=".pdf,image/*"
                onChange={(e) => setFile(e.target.files?.[0]?.name ?? null)}
              />
            </label>
            {file ? (
              <p className="mt-3 truncate rounded-lg bg-accent-soft px-3 py-2 text-xs text-accent-strong">
                Ready to share · {file}
              </p>
            ) : null}
            <div className="mt-5">
              <MedicalDisclaimer />
            </div>
          </WidgetCard>
        </Reveal>
      </div>
    </DoctorShell>
  );
}
