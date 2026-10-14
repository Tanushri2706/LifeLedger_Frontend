import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shared Medical Records | LifeLedger",
  description: "Secure, time-limited shared medical record viewer.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function MedicalShareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
