/**
 * LifeLedger Environment Configuration
 * Only client-safe variables prefixed with NEXT_PUBLIC_ are exposed.
 */

function resolveAppUrl(): URL {
  const raw = process.env.NEXT_PUBLIC_APP_URL;
  if (raw) {
    try {
      const normalized =
        raw.startsWith("http://") || raw.startsWith("https://")
          ? raw
          : `https://${raw}`;
      return new URL(normalized);
    } catch {
      // Invalid URL format, fall back safely
    }
  }
  return new URL("http://localhost:3000");
}

export function resolveApiUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL;
  if (raw && raw.trim().length > 0) {
    return raw.trim();
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "[LifeLedger Config] NEXT_PUBLIC_API_URL must be defined for production."
    );
  }
  return "http://localhost:5000/api/v1";
}

export const env = {
  NEXT_PUBLIC_API_URL: resolveApiUrl(),
  NEXT_PUBLIC_APP_URL:
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  appUrl: resolveAppUrl(),
  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: process.env.NODE_ENV === "development",
} as const;

