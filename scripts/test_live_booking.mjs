import crypto from "crypto";

function createJWT(payload, secret) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + 3600 })).toString("base64url");
  const signature = crypto.createHmac("sha256", secret).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${signature}`;
}

async function runLiveTest() {
  const baseUrl = "http://localhost:5000/api/v1";
  const jwtSecret = "lifeledger_development_jwt_access_secret_key_32bytes_min";
  const doctorId = "6abf400f4570b9546ec44009"; // Dr. Amit Sharma
  const testDate = "2026-10-05"; // Future Monday

  console.log("==================================================");
  console.log("1. FETCH DOCTOR DETAILS & PROFILE");
  console.log("==================================================");
  const docRes = await fetch(`${baseUrl}/doctors/${doctorId}`);
  const docJson = await docRes.json();
  console.log("Doctor Name:", docJson.data.doctor.name);
  console.log("Doctor Specialization:", docJson.data.doctor.specialization);
  console.log("Doctor Availability Schedule:", JSON.stringify(docJson.data.doctor.availability, null, 2));

  console.log("\n==================================================");
  console.log("2. FETCH SLOTS FOR FUTURE MONDAY (2026-10-05)");
  console.log("==================================================");
  const slotsRes = await fetch(`${baseUrl}/doctors/${doctorId}/slots?date=${testDate}`);
  const slotsJson = await slotsRes.json();
  console.log("Slots API Status:", slotsRes.status);
  console.log("Total Slots:", slotsJson.data.totalSlots);
  console.log("Available Slots Count:", slotsJson.data.availableSlotsCount);
  console.log("Slots List from Backend:");
  console.table(slotsJson.data.slots);

  // Normalize as done by our frontend API client
  const normalizedSlots = slotsJson.data.slots.map((s) => {
    const available = Boolean(s.isAvailable ?? s.available ?? false);
    return {
      start: s.start,
      end: s.end,
      formatted: `${s.start} - ${s.end}`,
      available,
      isAvailable: available,
    };
  });

  console.log("\nNormalized Frontend Slots:");
  console.table(normalizedSlots);
  const allAvailable = normalizedSlots.every((s) => s.available === true && s.isAvailable === true);
  console.log(`Are all 6 Monday slots clickable/available in frontend? -> ${allAvailable}`);

  console.log("\n==================================================");
  console.log("3. CREATE / SIGN TEST PATIENT JWT");
  console.log("==================================================");
  const patientUserId = "6abbffc28841e01135d31e93";
  const patientToken = createJWT(
    {
      id: patientUserId,
      email: "iamamritjha@gmail.com",
      role: "patient",
    },
    jwtSecret
  );
  console.log("Generated Patient JWT for patient ID:", patientUserId);

  console.log("\n==================================================");
  console.log("4. SUBMIT BOOKING (09:00 - 09:30 on 2026-10-05)");
  console.log("==================================================");
  const selectedSlot = normalizedSlots[0]; // "09:00" - "09:30"
  const bookingPayload = {
    doctorId,
    appointmentDate: testDate,
    timeSlot: {
      start: selectedSlot.start,
      end: selectedSlot.end,
    },
    consultationType: "in_person",
    notes: "Follow-up consultation",
    hospital: "LifeLedger Central Hospital",
  };

  console.log("Booking Request URL: POST", `${baseUrl}/appointments`);
  console.log("Booking Request Payload:", JSON.stringify(bookingPayload, null, 2));

  const bookRes = await fetch(`${baseUrl}/appointments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${patientToken}`,
    },
    body: JSON.stringify(bookingPayload),
  });

  console.log(`Booking Response Status: ${bookRes.status} ${bookRes.statusText}`);
  const bookJson = await bookRes.json();
  console.log("Booking Response Body:", JSON.stringify(bookJson, null, 2));

  const appointmentId = bookJson?.data?.appointment?.id || bookJson?.data?.id;

  console.log("\n==================================================");
  console.log("5. VERIFY SLOT REFRESH & COLLISION REFLECTION");
  console.log("==================================================");
  const refetchRes = await fetch(`${baseUrl}/doctors/${doctorId}/slots?date=${testDate}`);
  const refetchJson = await refetchRes.json();
  console.log("Available Slots Count After Booking:", refetchJson.data.availableSlotsCount);
  console.table(refetchJson.data.slots);
  const bookedSlot = refetchJson.data.slots.find((s) => s.start === "09:00");
  console.log("Slot 09:00 - 09:30 isAvailable:", bookedSlot?.isAvailable);
  console.log("Slot 09:00 - 09:30 reason:", bookedSlot?.reason);

  if (appointmentId) {
    console.log("\n==================================================");
    console.log("6. RESCHEDULE APPOINTMENT TO (09:30 - 10:00)");
    console.log("==================================================");
    const reschedulePayload = {
      appointmentDate: testDate,
      timeSlot: {
        start: "09:30",
        end: "10:00",
      },
    };

    console.log("Reschedule Request URL: PUT", `${baseUrl}/appointments/${appointmentId}/reschedule`);
    console.log("Reschedule Request Payload:", JSON.stringify(reschedulePayload, null, 2));

    const reschedRes = await fetch(`${baseUrl}/appointments/${appointmentId}/reschedule`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${patientToken}`,
      },
      body: JSON.stringify(reschedulePayload),
    });

    console.log(`Reschedule Response Status: ${reschedRes.status} ${reschedRes.statusText}`);
    const reschedJson = await reschedRes.json();
    console.log("Reschedule Response Body:", JSON.stringify(reschedJson, null, 2));

    console.log("\n==================================================");
    console.log("7. VERIFY SLOT REFRESH AFTER RESCHEDULE");
    console.log("==================================================");
    const refetch2Res = await fetch(`${baseUrl}/doctors/${doctorId}/slots?date=${testDate}`);
    const refetch2Json = await refetch2Res.json();
    console.log("Available Slots Count After Reschedule:", refetch2Json.data.availableSlotsCount);
    console.table(refetch2Json.data.slots);
    const slot0900 = refetch2Json.data.slots.find((s) => s.start === "09:00");
    const slot0930 = refetch2Json.data.slots.find((s) => s.start === "09:30");
    console.log("Slot 09:00 - 09:30 isAvailable (freed up):", slot0900?.isAvailable);
    console.log("Slot 09:30 - 10:00 isAvailable (now booked):", slot0930?.isAvailable);
  }
}

runLiveTest();
