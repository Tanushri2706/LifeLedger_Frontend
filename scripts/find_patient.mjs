import mongoose from "mongoose";

async function findPatient() {
  const uri = "mongodb+srv://lifeledger:zYOe0wRnKUCWnYgt@lifeledger-prod.kxgc9h0.mongodb.net/lifeledger?appName=LifeLedger-Prod";
  await mongoose.connect(uri);

  const users = await mongoose.connection.collection("users").find({ role: "patient" }).toArray();
  console.log("Patients in DB:", users.map(u => ({ id: u._id.toString(), email: u.email, isVerified: u.isVerified, role: u.role })));

  await mongoose.disconnect();
}

findPatient();
