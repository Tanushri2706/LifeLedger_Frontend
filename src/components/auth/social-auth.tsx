"use client";

import { useRouter } from "next/navigation";
import { Apple } from "lucide-react";

import { Button } from "@/components/ui/button";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4.5" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1A6.2 6.2 0 1 1 16.1 7.4l2.7-2.6A9.9 9.9 0 1 0 12 21.9c5.7 0 9.6-4 9.6-9.7 0-.7-.07-1.2-.17-2H12Z"
      />
    </svg>
  );
}

export function SocialAuth({ role = "user" }: { role?: "user" | "doctor" }) {
  const suffix = role === "doctor" ? " as doctor" : "";
  const router = useRouter();
  const go = () => {
    router.push(role === "doctor" ? "/doctor" : "/dashboard");
  };
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Button
        type="button"
        variant="outline"
        className="h-12 w-full justify-center gap-2.5"
        onClick={go}
      >
        <GoogleIcon />
        <span>Google{suffix ? "" : ""}</span>
        <span className="sr-only">Continue with Google{suffix}</span>
      </Button>
      <Button
        type="button"
        variant="outline"
        className="h-12 w-full justify-center gap-2.5"
        onClick={go}
      >
        <Apple className="size-4.5" aria-hidden="true" />
        <span>Apple</span>
        <span className="sr-only">Continue with Apple{suffix}</span>
      </Button>
    </div>
  );
}

export function OrDivider({ label = "or continue with email" }: { label?: string }) {
  return (
    <div className="my-6 flex items-center gap-4">
      <span className="h-px flex-1 bg-border" />
      <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
