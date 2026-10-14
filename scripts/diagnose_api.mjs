async function run() {
  const baseUrl = "http://localhost:5000/api/v1";

  async function test(name, url, method = "GET", body = null) {
    console.log(`\n========================================`);
    console.log(`TEST: ${name}`);
    console.log(`URL: ${url}`);
    try {
      const options = {
        method,
        headers: { "Content-Type": "application/json" },
      };
      if (body) options.body = JSON.stringify(body);
      const res = await fetch(url, options);
      console.log(`STATUS: ${res.status} ${res.statusText}`);
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        console.log(`RESPONSE JSON:`, JSON.stringify(json, null, 2));
        return json;
      } catch {
        console.log(`RESPONSE TEXT:`, text);
        return null;
      }
    } catch (err) {
      console.log(`ERROR:`, err.message);
      return null;
    }
  }

  const docId = "6abf400f4570b9546ec44009"; // Dr. Amit Sharma
  
  // Future Monday (2026-10-05)
  await test("Doctor Slots - Future Monday (2026-10-05)", `${baseUrl}/doctors/${docId}/slots?date=2026-10-05`);

  // Future Tuesday (2026-10-06)
  await test("Doctor Slots - Future Tuesday (2026-10-06)", `${baseUrl}/doctors/${docId}/slots?date=2026-10-06`);

  // Future Wednesday (2026-10-07) - not configured
  await test("Doctor Slots - Future Wednesday (2026-10-07)", `${baseUrl}/doctors/${docId}/slots?date=2026-10-07`);

  // Today (2026-10-02)
  await test("Doctor Slots - Today Friday (2026-10-02)", `${baseUrl}/doctors/${docId}/slots?date=2026-10-02`);
}

run();
