"use client";

import { Badge } from "@/components/ui/badge";
import type { MedicalShareStatus } from "../medical-share-types";

interface MedicalShareStatusBadgeProps {
  status: MedicalShareStatus;
  className?: string;
}

export function MedicalShareStatusBadge({
  status,
  className = "",
}: MedicalShareStatusBadgeProps) {
  switch (status) {
    case "active":
      return (
        <Badge
          className={`bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-semibold ${className}`}
        >
          Active
        </Badge>
      );
    case "consumed":
      return (
        <Badge
          variant="secondary"
          className={`bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/30 text-[10px] ${className}`}
        >
          Unlocked / Used
        </Badge>
      );
    case "expired":
      return (
        <Badge
          variant="outline"
          className={`text-muted-foreground border-border text-[10px] ${className}`}
        >
          Expired
        </Badge>
      );
    case "revoked":
      return (
        <Badge
          variant="outline"
          className={`text-destructive border-destructive/30 bg-destructive/5 text-[10px] ${className}`}
        >
          Revoked
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className={`text-[10px] ${className}`}>
          {status}
        </Badge>
      );
  }
}
