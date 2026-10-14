"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { HeartPulse } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: "doctor" | "patient" | "any";
}

export function AuthGuard({ children, requiredRole = "any" }: AuthGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace(`/signin?from=${encodeURIComponent(pathname)}`);
      } else if (requiredRole === "doctor" && user?.role !== "doctor") {
        router.replace("/dashboard");
      } else if (requiredRole === "patient" && user?.role === "doctor") {
        router.replace("/doctor");
      }
    }
  }, [isLoading, isAuthenticated, user, requiredRole, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-4">
          <div className="grid size-12 place-items-center rounded-xl bg-primary text-primary-foreground animate-pulse">
            <HeartPulse className="size-6" />
          </div>
          <p className="text-sm font-medium text-muted-foreground animate-pulse">
            Opening your health vault...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole === "doctor" && user?.role !== "doctor") {
    return null;
  }

  if (requiredRole === "patient" && user?.role === "doctor") {
    return null;
  }

  return <>{children}</>;
}
