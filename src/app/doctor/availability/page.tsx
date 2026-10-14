"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  CalendarClock,
  CalendarHeart,
  Check,
  RotateCcw,
  AlertCircle,
  Loader2,
  Save,
  Undo2,
} from "lucide-react";
import { DoctorPageHeader, DoctorShell } from "@/components/doctor/doctor-shell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useDoctorAvailabilityQuery,
  useUpdateDoctorAvailabilityMutation,
  DoctorAvailabilitySummaryCard,
  DoctorDayScheduleRow,
  DAYS_OF_WEEK,
  DAY_LABELS,
  type DayOfWeek,
  type DayAvailabilityDto,
  type AvailabilitySlotWindowDto,
} from "@/features/doctor";

interface DayEditorState {
  day: DayOfWeek;
  isOpen: boolean;
  slots: AvailabilitySlotWindowDto[];
}

function timeToMinutes(timeStr: string): number {
  const [h, m] = (timeStr || "").split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return -1;
  return h * 60 + m;
}

function validateDaySlots(slots: AvailabilitySlotWindowDto[]): string[] {
  const errors: string[] = [];
  if (slots.length === 0) return errors;

  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    const startMin = timeToMinutes(slot.start);
    const endMin = timeToMinutes(slot.end);

    if (startMin < 0 || endMin < 0) {
      errors.push(`Window #${i + 1}: Please enter a valid start and end time.`);
      continue;
    }

    if (startMin >= endMin) {
      errors.push(
        `Window #${i + 1} (${slot.start} to ${slot.end}): End time must be strictly after start time.`
      );
    }
  }

  // Check for overlaps & duplicates
  const sorted = [...slots].sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    const prevStart = timeToMinutes(prev.start);
    const prevEnd = timeToMinutes(prev.end);
    const currStart = timeToMinutes(curr.start);
    const currEnd = timeToMinutes(curr.end);

    if (prevStart < 0 || prevEnd < 0 || currStart < 0 || currEnd < 0) continue;

    if (prevStart === currStart && prevEnd === currEnd) {
      errors.push(`Duplicate window detected: ${curr.start} to ${curr.end}.`);
    } else if (currStart < prevEnd) {
      errors.push(
        `Overlapping windows detected: (${prev.start}–${prev.end}) and (${curr.start}–${curr.end}).`
      );
    }
  }

  return errors;
}

function buildDefaultEditorState(backendList: DayAvailabilityDto[]): DayEditorState[] {
  const map = new Map<string, AvailabilitySlotWindowDto[]>();
  for (const item of backendList) {
    if (item?.day) {
      map.set(item.day.toLowerCase().trim(), item.slots || []);
    }
  }

  return DAYS_OF_WEEK.map((day) => {
    const backendSlots = map.get(day);
    const hasSlots = Boolean(backendSlots && backendSlots.length > 0);

    return {
      day,
      isOpen: hasSlots,
      slots: hasSlots ? backendSlots! : [{ start: "09:00", end: "13:00" }],
    };
  });
}

function serializeEditorState(state: DayEditorState[]): string {
  const active = state.map((d) => ({
    day: d.day,
    isOpen: d.isOpen,
    slots: d.isOpen ? d.slots : [],
  }));
  return JSON.stringify(active);
}

