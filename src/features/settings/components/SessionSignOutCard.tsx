"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export function SessionSignOutCard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { logout, user } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await logout();
      queryClient.clear();
      toast.success("Signed out successfully.");
      router.replace("/signin");
    } catch {
      queryClient.clear();
      router.replace("/signin");
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="font-display text-lg sm:text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <LogOut className="size-5 text-destructive" />
            Sign Out
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Sign out of your LifeLedger account ({user?.email || "current session"}).
          </p>
        </div>

        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="text-xs font-semibold h-9 shrink-0 gap-2 sm:self-center"
        >
          {isSigningOut ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              Signing out...
            </>
          ) : (
            <>
              <LogOut className="size-3.5" />
              Sign Out
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
