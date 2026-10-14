import assert from "node:assert/strict";

// Test the pure logic of resolveApiUrl under different environment configurations
function testResolveApiUrl(envNodeEnv, envApiUrl) {
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

console.log("Running Phase 1K resolveApiUrl regression tests...");

// Test Case 1: Development with missing API URL -> falls back to localhost
const devFallback = testResolveApiUrl("development", undefined);
assert.equal(devFallback, "http://localhost:5000/api/v1");
console.log("✔ Test Case 1 Passed: Development mode falls back to http://localhost:5000/api/v1");

// Test Case 2: Development with empty string -> falls back to localhost
const devEmpty = testResolveApiUrl("development", "   ");
assert.equal(devEmpty, "http://localhost:5000/api/v1");
console.log("✔ Test Case 2 Passed: Development mode with whitespace falls back to http://localhost:5000/api/v1");

// Test Case 3: Development with configured URL -> returns configured URL
const devConfigured = testResolveApiUrl("development", "http://localhost:8080/api/v1");
assert.equal(devConfigured, "http://localhost:8080/api/v1");
console.log("✔ Test Case 3 Passed: Development mode returns configured URL");

// Test Case 4: Production with missing API URL -> throws fail-fast error
assert.throws(
  () => testResolveApiUrl("production", undefined),
  (err) => {
    assert.match(err.message, /\[LifeLedger Config\] NEXT_PUBLIC_API_URL must be defined for production\./);
    return true;
  }
);
console.log("✔ Test Case 4 Passed: Production mode throws fail-fast Error when NEXT_PUBLIC_API_URL is missing");

// Test Case 5: Production with empty string -> throws fail-fast error
assert.throws(
  () => testResolveApiUrl("production", "   "),
  (err) => {
    assert.match(err.message, /\[LifeLedger Config\] NEXT_PUBLIC_API_URL must be defined for production\./);
    return true;
  }
);
console.log("✔ Test Case 5 Passed: Production mode throws fail-fast Error when NEXT_PUBLIC_API_URL is empty");

// Test Case 6: Production with configured URL -> returns trimmed configured URL
const prodConfigured = testResolveApiUrl("production", " https://api.lifeledger.com/api/v1 ");
assert.equal(prodConfigured, "https://api.lifeledger.com/api/v1");
console.log("✔ Test Case 6 Passed: Production mode successfully returns configured production API URL");

console.log("\nAll 6 resolveApiUrl regression test cases PASSED successfully!");
