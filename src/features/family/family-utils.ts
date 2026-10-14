import { FamilyRelationship } from "./family-types";

export const RELATIONSHIP_OPTIONS: Array<{ value: FamilyRelationship; label: string }> = [
  { value: FamilyRelationship.MOTHER, label: "Mother" },
  { value: FamilyRelationship.FATHER, label: "Father" },
  { value: FamilyRelationship.SPOUSE, label: "Spouse" },
  { value: FamilyRelationship.SON, label: "Son" },
  { value: FamilyRelationship.DAUGHTER, label: "Daughter" },
  { value: FamilyRelationship.BROTHER, label: "Brother" },
  { value: FamilyRelationship.SISTER, label: "Sister" },
  { value: FamilyRelationship.GRANDMOTHER, label: "Grandmother" },
  { value: FamilyRelationship.GRANDFATHER, label: "Grandfather" },
  { value: FamilyRelationship.GUARDIAN, label: "Guardian" },
  { value: FamilyRelationship.DEPENDENT, label: "Dependent" },
  { value: FamilyRelationship.OTHER, label: "Other" },
];

export function formatRelationship(rel: string | FamilyRelationship): string {
  const found = RELATIONSHIP_OPTIONS.find((r) => r.value === rel);
  if (found) return found.label;
  return rel.charAt(0).toUpperCase() + rel.slice(1).replace("_", " ");
}

export function getInitials(name: string): string {
  if (!name) return "FM";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function calculateAgeFromDob(dobString?: string | null): number | null {
  if (!dobString) return null;
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return null;
  const diff = Date.now() - dob.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}
