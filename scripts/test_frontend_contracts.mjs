async function testContracts() {
  console.log("=== 1. TEST TIME SLOT PARSER ===");
  function parseTimeSlot(input) {
    if (!input) throw new Error("Appointment time slot is required.");
    if (typeof input === "object" && input !== null) {
      const start = input.start?.trim();
      const end = input.end?.trim();
      if (start && end) return { start, end };
    }
    if (typeof input === "string") {
      const trimmed = input.trim();
      const parts = trimmed.split(/\s*[-–—]\s*|\s+to\s+/i);
      if (parts.length >= 2) {
        const start = parts[0]?.trim();
        const end = parts[1]?.trim();
        if (start && end) return { start, end };
      }
    }
    throw new Error(`Invalid appointment time slot: ${typeof input === "string" ? input : JSON.stringify(input)}`);
  }

  function normalizeConsultationType(type) {
    if (!type) return "in_person";
    const lower = type.toLowerCase().trim();
    if (lower === "in-person" || lower === "inperson" || lower === "in_person") return "in_person";
    if (lower === "video") return "video";
    if (lower === "audio") return "audio";
    return lower.replace(/-/g, "_");
  }

  // Unit tests for parser
  console.log("parse '09:00 - 09:30' ->", parseTimeSlot("09:00 - 09:30"));
  console.log("parse '09:00–09:30' (en-dash) ->", parseTimeSlot("09:00–09:30"));
  console.log("parse { start: '09:00', end: '09:30' } ->", parseTimeSlot({ start: "09:00", end: "09:30" }));
  console.log("normalize 'in-person' ->", normalizeConsultationType("in-person"));
  console.log("normalize 'in_person' ->", normalizeConsultationType("in_person"));

  console.log("\n=== 2. TEST DOCTOR SLOTS NORMALIZATION AGAINST LIVE BACKEND ===");
  const baseUrl = "http://localhost:5000/api/v1";
  const doctorId = "6abf400f4570b9546ec44009"; // Dr. Amit Sharma
  const testDate = "2026-10-05"; // Future Monday

  const res = await fetch(`${baseUrl}/doctors/${doctorId}/slots?date=${testDate}`);
  const json = await res.json();
  console.log("Raw Backend Response Status:", res.status);
  console.log("Raw Backend Slots Count:", json?.data?.slots?.length);

  // Apply our API normalization
  const rawSlots = json?.data?.slots || [];
  const normalizedSlots = rawSlots.map((slot) => {
    const start = String(slot.start || "").trim();
    const end = String(slot.end || "").trim();
    const isAvailableRaw = slot.isAvailable ?? slot.available;
    const available = typeof isAvailableRaw === "boolean" ? isAvailableRaw : false;

    return {
      start,
      end,
      formatted: `${start} - ${end}`,
      available,
      isAvailable: available,
      isPast: typeof slot.isPast === "boolean" ? slot.isPast : undefined,
      isBooked: typeof slot.isBooked === "boolean" ? slot.isBooked : undefined,
    };
  });

  console.log("Normalized Slots Sample:", normalizedSlots);
  console.log("All 6 slots available (clickable)?", normalizedSlots.every((s) => s.available === true && s.isAvailable === true));

  console.log("\n=== 3. TEST AUTH & BOOKING FLOW ===");
  // Sign in as patient or create test patient to test real booking payload
  const signinRes = await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "ananya.sharma@gmail.com",
      password: "Password123!",
    }),
  });

  let token = null;
  if (signinRes.ok) {
    const signinData = await signinRes.json();
    token = signinData?.data?.accessToken;
    console.log("Signed in as existing patient: ananya.sharma@gmail.com");
  } else {
    console.log("Signin failed with status:", signinRes.status, "Creating temporary patient...");
    const signupRes = await fetch(`${baseUrl}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: "Test",
        lastName: "Patient",
        email: `test.patient.${Date.now()}@example.com`,
        password: "Password123!",
        role: "patient",
      }),
    });
    const signupData = await signupRes.json();
    token = signupData?.data?.accessToken;
    console.log("Signed up temporary patient, token acquired:", Boolean(token));
  }

  if (token) {
    const bookingPayload = {
      doctorId,
      appointmentDate: testDate,
      timeSlot: parseTimeSlot("09:00 - 09:30"),
      consultationType: normalizeConsultationType("in-person"),
      notes: "Routine cardiac checkup",
      hospital: "LifeLedger Central Hospital",
    };

    console.log("Sending normalized booking payload:", JSON.stringify(bookingPayload, null, 2));

    const bookRes = await fetch(`${baseUrl}/appointments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(bookingPayload),
    });

    console.log("Booking Response Status:", bookRes.status, bookRes.statusText);
    const bookJson = await bookRes.json();
    console.log("Booking Response JSON:", JSON.stringify(bookJson, null, 2));

    const appointmentId = bookJson?.data?.appointment?.id || bookJson?.data?.id;

    console.log("\n=== 4. TEST SLOT REFLECTION AFTER BOOKING (COLLISION CHECK) ===");
    const refetchRes = await fetch(`${baseUrl}/doctors/${doctorId}/slots?date=${testDate}`);
    const refetchJson = await refetchRes.json();
    const bookedSlot = refetchJson?.data?.slots?.find((s) => s.start === "09:00");
    console.log("Slot '09:00 - 09:30' after booking isAvailable:", bookedSlot?.isAvailable);
    console.log("Slot '09:00 - 09:30' reason:", bookedSlot?.reason);

    if (appointmentId) {
      console.log("\n=== 5. TEST RESCHEDULE FLOW ===");
      const reschedulePayload = {
        appointmentDate: testDate,
        timeSlot: parseTimeSlot("09:30 - 10:00"),
      };
      console.log("Sending reschedule payload:", JSON.stringify(reschedulePayload, null, 2));

      const reschedRes = await fetch(`${baseUrl}/appointments/${appointmentId}/reschedule`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reschedulePayload),
      });

      console.log("Reschedule Response Status:", reschedRes.status, reschedRes.statusText);
      const reschedJson = await reschedRes.json();
      console.log("Reschedule Response JSON:", JSON.stringify(reschedJson, null, 2));
    }
  }
}

testContracts();
