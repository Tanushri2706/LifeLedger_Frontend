"use client";

import { Eye, FileText, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { DoctorPageHeader, DoctorShell } from "@/components/doctor/doctor-shell";
import { sharedReports } from "@/components/doctor/doctor-bits";
import { EmptyState } from "@/components/dashboard/widgets";
import { MedicalDisclaimer } from "@/components/vault/vault-bits";
import { Reveal } from "@/components/landing/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DoctorReportsPage() {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("new");

  const list = useMemo(
    () =>
      sharedReports.filter((r) => {
        const matchesTab =
          tab === "all" || (tab === "new" ? !r.reviewed : tab === "reviewed" ? r.reviewed : true);
        const matchesQuery =
          !query ||
          r.patient.toLowerCase().includes(query.toLowerCase()) ||
          r.title.toLowerCase().includes(query.toLowerCase());
        return matchesTab && matchesQuery;
      }),
    [query, tab],
  );

  return (
    <DoctorShell>
      <Reveal>
        <DoctorPageHeader
          title="Reports shared by patients"
          subtitle="Patients choose exactly what to share. Flagged values are highlighted so you can prepare in seconds."
        />
      </Reveal>

      <Reveal delay={0.05}>
        <div className="surface-calm mt-4 grid gap-3 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <div className="relative min-w-0">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by patient or report"
              className="h-11 pl-9"
              aria-label="Search shared reports"
            />
          </div>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="new">New</TabsTrigger>
              <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </Reveal>

      {list.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon={FileText}
            title="Nothing here right now"
            body="When a patient shares a lab report or scan with you, it will appear in this list."
          />
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {list.map((r, i) => (
            <Reveal key={r.id} delay={0.05 + i * 0.04}>
              <article className="surface-calm lift grid gap-4 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-base font-semibold">{r.title}</h2>
                    <Badge variant="secondary">{r.category}</Badge>
                    {!r.reviewed ? <Badge>New</Badge> : null}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {r.patient} · {r.lab}
                  </p>
                  <p className="mt-1.5 text-sm text-primary">{r.flag}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Shared on {r.sharedOn}</p>
                </div>
                <div className="grid gap-2 sm:w-44">
                  <Button size="sm">
                    <Eye className="size-4" aria-hidden="true" />
                    Open report
                  </Button>
                  <Button size="sm" variant="secondary">
                    Mark reviewed
                  </Button>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      )}

      <div className="mt-6">
        <MedicalDisclaimer />
      </div>
    </DoctorShell>
  );
}
