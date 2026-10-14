import type { NextConfig } from "next";

function buildCspHeader(): string {
  const isProd = process.env.NODE_ENV === "production";

  const apiOrigin = (() => {
    const raw = process.env.NEXT_PUBLIC_API_URL;
    if (!raw) return null;
    try {
      const parsed = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
      return parsed.origin;
    } catch {
      return null;
    }
  })();

  const scriptSrc = isProd
    ? ["'self'", "'unsafe-inline'"]
    : ["'self'", "'unsafe-inline'", "'unsafe-eval'"];

  const connectSrc = [
    "'self'",
    "https://tile.openstreetmap.org",
    "https://*.tile.openstreetmap.org",
    "https://res.cloudinary.com",
    ...(apiOrigin ? [apiOrigin] : []),
    ...(!isProd ? ["http://localhost:5000", "ws:", "wss:"] : []),
  ];

  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": scriptSrc,
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": [
      "'self'",
      "data:",
      "blob:",
      "https://res.cloudinary.com",
      "https://lh3.googleusercontent.com",
      "https://tile.openstreetmap.org",
      "https://*.tile.openstreetmap.org",
    ],
    "font-src": ["'self'", "data:"],
    "connect-src": Array.from(new Set(connectSrc)),
    "worker-src": ["'self'", "blob:"],
    "child-src": ["'self'", "blob:"],
    "frame-ancestors": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
  };

  return Object.entries(directives)
    .map(([key, values]) => `${key} ${values.join(" ")}`)
    .join("; ");
}

const securityHeaders = [
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self)",
  },
  {
    key: "Content-Security-Policy",
    value: buildCspHeader(),
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
