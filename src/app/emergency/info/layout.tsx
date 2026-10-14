import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Emergency Medical Information | LifeLedger",
  description: "Official LifeLedger emergency first-responder summary.",
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

export default function EmergencyInfoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
