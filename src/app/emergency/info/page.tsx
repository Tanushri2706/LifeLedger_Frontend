"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PublicEmergencyInfoPage from "./[token]/page";

function EmergencyInfoWithSearchParam() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  return (
    <PublicEmergencyInfoPage
      params={Promise.resolve({ token })}
    />
  );
}

export default function EmergencyInfoPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center text-sm">
          Loading Emergency Information...
        </div>
      }
    >
      <EmergencyInfoWithSearchParam />
    </Suspense>
  );
}
