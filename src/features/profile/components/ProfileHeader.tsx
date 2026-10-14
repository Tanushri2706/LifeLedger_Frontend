"use client";

import { useRef, useState } from "react";
import {
  Camera,
  CheckCircle2,
  Calendar,
  Loader2,
  Trash2,
  UploadCloud,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { UserProfileDto } from "../profile-types";
import { useUploadAvatarMutation, useRemoveAvatarMutation } from "../profile-hooks";

interface ProfileHeaderProps {
  profile: UserProfileDto;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const uploadMutation = useUploadAvatarMutation();
  const removeMutation = useRemoveAvatarMutation();

  const fullName =
    profile.fullName ||
    `${profile.firstName || ""} ${profile.lastName || ""}`.trim() ||
    profile.name ||
    "User";

  const initials = (
    `${profile.firstName?.[0] || ""}${profile.lastName?.[0] || ""}` ||
    fullName.slice(0, 2)
  ).toUpperCase();

  const photoUrl = profile.profilePhoto || profile.avatar;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation: Image files only
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (JPEG, PNG, WEBP).");
      return;
    }

    // Validation: Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB.");
      return;
    }

    try {
      setIsUploading(true);
      await uploadMutation.mutateAsync(file);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemovePhoto = async () => {
    await removeMutation.mutateAsync();
  };

  const formattedJoinDate = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm sm:p-8">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Avatar with Upload Dropdown */}
        <div className="relative group shrink-0">
          <Avatar className="size-24 sm:size-28 border-2 border-border/80 shadow-md">
            {photoUrl ? (
              <AvatarImage
                src={photoUrl}
                alt={fullName}
                className="object-cover"
              />
            ) : null}
            <AvatarFallback className="bg-primary/10 text-primary font-display text-2xl font-bold">
              {initials || "LL"}
            </AvatarFallback>
          </Avatar>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
            aria-label="Upload profile photo"
          />

          {/* Avatar Action Trigger */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="secondary"
                disabled={isUploading || removeMutation.isPending}
                className="absolute -bottom-1 -right-1 size-8 rounded-full border border-border shadow-md hover:bg-surface"
                aria-label="Change profile picture"
              >
                {isUploading || removeMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin text-primary" />
                ) : (
                  <Camera className="size-4 text-muted-foreground" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44">
              <DropdownMenuItem
                onClick={() => fileInputRef.current?.click()}
                className="gap-2 cursor-pointer text-xs"
              >
                <UploadCloud className="size-3.5 text-primary" />
                <span>{photoUrl ? "Replace photo" : "Upload photo"}</span>
              </DropdownMenuItem>
              {photoUrl ? (
                <DropdownMenuItem
                  onClick={handleRemovePhoto}
                  className="gap-2 cursor-pointer text-xs text-destructive focus:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                  <span>Remove photo</span>
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Profile Info */}
        <div className="flex-1 text-center sm:text-left space-y-3 min-w-0">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {fullName}
              </h1>
              {profile.isVerified ? (
                <Badge
                  variant="outline"
                  className="gap-1 bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-xs font-semibold"
                >
                  <CheckCircle2 className="size-3.5" />
                  Verified Account
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  Unverified
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground break-all">{profile.email}</p>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-primary" />
              <span>Protected Health Workspace</span>
            </div>
            {formattedJoinDate ? (
              <div className="flex items-center gap-1.5">
                <Calendar className="size-3.5 text-muted-foreground" />
                <span>Member since {formattedJoinDate}</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
