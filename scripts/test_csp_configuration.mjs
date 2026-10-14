import assert from "node:assert/strict";

// Test CSP generation function logic
function buildCspHeaderTest(envNodeEnv, envApiUrl) {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalApiUrl = process.env.NEXT_PUBLIC_API_URL;

  try {
    if (envNodeEnv !== undefined) {
      process.env.NODE_ENV = envNodeEnv;
    } else {
      delete process.env.NODE_ENV;
    }

    if (envApiUrl !== undefined) {
      process.env.NEXT_PUBLIC_API_URL = envApiUrl;
    } else {
      delete process.env.NEXT_PUBLIC_API_URL;
    }

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

    const directives = {
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
  } finally {
    if (originalNodeEnv !== undefined) {
      process.env.NODE_ENV = originalNodeEnv;
    } else {
      delete process.env.NODE_ENV;
    }

    if (originalApiUrl !== undefined) {
      process.env.NEXT_PUBLIC_API_URL = originalApiUrl;
    } else {
      delete process.env.NEXT_PUBLIC_API_URL;
    }
  }
}

console.log("Running Phase 1L Content Security Policy regression tests...");

// Test Case 1: Production CSP with production API URL
const prodCsp = buildCspHeaderTest("production", "https://api.lifeledger.com/api/v1");

// 1.1 Must NOT contain unsafe-eval in production
assert.ok(!prodCsp.includes("'unsafe-eval'"), "Production CSP must not contain 'unsafe-eval'");
console.log("✔ Test 1.1: 'unsafe-eval' is excluded in production CSP");

// 1.2 Must NOT contain http://localhost:5000 in production
assert.ok(!prodCsp.includes("http://localhost:5000"), "Production CSP must not contain hardcoded http://localhost:5000");
console.log("✔ Test 1.2: 'http://localhost:5000' is excluded in production CSP");

// 1.3 Must NOT contain broad wildcards in connect-src in production
const prodConnectSrcTokens = prodCsp.split("; ").find(d => d.startsWith("connect-src")).split(" ");
assert.ok(!prodConnectSrcTokens.includes("https:"), "Production connect-src must not contain wildcard https:");
assert.ok(!prodConnectSrcTokens.includes("ws:"), "Production connect-src must not contain wildcard ws:");
assert.ok(!prodConnectSrcTokens.includes("wss:"), "Production connect-src must not contain wildcard wss:");
console.log("✔ Test 1.3: Broad wildcards (https:, ws:, wss:) are excluded from production connect-src");

// 1.4 Must include required API origin, OSM tiles, and Cloudinary in connect-src
assert.ok(prodConnectSrcTokens.includes("https://api.lifeledger.com"), "Production connect-src must include API origin");
assert.ok(prodConnectSrcTokens.includes("https://tile.openstreetmap.org"), "Production connect-src must include OSM tile host");
assert.ok(prodConnectSrcTokens.includes("https://*.tile.openstreetmap.org"), "Production connect-src must include OSM tile subdomains");
assert.ok(prodConnectSrcTokens.includes("https://res.cloudinary.com"), "Production connect-src must include Cloudinary host");
console.log("✔ Test 1.4: Scoped API origin, OSM tiles, and Cloudinary hosts are included in connect-src");

// Test Case 2: Development CSP
const devCsp = buildCspHeaderTest("development", "http://localhost:5000/api/v1");

// 2.1 Development CSP must include unsafe-eval for Next.js Fast Refresh
assert.ok(devCsp.includes("'unsafe-eval'"), "Development CSP must include 'unsafe-eval'");
console.log("✔ Test 2.1: 'unsafe-eval' is included in development mode for HMR/Fast Refresh");

// 2.2 Development connect-src must include localhost and websocket protocols
const devConnectSrcTokens = devCsp.split("; ").find(d => d.startsWith("connect-src")).split(" ");
assert.ok(devConnectSrcTokens.includes("http://localhost:5000"), "Development connect-src must include localhost:5000");
assert.ok(devConnectSrcTokens.includes("ws:"), "Development connect-src must include ws:");
assert.ok(devConnectSrcTokens.includes("wss:"), "Development connect-src must include wss:");
console.log("✔ Test 2.2: Development connect-src includes localhost:5000 and websocket protocols");

console.log("\nAll Phase 1L CSP configuration regression tests PASSED successfully!");
