async function run() {
  const baseUrl = "http://localhost:5000/api/v1";

  async function test(name, url) {
    console.log(`\n========================================`);
    console.log(`TEST: ${name}`);
    console.log(`URL: ${url}`);
    const start = Date.now();
    try {
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      const elapsed = Date.now() - start;
      console.log(`STATUS: ${res.status} ${res.statusText} (${elapsed}ms)`);
      const json = await res.json();
      console.log(`ENVELOPE KEYS:`, Object.keys(json));
      if (json.data) {
        console.log(`DATA KEYS:`, Object.keys(json.data));
        console.log(`HOSPITALS COUNT:`, json.data.hospitals?.length ?? 0);
        console.log(`TOTAL PAGINATION:`, json.data.pagination);
        console.log(`PROVIDER:`, json.data.provider);
        console.log(`FIRST HOSPITAL SAMPLE:`, json.data.hospitals?.[0]);
      } else {
        console.log(`RAW JSON:`, JSON.stringify(json, null, 2));
      }
      return json;
    } catch (err) {
      console.log(`ERROR:`, err.message);
      return null;
    }
  }

  // 1. Nearby New Delhi
  await test("Nearby - New Delhi (28.6139, 77.209, radius 5km)", `${baseUrl}/hospitals?latitude=28.6139&longitude=77.209&radiusKm=5`);

  // 2. Nearby Mumbai
  await test("Nearby - Mumbai (19.0760, 72.8777, radius 5km)", `${baseUrl}/hospitals?latitude=19.0760&longitude=72.8777&radiusKm=5`);

  // 3. Nearby Bengaluru
  await test("Nearby - Bengaluru (12.9716, 77.5946, radius 5km)", `${baseUrl}/hospitals?latitude=12.9716&longitude=77.5946&radiusKm=5`);

  // 4. City Search - New Delhi
  await test("City Search - New Delhi", `${baseUrl}/hospitals/search?city=New%20Delhi`);

  // 5. City Search - Mumbai
  await test("City Search - Mumbai", `${baseUrl}/hospitals/search?city=Mumbai`);

  // 6. City Search - Bengaluru
  await test("City Search - Bengaluru", `${baseUrl}/hospitals/search?city=Bengaluru`);

  // 7. Test Hospital Details on an OSM ID
  const delRes = await test("Nearby - New Delhi again for details", `${baseUrl}/hospitals?latitude=28.6139&longitude=77.209&radiusKm=5`);
  const firstId = delRes?.data?.hospitals?.[0]?.id;
  if (firstId) {
    await test(`Hospital Details for ID: ${firstId}`, `${baseUrl}/hospitals/${encodeURIComponent(firstId)}`);
  }
}

run();
