"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  Sparkles,
  Clock,
  User,
  Share2,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Reveal } from "@/components/landing/reveal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FamilyMemberHeader,
  FamilyMemberOverview,
  FamilyMemberDocuments,
  FamilyMemberAIInsights,
  FamilyMemberTimeline,
  EditFamilyMemberDialog,
  ArchiveFamilyMemberDialog,
} from "@/features/family/components";
import {
  ActiveSharesList,
  CreateMedicalShareDialog,
} from "@/features/medical-share/components";
import { useFamilyMemberDetailQuery } from "@/features/family/family-hooks";
import { formatRelationship } from "@/features/family/family-utils";

interface PageProps {
  params: Promise<{ memberId: string }>;
}

export default function FamilyMemberDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const memberId = resolvedParams.memberId;
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("overview");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const {
    data: member,
    isLoading,
    isError,
    error,
    refetch,
  } = useFamilyMemberDetailQuery(memberId);

  return (
    <DashboardShell>
      <div className="mx-auto max-w-6xl space-y-6 pt-6 pb-12">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-40" />
            <div className="flex items-center gap-4">
              <Skeleton className="size-16 rounded-2xl" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        ) : isError || !member ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 p-10 text-center">
            <div className="grid size-12 place-items-center rounded-full bg-destructive/10 text-destructive mb-3">
              <AlertCircle className="size-6" />
            </div>
            <h2 className="font-display text-lg font-bold text-foreground">
              Family Profile Not Found
            </h2>
            <p className="mt-1 text-xs text-muted-foreground max-w-md">
              {error instanceof Error
                ? error.message
                : "This profile could not be loaded or may have been deleted."}
            </p>
            <div className="mt-6 flex items-center gap-3">
              <Button asChild variant="outline" size="sm">
                <Link href="/family">
                  <ArrowLeft className="size-3.5 mr-1.5" />
                  Back to Family Vault
                </Link>
              </Button>
              <Button size="sm" onClick={() => refetch()} className="gap-1.5">
                <RefreshCw className="size-3.5" />
                Retry
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <Reveal>
              <FamilyMemberHeader
                member={member}
                onEdit={() => setIsEditOpen(true)}
                onShare={() => setIsShareOpen(true)}
                onArchive={() => setIsArchiveOpen(true)}
              />
            </Reveal>

            {/* Tabs Navigation & Content */}
            <Reveal delay={0.1}>
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="space-y-6"
              >
                <div className="overflow-x-auto pb-1">
                  <TabsList className="h-10 p-1 bg-surface border border-border/60">
                    <TabsTrigger value="overview" className="gap-2 text-xs font-semibold px-3.5">
                      <User className="size-3.5" />
                      Overview
                    </TabsTrigger>
                    <TabsTrigger value="documents" className="gap-2 text-xs font-semibold px-3.5">
                      <FileText className="size-3.5" />
                      Documents
                    </TabsTrigger>
                    <TabsTrigger value="ai_insights" className="gap-2 text-xs font-semibold px-3.5">
                      <Sparkles className="size-3.5 text-primary" />
                      AI Insights
                    </TabsTrigger>
                    <TabsTrigger value="timeline" className="gap-2 text-xs font-semibold px-3.5">
                      <Clock className="size-3.5" />
                      Timeline
                    </TabsTrigger>
                    <TabsTrigger value="shares" className="gap-2 text-xs font-semibold px-3.5">
                      <Share2 className="size-3.5" />
                      Medical Shares
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="overview" className="space-y-4 focus-visible:outline-none">
                  <FamilyMemberOverview member={member} />
                </TabsContent>

                <TabsContent value="documents" className="space-y-4 focus-visible:outline-none">
                  <FamilyMemberDocuments member={member} />
                </TabsContent>

                <TabsContent value="ai_insights" className="space-y-4 focus-visible:outline-none">
                  <FamilyMemberAIInsights member={member} />
                </TabsContent>

                <TabsContent value="timeline" className="space-y-4 focus-visible:outline-none">
                  <FamilyMemberTimeline member={member} />
                </TabsContent>

                <TabsContent value="shares" className="space-y-4 focus-visible:outline-none">
                  <ActiveSharesList
                    subjectType="family_member"
                    subjectId={member.id}
                    subjectDisplayName={member.displayName}
                    onCreateNewShare={() => setIsShareOpen(true)}
                  />
                </TabsContent>
              </Tabs>
            </Reveal>

            {/* Dialogs */}
            <EditFamilyMemberDialog
              member={member}
              open={isEditOpen}
              onOpenChange={setIsEditOpen}
            />

            <ArchiveFamilyMemberDialog
              member={member}
              open={isArchiveOpen}
              onOpenChange={setIsArchiveOpen}
              onSuccess={() => router.push("/family")}
            />

            <CreateMedicalShareDialog
              subjectType="family_member"
              memberId={member.id}
              memberDisplayName={member.displayName}
              memberRelationship={formatRelationship(member.relationship)}
              open={isShareOpen}
              onOpenChange={setIsShareOpen}
            />
          </>
        )}
      </div>
    </DashboardShell>
  );
}
