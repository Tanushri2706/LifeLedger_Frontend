"use client";

import { Plus, Trash2, Clock, AlertCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { AvailabilitySlotWindowDto } from "../doctor-types";

interface DoctorDayScheduleRowProps {
  day: string;
  dayLabel: string;
  isOpen: boolean;
  slots: AvailabilitySlotWindowDto[];
  errors: string[];
  onToggleOpen: (open: boolean) => void;
  onAddSlot: () => void;
  onRemoveSlot: (index: number) => void;
  onSlotChange: (index: number, field: "start" | "end", value: string) => void;
}

export function DoctorDayScheduleRow({
  day,
  dayLabel,
  isOpen,
  slots,
  errors,
  onToggleOpen,
  onAddSlot,
  onRemoveSlot,
  onSlotChange,
}: DoctorDayScheduleRowProps) {
  const switchId = `switch-day-${day}`;

  return (
    <div
      className={`rounded-2xl border transition-all p-4 sm:p-5 ${
        isOpen
          ? errors.length > 0
            ? "border-destructive/40 bg-destructive/5"
            : "border-border/90 bg-card shadow-sm"
          : "border-border/60 bg-surface/40 opacity-80"
      }`}
    >
      {/* Day Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3.5">
        <div className="flex items-center gap-2.5">
          <h3 className="font-display text-base font-bold text-foreground">{dayLabel}</h3>
          {isOpen ? (
            <Badge
              variant="outline"
              className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[11px] font-semibold"
            >
              Open · {slots.length} {slots.length === 1 ? "window" : "windows"}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground text-[11px]">
              Closed
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Label
            htmlFor={switchId}
            className="text-xs text-muted-foreground cursor-pointer font-medium"
          >
            {isOpen ? "Available for Booking" : "Closed / Unavailable"}
          </Label>
          <Switch
            id={switchId}
            checked={isOpen}
            onCheckedChange={onToggleOpen}
            aria-label={`Toggle availability for ${dayLabel}`}
          />
        </div>
      </div>

      {/* Day Body */}
      {isOpen ? (
        <div className="space-y-3 pt-3.5">
          {/* Validation errors */}
          {errors.length > 0 && (
            <div className="space-y-1 rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
              {errors.map((err, i) => (
                <p key={i} className="flex items-center gap-1.5 font-medium">
                  <AlertCircle className="size-3.5 shrink-0" />
                  <span>{err}</span>
                </p>
              ))}
            </div>
          )}

          {/* Windows list */}
          {slots.length === 0 ? (
            <div className="py-2 text-xs text-muted-foreground flex items-center justify-between">
              <span>No working windows configured. Click &quot;Add Window&quot; to set consultation hours.</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onAddSlot}
                className="text-xs h-8 gap-1 text-primary"
              >
                <Plus className="size-3.5" />
                Add Window
              </Button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {slots.map((slot, index) => {
                const startId = `time-${day}-${index}-start`;
                const endId = `time-${day}-${index}-end`;

                return (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-border/70 bg-surface/60 hover:bg-surface transition-colors"
                  >
                    <div className="flex flex-wrap items-center gap-3 flex-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold shrink-0">
                        <Clock className="size-3.5 text-primary" />
                        <span>Window #{index + 1}:</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <Label htmlFor={startId} className="sr-only">
                            {dayLabel} window {index + 1} start time
                          </Label>
                          <Input
                            id={startId}
                            type="time"
                            value={slot.start}
                            onChange={(e) => onSlotChange(index, "start", e.target.value)}
                            className="h-9 w-28 text-xs font-mono"
                            aria-label={`${dayLabel} window ${index + 1} start time`}
                            required
                          />
                        </div>

                        <span className="text-xs text-muted-foreground font-medium">to</span>

                        <div className="flex items-center gap-1.5">
                          <Label htmlFor={endId} className="sr-only">
                            {dayLabel} window {index + 1} end time
                          </Label>
                          <Input
                            id={endId}
                            type="time"
                            value={slot.end}
                            onChange={(e) => onSlotChange(index, "end", e.target.value)}
                            className="h-9 w-28 text-xs font-mono"
                            aria-label={`${dayLabel} window ${index + 1} end time`}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveSlot(index)}
                        className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 gap-1 px-2.5"
                        aria-label={`Remove ${dayLabel} window ${index + 1} (${slot.start} to ${slot.end})`}
                      >
                        <Trash2 className="size-3.5" />
                        <span className="sm:hidden">Remove</span>
                      </Button>
                    </div>
                  </div>
                );
              })}

              <div className="pt-1 flex justify-start">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onAddSlot}
                  className="text-xs h-8 gap-1.5 text-primary hover:text-primary"
                >
                  <Plus className="size-3.5" />
                  Add Time Window for {dayLabel}
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="pt-3 text-xs text-muted-foreground">
          No consultation hours. Patients cannot book appointments on this day.
        </p>
      )}
    </div>
  );
}
