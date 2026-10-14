import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";

import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/features/auth/auth-context";
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { env } from "@/lib/env";
import "@/styles.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "LifeLedger — Connecting You to Better Healthcare",
    template: "%s | LifeLedger",
  },
  description:
    "LifeLedger keeps your medical reports, prescriptions and health timeline in one secure place, with AI that explains them in plain language.",
  metadataBase: env.appUrl,
  openGraph: {
    title: "LifeLedger — Connecting You to Better Healthcare",
    description: "One secure health ledger for your reports, prescriptions and emergency details.",
    type: "website",
    siteName: "LifeLedger",
  },
  twitter: {
    card: "summary_large_image",
    title: "LifeLedger — Connecting You to Better Healthcare",
    description: "One secure health ledger for your reports, prescriptions and emergency details.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2563EB",
};

const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('lifeledger_theme');
    var isDark = stored === 'dark' || (stored === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${sora.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-dvh bg-background text-foreground antialiased selection:bg-primary/20">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <QueryProvider>
          <AuthProvider>
            <ThemeProvider>
              {children}
              <Toaster position="top-center" richColors />
            </ThemeProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