export default function DoctorAvailabilityPage() {
  const { data: rawAvailability, isLoading, isError, error, refetch } = useDoctorAvailabilityQuery();
  const updateMutation = useUpdateDoctorAvailabilityMutation();

  const [editorState, setEditorState] = useState<DayEditorState[]>(() =>
    buildDefaultEditorState(rawAvailability || [])
  );
  const [initialSerialized, setInitialSerialized] = useState<string>("");

  // Sync editor with backend response when loaded
  useEffect(() => {
    if (rawAvailability) {
      const initial = buildDefaultEditorState(rawAvailability);
      setEditorState(initial);
      setInitialSerialized(serializeEditorState(initial));
    }
  }, [rawAvailability]);

  // Compute validation errors per day
  const dayValidationMap = useMemo(() => {
    const map = new Map<DayOfWeek, string[]>();
    for (const day of editorState) {
      if (day.isOpen) {
        map.set(day.day, validateDaySlots(day.slots));
      } else {
        map.set(day.day, []);
      }
    }
    return map;
  }, [editorState]);

  // Overall form validity and dirty tracking
  const hasErrors = useMemo(() => {
    for (const errors of dayValidationMap.values()) {
      if (errors.length > 0) return true;
    }
    return false;
  }, [dayValidationMap]);

  const isDirty = useMemo(() => {
    if (!initialSerialized) return false;
    return serializeEditorState(editorState) !== initialSerialized;
  }, [editorState, initialSerialized]);

  // Handlers
  const handleToggleDay = useCallback((day: DayOfWeek, isOpen: boolean) => {
    setEditorState((prev) =>
      prev.map((d) => {
        if (d.day !== day) return d;
        return {
          ...d,
          isOpen,
          slots: d.slots.length > 0 ? d.slots : [{ start: "09:00", end: "13:00" }],
        };
      })
    );
  }, []);

  const handleAddSlot = useCallback((day: DayOfWeek) => {
    setEditorState((prev) =>
      prev.map((d) => {
        if (d.day !== day) return d;
        const lastSlot = d.slots[d.slots.length - 1];
        let nextStart = "14:00";
        let nextEnd = "18:00";

        if (lastSlot && lastSlot.end) {
          const [endH] = lastSlot.end.split(":").map(Number);
          if (!isNaN(endH) && endH < 22) {
            const startH = Math.min(endH + 1, 22);
            const endHNew = Math.min(startH + 4, 23);
            nextStart = `${String(startH).padStart(2, "0")}:00`;
            nextEnd = `${String(endHNew).padStart(2, "0")}:00`;
          }
        }

        return {
          ...d,
          isOpen: true,
          slots: [...d.slots, { start: nextStart, end: nextEnd }],
        };
      })
    );
  }, []);

  const handleRemoveSlot = useCallback((day: DayOfWeek, slotIndex: number) => {
    setEditorState((prev) =>
      prev.map((d) => {
        if (d.day !== day) return d;
        const updated = d.slots.filter((_, i) => i !== slotIndex);
        return {
          ...d,
          isOpen: updated.length > 0 ? d.isOpen : false,
          slots: updated.length > 0 ? updated : [{ start: "09:00", end: "13:00" }],
        };
      })
    );
  }, []);

  const handleSlotChange = useCallback(
    (day: DayOfWeek, slotIndex: number, field: "start" | "end", value: string) => {
      setEditorState((prev) =>
        prev.map((d) => {
          if (d.day !== day) return d;
          const updated = d.slots.map((s, i) => (i === slotIndex ? { ...s, [field]: value } : s));
          return {
            ...d,
            slots: updated,
          };
        })
      );
    },
    []
  );

  const handleDiscard = () => {
    if (rawAvailability) {
      const reset = buildDefaultEditorState(rawAvailability);
      setEditorState(reset);
    }
  };

  const handleSave = async () => {
    if (hasErrors || !isDirty || updateMutation.isPending) return;

    // Prepare clean payload: sort windows per day
    const payload: DayAvailabilityDto[] = editorState.map((d) => {
      if (!d.isOpen) {
        return { day: d.day, slots: [] };
      }

      const sortedSlots = [...d.slots]
        .sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start))
        .map((s) => ({
          start: s.start.trim(),
          end: s.end.trim(),
        }));

      return {
        day: d.day,
        slots: sortedSlots,
      };
    });

    try {
      const saved = await updateMutation.mutateAsync(payload);
      const updatedEditor = buildDefaultEditorState(saved);
      setEditorState(updatedEditor);
      setInitialSerialized(serializeEditorState(updatedEditor));
    } catch {
      // Error handled by mutation toast
    }
  };

  // Convert editor state to summary list for live metrics
  const activeSummarySchedule: DayAvailabilityDto[] = useMemo(() => {
    return editorState.map((d) => ({
      day: d.day,
      slots: d.isOpen ? d.slots : [],
    }));
  }, [editorState]);

  return (
    <DoctorShell>
      <div className="space-y-6 pt-2 pb-24">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <DoctorPageHeader
            title="Slot Availability Schedule"
            subtitle="Configure your recurring weekly clinic hours. Patient appointment slots are dynamically generated from your active windows."
          />

          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="text-xs font-semibold h-9 gap-1.5"
            >
              <Link href="/doctor/appointments">
                <CalendarHeart className="size-3.5" />
                View Appointments
              </Link>
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <Skeleton className="h-24 w-full rounded-2xl" />
              <Skeleton className="h-24 w-full rounded-2xl" />
              <Skeleton className="h-24 w-full rounded-2xl" />
            </div>
            <Skeleton className="h-16 w-full rounded-2xl" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <Skeleton key={i} className="h-28 w-full rounded-2xl" />
              ))}
            </div>
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center space-y-3">
            <AlertCircle className="size-8 text-destructive mx-auto" />
            <h3 className="text-sm font-semibold text-foreground">Failed to load availability</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {error instanceof Error
                ? error.message
                : "An error occurred while fetching your availability schedule."}
            </p>
            <Button onClick={() => refetch()} variant="outline" size="sm" className="text-xs gap-1.5 mt-2">
              <RotateCcw className="size-3.5" />
              Retry
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Live Summary & Timezone Banner */}
            <DoctorAvailabilitySummaryCard schedule={activeSummarySchedule} />

            {/* Weekly Days Editor Rows */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <CalendarClock className="size-3.5 text-primary" />
                  Weekly Working Windows (7 Days)
                </h2>
                {isDirty && (
                  <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Unsaved Schedule Changes
                  </span>
                )}
              </div>

              {editorState.map((dayState) => {
                const errors = dayValidationMap.get(dayState.day) || [];

                return (
                  <DoctorDayScheduleRow
                    key={dayState.day}
                    day={dayState.day}
                    dayLabel={DAY_LABELS[dayState.day]}
                    isOpen={dayState.isOpen}
                    slots={dayState.slots}
                    errors={errors}
                    onToggleOpen={(open) => handleToggleDay(dayState.day, open)}
                    onAddSlot={() => handleAddSlot(dayState.day)}
                    onRemoveSlot={(slotIndex) => handleRemoveSlot(dayState.day, slotIndex)}
                    onSlotChange={(slotIndex, field, val) =>
                      handleSlotChange(dayState.day, slotIndex, field, val)
                    }
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Floating Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border/80 bg-card/90 backdrop-blur-xl px-4 py-3.5 shadow-lg">
        <div className="mx-auto flex max-w-5xl flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {isDirty ? (
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-amber-500 animate-ping" />
                You have unsaved changes in your weekly schedule.
              </span>
            ) : (
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Check className="size-4 text-emerald-600" />
                Schedule is synced with backend.
              </span>
            )}
            {hasErrors && (
              <span className="text-xs text-destructive font-semibold">
                (Fix validation errors before saving)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {isDirty && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDiscard}
                disabled={updateMutation.isPending}
                className="text-xs gap-1.5"
              >
                <Undo2 className="size-3.5" />
                Discard Changes
              </Button>
            )}

            <Button
              type="button"
              onClick={handleSave}
              disabled={!isDirty || hasErrors || updateMutation.isPending}
              size="sm"
              className="text-xs gap-1.5 font-semibold shadow-sm"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Saving Schedule...
                </>
              ) : (
                <>
                  <Save className="size-3.5" />
                  Save Availability
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </DoctorShell>
  );
}
