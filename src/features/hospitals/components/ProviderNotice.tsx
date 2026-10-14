"use client";

import { Info } from "lucide-react";

interface ProviderNoticeProps {
  provider?: "google" | "mock" | "osm" | string;
  attribution?: string;
}

export function ProviderNotice({ provider, attribution: _attribution }: ProviderNoticeProps) {
  // Only render notice in development / mock provider mode
  if (provider === "mock") {
    return (
      <div
        className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary-soft/30 px-3.5 py-2 text-xs text-muted-foreground"
        role="status"
        aria-live="polite"
      >
        <Info className="size-4 shrink-0 text-primary" aria-hidden="true" />
        <span>
          <strong className="font-medium text-foreground">Development Mode:</strong>{" "}
          Displaying simulated healthcare provider records. Live OpenStreetMap data activates once connected to the backend provider.
        </span>
      </div>
    );
  }

  return null;
}
