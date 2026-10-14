"use client";

import { FileText, Search, Users } from "lucide-react";
import { useMemo, useState } from "react";

import { DoctorPageHeader, DoctorShell } from "@/components/doctor/doctor-shell";
import { doctorPatients, StatusPill } from "@/components/doctor/doctor-bits";
import { EmptyState } from "@/components/dashboard/widgets";
import { Reveal } from "@/components/landing/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DoctorPatientsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const list = useMemo(
    () =>
      doctorPatients.filter((p) => {
        const matchesQuery =
          !query ||
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.condition.toLowerCase().includes(query.toLowerCase());
        const matchesStatus = status === "all" || p.status === status;
        return matchesQuery && matchesStatus;
      }),
    [query, status],
  );

  return (
    <DoctorShell>
      <Reveal>
        <DoctorPageHeader
          title="Patients"
          subtitle="Everyone currently under your care, with their primary condition and shared records."
        />
      </Reveal>

      <Reveal delay={0.05}>
        <div className="surface-calm mt-4 grid gap-3 p-5 sm:grid-cols-[minmax(0,1fr)_200px]">
          <div className="relative min-w-0">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by patient name or condition"
              className="h-11 pl-9"
              aria-label="Search patients"
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-11" aria-label="Filter by status">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Follow-up due">Follow-up due</SelectItem>
              <SelectItem value="Stable">Stable</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Reveal>

      {list.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon={Users}
            title="No patients match this search"
            body="Try a different name, condition or clear the status filter."
          />
        </div>
      ) : (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {list.map((p, i) => (
            <Reveal key={p.id} delay={0.05 + i * 0.04}>
              <article className="surface-calm lift h-full p-5">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate font-display text-base font-semibold">{p.name}</h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {p.age} yrs · {p.gender} · {p.city}
                    </p>
                  </div>
                  <StatusPill status={p.status} />
                </div>

                <div className="mt-4 grid gap-2 text-sm">
                  <p className="flex items-center gap-2">
                    <span className="text-muted-foreground">Condition</span>
                    <Badge variant="secondary">{p.condition}</Badge>
                  </p>
                  <p className="text-sm text-muted-foreground">Last visit · {p.lastVisit}</p>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2">
                  <Button variant="secondary" size="sm">
                    <FileText className="size-4" aria-hidden="true" />
                    {p.reportsShared} reports
                  </Button>
                  <Button size="sm">View history</Button>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      )}
    </DoctorShell>
  );
}
