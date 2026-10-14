"use client";

import { useState } from "react";
import {
  AlertCircle,
  Check,
  Edit2,
  Phone,
  Plus,
  RefreshCw,
  Star,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useEmergencyContactsQuery,
  useCreateEmergencyContactMutation,
  useUpdateEmergencyContactMutation,
  useDeleteEmergencyContactMutation,
} from "../emergency-hooks";
import type { IEmergencyContact } from "../emergency-types";

const RELATIONSHIP_OPTIONS = [
  "Spouse",
  "Parent",
  "Child",
  "Sibling",
  "Relative",
  "Friend",
  "Doctor",
  "Guardian",
  "Colleague",
  "Other",
];

export function EmergencyContactsManager() {
  const { data: contacts = [], isLoading, isError, error, refetch } = useEmergencyContactsQuery();

  const createMutation = useCreateEmergencyContactMutation();
  const updateMutation = useUpdateEmergencyContactMutation();
  const deleteMutation = useDeleteEmergencyContactMutation();

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<IEmergencyContact | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("Spouse");
  const [phone, setPhone] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // Delete dialog state
  const [deletingContactId, setDeletingContactId] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditingContact(null);
    setName("");
    setRelationship("Spouse");
    setPhone("");
    setIsPrimary(contacts.length === 0);
    setNotes("");
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (contact: IEmergencyContact) => {
    setEditingContact(contact);
    setName(contact.name);
    setRelationship(contact.relationship);
    setPhone(contact.phone);
    setIsPrimary(contact.isPrimary);
    setNotes(contact.notes || "");
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim().replace(/[\s\-()]/g, "");

    if (trimmedName.length < 2) {
      setFormError("Contact name must be at least 2 characters.");
      return;
    }

    if (!/^\+?[0-9]{7,15}$/.test(trimmedPhone)) {
      setFormError("Phone number must contain between 7 and 15 digits (e.g. +919876543210).");
      return;
    }

    try {
      if (editingContact) {
        await updateMutation.mutateAsync({
          contactId: editingContact.id || editingContact._id || "",
          dto: {
            name: trimmedName,
            relationship,
            phone: phone.trim(),
            isPrimary,
            notes: notes.trim() || undefined,
          },
        });
      } else {
        await createMutation.mutateAsync({
          name: trimmedName,
          relationship,
          phone: phone.trim(),
          isPrimary,
          notes: notes.trim() || undefined,
        });
      }
      setIsFormOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save emergency contact.";
      setFormError(msg);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingContactId) return;
    try {
      await deleteMutation.mutateAsync(deletingContactId);
      setDeletingContactId(null);
    } catch {
      // Handled by mutation toast
    }
  };

  if (isLoading) {
    return (
      <div className="surface-calm rounded-2xl border border-border/60 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-8 w-28" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="surface-calm flex flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center">
        <AlertCircle className="size-6 text-destructive mb-2" />
        <h4 className="font-semibold text-foreground text-sm">Failed to load emergency contacts</h4>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
          {error?.message || "Could not retrieve your contacts."}
        </p>
        <Button size="sm" variant="outline" className="mt-3 gap-1.5" onClick={() => refetch()}>
          <RefreshCw className="size-3.5" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <>
      <section
        className="surface-calm rounded-2xl border border-border/60 p-5 sm:p-6"
        aria-label="Emergency Contacts Manager"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-lg bg-primary-soft text-primary">
              <Users className="size-5" aria-hidden="true" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-base font-bold text-foreground sm:text-lg">
                  Emergency Contacts
                </h3>
                <Badge variant="secondary" className="text-xs font-semibold">
                  {contacts.length} / 10
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Trusted family, friends, or caregivers to be alerted in an emergency
              </p>
            </div>
          </div>

          <Button
            size="sm"
            onClick={handleOpenAdd}
            disabled={contacts.length >= 10}
            className="gap-1.5 shadow-sm"
          >
            <UserPlus className="size-3.5" aria-hidden="true" />
            Add Contact
          </Button>
        </div>

        {/* Contacts List */}
        <div className="mt-5 space-y-3">
          {contacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-surface/40 p-8 text-center">
              <Users className="size-8 text-muted-foreground/40 mb-2" aria-hidden="true" />
              <h4 className="font-semibold text-foreground text-sm">No emergency contacts configured</h4>
              <p className="text-xs text-muted-foreground max-w-xs mt-1">
                Add at least one primary contact who should be called during an emergency or reached via your Emergency QR.
              </p>
              <Button size="sm" onClick={handleOpenAdd} className="mt-4 gap-1.5">
                <Plus className="size-3.5" />
                Add First Emergency Contact
              </Button>
            </div>
          ) : (
            contacts.map((contact) => (
              <div
                key={contact.id || contact._id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border p-4 transition-all ${
                  contact.isPrimary
                    ? "border-primary/40 bg-primary-soft/20 ring-1 ring-primary/20"
                    : "border-border/60 bg-surface hover:bg-surface/80"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-semibold text-sm text-foreground truncate">
                      {contact.name}
                    </h4>
                    <Badge variant="outline" className="text-xs">
                      {contact.relationship}
                    </Badge>
                    {contact.isPrimary ? (
                      <Badge className="gap-1 bg-primary text-primary-foreground text-xs font-semibold">
                        <Star className="size-3 fill-primary-foreground" aria-hidden="true" />
                        Primary Contact
                      </Badge>
                    ) : null}
                  </div>

                  <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="font-mono text-foreground font-medium flex items-center gap-1">
                      <Phone className="size-3 text-primary" aria-hidden="true" />
                      {contact.phone}
                    </span>
                    {contact.notes ? (
                      <span className="italic text-muted-foreground truncate max-w-xs">
                        &bull; {contact.notes}
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-border/40">
                  <Button asChild size="sm" variant="secondary" className="gap-1 text-xs">
                    <a href={`tel:${contact.phone.replace(/[\s\-()]/g, "")}`}>
                      <Phone className="size-3.5" aria-hidden="true" />
                      Call
                    </a>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenEdit(contact)}
                    aria-label={`Edit ${contact.name}`}
                  >
                    <Edit2 className="size-3.5" aria-hidden="true" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeletingContactId(contact.id || contact._id || "")}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label={`Delete ${contact.name}`}
                  >
                    <Trash2 className="size-3.5" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Add / Edit Contact Modal */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="font-display text-lg">
                {editingContact ? "Edit Emergency Contact" : "Add Emergency Contact"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                First responders will see these contact details when scanning your Emergency QR.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-3">
              {formError ? (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive flex items-center gap-2">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              ) : null}

              <div className="space-y-1.5">
                <Label htmlFor="contact-name" className="text-xs font-semibold">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="contact-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="h-10 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Relationship</Label>
                  <Select value={relationship} onValueChange={setRelationship}>
                    <SelectTrigger className="h-10 text-xs">
                      <SelectValue placeholder="Relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      {RELATIONSHIP_OPTIONS.map((rel) => (
                        <SelectItem key={rel} value={rel}>
                          {rel}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="contact-phone" className="text-xs font-semibold">
                    Phone Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="contact-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="h-10 text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="contact-notes" className="text-xs font-semibold">
                  Notes / Availability (Optional)
                </Label>
                <Input
                  id="contact-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Available 24/7, Lives in same apartment"
                  className="h-9 text-xs"
                  maxLength={100}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg bg-surface p-3 border border-border/60">
                <div className="space-y-0.5">
                  <Label htmlFor="is-primary" className="text-xs font-semibold cursor-pointer">
                    Set as Primary Contact
                  </Label>
                  <p className="text-[11px] text-muted-foreground">
                    First person to be contacted in an emergency
                  </p>
                </div>
                <Switch
                  id="is-primary"
                  checked={isPrimary}
                  onCheckedChange={setIsPrimary}
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormOpen(false)}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="gap-1.5"
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <>
                    <RefreshCw className="size-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="size-3.5" />
                    {editingContact ? "Update Contact" : "Add Contact"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={Boolean(deletingContactId)}
        onOpenChange={(open) => !open && setDeletingContactId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Emergency Contact?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              This contact will no longer receive emergency alerts or appear on your Emergency QR.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Removing..." : "Remove Contact"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
