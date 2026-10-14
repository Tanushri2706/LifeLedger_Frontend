import { Badge } from "@/components/ui/badge";

export type DoctorAppointment = {
  id: string;
  patient: string;
  age: number;
  time: string;
  reason: string;
  mode: "In-clinic" | "Video";
  status: "Confirmed" | "Checked in" | "Completed" | "Awaiting";
};

export const todayAppointments: DoctorAppointment[] = [
  {
    id: "da-1",
    patient: "Aarav Sharma",
    age: 34,
    time: "10:00 AM",
    reason: "Diabetic panel review",
    mode: "In-clinic",
    status: "Checked in",
  },
  {
    id: "da-2",
    patient: "Kavita Nair",
    age: 52,
    time: "10:40 AM",
    reason: "Thyroid follow-up",
    mode: "In-clinic",
    status: "Confirmed",
  },
  {
    id: "da-3",
    patient: "Rakesh Menon",
    age: 61,
    time: "11:20 AM",
    reason: "Vitamin D deficiency",
    mode: "Video",
    status: "Confirmed",
  },
  {
    id: "da-4",
    patient: "Sneha Kulkarni",
    age: 29,
    time: "12:00 PM",
    reason: "First consultation",
    mode: "In-clinic",
    status: "Awaiting",
  },
  {
    id: "da-5",
    patient: "Imran Qureshi",
    age: 45,
    time: "5:30 PM",
    reason: "HbA1c report discussion",
    mode: "Video",
    status: "Confirmed",
  },
];

export const upcomingSchedule = [
  {
    day: "Wed, 3 Sep",
    slots: "9:30 AM – 1:00 PM · Deenanath Mangeshkar Hospital",
    count: 7,
    note: "2 video consults",
  },
  {
    day: "Thu, 4 Sep",
    slots: "10:00 AM – 12:30 PM · Deenanath Mangeshkar Hospital",
    count: 5,
    note: "1 new patient",
  },
  {
    day: "Fri, 5 Sep",
    slots: "5:00 PM – 8:00 PM · Ruby Hall OPD",
    count: 9,
    note: "OPD block",
  },
  {
    day: "Sat, 6 Sep",
    slots: "9:30 AM – 12:00 PM · Video only",
    count: 4,
    note: "Follow-ups",
  },
];

export type DoctorPatient = {
  id: string;
  name: string;
  age: number;
  gender: "Male" | "Female";
  condition: string;
  lastVisit: string;
  city: string;
  reportsShared: number;
  status: "Active" | "Follow-up due" | "Stable";
};

export const doctorPatients: DoctorPatient[] = [
  {
    id: "p-1",
    name: "Aarav Sharma",
    age: 34,
    gender: "Male",
    condition: "Pre-diabetes",
    lastVisit: "28 Aug 2026",
    city: "Pune",
    reportsShared: 6,
    status: "Active",
  },
  {
    id: "p-2",
    name: "Kavita Nair",
    age: 52,
    gender: "Female",
    condition: "Hypothyroidism",
    lastVisit: "21 Aug 2026",
    city: "Pune",
    reportsShared: 9,
    status: "Follow-up due",
  },
  {
    id: "p-3",
    name: "Rakesh Menon",
    age: 61,
    gender: "Male",
    condition: "Vitamin D deficiency",
    lastVisit: "14 Aug 2026",
    city: "Mumbai",
    reportsShared: 4,
    status: "Stable",
  },
  {
    id: "p-4",
    name: "Sneha Kulkarni",
    age: 29,
    gender: "Female",
    condition: "PCOS screening",
    lastVisit: "New patient",
    city: "Pune",
    reportsShared: 2,
    status: "Active",
  },
  {
    id: "p-5",
    name: "Imran Qureshi",
    age: 45,
    gender: "Male",
    condition: "Type 2 diabetes",
    lastVisit: "30 Aug 2026",
    city: "Nashik",
    reportsShared: 11,
    status: "Follow-up due",
  },
  {
    id: "p-6",
    name: "Lakshmi Iyer",
    age: 68,
    gender: "Female",
    condition: "Osteoporosis",
    lastVisit: "9 Aug 2026",
    city: "Pune",
    reportsShared: 7,
    status: "Stable",
  },
];

export const sharedReports = [
  {
    id: "sr-1",
    patient: "Aarav Sharma",
    title: "Diabetic Panel + HbA1c",
    lab: "Dr. Lal PathLabs, Kothrud",
    sharedOn: "1 Sep 2026",
    category: "Lab Report",
    flag: "2 values out of range",
    reviewed: false,
  },
  {
    id: "sr-2",
    patient: "Kavita Nair",
    title: "Thyroid Profile (T3, T4, TSH)",
    lab: "Metropolis, Aundh",
    sharedOn: "31 Aug 2026",
    category: "Lab Report",
    flag: "TSH slightly elevated",
    reviewed: false,
  },
  {
    id: "sr-3",
    patient: "Rakesh Menon",
    title: "MRI Lumbar Spine",
    lab: "Ruby Hall Imaging",
    sharedOn: "29 Aug 2026",
    category: "Scan",
    flag: "Radiologist note attached",
    reviewed: true,
  },
  {
    id: "sr-4",
    patient: "Imran Qureshi",
    title: "Lipid Profile",
    lab: "Thyrocare",
    sharedOn: "27 Aug 2026",
    category: "Lab Report",
    flag: "All values normal",
    reviewed: true,
  },
];

export function StatusPill({ status }: { status: string }) {
  const tone =
    status === "Checked in" || status === "Active"
      ? "bg-accent-soft text-accent-strong"
      : status === "Follow-up due" || status === "Awaiting"
        ? "bg-primary-soft text-primary"
        : "bg-muted text-muted-foreground";

  return (
    <Badge variant="secondary" className={`shrink-0 border-transparent ${tone}`}>
      {status}
    </Badge>
  );
}
