"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { Lock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

function MedicalShareFallback() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  if (token) {
    if (typeof window !== "undefined") {
      window.location.replace(`/medical-share/${token}`);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col items-center justify-center text-center">
      <div className="max-w-md space-y-4">
        <span className="grid size-12 place-items-center rounded-xl bg-primary text-primary-foreground mx-auto">
          <Lock className="size-6" />
        </span>
        <h1 className="font-display text-xl font-bold text-white">
          LifeLedger Medical Share
        </h1>
        <p className="text-xs text-slate-400">
          Please scan a valid Selective Medical Share QR code or use the full link provided by the patient.
        </p>
        <Button asChild variant="outline" size="sm" className="border-slate-800 text-slate-200">
          <Link href="/">
            <ArrowLeft className="size-3.5 mr-1.5" />
            Return Home
          </Link>
        </Button>
      </div>
    </main>
  );
}

export default function MedicalShareQueryRedirect() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs">
          Loading share portal...
        </div>
      }
    >
      <MedicalShareFallback />
    </Suspense>
  );
}
