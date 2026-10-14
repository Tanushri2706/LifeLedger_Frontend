"use client";

import { AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function Field({
  id,
  label,
  hint,
  error,
  ...props
}: React.ComponentProps<typeof Input> & {
  id: string;
  label: string;
  hint?: string;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      <Input
        id={id}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={cn("h-12 rounded-[var(--radius-md)] text-base", props.className)}
        {...props}
      />
      {error ? (
        <p id={`${id}-error`} className="flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle className="size-3.5" aria-hidden="true" />
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function PasswordField({
  id,
  label,
  hint,
  error,
  ...props
}: React.ComponentProps<typeof Input> & {
  id: string;
  label: string;
  hint?: string;
  error?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          aria-invalid={Boolean(error) || undefined}
          className="h-12 rounded-[var(--radius-md)] pr-12 text-base"
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-0 grid w-12 place-items-center text-muted-foreground transition-colors hover:text-foreground"
        >
          {show ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
        </button>
      </div>
      {error ? (
        <p className="flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle className="size-3.5" aria-hidden="true" />
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export function FormAlert({
  tone,
  title,
  children,
}: {
  tone: "error" | "success";
  title: string;
  children?: React.ReactNode;
}) {
  const Icon = tone === "error" ? AlertCircle : CheckCircle2;
  return (
    <div
      role="status"
      className={cn(
        "flex items-start gap-3 rounded-[var(--radius-md)] p-4 text-sm",
        tone === "error"
          ? "bg-destructive/8 text-destructive"
          : "bg-success/10 text-success-foreground",
      )}
    >
      <Icon
        className={cn("mt-0.5 size-4.5 shrink-0", tone === "success" && "text-success")}
        aria-hidden="true"
      />
      <div className={cn(tone === "success" && "text-foreground")}>
        <p className="font-medium">{title}</p>
        {children ? <p className="mt-1 text-xs opacity-80">{children}</p> : null}
      </div>
    </div>
  );
}
